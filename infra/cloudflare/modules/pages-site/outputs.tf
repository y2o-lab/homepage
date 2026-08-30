output "custom_domain" {
  description = "Production custom domain associated with the Pages project."
  value       = cloudflare_pages_domain.this.name
}

output "pages_project_name" {
  description = "Cloudflare Pages project name."
  value       = cloudflare_pages_project.this.name
}

output "pages_subdomain" {
  description = "Cloudflare Pages generated pages.dev hostname."
  value       = cloudflare_pages_project.this.subdomain
}
