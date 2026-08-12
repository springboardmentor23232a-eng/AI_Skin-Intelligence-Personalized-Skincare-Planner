import os
import json
import sys
import numpy as np
import tensorflow as tf
from tensorflow import keras


# =========================
# Paths
# =========================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "acne_severity_model.keras"
)

CLASS_PATH = os.path.join(
    BASE_DIR,
    "models",
    "class_names.json"
)


# =========================
# Load model
# =========================

print("Loading model...")

model = keras.models.load_model(MODEL_PATH)

with open(CLASS_PATH, "r") as f:
    class_names = json.load(f)

print("Model loaded successfully.")
print("Classes:", class_names)


# =========================
# Get image path
# =========================

if len(sys.argv) < 2:
    print("\nUsage:")
    print("python .\\src\\predict.py <image_path>")
    sys.exit(1)

image_path = sys.argv[1]

if not os.path.exists(image_path):
    print(f"\nImage not found: {image_path}")
    sys.exit(1)


# =========================
# Load image
# =========================

image = keras.utils.load_img(
    image_path,
    target_size=(224, 224)
)

image_array = keras.utils.img_to_array(image)

image_array = np.expand_dims(
    image_array,
    axis=0
)

# =========================
# Prediction
# =========================

predictions = model.predict(image_array, verbose=0)

predicted_index = np.argmax(predictions[0])

predicted_class = class_names[predicted_index]

confidence = float(
    predictions[0][predicted_index] * 100
)


# =========================
# Result
# =========================

print("\n==============================")
print("       SKIN IMAGE RESULT")
print("==============================")

print(f"Prediction : {predicted_class}")
print(f"Confidence : {confidence:.2f}%")

print("\nAll class probabilities:")

for class_name, probability in zip(
    class_names,
    predictions[0]
):
    print(
        f"{class_name:12} : "
        f"{probability * 100:.2f}%"
    )

print("==============================")