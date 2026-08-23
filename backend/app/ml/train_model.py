"""
Trains a RandomForest classifier that predicts skin type
(oily / dry / combination / normal / sensitive) from the six
OpenCV-derived features in app/utils/image_utils.py.

There is no public labeled dermatology image dataset bundled with this
project (real clinical datasets require licensing/IRB approval), so this
script builds a synthetic-but-domain-informed training set: each skin type
is modeled as a Gaussian cluster in feature space using ranges informed by
dermatological literature (e.g. oily skin -> higher oil_sheen_ratio and
brightness; dry skin -> higher texture_variance and lower oil_sheen_ratio;
sensitive skin -> higher redness).

To retrain with real labeled images later: replace `build_synthetic_dataset()`
with a loader that runs `extract_skin_features()` over your labeled image
folder and collects (features, label) pairs, then rerun this script.

Usage:
    python -m app.ml.train_model
Produces:
    app/ml/skin_model.pkl   (trained sklearn Pipeline: StandardScaler + RandomForestClassifier)
    app/ml/model_report.txt (train/test accuracy + classification report)
"""
import os
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, accuracy_score
import joblib

LABELS = ["oily", "dry", "combination", "normal", "sensitive"]

# feature order: brightness, redness, oil_sheen_ratio, texture_variance, edge_density, saturation
CLUSTER_PARAMS = {
    "oily":        {"mean": [165, 0.36, 0.18, 90,  0.09, 110], "std": [15, 0.03, 0.05, 25, 0.02, 15]},
    "dry":         {"mean": [140, 0.34, 0.03, 160, 0.07, 90],  "std": [15, 0.03, 0.02, 35, 0.02, 15]},
    "combination": {"mean": [155, 0.35, 0.10, 120, 0.08, 100], "std": [15, 0.03, 0.04, 30, 0.02, 15]},
    "normal":      {"mean": [150, 0.33, 0.06, 100, 0.075, 95], "std": [12, 0.02, 0.03, 20, 0.015, 12]},
    "sensitive":   {"mean": [148, 0.42, 0.07, 110, 0.08, 105], "std": [15, 0.04, 0.03, 25, 0.02, 15]},
}


def build_synthetic_dataset(n_per_class: int = 400, seed: int = 42):
    rng = np.random.default_rng(seed)
    X, y = [], []
    for label in LABELS:
        params = CLUSTER_PARAMS[label]
        mean = np.array(params["mean"], dtype=float)
        std = np.array(params["std"], dtype=float)
        samples = rng.normal(loc=mean, scale=std, size=(n_per_class, len(mean)))
        samples = np.clip(samples, 0, None)
        X.append(samples)
        y.extend([label] * n_per_class)
    X = np.vstack(X)
    y = np.array(y)
    return X, y


def train_and_save():
    X, y = build_synthetic_dataset()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", RandomForestClassifier(
            n_estimators=200, max_depth=8, random_state=42, class_weight="balanced"
        )),
    ])
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred)

    out_dir = os.path.dirname(__file__)
    model_path = os.path.join(out_dir, "skin_model.pkl")
    report_path = os.path.join(out_dir, "model_report.txt")

    joblib.dump({"pipeline": pipeline, "labels": LABELS}, model_path)
    with open(report_path, "w") as f:
        f.write(f"Test Accuracy: {acc:.4f}\n\n")
        f.write(report)

    print(f"Model trained. Test accuracy: {acc:.4f}")
    print(f"Saved model to: {model_path}")
    print(f"Saved report to: {report_path}")


if __name__ == "__main__":
    train_and_save()
