# Infrastructure

デプロイ先ごとに Terraform の実装を分離しています。環境ごとの root module と、再利用する provider 固有 module を分けることで、将来ホスティング先を切り替えても既存の state や設定を混在させません。

```text
infra/
├── cloudflare/                  # 現在の本番実装
│   ├── environments/production/ # production 用 root module
│   └── modules/pages-site/      # Pages + DNS の再利用 module
└── vercel/                      # 将来の Vercel 実装の配置先
```

Terraform はリポジトリ直下の `mise.toml` でバージョンを固定しています。初回だけ `mise install` を実行してください。

Cloudflare の具体的な準備・実行手順は [cloudflare/README.md](cloudflare/README.md) を参照してください。
