# Module 3: Skin Assessment Engine

**AI Skin Intelligence & Personalized Skincare Planner**

The **Skin Assessment Engine** is a high-performance Python FastAPI service that analyzes user skin profiles and generates multi-dimensional skin health assessments, weighted health scores (0–100), prioritized concern taxonomies, and rule-based risk factor analyses backed by PostgreSQL.

---

## Key Features

1. **Skin Assessment CRUD APIs**: Full lifecycle management of user skin assessments.
2. **Skin Health Score Calculation**: Algorithmic scoring engine combining 10 skin & lifestyle parameters (Hydration, Sebum Balance, Acne Index, Tone, Sensitivity, UV Exposure, Sleep, Stress).
3. **Concern Identification & Prioritization**: Automatically identifies active concerns (Acne, Hyperpigmentation, Dehydration, Barrier Impairment, Premature Aging), classifies severity (`Mild`, `Moderate`, `Severe`, `Critical`), and ranks priority `1..N`.
4. **Rule-Based Risk Factor Analysis**: Multi-variable rule engine identifying skin health risks (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) with actionable clinical mitigation advice.
5. **Assessment History & Trend Analysis**: Chronological scanning history, average scores, and trend detection (`Improving`, `Stable`, `Declining`).
6. **JWT Authentication**: Secured with JWT Bearer Token authorization compatible with platform credentials.
7. **Containerized Architecture**: Production-ready `Dockerfile` and `docker-compose.yml` for PostgreSQL and FastAPI deployment.
8. **Automated Testing**: 100% test coverage using Pytest and FastAPI TestClient.

---

## Suggested REST APIs

| HTTP Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/assessment` | Creates a new skin assessment, runs scoring & risk engines, persists to PostgreSQL. |
| `GET` | `/assessment` | Retrieves paginated assessments for the authenticated user. |
| `GET` | `/assessment/history` | Fetches assessment history timeline, score trend, and aggregate stats. |
| `GET` | `/assessment/score` | Retrieves latest overall skin health score (0-100), parameter breakdown, & insights. |
| `GET` | `/assessment/risks` | Retrieves active rule-based risk factor matrix categorized by risk level. |
| `GET` | `/assessment/{id}` | Retrieves detailed assessment report by ID including concerns & risk factors. |
| `PUT` | `/assessment/{id}` | Updates assessment parameters/notes and re-evaluates score & risk engines. |
| `DELETE` | `/assessment/{id}` | Deletes a skin assessment record and associated concerns/risk factors. |
| `GET` | `/health` | Health check endpoint verifying engine status and PostgreSQL connectivity. |

---

## Suggested Database Schema

```sql
-- Skin Assessment Table
SkinAssessment (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  assessment_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  skin_type VARCHAR(50),
  skin_health_score NUMERIC(5,2),
  overall_condition VARCHAR(100),
  hydration_level NUMERIC(5,2),
  oiliness_level NUMERIC(5,2),
  sensitivity_level NUMERIC(5,2),
  acne_severity NUMERIC(5,2),
  pigmentation_score NUMERIC(5,2),
  wrinkles_score NUMERIC(5,2),
  sun_exposure_hours NUMERIC(4,2),
  spf_frequency VARCHAR(50),
  sleep_hours NUMERIC(4,2),
  stress_level INT,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Skin Concern Table
SkinConcern (
  id SERIAL PRIMARY KEY,
  assessment_id INT REFERENCES SkinAssessment(id) ON DELETE CASCADE,
  concern_name VARCHAR(150),
  severity VARCHAR(50), -- Mild, Moderate, Severe, Critical
  priority INT,         -- 1 = Highest Priority
  category VARCHAR(100),
  description TEXT
);

-- Risk Factor Analysis Table
RiskFactor (
  id SERIAL PRIMARY KEY,
  assessment_id INT REFERENCES SkinAssessment(id) ON DELETE CASCADE,
  risk_name VARCHAR(150),
  description TEXT,
  risk_level VARCHAR(50), -- LOW, MEDIUM, HIGH, CRITICAL
  mitigation_tip TEXT
);
```

---

## Quick Start & Installation

### 1. Local Python Setup

```bash
# Navigate to engine directory
cd skin_assessment_engine

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server with Uvicorn
uvicorn app.main:app --reload --port 8000
```

Access interactive API docs at `http://localhost:8000/docs`.

### 2. Docker & Docker Compose Setup

```bash
# Build and start FastAPI app & PostgreSQL container
docker-compose up --build -d

# Check service logs
docker-compose logs -f api
```

---

## Running Automated Tests

```bash
cd skin_assessment_engine
python -m pytest tests/ -v
```

---

## Postman Collection Testing

Import the provided `postman_collection.json` file directly into **Postman** to execute pre-configured requests for all endpoints with sample request payloads, Bearer token headers, and parameter queries.
