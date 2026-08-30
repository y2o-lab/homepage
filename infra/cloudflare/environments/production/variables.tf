variable "cloudflare_account_id" {
  description = "Cloudflare account ID that owns the Pages project."
  type        = string
  default     = "06109ed4642ce78eccfe61da32f44c9b"
  nullable    = false
}

variable "cloudflare_zone_id" {
  description = "Existing Cloudflare zone ID that contains custom_domain."
  type        = string
  default     = "ff325226cc30d0e6e3d50f7368d2f4a5"
  nullable    = false
}

variable "custom_domain" {
  description = "Production hostname to attach to Cloudflare Pages."
  type        = string
  default     = "yuno-i.com"
  nullable    = false
}

variable "dns_record_name" {
  description = "DNS record name in the Cloudflare zone; use @ for the apex."
  type        = string
  default     = "@"
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
  default     = "homepage"
  nullable    = false
}
