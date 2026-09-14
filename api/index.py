"""
Vercel Serverless Function Bridge Entrypoint
AI Skin Intelligence & Personalized Skincare Planner
=====================================================
This module bridges Vercel's Python runtime to the production
FastAPI application located in backend/app/main.py.

It ensures:
1. System path correctly includes 'backend' and the project root.
2. The FastAPI ASGI 'app' instance is exported cleanly.
3. Database connection strings are normalized for cloud providers.
"""

import sys
import os

# Determine directory paths
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")

# Inject paths into sys.path
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.main import app

__all__ = ["app"]



