import os
import sys
import pandas as pd
import numpy as np
import joblib
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix


def train_skin_type_model():
    # Resolve filepaths dynamically relative to script location
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    csv_path = os.path.join(base_dir, "datasets", "Skin_Type_OG.csv")
    models_dir = os.path.join(base_dir, "ml", "models")
    model_filepath = os.path.join(models_dir, "skin_type_model.pkl")

    print(f"Loading dataset from: {csv_path}\n")

    try:
        df = pd.read_csv(csv_path)
        print("[SUCCESS] Dataset loaded successfully!\n")
    except FileNotFoundError:
        print(f"[ERROR] Dataset file not found at '{csv_path}'.")
        sys.exit(1)
    except Exception as e:
        print(f"[ERROR] Failed loading dataset: {e}")
        sys.exit(1)

    print("=" * 70)
    print(" 1. PREPROCESSING & LABEL ENCODING")
    print("=" * 70)

    feature_cols = [
        "Age",
        "Gender",
        "Hydration_Level",
        "Oil_Level",
        "Sensitivity",
        "Humidity",
        "Temperature",
    ]
    target_col = "Skin_Type"

    # Validate column presence
    missing_cols = [col for col in feature_cols + [target_col] if col not in df.columns]
    if missing_cols:
        print(f"[ERROR] Missing required columns in dataset: {missing_cols}")
        sys.exit(1)

    X = df[feature_cols].copy()
    y = df[target_col].copy()

    # Encode feature columns
    categorical_feature_cols = ["Gender", "Hydration_Level", "Oil_Level", "Sensitivity"]
    for col in categorical_feature_cols:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col])

    # Encode target column
    target_le = LabelEncoder()
    y_encoded = target_le.fit_transform(y)

    print("[SUCCESS] All categorical features and target column encoded.\n")

    print("=" * 70)
    print(" 2. TRAIN-TEST SPLIT (80% Train, 20% Test, random_state=42)")
    print("=" * 70)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42
    )

    print(f"Training set: {X_train.shape[0]} samples")
    print(f"Testing set : {X_test.shape[0]} samples\n")

    print("=" * 70)
    print(" 3. MODEL TRAINING (RandomForestClassifier, n_estimators=100)")
    print("=" * 70)
    try:
        clf = RandomForestClassifier(n_estimators=100, random_state=42)
        clf.fit(X_train, y_train)
        print("[SUCCESS] RandomForestClassifier model trained successfully!\n")
    except Exception as e:
        print(f"[ERROR] Failed to train RandomForestClassifier: {e}")
        sys.exit(1)

    print("=" * 70)
    print(" 4. MODEL EVALUATION")
    print("=" * 70)
    y_train_pred = clf.predict(X_train)
    y_test_pred = clf.predict(X_test)

    train_acc = accuracy_score(y_train, y_train_pred)
    test_acc = accuracy_score(y_test, y_test_pred)

    print(f"Training Accuracy : {train_acc * 100:.2f}% ({train_acc:.4f})")
    print(f"Testing Accuracy  : {test_acc * 100:.2f}% ({test_acc:.4f})\n")

    print("--- Classification Report ---")
    print(
        classification_report(
            y_test, y_test_pred, target_names=list(target_le.classes_)
        )
    )

    print("--- Confusion Matrix ---")
    print(confusion_matrix(y_test, y_test_pred))
    print("\n")

    print("=" * 70)
    print(" 5. FEATURE IMPORTANCE (Sorted Highest to Lowest)")
    print("=" * 70)
    importances = clf.feature_importances_
    sorted_indices = np.argsort(importances)[::-1]

    for rank, idx in enumerate(sorted_indices, 1):
        feature_name = feature_cols[idx]
        score = importances[idx]
        print(f"  {rank}. {feature_name:<20}: {score:.4f} ({score * 100:.2f}%)")
    print("\n")

    print("=" * 70)
    print(" 6. SAVING TRAINED MODEL")
    print("=" * 70)
    try:
        os.makedirs(models_dir, exist_ok=True)
        joblib.dump(clf, model_filepath)
        print(f"[SUCCESS] Trained model saved successfully to: '{model_filepath}'\n")
    except Exception as e:
        print(f"[ERROR] Failed saving model to '{model_filepath}': {e}")
        sys.exit(1)

    print("=" * 70)
    print(" MODEL TRAINING COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    train_skin_type_model()
