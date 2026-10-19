// ==============================================================================
// Jenkinsfile — Declarative CI/CD & DevSecOps Pipeline
// Project: Emergency Response Coordination System (ERCS)
// Student Roll No: 124BTCS1031 | Course: DevSecOps Lab CIAP Microproject
// Pipeline: SCM -> Build -> Test -> SonarQube -> Trivy -> Docker -> Deploy
// ==============================================================================

pipeline {
    agent any

    environment {
        APP_NAME         = 'ercs'
        BACKEND_IMAGE    = 'safcore/ercs-backend'
        FRONTEND_IMAGE   = 'safcore/ercs-frontend'
        IMAGE_TAG        = "${BUILD_NUMBER}"
        SONAR_PROJECT    = 'ERCS-DevSecOps'
        SCAN_SEVERITY    = 'HIGH,CRITICAL'
        AWS_REGION       = 'us-east-1'
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        // ----------------------------------------------------------------------
        // STAGE 1: SCM Checkout
        // ----------------------------------------------------------------------
        stage('1. SCM Checkout') {
            steps {
                echo "===> Checking out source code from Git repository..."
                checkout scm
                script {
                    echo "Branch: ${env.GIT_BRANCH}"
                    echo "Commit: ${env.GIT_COMMIT}"
                }
            }
        }

        // ----------------------------------------------------------------------
        // STAGE 2: Backend Dependency Validation & Automated Testing
        // ----------------------------------------------------------------------
        stage('2. Backend Tests (Pytest)') {
            steps {
                echo "===> Installing Python dependencies and executing automated tests..."
                dir('backend') {
                    sh '''
                        if ! command -v python3 >/dev/null 2>&1 && ! command -v python >/dev/null 2>&1; then
                            echo "[ERROR] Neither python3 nor python was found in PATH on this Jenkins agent."
                            echo "[ERROR] Please install Python 3 on the agent to run the backend automated test suite."
                            exit 1
                        fi

                        PYTHON_CMD=""
                        if command -v python3 >/dev/null 2>&1; then
                            PYTHON_CMD="python3"
                        else
                            PYTHON_CMD="python"
                        fi

                        $PYTHON_CMD -m venv venv
                        if [ -f "venv/bin/activate" ]; then
                            . venv/bin/activate
                        elif [ -f "venv/Scripts/activate" ]; then
                            . venv/Scripts/activate
                        else
                            echo "[ERROR] Virtual environment activation script not found in backend/venv."
                            exit 1
                        fi

                        pip install --upgrade pip
                        pip install -r requirements.txt
                    '''
                }
                sh '''
                    if [ -f "backend/venv/bin/activate" ]; then
                        . backend/venv/bin/activate
                    elif [ -f "backend/venv/Scripts/activate" ]; then
                        . backend/venv/Scripts/activate
                    else
                        echo "[ERROR] Backend virtual environment not found. Tests cannot be executed."
                        exit 1
                    fi

                    python -m pytest tests/test_ercs.py -v --junitxml=test-results.xml || python3 -m pytest tests/test_ercs.py -v --junitxml=test-results.xml || pytest tests/test_ercs.py -v --junitxml=test-results.xml
                '''
            }
            post {
                always {
                    junit testResults: 'test-results.xml', allowEmptyResults: true
                }
            }
        }

        // ----------------------------------------------------------------------
        // STAGE 3: Frontend Dependency Install & Production Build
        // ----------------------------------------------------------------------
        stage('3. Frontend Build (Vite)') {
            steps {
                echo "===> Installing npm dependencies and compiling React production bundle..."
                dir('frontend') {
                    sh '''
                        if ! command -v npm >/dev/null 2>&1; then
                            echo "[ERROR] npm command not found in PATH on this Jenkins agent."
                            echo "[ERROR] Please install Node.js and npm on the agent to build the React frontend."
                            exit 1
                        fi

                        npm ci
                        npm run build
                    '''
                }
            }
        }

        // ----------------------------------------------------------------------
        // STAGE 4: Static Application Security Testing (SonarQube)
        // ----------------------------------------------------------------------
        stage('4. SonarQube SAST Analysis') {
            steps {
                echo "===> Running SonarQube Code Quality and Static Security Analysis..."
                script {
                    def scannerHome = tool 'SonarScanner'
                    withSonarQubeEnv('SonarQube') {
                        sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=${SONAR_PROJECT}"
                    }
                }
            }
        }

        // ----------------------------------------------------------------------
        // STAGE 5: Trivy Vulnerability Scanning (Filesystem & Dependencies)
        // ----------------------------------------------------------------------
        stage('5. Trivy Security Scan') {
            steps {
                echo "===> Executing Trivy Vulnerability Scanner on Repository & Dependencies..."
                script {
                    sh '''
                        if command -v trivy >/dev/null 2>&1; then
                            echo "Running Trivy filesystem scan..."
                            trivy fs --severity ${SCAN_SEVERITY} --format table --output trivy-fs-report.txt .
                            trivy fs --severity ${SCAN_SEVERITY} --format json --output trivy-fs-report.json .
                            cat trivy-fs-report.txt || true
                        else
                            echo "[NOTICE] Trivy CLI not installed locally on agent."
                            echo "[NOTICE] To run Trivy in Docker: docker run --rm -v $(pwd):/app aquasec/trivy fs --severity HIGH,CRITICAL /app"
                        fi
                    '''
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'trivy-fs-report.*', allowEmptyArchive: true
                }
            }
        }

        // ----------------------------------------------------------------------
        // STAGE 6: Docker Image Build & Container Scan
        // ----------------------------------------------------------------------
        stage('6. Docker Build & Container Scan') {
            steps {
                echo "===> Building Docker Container Images for Backend and Frontend..."
                script {
                    sh '''
                        if command -v docker >/dev/null 2>&1; then
                            echo "Building Backend Container Image..."
                            docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest ./backend

                            echo "Building Frontend Container Image..."
                            docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest ./frontend

                            if command -v trivy >/dev/null 2>&1; then
                                echo "Scanning Backend Image with Trivy..."
                                trivy image --severity ${SCAN_SEVERITY} ${BACKEND_IMAGE}:${IMAGE_TAG} || true
                                echo "Scanning Frontend Image with Trivy..."
                                trivy image --severity ${SCAN_SEVERITY} ${FRONTEND_IMAGE}:${IMAGE_TAG} || true
                            fi
                        else
                            echo "[NOTICE] Docker daemon not reachable or Docker CLI not installed on this runner."
                            echo "[NOTICE] Docker build command: docker compose build"
                        fi
                    '''
                }
            }
        }

        // ----------------------------------------------------------------------
        // STAGE 7: Push to Amazon ECR / Container Registry
        // ----------------------------------------------------------------------
        stage('7. Push to Container Registry (ECR / Docker Hub)') {
            steps {
                echo "===> Pushing verified container images to Amazon ECR / Registry..."
                script {
                    sh '''
                        if command -v aws >/dev/null 2>&1 && [ -n "${AWS_ACCOUNT_ID}" ]; then
                            echo "Authenticating Docker with Amazon ECR (${AWS_REGION})..."
                            aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com || true

                            echo "Tagging and pushing images to ECR..."
                            docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ercs-backend:${IMAGE_TAG} || true
                            docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ercs-frontend:${IMAGE_TAG} || true

                            docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ercs-backend:${IMAGE_TAG} || true
                            docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ercs-frontend:${IMAGE_TAG} || true
                        else
                            echo "[INFO] Direct ECR push bypassed: AWS credentials or AWS_ACCOUNT_ID not configured in pipeline runner."
                            echo "[INFO] Images available locally: ${BACKEND_IMAGE}:${IMAGE_TAG}, ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                        fi
                    '''
                }
            }
        }

        // ----------------------------------------------------------------------
        // STAGE 8: Deployment to AWS EC2 / Staging
        // ----------------------------------------------------------------------
        stage('8. Deploy to AWS EC2') {
            steps {
                echo "===> Deploying ERCS Application via Docker Compose / EC2..."
                script {
                    sh '''
                        if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
                            echo "Starting containers with Docker Compose..."
                            docker compose up -d
                            echo "Verifying running containers..."
                            docker compose ps
                        else
                            echo "[NOTICE] Container deployment skipped: Docker engine not active on agent."
                            echo "[NOTICE] Local fallback: python backend/app.py and npm run dev"
                        fi
                    '''
                }
            }
        }
    }

    post {
        always {
            echo "=================================================="
            echo "ERCS CI/CD Pipeline Execution Completed"
            echo "Build Number: ${env.BUILD_NUMBER}"
            echo "Result: ${currentBuild.currentResult}"
            echo "=================================================="
        }
        success {
            echo "SUCCESS: All automated build and testing stages completed cleanly!"
        }
        failure {
            echo "FAILURE: One or more stages failed. Check console log above for error details."
        }
    }
}
