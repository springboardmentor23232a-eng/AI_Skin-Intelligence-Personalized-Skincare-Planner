# Skin Assessment Engine - Python/FastAPI Service

A rule-based skin health assessment engine built with Python, FastAPI, and PostgreSQL.

## Setup Instructions

### 1. Install Dependencies
```bash
cd python-engine
pip install -r requirements.txt
```

### 2. Configure Database
- Ensure PostgreSQL is running on localhost:5432
- Create a database named `skin_intelligence`
- Copy `.env.example` to `.env` and update database credentials if needed

### 3. Run the Application
```bash
# Option 1: Direct Python
python -m app.main

# Option 2: Using uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8001`

## API Endpoints

- `POST /api/assessment` - Create new assessment
- `GET /api/assessment` - Get all assessments
- `GET /api/assessment/{id}` - Get specific assessment
- `PUT /api/assessment/{id}` - Update assessment
- `DELETE /api/assessment/{id}` - Delete assessment
- `GET /api/assessment/history` - Get user assessment history
- `GET /api/assessment/risks/{id}` - Get risk factors for assessment

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8001/docs`
- ReDoc: `http://localhost:8001/redoc`
