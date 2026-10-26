#!/usr/bin/env python3
"""Validate this repository's Codex harness files."""

from __future__ import annotations

import json
import re
import subprocess
import sys
import tempfile
import tomllib
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / ".codex" / "config.toml"
HOOKS = ROOT / ".codex" / "hooks.json"
HOOK_SCRIPT = ROOT / ".codex" / "hooks" / "project_guard.py"
AGENTS_DIR = ROOT / ".codex" / "agents"
SKILLS_DIR = ROOT / ".agents" / "skills"
EXPECTED_AGENTS = {
    "homepage-explorer": "homepage-explorer.toml",
    "homepage-reviewer": "homepage-reviewer.toml",
    "homepage-verifier": "homepage-verifier.toml",
}


def main() -> int:
    checks = [
        check_agents_md,
        check_config,
        check_hooks,
        check_custom_agents,
        check_skills,
        check_hook_behavior,
    ]
    for check in checks:
        check()
    print("Codex harness verification passed.")
    return 0


def check_agents_md() -> None:
    content = read(ROOT / "AGENTS.md")
    require("pnpm verify:codex" in content, "AGENTS.md must document harness verification.")
    require(".agents/skills" in content, "AGENTS.md must mention repo-scoped skills.")
    require(".codex/agents" in content, "AGENTS.md must mention custom subagents.")


def check_config() -> None:
    data = load_toml(CONFIG)
    require(data.get("sandbox_mode") == "workspace-write", ".codex/config.toml must use workspace-write.")
    require(data.get("approval_policy") == "on-request", ".codex/config.toml must use on-request approvals.")
    require(data.get("features", {}).get("hooks") is True, ".codex/config.toml must enable hooks.")
    require(data.get("features", {}).get("multi_agent") is True, ".codex/config.toml must enable subagents.")
    agents = data.get("agents", {})
    require(agents.get("max_depth") == 1, ".codex/config.toml must keep subagent depth at 1.")
    require(agents.get("max_threads", 0) >= 3, ".codex/config.toml must allow parallel subagents.")
    for name, filename in EXPECTED_AGENTS.items():
        agent = agents.get(name, {})
        require(agent.get("config_file") == f"./agents/{filename}", f".codex/config.toml must register {name}.")


def check_hooks() -> None:
    data = json.loads(read(HOOKS))
    hooks = data.get("hooks", {})
    for event in ("PreToolUse", "UserPromptSubmit", "Stop"):
        require(event in hooks, f"{HOOKS} must define {event}.")
    pre_tool_matchers = [group.get("matcher", "") for group in hooks.get("PreToolUse", [])]
    joined_matchers = "\n".join(pre_tool_matchers)
    require("Bash" in joined_matchers, f"{HOOKS} PreToolUse matcher must cover Bash.")
    require("exec_command" in joined_matchers, f"{HOOKS} PreToolUse matcher must cover Codex exec_command.")
    for command in hook_commands(data):
        require("$(git rev-parse --show-toplevel)" in command, "Hook commands must resolve from git root.")
        require(".codex/hooks/project_guard.py" in command, "Hook commands must call project_guard.py.")
    require(HOOK_SCRIPT.exists(), "project_guard.py is missing.")


def check_custom_agents() -> None:
    expected = set(EXPECTED_AGENTS.values())
    actual = {path.name for path in AGENTS_DIR.glob("*.toml")}
    require(expected <= actual, f"Missing custom agent files: {sorted(expected - actual)}")
    for path in AGENTS_DIR.glob("*.toml"):
        data = load_toml(path)
        for key in ("name", "description", "developer_instructions"):
            require(data.get(key), f"{path} must define {key}.")
        require("homepage" in data["name"], f"{path} name should be project scoped.")


def check_skills() -> None:
    expected = {"astro-homepage-maintainer", "homepage-content-author"}
    actual = {path.name for path in SKILLS_DIR.iterdir() if path.is_dir()}
    require(expected <= actual, f"Missing skill folders: {sorted(expected - actual)}")
    for skill_dir in sorted(SKILLS_DIR.iterdir()):
        if not skill_dir.is_dir():
            continue
        skill_md = skill_dir / "SKILL.md"
        content = read(skill_md)
        require("TODO" not in content, f"{skill_md} still contains TODO text.")
        frontmatter = parse_frontmatter(content)
        require(frontmatter.get("name") == skill_dir.name, f"{skill_md} name must match folder.")
        require(frontmatter.get("description"), f"{skill_md} must define description.")
        require((skill_dir / "agents" / "openai.yaml").exists(), f"{skill_dir} missing agents/openai.yaml.")


