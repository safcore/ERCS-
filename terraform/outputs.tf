# ==============================================================================
# Terraform Outputs — ERCS Deployment Endpoints
# ==============================================================================

output "instance_id" {
  description = "The unique ID of the provisioned EC2 instance."
  value       = aws_instance.ercs_host.id
}

output "instance_public_ip" {
  description = "The public IPv4 address of the ERCS server."
  value       = aws_instance.ercs_host.public_ip
}

output "instance_public_dns" {
  description = "The public DNS name assigned to the instance."
  value       = aws_instance.ercs_host.public_dns
}

output "application_url" {
  description = "The public HTTP URL to access the ERCS Frontend."
  value       = "http://${aws_instance.ercs_host.public_ip}:3000"
}

output "backend_api_health_url" {
  description = "The direct health check endpoint for the Flask REST API."
  value       = "http://${aws_instance.ercs_host.public_ip}:5000/api/system/health"
}

output "ecr_backend_repository_url" {
  description = "The URL of the Amazon ECR repository for the backend image."
  value       = aws_ecr_repository.ercs_backend.repository_url
}

output "ecr_frontend_repository_url" {
  description = "The URL of the Amazon ECR repository for the frontend image."
  value       = aws_ecr_repository.ercs_frontend.repository_url
}
