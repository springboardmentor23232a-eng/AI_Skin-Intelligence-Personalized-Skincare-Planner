# 🌟 DermaAI: Clinical Skin Intelligence Platform

![DermaAI](https://img.shields.io/badge/DermaAI-Production_Ready-0D9488?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![ONNX](https://img.shields.io/badge/ONNX-005CED?style=for-the-badge&logo=onnx)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql)

## Executive Summary
Welcome to **DermaAI**, a modular, full-stack AI platform bridging the gap between everyday skincare and clinical dermatology. 

Our product vision is to deliver clinical-grade skin assessments, ingredient interaction scanning, and dynamic routine recommendations by combining lightweight Computer Vision (ONNX) with advanced Large Language Models (Google Gemini). This repository serves as the central source of truth for the platform's presentation layer, routing controllers, and AI computational engines.

## Platform Deliverables & Key Features
*   **Multi-Modal Skin Assessment:** Processes patient selfies and lifestyle metrics via ONNX vision models and Gemini LLM synthesis to detect active markers and generate clinical summaries.
*   **Ingredient Intelligence:** Scans INCI product ingredient lists against declared patient allergies to flag severe contraindications.
*   **Dynamic Routine Engine:** Automatically builds AM/PM routines and weekly treatments based on assessment targets, seasonal changes, and budgets.
*   **Longitudinal Tracking:** Monitors daily routine adherence, hydration, and subjective skin comfort to forecast improvement velocity.
*   **Role-Based Access Control (RBAC):** Secure, distinct operational portals for Patients, Skincare Consultants, Board-Certified Dermatologists, and System Administrators.

## Tech Stack & Architecture
*   **Backend Application:** Python 3.12, FastAPI, Uvicorn
*   **Data Persistence:** PostgreSQL (Neon Cloud) with `psycopg2-binary` connection pooling
*   **AI / Inference:** ONNX Runtime (local execution), Google Gemini API (`google-genai`)
*   **Frontend UI:** Vanilla JavaScript, HTML5, Tailwind CSS
*   For a deep dive into the engineering design, refer to our [Architecture Document](architecture.md).

## Developer Onboarding (Local Setup)
Follow these steps to initialize your local development environment:

1. **Clone the Repository:**
   `git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git`
2. **Initialize Virtual Environment:**
   `python -m venv venv` and activate it.
3. **Install Dependencies:**
   `pip install -r requirements.txt`
4. **Configure Secrets:**
   Create a `.env` file in the root directory. Add your `DATABASE_URL`, `GEMINI_API_KEY`, and `JWT_SECRET`. *(Note: Never commit this file to version control).*
5. **Initialize Database:**
   Execute `DB.sql` in your PostgreSQL client to establish the schema and RBAC roles.
6. **Launch the Server:**
   `uvicorn app:app --reload` (Access the platform at `http://127.0.0.1:8000`).
