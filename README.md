# 🌸 AI Skincare Intelligence & Personalized Skincare Planner

> Clinical-grade rule-based & generative AI skincare assessment, personalized routine generation, ingredient intelligence, product recommendations, progress tracking, and analytical reporting.

---

## 🚀 Live Production Links

- **Main Production Web Application:** [https://ai-skincare-frontend-qje7ih4g4-akashongit01.vercel.app](https://ai-skincare-frontend-qje7ih4g4-akashongit01.vercel.app)
- **Production Alias URL:** [https://ai-skincare-frontend-blush.vercel.app](https://ai-skincare-frontend-blush.vercel.app)
- **Express Backend API:** [https://ai-skincare-express-backend.onrender.com/api](https://ai-skincare-express-backend.onrender.com/api)
- **FastAPI AI Engine API:** [https://ai-skincare-fastapi-backend.onrender.com](https://ai-skincare-fastapi-backend.onrender.com)

---

## 🏗 System Architecture

```
Vercel Frontend (React + Vite)
        ↓
Express Node.js Backend (Render) — Authentication, User Accounts & Routing
        ↓
FastAPI Python AI Microservice (Render) — Rule-Based Assessment, Routine Engine & Gemini
        ↓
PostgreSQL / SQLite Database + Gemini 1.5 Flash AI Service
```

---

## ✨ Key Features

- **Rule-Based Skin Assessment Engine:** Evaluates skin type, concerns, age, climate, lifestyle, and sensitivities to score skin health (0-100).
- **Personalized Routine Generator:** Crafts tailored Morning & Evening skincare routines with step-by-step instructions.
- **Ingredient Intelligence & Conflict Checker:** Analyzes active ingredients, comedogenic ratings, and safety warnings for ingredient combinations.
- **AI Product Recommendation System:** Matches products from Nykaa, Amazon, Minimalist, CeraVe, and more by skin type and budget.
- **Skincare Progress Tracking & Analytics:** Tracks routine consistency, hydration, acne, and barrier recovery over time.
- **Export System:** Generates downloadable clinical PDF & Excel diagnostic reports.
- **Gemini AI Skincare Assistant:** Interactive AI consultation powered by Gemini 1.5 Flash.

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/springboardmentor23232a-eng/AI_Skin-Intelligence-Personalized-Skincare-Planner.git
cd AI_Skin-Intelligence-Personalized-Skincare-Planner

# Install Node dependencies
npm install

# Setup Python virtual environment for FastAPI engine
cd fastapi_app
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 3. Run Application
```bash
# Run all services concurrently (Vite Frontend + Express Backend + FastAPI Engine)
npm run dev
```

- **Frontend:** `http://localhost:5173`
- **Express Backend:** `http://localhost:5000`
- **FastAPI Engine:** `http://localhost:8000/docs`

---

## 📄 License

MIT License — AI Skincare Intelligence Project.
