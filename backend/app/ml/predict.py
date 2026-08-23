import os
import joblib
import numpy as np

_MODEL_CACHE = None
_MODEL_PATH = os.path.join(os.path.dirname(__file__), "skin_model.pkl")


def _load_model():
    global _MODEL_CACHE
    if _MODEL_CACHE is None:
        if not os.path.exists(_MODEL_PATH):
            raise FileNotFoundError(
                "skin_model.pkl not found. Run: python -m app.ml.train_model"
            )
        _MODEL_CACHE = joblib.load(_MODEL_PATH)
    return _MODEL_CACHE


def predict_skin_type(feature_vec: list) -> dict:
    """Returns predicted skin type label + class probabilities."""
    bundle = _load_model()
    pipeline = bundle["pipeline"]
    labels = bundle["labels"]

    X = np.array([feature_vec])
    pred = pipeline.predict(X)[0]
    proba = pipeline.predict_proba(X)[0]
    proba_map = {label: round(float(p), 4) for label, p in zip(pipeline.classes_, proba)}

    return {"skin_type": pred, "probabilities": proba_map}
