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
                checkout scm
            }
        }

        stage('Start Test Database') {
            steps {
                sh 'docker-compose up -d db'
                sleep time: 30, unit: 'SECONDS'
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

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        docker run --rm \
                          --network=host \
                          -e SONAR_HOST_URL="$SONAR_HOST_URL" \
                          -e SONAR_TOKEN="$SONAR_AUTH_TOKEN" \
                          -v "$WORKSPACE:/usr/src" \
                          sonarsource/sonar-scanner-cli \
                          -Dsonar.projectKey=stockflow-inventory \
                          -Dsonar.projectName=StockFlow Inventory \
                          -Dsonar.sources=. \
                          -Dsonar.exclusions="**/node_modules/**,**/.git/**,**/build/**,**/dist/**,**/coverage/**"
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker-compose build'
            }
        }

        stage('Deploy to AWS (Live)') {
            steps {
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
            sh 'docker-compose down'
        }
    }
}
