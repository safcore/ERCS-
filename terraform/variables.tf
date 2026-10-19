# ==============================================================================
# Terraform Variables — ERCS AWS Infrastructure
# DevSecOps Practice: Parameterized environment, Free Tier defaults
# ==============================================================================

variable "aws_region" {
  description = "The target AWS Region for ERCS infrastructure."
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment name (e.g., staging, production)."
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project identifier for resource naming and tagging."
  type        = string
  default     = "ercs"
}

variable "instance_type" {
  description = "EC2 instance type (defaults to AWS Free Tier eligible t2.micro)."
  type        = string
  default     = "t2.micro"
}

variable "vpc_cidr" {
  description = "CIDR block for the dedicated ERCS Virtual Private Cloud."
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for the public subnet."
  type        = string
  default     = "10.0.1.0/24"
}

variable "allowed_ssh_cidrs" {
  description = "List of authorized IPv4 CIDR blocks permitted to SSH into the EC2 instance (e.g., ['203.0.113.25/32']). Defaults to an empty list for security; remote access is provided via AWS Systems Manager (SSM) Session Manager."
  type        = list(string)
  default     = [] # Secure default: No public SSH port exposed; use AWS SSM Session Manager
}

variable "key_name" {
  description = "Optional EC2 Key Pair name for SSH administrative access."
  type        = string
  default     = ""
}
