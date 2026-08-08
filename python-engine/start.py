#!/usr/bin/env python3
"""
Simple startup script for the Skin Assessment Engine
"""
import uvicorn
from app.main import app

if __name__ == "__main__":
    print("Starting Skin Assessment Engine...")
    print("API will be available at http://localhost:8001")
    print("Documentation at http://localhost:8001/docs")
    uvicorn.run(app, host="0.0.0.0", port=8001)
