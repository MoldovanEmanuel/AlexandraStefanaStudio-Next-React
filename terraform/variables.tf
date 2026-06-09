variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-central-1"
}

variable "s3_bucket_name" {
  description = "S3 bucket name for media uploads"
  type        = string
  default     = "alexandrastefana-studio-media"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"

  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Must be development, staging, or production"
  }
}

variable "app_url" {
  description = "Application URL (for CORS)"
  type        = string
  default     = "https://alexandrastefana.studio"
}
