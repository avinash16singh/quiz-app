output "ec2_public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_eip.quiz_eip.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = aws_instance.quiz_server.public_dns
}

output "app_url" {
  description = "Quiz App URL"
  value       = "http://${aws_eip.quiz_eip.public_ip}"
}

output "backend_url" {
  description = "Backend API URL"
  value       = "http://${aws_eip.quiz_eip.public_ip}:8080"
}

output "jenkins_url" {
  description = "Jenkins URL"
  value       = "http://${aws_eip.quiz_eip.public_ip}:8081"
}

output "ssh_command" {
  description = "SSH command to connect to EC2"
  value       = "ssh -i ~/.ssh/id_rsa ubuntu@${aws_eip.quiz_eip.public_ip}"
}
