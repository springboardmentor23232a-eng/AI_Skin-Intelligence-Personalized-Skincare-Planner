import os
import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestRegressor

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
dataset_path = os.path.join(BASE_DIR, "Skin_Assessment_Training_Dataset.xlsx")
model_path = os.path.join(BASE_DIR, "skin_health_score_model.pkl")

print("Loading dataset...")
df = pd.read_excel(dataset_path)

X = df.drop(columns=["SkinHealthScore", "RiskLevel"])
Y = df["SkinHealthScore"]

categorical_features = [
    "SkinType",
    "AgeGroup",
    "SleepQuality",
    "WaterIntake"
]

numeric_features = [
    col for col in X.columns
    if col not in categorical_features
]

preprocessor = ColumnTransformer(
    transformers=[
        (
            "cat",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features
        ),
        (
            "num",
            "passthrough",
            numeric_features
        )
    ]
)

model = RandomForestRegressor(
    n_estimators=300,
    max_depth=20,
    random_state=42,
    n_jobs=-1
)

pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("model", model)
])

print("Training model pipeline on complete dataset...")
pipeline.fit(X, Y)

print("Saving model to", model_path)
joblib.dump(pipeline, model_path, compress=3)
print("SUCCESS: skin_health_score_model.pkl created successfully!")
