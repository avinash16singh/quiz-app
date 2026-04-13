variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "aws_access_key" {
  description = "AWS Access Key ID"
  type        = string
  sensitive   = true
}

variable "aws_secret_key" {
  description = "AWS Secret Access Key"
  type        = string
  sensitive   = true
}

variable "ami_id" {
  description = "Ubuntu 22.04 LTS AMI ID"
  type        = string
  default     = "ami-0c7217cdde317cfec"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
}

variable "public_key_path" {
  description = "Path to your SSH public key file"
  type        = string
  default     = "~/.ssh/quiz-app-key.pub"
}

variable "dockerhub_username" {
  description = "Docker Hub username"
  type        = string
}

variable "dockerhub_password" {
  description = "Docker Hub password or access token"
  type        = string
  sensitive   = true
}

variable "mysql_root_password" {
  description = "MySQL root password"
  type        = string
  sensitive   = true
}

variable "gemini_api_key" {
  description = "Google Gemini API key"
  type        = string
  sensitive   = true
}

variable "image_tag" {
  description = "Docker image tag to deploy"
  type        = string
  default     = "latest"
}
