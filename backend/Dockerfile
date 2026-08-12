FROM python:3.10-slim

WORKDIR /app

# Install system dependencies (required for some Python packages like psycopg2)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
# Add tensorflow and Pillow manually since they aren't in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt tensorflow Pillow python-multipart

# Copy the rest of the backend code
COPY . .

# Expose the FastAPI port
EXPOSE 8000

# Run the FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
