import os
import json
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# =========================
# Configuration
# =========================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATASET_DIR = os.path.join(BASE_DIR, "dataset")
MODEL_DIR = os.path.join(BASE_DIR, "models")

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 16
EPOCHS = 15
VALIDATION_SPLIT = 0.2
SEED = 42

os.makedirs(MODEL_DIR, exist_ok=True)

# =========================
# Class names
# =========================

CLASS_NAMES = [
    "Mild",
    "Moderate",
    "Severe",
    "Very Severe"
]

print("Dataset directory:")
print(DATASET_DIR)

print("\nClasses:")
for i, name in enumerate(CLASS_NAMES):
    print(f"{i}: {name}")

# =========================
# Load training dataset
# =========================

train_dataset = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,
    labels="inferred",
    label_mode="int",
    class_names=[
        "acne0_1024",
        "acne1_1024",
        "acne2_1024",
        "acne3_1024"
    ],
    validation_split=VALIDATION_SPLIT,
    subset="training",
    seed=SEED,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE
)

# =========================
# Load validation dataset
# =========================

validation_dataset = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,
    labels="inferred",
    label_mode="int",
    class_names=[
        "acne0_1024",
        "acne1_1024",
        "acne2_1024",
        "acne3_1024"
    ],
    validation_split=VALIDATION_SPLIT,
    subset="validation",
    seed=SEED,
    image_size=IMAGE_SIZE,
    batch_size=BATCH_SIZE
)

print("\nDataset loaded successfully.")

# =========================
# Improve performance
# =========================

AUTOTUNE = tf.data.AUTOTUNE

train_dataset = train_dataset.prefetch(AUTOTUNE)
validation_dataset = validation_dataset.prefetch(AUTOTUNE)

# =========================
# Data augmentation
# =========================

data_augmentation = keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.1),
    layers.RandomZoom(0.1),
], name="data_augmentation")

# =========================
# Build CNN model
# =========================

model = keras.Sequential([
    layers.Input(shape=(224, 224, 3)),

    data_augmentation,

    layers.Rescaling(1.0 / 255),

    layers.Conv2D(32, 3, activation="relu"),
    layers.MaxPooling2D(),

    layers.Conv2D(64, 3, activation="relu"),
    layers.MaxPooling2D(),

    layers.Conv2D(128, 3, activation="relu"),
    layers.MaxPooling2D(),

    layers.Flatten(),

    layers.Dense(128, activation="relu"),
    layers.Dropout(0.5),

    layers.Dense(4, activation="softmax")
])

# =========================
# Compile
# =========================

model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()

# =========================
# Train
# =========================

print("\nStarting training...\n")

history = model.fit(
    train_dataset,
    validation_data=validation_dataset,
    epochs=EPOCHS
)

# =========================
# Save model
# =========================

model_path = os.path.join(
    MODEL_DIR,
    "acne_severity_model.keras"
)

model.save(model_path)

print("\nModel saved successfully:")
print(model_path)

# =========================
# Save class names
# =========================

class_file = os.path.join(
    MODEL_DIR,
    "class_names.json"
)

with open(class_file, "w") as f:
    json.dump(CLASS_NAMES, f, indent=4)

print("\nClass names saved:")
print(class_file)

print("\nTraining completed successfully!")