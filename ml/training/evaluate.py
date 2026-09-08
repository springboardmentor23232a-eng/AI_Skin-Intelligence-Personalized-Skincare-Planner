"""
Evaluates a saved demo model against the val/ split (real dataset if
present, else the synthetic sample set), printing accuracy, a full
classification report, and a confusion matrix.

Usage:
    python training/evaluate.py
    python training/evaluate.py --model ml/models/demo_model.joblib --data-dir ml/dataset
"""

import argparse
import sys
from pathlib import Path

import joblib
import numpy as np
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

ML_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ML_DIR))

from preprocessing.preprocess import load_image, extract_features, scan_dataset_dir  # noqa: E402

DEFAULT_MODEL = ML_DIR / "models" / "demo_model.joblib"
DEFAULT_DATA_DIR = ML_DIR / "dataset"
SAMPLE_DATA_DIR = ML_DIR / "dataset" / "sample"


def evaluate(model_path=DEFAULT_MODEL, data_dir=DEFAULT_DATA_DIR):
    bundle = joblib.load(model_path)
    clf, encoder = bundle["classifier"], bundle["label_encoder"]

    val_dir = Path(data_dir) / "val"
    samples = scan_dataset_dir(val_dir)
    if not samples:
        samples = scan_dataset_dir(SAMPLE_DATA_DIR / "val")
        print(f"No val set at {val_dir} — evaluating on synthetic sample val set instead.")

    if not samples:
        raise SystemExit("No validation data available. Run training/train_demo.py first "
                          "to generate the sample dataset.")

    X, y_true_raw = [], []
    for filepath, label in samples:
        img = load_image(filepath)
        X.append(extract_features(img))
        y_true_raw.append(label)
    X = np.stack(X)

    y_true = encoder.transform(y_true_raw)
    y_pred = clf.predict(X)

    acc = accuracy_score(y_true, y_pred)
    print(f"\nEvaluated on {len(samples)} images")
    print(f"Accuracy: {acc:.3f}\n")
    print(classification_report(y_true, y_pred, target_names=encoder.classes_, zero_division=0))

    cm = confusion_matrix(y_true, y_pred)
    print("Confusion matrix (rows=true, cols=predicted):")
    print(f"{'':>14}" + "".join(f"{c[:10]:>12}" for c in encoder.classes_))
    for i, row in enumerate(cm):
        print(f"{encoder.classes_[i][:12]:>14}" + "".join(f"{v:>12}" for v in row))

    return {"accuracy": acc, "confusion_matrix": cm.tolist(), "classes": list(encoder.classes_)}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate the demo model on the validation split.")
    parser.add_argument("--model", default=str(DEFAULT_MODEL))
    parser.add_argument("--data-dir", default=str(DEFAULT_DATA_DIR))
    args = parser.parse_args()
    evaluate(model_path=args.model, data_dir=args.data_dir)
