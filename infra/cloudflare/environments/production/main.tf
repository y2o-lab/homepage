module "pages_site" {
  source = "../../modules/pages-site"

  account_id        = var.cloudflare_account_id
  custom_domain     = var.custom_domain
  dns_record_name   = var.dns_record_name
  manage_dns_record = var.manage_dns_record
  project_name      = var.project_name
  production_branch = "release"
  zone_id           = var.cloudflare_zone_id
}
