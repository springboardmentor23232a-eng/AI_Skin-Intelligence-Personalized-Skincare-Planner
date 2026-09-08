"""
Flask microservice exposing the ML pipeline over HTTP so the Node/Express
backend can call it without embedding Python in the Node process.

Run:
    python inference/serve.py
    # or in production:
    gunicorn -w 2 -b 0.0.0.0:5001 inference.serve:app

Endpoints:
    GET  /health              -> {"status": "ok", "model_loaded": true}
    POST /predict              multipart/form-data, field "image" -> JSON result
"""

import sys
from pathlib import Path

from flask import Flask, request, jsonify

ML_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ML_DIR))

from inference.predict import predict_from_bytes, _load_model, DISCLAIMER  # noqa: E402
from preprocessing.preprocess import InvalidImageError, MAX_FILE_MB  # noqa: E402

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_FILE_MB * 1024 * 1024

_model_bundle = None


def get_model():
    global _model_bundle
    if _model_bundle is None:
        _model_bundle = _load_model()
    return _model_bundle


@app.get("/health")
def health():
    try:
        get_model()
        return jsonify({"status": "ok", "model_loaded": True, "disclaimer": DISCLAIMER})
    except FileNotFoundError as e:
        return jsonify({"status": "degraded", "model_loaded": False, "error": str(e)}), 503


@app.post("/predict")
def predict():
    if "image" not in request.files:
        return jsonify({"error": "Missing 'image' file field."}), 400

    file = request.files["image"]
    if not file.filename:
        return jsonify({"error": "Empty filename."}), 400

    try:
        bundle = get_model()
        result = predict_from_bytes(file.read(), file.filename, model_bundle=bundle)
        return jsonify(result)
    except InvalidImageError as e:
        return jsonify({"error": str(e)}), 400
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 503
    except Exception as e:  # noqa: BLE001
        return jsonify({"error": f"Inference failed: {e}"}), 500


if __name__ == "__main__":
    port = 5001
    print(f"AI Skincare Planner — ML inference service starting on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
