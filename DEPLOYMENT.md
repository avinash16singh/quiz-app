# 🚀 Quiz App — AWS Deployment Guide
## Stack: Jenkins + Docker + Terraform + EC2

---

## 📋 PREREQUISITES (Install on your local machine)

| Tool      | Version | Download |
|-----------|---------|----------|
| Terraform | >= 1.3  | https://developer.hashicorp.com/terraform/install |
| AWS CLI   | >= 2.x  | https://aws.amazon.com/cli/ |
| Docker    | >= 24.x | https://www.docker.com/get-started |
| Git       | any     | https://git-scm.com |

---

## 🔑 YOUR CREDENTIALS (Pre-filled)

| Item                  | Value |
|-----------------------|-------|
| Docker Hub Username   | `avinashsingh12` |
| Docker Hub Password   | `01Avni10@` |
| GitHub Repo           | `https://github.com/avinashsingh16singh/quiz-app.git` |
| Backend Image         | `avinashsingh12/quiz-backend` |
| Frontend Image        | `avinashsingh12/quiz-frontend` |
| Gemini API Key        | `AIzaSyBUUsHdpgLEG_7gqyfaq8MGSWHvwFCLBtw` |

---

## STEP 1 — Push Project to GitHub

Open terminal in your project root and run:

```bash
cd c:\Users\asing370\Desktop\quiz-app\quiz-app

git init
git add .
git commit -m "Initial commit - Quiz App with CI/CD"
git remote add origin https://github.com/avinashsingh16singh/quiz-app.git
git branch -M main
git push -u origin main
```

---

## STEP 2 — Configure AWS CLI

```bash
aws configure
```
Enter when prompted:
```
AWS Access Key ID:     <your-aws-access-key>
AWS Secret Access Key: <your-aws-secret-key>
Default region:        us-east-1
Output format:         json
```
> Get AWS keys from: AWS Console → IAM → Users → Your User → Security Credentials → Create Access Key

---

## STEP 3 — Generate SSH Key (for EC2 access)

```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/quiz-app-key -N ""
```
This creates:
- `~/.ssh/quiz-app-key`      ← private key (keep safe)
- `~/.ssh/quiz-app-key.pub`  ← public key (Terraform uploads this to EC2)

---

## STEP 4 — Setup Terraform Variables

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Your `terraform.tfvars` is already pre-filled:
```hcl
aws_region          = "us-east-1"
instance_type       = "t3.medium"
ami_id              = "ami-0c7217cdde317cfec"
public_key_path     = "~/.ssh/quiz-app-key.pub"
dockerhub_username  = "avinashsingh12"
dockerhub_password  = "01Avni10@"
mysql_root_password = "StrongPassword123!"
gemini_api_key      = "AIzaSyBUUsHdpgLEG_7gqyfaq8MGSWHvwFCLBtw"
image_tag           = "latest"
```

> ⚠️ Only change `public_key_path` if your key is in a different location.

---

## STEP 5 — Build & Push Docker Images (First Time)

Run from project root:

```bash
# Login to Docker Hub
docker login -u avinashsingh12 -p 01Avni10@

# Build and push Backend
cd backend
docker build -t avinashsingh12/quiz-backend:latest .
docker push avinashsingh12/quiz-backend:latest

# Build and push Frontend
cd ../frontend
docker build -t avinashsingh12/quiz-frontend:latest .
docker push avinashsingh12/quiz-frontend:latest
```

---

## STEP 6 — Deploy Infrastructure with Terraform

```bash
cd terraform

terraform init
terraform plan
terraform apply -auto-approve
```

After ~2 minutes you will see:
```
Outputs:
  ec2_public_ip  = "X.X.X.X"
  app_url        = "http://X.X.X.X"
  jenkins_url    = "http://X.X.X.X:8081"
  ssh_command    = "ssh -i ~/.ssh/quiz-app-key ubuntu@X.X.X.X"
```

> ⏳ Wait 4-5 minutes after apply for EC2 to finish installing Docker + Jenkins

---

## STEP 7 — Configure Jenkins

