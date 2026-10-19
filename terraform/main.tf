# ==============================================================================
# Terraform Main Infrastructure — ERCS AWS Architecture
# Architecture: VPC, Public Subnet, Security Groups, IAM Role, Encrypted EC2
# DevSecOps Practice: EBS encryption, Least-privilege IAM, Automated UserData bootstrap
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. NETWORKING (VPC, Subnet, Internet Gateway, Route Table)
# ------------------------------------------------------------------------------
resource "aws_vpc" "ercs_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

resource "aws_internet_gateway" "ercs_igw" {
  vpc_id = aws_vpc.ercs_vpc.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.ercs_vpc.id
  cidr_block              = var.public_subnet_cidr
  map_public_ip_on_launch = true
  availability_zone       = "${var.aws_region}a"

  tags = {
    Name = "${var.project_name}-public-subnet"
  }
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.ercs_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.ercs_igw.id
  }

  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_rt.id
}

# ------------------------------------------------------------------------------
# 2. SECURITY GROUP (Least-Privilege Ingress & Full Outbound)
# ------------------------------------------------------------------------------
resource "aws_security_group" "ercs_sg" {
  name        = "${var.project_name}-app-sg"
  description = "Controls inbound traffic to ERCS web containers and API"
  vpc_id      = aws_vpc.ercs_vpc.id

  # HTTP Port 80 (Nginx Frontend)
  ingress {
    description = "Allow inbound HTTP for Frontend"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Port 3000 (Docker Compose Frontend Mapping)
  ingress {
    description = "Allow inbound HTTP on port 3000"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Port 5000 (Flask REST API direct access / testing)
  ingress {
    description = "Allow inbound traffic on port 5000 for Flask API"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # SSH Port 22 (Conditional: Only provisioned if explicit administrator CIDRs are provided)
  dynamic "ingress" {
    for_each = length(var.allowed_ssh_cidrs) > 0 ? [1] : []
    content {
      description = "Allow restricted SSH access from specified administrator CIDRs"
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = var.allowed_ssh_cidrs
    }
  }

  # Outbound egress (Allow package updates, container registry pulls)
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-security-group"
  }
}

# ------------------------------------------------------------------------------
# 3. IAM ROLE & INSTANCE PROFILE (DevSecOps Least Privilege)
# ------------------------------------------------------------------------------
resource "aws_iam_role" "ercs_ec2_role" {
  name = "${var.project_name}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action    = "sts:AssumeRole"
        Effect    = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# Attach AWS SSM Managed Policy for secure remote access without open SSH
resource "aws_iam_role_policy_attachment" "ssm_policy" {
  role       = aws_iam_role.ercs_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Attach AWS ECR ReadOnly Policy so EC2 can pull container images from ECR
resource "aws_iam_role_policy_attachment" "ecr_readonly_policy" {
  role       = aws_iam_role.ercs_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_instance_profile" "ercs_profile" {
  name = "${var.project_name}-instance-profile"
  role = aws_iam_role.ercs_ec2_role.name
}

# ------------------------------------------------------------------------------
# 4. ECR REPOSITORIES (Container Registry for Backend & Frontend Images)
# ------------------------------------------------------------------------------
resource "aws_ecr_repository" "ercs_backend" {
  name                 = "${var.project_name}-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.project_name}-backend-repo"
  }
}

resource "aws_ecr_repository" "ercs_frontend" {
  name                 = "${var.project_name}-frontend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.project_name}-frontend-repo"
  }
}

# ------------------------------------------------------------------------------
# 5. AMI DATA SOURCE (Ubuntu 22.04 LTS x86_64)
# ------------------------------------------------------------------------------
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ------------------------------------------------------------------------------
# 6. EC2 COMPUTE INSTANCE (Encrypted EBS & Automated Bootstrap)
# ------------------------------------------------------------------------------
resource "aws_instance" "ercs_host" {
  ami                  = data.aws_ami.ubuntu.id
  instance_type        = var.instance_type
  subnet_id            = aws_subnet.public_subnet.id
  vpc_security_group_ids = [aws_security_group.ercs_sg.id]
  iam_instance_profile = aws_iam_instance_profile.ercs_profile.name
  key_name             = var.key_name != "" ? var.key_name : null

  # Encrypt root volume for security compliance
  root_block_device {
    volume_size           = 20
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
    tags = {
      Name = "${var.project_name}-encrypted-root"
    }
  }

  # Automated UserData bootstrap script to configure Docker and launch ERCS
  user_data = <<-EOF
              #!/bin/bash
              set -ex

              # System update
              apt-get update -y
              apt-get install -y ca-certificates curl gnupg lsb-release git

              # Install Docker Engine & Docker Compose
              install -m 0755 -d /etc/apt/keyrings
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
              chmod a+r /etc/apt/keyrings/docker.gpg

              echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

              apt-get update -y
              apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

              systemctl enable docker
              systemctl start docker
              usermod -aG docker ubuntu

              # Clone ERCS Repository and launch containers
              mkdir -p /opt/ercs
              cd /opt/ercs
              git clone https://github.com/safcore/ERCS-.git .
              docker compose up -d

              echo "ERCS Deployment Completed Successfully" > /var/log/ercs-init.log
              EOF

  tags = {
    Name = "${var.project_name}-production-server"
  }
}
