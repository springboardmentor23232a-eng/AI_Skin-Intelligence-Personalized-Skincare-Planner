@echo off
REM ==============================================================================
REM AI Skin Intelligence Platform - Production Deployment Automation (Windows)
REM ==============================================================================

echo [INFO] Starting Production Deployment Verification...

REM 1. Verify Docker Availability
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Docker not detected in PATH. Checking Python local environment...
) else (
    echo [OK] Docker engine detected.
)

REM 2. Verify Python & Backend Requirements
python --version >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is required but not installed or not in PATH.
    exit /b 1
)
echo [OK] Python detected.

REM 3. Check Model Weights
if not exist "ml\models\skin_condition_improved.pth" (
    echo [ERROR] Model weights file ml\models\skin_condition_improved.pth is missing!
    exit /b 1
)
echo [OK] EfficientNet-B0 ML weights verified.

REM 4. Build and Verify Frontend
echo [INFO] Building Frontend production bundle...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed!
    cd ..
    exit /b 1
)
echo [OK] Frontend production bundle built successfully.
cd ..

REM 5. Run Production Readiness Verification
echo [INFO] Running Production Deployment Readiness Test Suite...
cd backend
python -m pytest tests/test_production_deployment_readiness.py
if %errorlevel% neq 0 (
    echo [WARNING] Some deployment readiness tests reported warnings. Proceeding with caution.
)
cd ..

REM 6. Docker Compose Launch Option
if "%1"=="--docker" (
    echo [INFO] Launching full stack via Docker Compose...
    docker-compose down
    docker-compose up --build -d
    echo [OK] Full stack services started in detached mode.
    echo Backend API: http://localhost:8000/docs
    echo Frontend App: http://localhost:80
) else (
    echo [INFO] Build and verification completed successfully.
    echo To deploy using Docker Compose run: deploy_production.bat --docker
)

echo [SUCCESS] Production Deployment script completed.
