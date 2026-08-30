# Vercel

Vercel へ切り替える場合の Terraform 実装はこのディレクトリに配置します。Cloudflare の state や module を共有せず、次の構造を起点にします。

```text
vercel/
├── environments/production/
└── modules/
```

現在の production は Cloudflare Pages を使用しているため、Vercel 用の provider やリソースはまだ追加していません。
