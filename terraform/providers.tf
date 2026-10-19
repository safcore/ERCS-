# ==============================================================================
# Terraform Providers Configuration — ERCS AWS Deployment
# DevSecOps Practice: Pinned provider versions, parameterized region, zero hardcoded keys
# ==============================================================================

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "ERCS"
      Course      = "DevSecOps Lab CIAP"
      StudentRoll = "124BTCS1031"
      ManagedBy   = "Terraform"
      Environment = var.environment
    }
  }
}
