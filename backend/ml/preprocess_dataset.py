import os
import sys
import pandas as pd
import joblib
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split


def preprocess_skin_type_dataset():
    # Resolve CSV filepath dynamically relative to script location
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    csv_path = os.path.join(base_dir, "datasets", "Skin_Type_OG.csv")
    encoders_dir = os.path.join(base_dir, "ml", "encoders")

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
    print(" 1. FEATURE & TARGET SEPARATION")
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
    missing_features = [col for col in feature_cols if col not in df.columns]
    if missing_features or target_col not in df.columns:
        print(f"[ERROR] Missing expected columns in dataset. Missing: {missing_features + ([target_col] if target_col not in df.columns else [])}")
        sys.exit(1)

    X = df[feature_cols].copy()
    y = df[target_col].copy()

    print(f"Features (X) columns: {list(X.columns)}")
    print(f"Target (y) column: {target_col}\n")

    print("=" * 70)
    print(" 2. CATEGORICAL ENCODING (LabelEncoder) & MAPPINGS")
    print("=" * 70)

    # Ensure encoders directory exists
    os.makedirs(encoders_dir, exist_ok=True)

    categorical_cols = ["Gender", "Hydration_Level", "Oil_Level", "Sensitivity"]
    encoders = {}

    # Encode feature columns
    for col in categorical_cols:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col])
        encoders[col] = le

        print(f"--- Encodings for Feature: '{col}' ---")
        for cls, index in zip(le.classes_, range(len(le.classes_))):
            print(f"  {cls} -> {index}")
        print()

        # Save encoder
        encoder_path = os.path.join(encoders_dir, f"label_encoder_{col}.joblib")
        joblib.dump(le, encoder_path)

    # Encode target column
    target_le = LabelEncoder()
    y_encoded = target_le.fit_transform(y)
    encoders[target_col] = target_le

    print(f"--- Encodings for Target: '{target_col}' ---")
    for cls, index in zip(target_le.classes_, range(len(target_le.classes_))):
        print(f"  {cls} -> {index}")
    print()

    # Save target encoder
    target_encoder_path = os.path.join(encoders_dir, f"label_encoder_{target_col}.joblib")
    joblib.dump(target_le, target_encoder_path)

    print(f"[SUCCESS] All LabelEncoders saved into directory: '{encoders_dir}'\n")

    print("=" * 70)
    print(" 3. TRAIN-TEST SPLIT (80% Train, 20% Test, random_state=42)")
    print("=" * 70)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42
    )

    print(f"Training Features (X_train) Shape: {X_train.shape}")
    print(f"Training Target (y_train) Shape  : {y_train.shape}")
    print(f"Testing Features (X_test) Shape  : {X_test.shape}")
    print(f"Testing Target (y_test) Shape    : {y_test.shape}")
    print(f"Number of Target Classes          : {len(target_le.classes_)}")
    print("\n")

    print("=" * 70)
    print(" PREPROCESSING COMPLETE")
    print("=" * 70)

    return X_train, X_test, y_train, y_test, encoders


if __name__ == "__main__":
    preprocess_skin_type_dataset()
