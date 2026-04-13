pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_USERNAME     = "avinashsingh12"
        IMAGE_TAG              = "${BUILD_NUMBER}"
        BACKEND_IMAGE          = "avinashsingh12/quiz-backend"
        FRONTEND_IMAGE         = "avinashsingh12/quiz-frontend"
        EC2_HOST               = credentials('ec2-host')
        EC2_SSH_KEY            = credentials('ec2-ssh-key')
        MYSQL_ROOT_PASSWORD    = credentials('mysql-root-password')
        GEMINI_API_KEY         = credentials('gemini-api-key')
        AWS_ACCESS_KEY_ID      = "AKIARDFCLRPQQ24QKH43"
        AWS_SECRET_ACCESS_KEY  = "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"
        AWS_DEFAULT_REGION     = "us-east-1"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo "✅ Code checked out — Branch: ${env.BRANCH_NAME}, Build: #${BUILD_NUMBER}"
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'mvn clean package -DskipTests -B'
                    echo "✅ Backend JAR built"
                }
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Backend Image') {
                    steps {
                        dir('backend') {
                            sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest ."
                            echo "✅ Backend Docker image built"
                        }
                    }
                }
                stage('Frontend Image') {
                    steps {
                        dir('frontend') {
                            sh "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest ."
                            echo "✅ Frontend Docker image built"
                        }
                    }
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                sh "echo ${DOCKERHUB_CREDENTIALS_PSW} | docker login -u ${DOCKERHUB_CREDENTIALS_USR} --password-stdin"
                sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
                sh "docker push ${BACKEND_IMAGE}:latest"
                sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                sh "docker push ${FRONTEND_IMAGE}:latest"
                echo "✅ Images pushed to Docker Hub"
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(credentials: ['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@${EC2_HOST} '
                            cd /opt/quiz-app

                            # Update .env with new image tag
                            sed -i "s/IMAGE_TAG=.*/IMAGE_TAG=${IMAGE_TAG}/" .env

                            # Pull latest images
                            docker-compose pull

                            # Rolling restart
                            docker-compose up -d --remove-orphans

                            # Clean old images
                            docker image prune -f

                            echo "Deployment complete!"
                        '
                    """
                }
                echo "✅ Deployed to EC2 — http://${EC2_HOST}"
            }
        }
    }

    post {
        success {
            echo """
            ╔══════════════════════════════════════╗
            ║   ✅ DEPLOYMENT SUCCESSFUL            ║
            ║   App:     http://${EC2_HOST}         ║
            ║   Backend: http://${EC2_HOST}:8080    ║
            ║   Build:   #${BUILD_NUMBER}           ║
            ╚══════════════════════════════════════╝
            """
        }
        failure {
            echo "❌ Pipeline failed at stage: ${env.STAGE_NAME}"
        }
        always {
            sh 'docker logout || true'
        }
    }
}
