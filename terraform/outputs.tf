output "s3_bucket_name" {
  description = "S3 bucket name — use as AWS_S3_BUCKET env var"
  value       = aws_s3_bucket.media.bucket
}

output "cloudfront_domain" {
  description = "CloudFront domain — use as CLOUDFRONT_DOMAIN env var"
  value       = aws_cloudfront_distribution.media.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (for cache invalidation)"
  value       = aws_cloudfront_distribution.media.id
}
