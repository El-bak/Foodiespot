pipeline {
    agent any

    environment {
        APP_DIR           = "foodiespot-backend"
        INFRA_DIR         = "foodiespot-backend/infra"
        IMAGE_NAME        = "foodiespot-backend"
        REGISTRY          = "ghcr.io/el-bak/foodiespot-backend"
        SONAR_PROJECT_KEY = "foodiespot-backend"
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {

        // 1. Checkout
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_SHA = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                }
                echo "Commit SHA: ${env.GIT_SHA}"
            }
        }

        // 2. Lint
        stage('Lint') {
            steps {
                sh """
                    docker run --rm \
                      --volumes-from jenkins \
                      -w /var/jenkins_home/workspace/foodiespot-pipeline/${APP_DIR} \
                      node:22-alpine \
                      sh -c "npm install --silent && npm run lint"
                """
            }
        }

        // 3. Build & Test
        stage('Build & Test') {
            steps {
                script {
                    sh """
                        docker build -t ${IMAGE_NAME}:${env.GIT_SHA} \
                                     -t ${IMAGE_NAME}:latest \
                                     ${APP_DIR}/
                    """
                    sh """
                        docker run --rm \
                          --volumes-from jenkins \
                          -w /var/jenkins_home/workspace/foodiespot-pipeline/${APP_DIR} \
                          ${IMAGE_NAME}:${env.GIT_SHA} \
                          sh -c "npm test -- --coverage --coverageReporters=lcov"
                    """
                }
            }
        }

        // 4. SonarQube Analysis
        stage('SonarQube Analysis') {
            environment {
                SONARQUBE_TOKEN = credentials('sonar-token')
            }
            steps {
                withSonarQubeEnv('sonarqube') {
                    sh """
                        docker run --rm \
                          --network cicd-network \
                          --volumes-from jenkins \
                          -w /var/jenkins_home/workspace/foodiespot-pipeline \
                          -e SONAR_HOST_URL=\${SONAR_HOST_URL} \
                          -e SONAR_TOKEN=\${SONARQUBE_TOKEN} \
                          sonarsource/sonar-scanner-cli:latest \
                          sonar-scanner \
                            -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                            -Dsonar.projectName=FoodieSpot \
                            -Dsonar.sources=${APP_DIR} \
                            -Dsonar.exclusions=${APP_DIR}/node_modules/**,${APP_DIR}/coverage/**,${APP_DIR}/data/** \
                            -Dsonar.javascript.lcov.reportPaths=${APP_DIR}/coverage/lcov.info \
                            -Dsonar.scanner.metadataFilePath=/var/jenkins_home/workspace/foodiespot-pipeline/report-task.txt
                    """
                }
            }
        }

        // 5. Quality Gate
        stage('Quality Gate') {
            steps {
                timeout(time: 15, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        // 6. Security Scan
        stage('Security Scan') {
            steps {
                sh """
                    docker run --rm \
                      -v /var/run/docker.sock:/var/run/docker.sock \
                      -v trivy-cache:/root/.cache/trivy \
                      aquasec/trivy:latest image \
                        --severity HIGH,CRITICAL \
                        --exit-code 0 \
                        --format table \
                        ${IMAGE_NAME}:${env.GIT_SHA}
                """
            }
        }

        // 7. Push (branche devops-pipeline pour tests, main pour prod)
        stage('Push to Registry') {
            when {
                branch 'devops-pipeline'
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'github-token',
                    usernameVariable: 'GHCR_USER',
                    passwordVariable: 'GHCR_TOKEN'
                )]) {
                    sh """
                        echo "\$GHCR_TOKEN" | docker login ghcr.io -u "\$GHCR_USER" --password-stdin
                        docker tag ${IMAGE_NAME}:${env.GIT_SHA} ${REGISTRY}:${env.GIT_SHA}
                        docker tag ${IMAGE_NAME}:${env.GIT_SHA} ${REGISTRY}:latest
                        docker push ${REGISTRY}:${env.GIT_SHA}
                        docker push ${REGISTRY}:latest
                    """
                }
            }
        }

        // 8. IaC Apply
        stage('IaC Apply') {
            steps {
                sh """
                    docker exec jenkins terraform --version || \
                    wget -q https://releases.hashicorp.com/terraform/1.7.0/terraform_1.7.0_linux_amd64.zip \
                      -O /tmp/terraform.zip && \
                    unzip -q /tmp/terraform.zip -d /usr/local/bin/
                """
                dir("${INFRA_DIR}") {
                    sh """
                        terraform init -input=false
                        terraform apply -input=false -auto-approve \
                          -var="image_name=${IMAGE_NAME}:${env.GIT_SHA}"
                        terraform output
                    """
                }
            }
        }

        // 9. Smoke Test
        stage('Smoke Test') {
            steps {
                sh "sleep 5"
                sh """
                    docker run --rm \
                      --network cicd-network \
                      curlimages/curl:latest \
                      curl -f http://foodiespot-staging:4000/health
                """
            }
        }
    }

    post {
        always {
            sh 'docker compose down -v 2>/dev/null || true'
        }
        success {
            echo "Pipeline reussi - commit ${env.GIT_SHA}"
        }
        failure {
            echo "Pipeline echoue - voir les logs ci-dessus"
        }
    }
}
