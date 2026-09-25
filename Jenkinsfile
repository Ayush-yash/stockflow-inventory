pipeline {
    agent any

    environment {
        DB_HOST = '127.0.0.1'
        DB_PORT = '3307'
        DB_USER = 'root'
        DB_PASSWORD = 'mysecretpassword'
        DB_NAME = 'stockflow'
        NODE_ENV = 'test'
    }

    stages {
        stage('Checkout Code') {
            steps {
                // Get the code from GitHub
                checkout scm
            }
        }
        
        stage('Start Test Database') {
            steps {
                // Start MySQL database in the background using Docker Compose
                sh 'docker-compose up -d db'
                // Wait for the database to initialize properly
                sleep time: 30, unit: 'SECONDS'
                // Create the test database inside the container
                sh 'docker exec stockflow_db mysql -uroot -pmysecretpassword -e "CREATE DATABASE IF NOT EXISTS stockflow_test;"'
            }
        }
        
        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }
        
        stage('Run Automated Tests') {
            steps {
                dir('backend') {
                    sh 'npm test'
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                // Test building the application images to ensure Dockerfile is correct
                sh 'docker-compose build'
            }
        }
        
        stage('Deploy to AWS (Live)') {
            steps {
                // Start all containers (DB, Backend, Frontend) in detached mode
                sh 'docker-compose up -d'
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline executed successfully! App is now LIVE on AWS.'
        }
        failure {
            echo 'Pipeline failed. Please check the logs.'
            // Only stop everything if it fails, so we don't leave broken containers
            sh 'docker-compose down'
        }
    }
}