### 7a. Open Jenkins
Go to: `http://EC2_PUBLIC_IP:8081`

### 7b. Get Admin Password
```bash
ssh -i ~/.ssh/quiz-app-key ubuntu@EC2_PUBLIC_IP
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### 7c. Install Plugins
- Click "Install suggested plugins"
- Then install these extra plugins:
  - `Docker Pipeline`
  - `SSH Agent`
  - `Credentials Binding`

### 7d. Add These 5 Credentials
Go to: **Manage Jenkins → Credentials → Global → Add Credential**

| Credential ID           | Kind                    | Value |
|-------------------------|-------------------------|-------|
| `dockerhub-credentials` | Username with password  | Username: `avinashsingh12` / Password: `01Avni10@` |
| `ec2-host`              | Secret text             | Your EC2 public IP (e.g. `54.x.x.x`) |
| `ec2-ssh-key`           | SSH Username with key   | Username: `ubuntu` / Private key: paste contents of `~/.ssh/quiz-app-key` |
| `mysql-root-password`   | Secret text             | `StrongPassword123!` |
| `gemini-api-key`        | Secret text             | `AIzaSyBUUsHdpgLEG_7gqyfaq8MGSWHvwFCLBtw` |

### 7e. Create Pipeline Job
1. New Item → name it `quiz-app` → select **Pipeline** → OK
2. Under **Pipeline** section:
   - Definition: `Pipeline script from SCM`
   - SCM: `Git`
   - Repository URL: `https://github.com/avinashsingh16singh/quiz-app.git`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
3. Click **Save** → Click **Build Now**

---

## STEP 8 — Verify Everything is Running

```bash
# SSH into EC2
ssh -i ~/.ssh/quiz-app-key ubuntu@EC2_PUBLIC_IP

# Check all containers are up
docker ps
```

Expected output:
```
CONTAINER ID   IMAGE                              STATUS
xxxx           avinashsingh12/quiz-frontend       Up
xxxx           avinashsingh12/quiz-backend        Up
xxxx           mysql:8.0                          Up (healthy)
```

Open in browser:
| URL | What |
|-----|------|
| `http://EC2_PUBLIC_IP` | 🎯 Quiz App |
| `http://EC2_PUBLIC_IP:8080/api/topics` | ✅ Backend API check |
| `http://EC2_PUBLIC_IP:8081` | 🔧 Jenkins |

---

## 🔄 CI/CD FLOW (After Setup)

Every time you push to GitHub:
```
git push origin main
        ↓
Jenkins pulls latest code
        ↓
Builds Backend JAR (Maven)
        ↓
Builds Docker images (Backend + Frontend) in parallel
        ↓
Pushes to Docker Hub:
  avinashsingh12/quiz-backend:BUILD_NUMBER
  avinashsingh12/quiz-frontend:BUILD_NUMBER
        ↓
SSH into EC2 → docker-compose pull → docker-compose up -d
        ↓
✅ App live at http://EC2_PUBLIC_IP
```

---

## 🧹 TEARDOWN (Delete all AWS resources)

```bash
cd terraform
terraform destroy -auto-approve
```

---

## 💰 ESTIMATED AWS COST

| Resource   | Type      | Cost/month |
|------------|-----------|------------|
| EC2        | t3.medium | ~$30       |
| Elastic IP | -         | ~$4        |
| EBS 20GB   | gp3       | ~$2        |
| **Total**  |           | **~$36/mo**|

> Use `t3.micro` for free tier testing — change `instance_type = "t3.micro"` in terraform.tfvars

---

## ❓ TROUBLESHOOTING

**App not loading:**
```bash
ssh -i ~/.ssh/quiz-app-key ubuntu@EC2_IP
cd /opt/quiz-app && docker-compose logs -f
```

**Jenkins pipeline fails at Deploy stage:**
- Check `ec2-host` credential has correct IP
- Check `ec2-ssh-key` has correct private key content

**Docker build fails:**
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

**MySQL not connecting:**
```bash
docker-compose logs mysql
# Wait for "ready for connections" message
```
