FROM python:3.11-slim

WORKDIR /app

# System deps needed by scikit-image/pillow for image decoding
RUN apt-get update && apt-get install -y --no-install-recommends \
    libjpeg62-turbo \
    zlib1g \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-demo.txt .
RUN pip install --no-cache-dir -r requirements-demo.txt gunicorn

COPY . .

EXPOSE 5001

CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:5001", "inference.serve:app"]
