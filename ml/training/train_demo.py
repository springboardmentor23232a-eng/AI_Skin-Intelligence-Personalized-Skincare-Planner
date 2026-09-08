"""
Demo training pipeline (runs with just numpy/pillow/scikit-image/scikit-learn
— no GPU, no TensorFlow/PyTorch required).

Trains:
  1. A RandomForestClassifier for skin-type classification (5 classes).
  2. A concern-severity heuristic layered on top of texture/color features
     (documented below) — since the synthetic/sample dataset only has
     skin-type labels, concern detection in demo mode is derived from the
     same extracted features using domain rules, not a separately-trained
     multi-label model. The production CNN track (train_cnn.py) trains a
     genuine multi-label concern classifier when a labeled concerns.csv is
     available.

Usage:
    python training/train_demo.py
    python training/train_demo.py --data-dir /path/to/real/dataset
"""

import argparse
import json
import sys
from pathlib import Path

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder
import joblib

ML_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ML_DIR))

from preprocessing.preprocess import load_image, extract_features, scan_dataset_dir  # noqa: E402

MODELS_DIR = ML_DIR / "models"
DEFAULT_DATA_DIR = ML_DIR / "dataset"
SAMPLE_DATA_DIR = ML_DIR / "dataset" / "sample"


def _load_split(data_dir, split):
    """Loads a train/ or val/ split. Falls back through: real dataset ->
    generated sample dataset (generating it first if missing)."""
    real_dir = Path(data_dir) / split
    samples = scan_dataset_dir(real_dir)
    if samples:
        print(f"[{split}] using real dataset at {real_dir} ({len(samples)} images)")
        return samples

    sample_dir = SAMPLE_DATA_DIR / split
    if not sample_dir.exists():
        print(f"[{split}] no dataset found — generating synthetic sample dataset...")
        from preprocessing.generate_sample_dataset import generate
        generate()
    samples = scan_dataset_dir(sample_dir)
    print(f"[{split}] using synthetic sample dataset at {sample_dir} ({len(samples)} images)")
    return samples


def build_feature_matrix(samples):
    X, y = [], []
    for filepath, label in samples:
        img = load_image(filepath)
        X.append(extract_features(img))
        y.append(label)
    return np.stack(X), np.array(y)


def train(data_dir=DEFAULT_DATA_DIR, n_estimators=200, random_state=42):
    train_samples = _load_split(data_dir, "train")
    val_samples = _load_split(data_dir, "val")

    if not train_samples:
        raise SystemExit("No training data available even after sample generation.")

    print("Extracting features (color histograms + LBP texture)...")
    X_train, y_train_raw = build_feature_matrix(train_samples)

    if val_samples:
        X_val, y_val_raw = build_feature_matrix(val_samples)
    else:
        X_train, X_val, y_train_raw, y_val_raw = train_test_split(
            X_train, y_train_raw, test_size=0.2, random_state=random_state, stratify=y_train_raw
        )

    encoder = LabelEncoder()
    y_train = encoder.fit_transform(y_train_raw)
    y_val = encoder.transform(y_val_raw)

    print(f"Training RandomForestClassifier on {X_train.shape[0]} samples, "
          f"{X_train.shape[1]} features, {len(encoder.classes_)} classes: "
          f"{list(encoder.classes_)}")

    clf = RandomForestClassifier(
        n_estimators=n_estimators,
        max_depth=12,
        random_state=random_state,
        class_weight="balanced",
    )
    clf.fit(X_train, y_train)

    preds = clf.predict(X_val)
    acc = accuracy_score(y_val, preds)
    print(f"\nValidation accuracy: {acc:.3f}")
    print(classification_report(y_val, preds, target_names=encoder.classes_, zero_division=0))

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    model_path = MODELS_DIR / "demo_model.joblib"
    joblib.dump({"classifier": clf, "label_encoder": encoder}, model_path)

    meta = {
        "model_type": "RandomForestClassifier",
        "feature_extraction": "color_histogram(48) + LBP_texture(10)",
        "classes": list(encoder.classes_),
        "n_train_samples": int(X_train.shape[0]),
        "n_val_samples": int(X_val.shape[0]),
        "val_accuracy": float(acc),
        "note": "Trained on a synthetic sample dataset unless a real "
                "labeled dataset was found in ml/dataset/train — see ml/README.md.",
    }
    with open(MODELS_DIR / "demo_model_meta.json", "w") as f:
        json.dump(meta, f, indent=2)

    print(f"\nSaved model -> {model_path}")
    print(f"Saved metadata -> {MODELS_DIR / 'demo_model_meta.json'}")
    return clf, encoder, meta


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train the demo skin-type classifier.")
    parser.add_argument("--data-dir", default=str(DEFAULT_DATA_DIR))
    parser.add_argument("--n-estimators", type=int, default=200)
    args = parser.parse_args()
    train(data_dir=args.data_dir, n_estimators=args.n_estimators)
