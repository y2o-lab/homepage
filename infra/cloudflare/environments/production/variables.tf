variable "cloudflare_account_id" {
  description = "TODO: Cloudflare account ID that owns the Pages project."
  type        = string
  nullable    = false
}

variable "cloudflare_zone_id" {
  description = "TODO: Existing Cloudflare zone ID that contains custom_domain."
  type        = string
  nullable    = false
}

variable "custom_domain" {
  description = "TODO: Production hostname to attach to Cloudflare Pages."
  type        = string
  nullable    = false
}

variable "dns_record_name" {
  description = "TODO: DNS record name in the Cloudflare zone; use @ for the apex."
  type        = string
  nullable    = false
}

variable "manage_dns_record" {
  description = "Set false only when DNS is managed outside the configured Cloudflare zone."
  type        = bool
  default     = true
}

variable "project_name" {
  description = "TODO: Cloudflare Pages project name."
  type        = string
  nullable    = false
}
