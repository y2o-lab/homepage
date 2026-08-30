output "custom_domain" {
  description = "Production custom domain; GitHub Actions passes this to Astro as SITE_URL."
  value       = module.pages_site.custom_domain
}

output "pages_project_name" {
  description = "Cloudflare Pages project name used by Wrangler in GitHub Actions."
  value       = module.pages_site.pages_project_name
}

output "pages_subdomain" {
  description = "Generated pages.dev hostname."
  value       = module.pages_site.pages_subdomain
}
