#!/usr/bin/env python3
"""Repo-local Codex hook handlers for the homepage project."""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from collections.abc import Iterable
from pathlib import Path
from typing import Any


BLOCKED_COMMANDS: tuple[tuple[re.Pattern[str], str], ...] = (
    (
        re.compile(r"\bgit\s+reset\s+--hard\b"),
        "Do not run `git reset --hard` from an agent session. Preserve user work.",
    ),
    (
        re.compile(r"\bgit\s+clean\s+-[^\n]*[fdx][^\n]*\b"),
        "Do not run destructive `git clean` commands from an agent session.",
    ),
    (
        re.compile(r"\brm\s+-[^\n]*[rf][^\n]*\s+(?:/|~|\$HOME|\.\.?|\S*/\.git)(?:\s|$)"),
        "The command looks like a broad destructive removal. Narrow the path or ask explicitly.",
    ),
    (
        re.compile(r"\b(?:npm|yarn|bun)\s+(?:install|add|remove|update)\b"),
        "This repository uses pnpm. Use the matching `pnpm` command instead.",
    ),
    (
        re.compile(r"\b(?:curl|wget)\b[^\n|]*(?:\|\s*(?:sh|bash|zsh)|>\s*/tmp/)", re.IGNORECASE),
        "Do not pipe downloaded scripts into a shell from a project agent workflow.",
    ),
    (
        re.compile(r"\bchmod\s+-R\s+777\b"),
        "Do not recursively make project files world-writable.",
    ),
)

SECRET_PATTERNS: tuple[tuple[re.Pattern[str], str], ...] = (
    (re.compile(r"\bsk-[A-Za-z0-9_-]{20,}\b"), "OpenAI-style API key"),
    (re.compile(r"\bAKIA[0-9A-Z]{16}\b"), "AWS access key id"),
    (re.compile(r"(?i)\b(?:api|access|secret|refresh)_?token\s*=\s*['\"]?[\w./+=-]{16,}"), "token assignment"),
    (re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"), "private key"),
)


def main() -> int:
    mode = sys.argv[1] if len(sys.argv) > 1 else ""
    event = read_event()

    if mode == "pre-tool":
        return pre_tool(event)
    if mode == "user-prompt":
        return user_prompt(event)
    if mode == "stop":
        return stop(event)

    print(f"Unknown hook mode: {mode}", file=sys.stderr)
    return 1


def read_event() -> Any:
    raw = sys.stdin.read()
    if not raw.strip():
        return {}
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"raw": raw}


def pre_tool(event: Any) -> int:
    command = extract_command(event)
    if not command:
        return 0

    for pattern, message in BLOCKED_COMMANDS:
        if pattern.search(command):
            print(f"Blocked by homepage Codex hook: {message}", file=sys.stderr)
            return 1

    return 0


def user_prompt(event: Any) -> int:
    text = extract_prompt_text(event)
    if not text:
        return 0

    if any(pattern.search(text) for pattern, _ in SECRET_PATTERNS):
        print("Blocked by homepage Codex hook: possible secret in prompt.", file=sys.stderr)
        return 1

    return 0


def stop(event: Any) -> int:
    repo_root = find_repo_root()
    if repo_root is None:
        return 0

    changed = changed_files(repo_root)
    if not changed:
        return 0

    touched = "\n".join(f"  - {path}" for path in changed[:20])
    print("Homepage Codex reminder: verify changed source before finalizing.", file=sys.stderr)
    print(touched, file=sys.stderr)

    if any(path.startswith((".codex/", ".agents/")) or path == "AGENTS.md" for path in changed):
        print("Run `pnpm verify:codex` for harness changes.", file=sys.stderr)
    if any(path.startswith(("src/", "tests/")) or path in PROJECT_CODE_FILES for path in changed):
        print("Run the relevant checks, usually `pnpm check:code`, `pnpm test`, and `pnpm build`.", file=sys.stderr)

    return 0


def extract_command(value: Any) -> str:
    for found in walk_strings_for_keys(value, {"command", "cmd", "shell_command"}):
        if found.strip():
            return found.strip()
    return ""


def extract_prompt_text(value: Any) -> str:
    direct = list(walk_strings_for_keys(value, {"prompt", "user_prompt", "text", "content", "raw"}))
    if direct:
        return "\n".join(direct)
    if isinstance(value, str):
        return value
    return ""


def walk_strings_for_keys(value: Any, keys: set[str]) -> Iterable[str]:
    if isinstance(value, dict):
        for key, item in value.items():
            if key in keys and isinstance(item, str):
                yield item
            else:
                yield from walk_strings_for_keys(item, keys)
    elif isinstance(value, list):
        for item in value:
            yield from walk_strings_for_keys(item, keys)


def find_repo_root() -> Path | None:
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            check=True,
            capture_output=True,
            text=True,
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None
    return Path(result.stdout.strip())


def changed_files(repo_root: Path) -> list[str]:
    try:
        result = subprocess.run(
            ["git", "status", "--porcelain=v1", "--untracked-files=all"],
            cwd=repo_root,
            check=True,
            capture_output=True,
            text=True,
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        return []
    return [path for line in result.stdout.splitlines() if (path := parse_status_path(line))]


def parse_status_path(line: str) -> str:
    if len(line) < 4:
        return ""

    path = line[3:]
    if " -> " in path:
        path = path.rsplit(" -> ", 1)[1]
    return path.strip('"')


PROJECT_CODE_FILES = {
    "astro.config.mjs",
    "biome.json",
    "package.json",
    "playwright.config.ts",
    "src/content.config.ts",
    "src/site.config.ts",
    "tsconfig.json",
    "vitest.config.ts",
}


if __name__ == "__main__":
    raise SystemExit(main())
