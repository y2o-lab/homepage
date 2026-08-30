variable "account_id" {
  description = "Cloudflare account ID that owns the Pages project."
  type        = string
  nullable    = false
}

variable "custom_domain" {
  description = "Fully qualified production hostname to associate with Pages."
  type        = string
  nullable    = false

  validation {
    condition     = can(regex("^[A-Za-z0-9][A-Za-z0-9.-]*[A-Za-z0-9]$", var.custom_domain))
    error_message = "custom_domain must be a valid hostname without a scheme or path."
  }
}

variable "dns_record_name" {
  description = "Record name in the Cloudflare zone; use @ for the zone apex."
  type        = string
  nullable    = false
}

variable "manage_dns_record" {
  description = "Whether Terraform manages the CNAME record in the Cloudflare zone."
  type        = bool
  default     = true
}

variable "production_branch" {
  description = "The only branch GitHub Actions may deploy to production."
  type        = string
  default     = "main"
  nullable    = false
}

variable "project_name" {
  description = "Cloudflare Pages project name."
  type        = string
  nullable    = false

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9-]*[a-z0-9]$", var.project_name))
    error_message = "project_name must use lowercase letters, numbers, and hyphens."
  }
}

variable "zone_id" {
  description = "Existing Cloudflare zone ID that owns custom_domain."
  type        = string
  nullable    = false
}
