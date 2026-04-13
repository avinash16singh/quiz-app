terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.3.0"
}

provider "aws" {
  region     = var.aws_region
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
}

# ─── VPC ────────────────────────────────────────────────────────────────────
resource "aws_vpc" "quiz_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = { Name = "quiz-vpc" }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.quiz_vpc.id
  tags   = { Name = "quiz-igw" }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.quiz_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true
  tags                    = { Name = "quiz-public-subnet" }
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.quiz_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
  tags = { Name = "quiz-public-rt" }
}

resource "aws_route_table_association" "public_rta" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public_rt.id
}

# ─── SECURITY GROUP ─────────────────────────────────────────────────────────
resource "aws_security_group" "quiz_sg" {
  name        = "quiz-app-sg"
  description = "Allow HTTP, HTTPS, SSH, app ports"
  vpc_id      = aws_vpc.quiz_vpc.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "Backend API"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "Jenkins"
    from_port   = 8081
    to_port     = 8081
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "quiz-app-sg" }
}

# ─── KEY PAIR ───────────────────────────────────────────────────────────────
resource "aws_key_pair" "quiz_key" {
  key_name   = "quiz-app-key"
  public_key = file(var.public_key_path)
}

# ─── EC2 INSTANCE ───────────────────────────────────────────────────────────
resource "aws_instance" "quiz_server" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.quiz_sg.id]
  key_name               = aws_key_pair.quiz_key.key_name

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  user_data = templatefile("${path.module}/userdata.sh", {
    dockerhub_username = var.dockerhub_username
    dockerhub_password = var.dockerhub_password
    mysql_password     = var.mysql_root_password
    gemini_api_key     = var.gemini_api_key
    image_tag          = var.image_tag
  })

  tags = { Name = "quiz-app-server" }
}

# ─── ELASTIC IP ─────────────────────────────────────────────────────────────
resource "aws_eip" "quiz_eip" {
  instance = aws_instance.quiz_server.id
  domain   = "vpc"
  tags     = { Name = "quiz-eip" }
}
