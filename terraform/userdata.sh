#!/bin/bash
set -e

# Update system
apt-get update -y
apt-get install -y curl git unzip

# Install Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker ubuntu
systemctl enable docker
systemctl start docker

# Install Docker Compose v2
curl -SL "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-linux-x86_64" \
  -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Login to Docker Hub
echo "${dockerhub_password}" | docker login -u "${dockerhub_username}" --password-stdin

# Create app directory
mkdir -p /opt/quiz-app
cd /opt/quiz-app

# Write .env file
cat > .env <<EOF
DOCKERHUB_USERNAME=${dockerhub_username}
IMAGE_TAG=${image_tag}
MYSQL_ROOT_PASSWORD=${mysql_password}
GEMINI_API_KEY=${gemini_api_key}
EOF

# Write docker-compose.yml
cat > docker-compose.yml <<'COMPOSE'
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    container_name: quiz-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: quiz_app
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_ROOT_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    image: ${DOCKERHUB_USERNAME}/quiz-backend:${IMAGE_TAG}
    container_name: quiz-backend
    restart: always
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/quiz_app?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      GEMINI_API_KEY: ${GEMINI_API_KEY}
    depends_on:
      mysql:
        condition: service_healthy

  frontend:
    image: ${DOCKERHUB_USERNAME}/quiz-frontend:${IMAGE_TAG}
    container_name: quiz-frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
COMPOSE

# Pull and start
docker-compose pull
docker-compose up -d

# Install Jenkins
apt-get install -y openjdk-17-jdk
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | tee /etc/apt/sources.list.d/jenkins.list > /dev/null
apt-get update -y
apt-get install -y jenkins
# Run Jenkins on port 8081 to avoid conflict
sed -i 's/HTTP_PORT=8080/HTTP_PORT=8081/' /etc/default/jenkins 2>/dev/null || \
  sed -i 's/--httpPort=8080/--httpPort=8081/' /lib/systemd/system/jenkins.service 2>/dev/null || true
systemctl daemon-reload
systemctl enable jenkins
systemctl start jenkins

# Add jenkins user to docker group
usermod -aG docker jenkins
systemctl restart jenkins

echo "Bootstrap complete!"
