# Cloudflare Pages production

この構成は、Cloudflare Pages の Direct Upload と GitHub Actions を使って `release` だけを production にデプロイします。Cloudflare の Git 連携は使わないため、Cloudflare Pages の preview deployment は作成されません。

Terraform が管理するものは次のとおりです。

- Cloudflare Pages project（production branch: `release`）
- custom domain の Pages への紐付け
- 既存 Cloudflare zone 内の Pages 向け CNAME

`main` から `release-infra` への PR では `.github/workflows/manage-cloudflare-pages-infrastructure.yml` が Terraform plan を実行します。`release-infra` へマージされると、同 workflow が Terraform apply を実行します。

`release` へマージされたときは、Web の入力（`src/`、`public/`、Astro 設定、依存関係定義）に変更がある場合だけ `.github/workflows/deploy-cloudflare-pages.yml` がビルドと Direct Upload を実行します。upload 後に active production deployment 以外の Pages deployment を削除するため、古い deployment URL を残しません。Terraform と Wrangler は同じリソースを二重管理しません。

## 初回準備

1. Cloudflare に対象ドメインの zone を追加し、apex domain を使う場合は nameserver を Cloudflare に向けます。
2. Terraform state 専用の R2 bucket を作成します。state backend 自身は Terraform で作成できないため、Cloudflare dashboard または `wrangler r2 bucket create <TODO_BUCKET_NAME>` で先に作成してください。
3. その bucket に限定した `Object Read & Write` 権限の R2 API token を作成し、Access Key ID と Secret Access Key を控えます。
4. `terraform.tfvars.example` と `backend.hcl.example` をコピーし、すべての `TODO` を実値に置き換えます。実ファイルは Git にコミットしません。

```sh
mise install

cd infra/cloudflare/environments/production
cp terraform.tfvars.example terraform.tfvars
cp backend.hcl.example backend.hcl

export CLOUDFLARE_API_TOKEN='TODO: Cloudflare API token'
export AWS_ACCESS_KEY_ID='TODO: R2 access key ID'
export AWS_SECRET_ACCESS_KEY='TODO: R2 secret access key'

mise exec terraform -- terraform init -backend-config=backend.hcl
mise exec terraform -- terraform fmt -check -recursive
mise exec terraform -- terraform validate
mise exec terraform -- terraform plan
mise exec terraform -- terraform apply
```

`CLOUDFLARE_API_TOKEN` には、対象 account の **Pages: Edit** と、対象 zone の **DNS: Edit** 権限を付与してください。Cloudflare zone でない subdomain を使う場合は、DNS record をその DNS provider 側で `project.pages.dev` に作成し、`manage_dns_record = false` を指定します。

## GitHub Actions secrets

各 workflow には、次の repository secrets が必要です。`production` environment を使うため、environment secrets として設定する場合は、PR の plan と `release-infra` / `release` へのマージを承認対象にしてください。

| Secret | 用途 |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Terraform と Pages Direct Upload。Pages: Edit / Zone: DNS Edit が必要です。 |
| `CLOUDFLARE_ACCOUNT_ID` | Terraform と Wrangler の Cloudflare account ID。 |
| `R2_ACCESS_KEY_ID` | Terraform backend 用の R2 Access Key ID。 |
| `R2_SECRET_ACCESS_KEY` | Terraform backend 用の R2 Secret Access Key。 |
| `TF_BACKEND_BUCKET` | Terraform state 用 R2 bucket 名。 |
| `TF_BACKEND_ENDPOINT` | `https://TODO_ACCOUNT_ID.r2.cloudflarestorage.com`。 |

`TF_BACKEND_BUCKET` と `TF_BACKEND_ENDPOINT` は機密情報ではありませんが、workflow で一貫して扱うため secrets として指定しています。GitHub repository variables に切り替える場合は workflow の `secrets.` を `vars.` に置き換えてください。

Terraform の入力値は workflow が `CLOUDFLARE_ACCOUNT_ID` と、Git にコミットしない `terraform.tfvars` ではなく GitHub secrets から受け取ります。現在は `terraform.tfvars` に custom domain などの非機密設定を置くため、CI では `TF_VAR_*` secrets を追加してください。

| Required CI secret | 値 |
| --- | --- |
| `TF_VAR_project_name` | TODO: Pages project name |
| `TF_VAR_custom_domain` | TODO: production hostname（例: `example.com`） |
| `TF_VAR_cloudflare_zone_id` | TODO: Cloudflare zone ID |
| `TF_VAR_dns_record_name` | TODO: zone 内の record name（apex は `@`） |

`terraform.tfvars` を GitHub Actions でも使う場合は、上記 `TF_VAR_*` secrets の代わりに安全な設定配布方法を用意してください。`terraform.tfvars` 自体をコミットする場合も、API token などの secret は絶対に含めません。

## 既存リソース

既に Pages project / custom domain / DNS record を作成済みの場合、重複作成を避けるため先に import します。resource address は次のとおりです。

```sh
mise exec terraform -- terraform import module.pages_site.cloudflare_pages_project.this '<TODO_ACCOUNT_ID>/<TODO_PROJECT_NAME>'
mise exec terraform -- terraform import module.pages_site.cloudflare_pages_domain.this '<TODO_ACCOUNT_ID>/<TODO_PROJECT_NAME>/<TODO_CUSTOM_DOMAIN>'
mise exec terraform -- terraform import module.pages_site.cloudflare_dns_record.this '<TODO_ZONE_ID>/<TODO_DNS_RECORD_ID>'
```

Cloudflare Pages custom domain を関連付けるだけでは DNS record は作成されないため、この構成では DNS record も Terraform が管理します。
