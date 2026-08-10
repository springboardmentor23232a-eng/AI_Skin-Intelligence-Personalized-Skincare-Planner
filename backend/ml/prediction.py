"""
Skin Type ML Inference Module
-----------------------------
Loads trained RandomForestClassifier model and saved LabelEncoders to perform
real-time skin type prediction based on individual biometrics and environmental factors.
"""

import os
import sys
import pandas as pd
import numpy as np
import joblib

# Resolve directories dynamically relative to script path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "ml", "models")
ENCODERS_DIR = os.path.join(BASE_DIR, "ml", "encoders")

MODEL_PATH = os.path.join(MODELS_DIR, "skin_type_model.pkl")

# Global cached model and encoders
_MODEL = None
_ENCODERS = {}


def load_ml_assets():
    """
    Loads the trained RandomForest model and all categorical LabelEncoders.
    Caches loaded objects in memory for fast inference execution.
    """
    global _MODEL, _ENCODERS

    if _MODEL is not None and len(_ENCODERS) > 0:
        return _MODEL, _ENCODERS

    # 1. Load Trained Model
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Trained model not found at '{MODEL_PATH}'. Please run train_model.py first."
        )

    try:
        _MODEL = joblib.load(MODEL_PATH)
    except Exception as e:
        raise RuntimeError(f"Failed to load trained model: {e}")

    # 2. Load LabelEncoders
    required_encoders = ["Gender", "Hydration_Level", "Oil_Level", "Sensitivity", "Skin_Type"]

    for name in required_encoders:
        encoder_path = os.path.join(ENCODERS_DIR, f"label_encoder_{name}.joblib")
        if not os.path.exists(encoder_path):
            raise FileNotFoundError(
                f"LabelEncoder for '{name}' not found at '{encoder_path}'. Please run preprocess_dataset.py first."
            )
        try:
            _ENCODERS[name] = joblib.load(encoder_path)
        except Exception as e:
            raise RuntimeError(f"Failed loading encoder for '{name}': {e}")

    return _MODEL, _ENCODERS


def predict_skin_type(
    age: int,
    gender: str,
    hydration_level: str,
    oil_level: str,
    sensitivity: str,
    humidity: float,
    temperature: float,
) -> dict:
    """
    Predicts skin type given demographic, biometric, and environmental parameters.

    Parameters:
    -----------
    age             : int (e.g. 36)
    gender          : str ('Male', 'Female')
    hydration_level : str ('Low', 'Medium', 'High')
    oil_level       : str ('Low', 'Medium', 'High')
    sensitivity     : str ('Low', 'Medium', 'High')
    humidity        : float (e.g. 31.9)
    temperature     : float (e.g. 10.1)

    Returns:
    --------
    dict : {"predicted_skin_type": "Combination"}
    """
    try:
        # Load model and encoders
        model, encoders = load_ml_assets()

        # Format / capitalize input strings for encoder matching
        gender_clean = str(gender).strip().capitalize()
        hydration_clean = str(hydration_level).strip().capitalize()
        oil_clean = str(oil_level).strip().capitalize()
        sensitivity_clean = str(sensitivity).strip().capitalize()

        # Encode categorical features
        try:
            gender_enc = encoders["Gender"].transform([gender_clean])[0]
        except ValueError:
            valid = list(encoders["Gender"].classes_)
            raise ValueError(f"Invalid gender '{gender}'. Expected one of: {valid}")

        try:
            hydration_enc = encoders["Hydration_Level"].transform([hydration_clean])[0]
        except ValueError:
            valid = list(encoders["Hydration_Level"].classes_)
            raise ValueError(f"Invalid hydration_level '{hydration_level}'. Expected one of: {valid}")

        try:
            oil_enc = encoders["Oil_Level"].transform([oil_clean])[0]
        except ValueError:
            valid = list(encoders["Oil_Level"].classes_)
            raise ValueError(f"Invalid oil_level '{oil_level}'. Expected one of: {valid}")

        try:
            sensitivity_enc = encoders["Sensitivity"].transform([sensitivity_clean])[0]
        except ValueError:
            valid = list(encoders["Sensitivity"].classes_)
            raise ValueError(f"Invalid sensitivity '{sensitivity}'. Expected one of: {valid}")

        # Construct feature DataFrame in EXACT order used during model training:
        # ['Age', 'Gender', 'Hydration_Level', 'Oil_Level', 'Sensitivity', 'Humidity', 'Temperature']
        features_df = pd.DataFrame(
            [
                {
                    "Age": int(age),
                    "Gender": gender_enc,
                    "Hydration_Level": hydration_enc,
                    "Oil_Level": oil_enc,
                    "Sensitivity": sensitivity_enc,
                    "Humidity": float(humidity),
                    "Temperature": float(temperature),
                }
            ]
        )

        # Perform prediction
        pred_encoded = model.predict(features_df)[0]

        # Decode predicted class back to string label
        predicted_label = encoders["Skin_Type"].inverse_transform([pred_encoded])[0]

        return {"predicted_skin_type": str(predicted_label)}

    except Exception as e:
        return {"error": str(e), "predicted_skin_type": None}


def validate_pipeline_on_dataset(n_samples: int = 10):
    """
    Validates the prediction pipeline against the first n_samples of the original dataset.
    Prints a comparison table and overall accuracy score.
    """
    csv_path = os.path.join(BASE_DIR, "datasets", "Skin_Type_OG.csv")

    print("=" * 70)
    print(f" VALIDATING PREDICTION PIPELINE ON FIRST {n_samples} SAMPLES")
    print("=" * 70)

    try:
        df = pd.read_csv(csv_path)
    except Exception as e:
        print(f"[ERROR] Failed to load dataset for validation: {e}")
        return

    sample_df = df.head(n_samples)
    matches = 0

    print(f"{'Row':<5} | {'Actual Skin Type':<18} | {'Predicted Skin Type':<20} | {'Match (Yes/No)':<15}")
    print("-" * 68)

    for idx, row in sample_df.iterrows():
        actual = row["Skin_Type"]

        result = predict_skin_type(
            age=row["Age"],
            gender=row["Gender"],
            hydration_level=row["Hydration_Level"],
            oil_level=row["Oil_Level"],
            sensitivity=row["Sensitivity"],
            humidity=row["Humidity"],
            temperature=row["Temperature"],
        )

        predicted = result.get("predicted_skin_type", "N/A")
        is_match = (actual == predicted)
        if is_match:
            matches += 1
            match_str = "Yes"
        else:
            match_str = "No"

        row_num = idx + 1
        print(f"{row_num:<5} | {actual:<18} | {predicted:<20} | {match_str:<15}")

    accuracy = (matches / n_samples) * 100
    print("-" * 68)
    print(f"Overall Accuracy on First {n_samples} Samples: {accuracy:.2f}% ({matches}/{n_samples} matches)\n")


if __name__ == "__main__":
    validate_pipeline_on_dataset(10)
