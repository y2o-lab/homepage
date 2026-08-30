resource "cloudflare_pages_project" "this" {
  account_id        = var.account_id
  name              = var.project_name
  production_branch = var.production_branch
}

resource "cloudflare_pages_domain" "this" {
  account_id   = var.account_id
  name         = var.custom_domain
  project_name = cloudflare_pages_project.this.name
}

resource "cloudflare_dns_record" "this" {
  count = var.manage_dns_record ? 1 : 0

  content = cloudflare_pages_project.this.subdomain
  name    = var.dns_record_name
  proxied = true
  ttl     = 1
  type    = "CNAME"
  zone_id = var.zone_id

  depends_on = [cloudflare_pages_domain.this]
}
