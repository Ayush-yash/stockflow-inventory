# 📦 StockFlow - Cloud-Native Inventory Management System

![DevOps](https://img.shields.io/badge/DevOps-Jenkins-blue)
![Cloud](https://img.shields.io/badge/Cloud-AWS%20S3-orange)
![Docker](https://img.shields.io/badge/Container-Docker-2496ED)
![Backend](https://img.shields.io/badge/Backend-Node.js-339933)
![Database](https://img.shields.io/badge/Database-MySQL-4479A1)

StockFlow is a modern, full-stack inventory management system designed to track products, manage stock levels, and store product images in the cloud. It features a fully automated CI/CD pipeline and is entirely containerized for seamless deployment.

## ✨ Key Features
- **Dashboard Analytics**: Real-time overview of total products, stock levels, and out-of-stock alerts.
- **Cloud Storage Integration**: Product images are securely uploaded to and served directly from **AWS S3**.
- **Robust Backend**: RESTful API built with Node.js and Express, integrated with a MySQL database.
- **Containerized Architecture**: Fully dockerized application (Frontend, Backend, and DB) orchestrated via `docker-compose`.
- **CI/CD Automation**: Automated testing and build pipeline configured using **Jenkins**.

## 🛠️ Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js, Multer
- **Database**: MySQL 8.0
- **Cloud**: AWS S3 (Image Storage)
- **DevOps**: Docker, Docker Compose, Jenkins, Jest (Automated Testing)

## 🚀 CI/CD Pipeline Flow
Whenever new code is pushed to the `main` branch, a GitHub Webhook triggers the Jenkins pipeline which executes the following stages:
1. **Checkout Code**: Pulls the latest code from GitHub.
2. **Start Test Database**: Spins up an isolated MySQL Docker container.
3. **Install Dependencies**: Installs Node.js backend packages.
4. **Run Automated Tests**: Executes Jest API integration tests against the test database.
5. **Build Docker Images**: Verifies that the production Docker images build successfully.
6. **Clean Up**: Tears down the temporary test database container.

## ⚙️ Local Setup Instructions

### Prerequisites
- Docker & Docker Compose installed
- AWS Account (for S3 Bucket)

### 1. Clone the repository
```bash
git clone https://github.com/Ayush-yash/stockflow-inventory.git
cd stockflow-inventory
```

### 2. Configure Environment Variables
Create a `.env` file inside the `backend/` directory and add your database and AWS credentials:
```env
DB_HOST=db
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=stockflow
PORT=3000

AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=your_bucket_name
```

### 3. Run the Application
Start the entire stack (Frontend, Backend, MySQL) using Docker Compose:
```bash
docker-compose up -d --build
```

- **Frontend UI**: `http://localhost:5001`
- **Backend API**: `http://localhost:3001/api/products`

---
*Built with ❤️ for learning DevOps and Full-Stack development.*