def check_hook_behavior() -> None:
    allowed = run_hook("pre-tool", {"tool_input": {"command": "pnpm test"}})
    require(allowed.returncode == 0, "pre-tool hook must allow pnpm test.")

    blocked = run_hook("pre-tool", {"tool_input": {"command": "npm install left-pad"}})
    require(blocked.returncode != 0, "pre-tool hook must block npm install.")

    secret = run_hook("user-prompt", {"prompt": "OPENAI_API_TOKEN=sk-abcdefghijklmnopqrstuvwxyz123456"})
    require(secret.returncode != 0, "user-prompt hook must block high-confidence secrets.")
    require(secret.stdout == "", "user-prompt hook must not echo input to stdout.")
    require(
        secret.stderr == "Blocked by homepage Codex hook: possible secret in prompt.\n",
        "user-prompt hook must emit only a fixed diagnostic without input data.",
    )

    safe_prompt = run_hook("user-prompt", {"prompt": "Please run the project tests."})
    require(safe_prompt.returncode == 0, "user-prompt hook must allow ordinary prompts.")

    # Construct synthetic credentials so the fixtures cannot be mistaken for real keys.
    for sample in (
        "AKIA" + "0123456789ABCDEF",
        "access_token=" + "x" * 32,
        "-----BEGIN " + "PRIVATE KEY-----",
    ):
        result = run_hook("user-prompt", {"prompt": sample})
        require(result.returncode != 0, "user-prompt hook must block each supported secret format.")
        require(result.stdout == "", "user-prompt hook must not echo input to stdout.")
        require(
            result.stderr == "Blocked by homepage Codex hook: possible secret in prompt.\n",
            "user-prompt hook must emit only a fixed diagnostic without input data.",
        )

    blocked_with_sensitive_input = run_hook(
        "pre-tool",
        {"tool_input": {"command": "npm install private-package --token=example-sensitive-value"}},
    )
    require(blocked_with_sensitive_input.returncode != 0, "pre-tool hook must still block npm install.")
    require(blocked_with_sensitive_input.stdout == "", "pre-tool hook must not echo commands to stdout.")
    require(
        blocked_with_sensitive_input.stderr
        == "Blocked by homepage Codex hook: This repository uses pnpm. Use the matching `pnpm` command instead.\n",
        "pre-tool hook must emit only the diagnostic without command arguments.",
    )

    with tempfile.TemporaryDirectory(prefix="homepage-codex-harness-") as workspace:
        temp_repo = Path(workspace)
        subprocess.run(["git", "init"], cwd=temp_repo, capture_output=True, text=True, check=True)
        sentinel = temp_repo / ".codex" / "untracked-harness-file"
        sentinel.parent.mkdir()
        sentinel.write_text("temporary harness verification sentinel\n", encoding="utf-8")

        untracked = run_hook("stop", {}, cwd=temp_repo)
        output = f"{untracked.stdout}\n{untracked.stderr}"
        require(untracked.returncode == 0, "stop hook must not fail with untracked harness files.")
        require("pnpm verify:codex" in output, "stop hook must notice untracked harness files.")

    stop = run_hook("stop", {})
    require(stop.returncode == 0, "stop hook must not fail normal runs.")


def run_hook(mode: str, payload: object, cwd: Path = ROOT) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["/usr/bin/python3", str(HOOK_SCRIPT), mode],
        input=json.dumps(payload),
        cwd=cwd,
        capture_output=True,
        text=True,
        check=False,
    )


def hook_commands(data: object) -> list[str]:
    commands: list[str] = []
    if not isinstance(data, dict):
        return commands
    for groups in data.get("hooks", {}).values():
        for group in groups:
            for hook in group.get("hooks", []):
                command = hook.get("command")
                if command:
                    commands.append(command)
    return commands


def load_toml(path: Path) -> dict:
    with path.open("rb") as file:
        return tomllib.load(file)


def read(path: Path) -> str:
    require(path.exists(), f"Missing file: {path}")
    return path.read_text(encoding="utf-8")


def parse_frontmatter(content: str) -> dict[str, str]:
    match = re.match(r"^---\n(.*?)\n---\n", content, re.DOTALL)
    require(match is not None, "Skill is missing YAML frontmatter.")
    values: dict[str, str] = {}
    for line in match.group(1).splitlines():
        key, _, value = line.partition(":")
        values[key.strip()] = value.strip().strip('"')
    return values


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(f"Codex harness verification failed: {message}")


if __name__ == "__main__":
    raise SystemExit(main())
