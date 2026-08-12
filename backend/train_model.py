import os
import tensorflow as tf
from tensorflow import keras
from keras import layers
from keras.applications import MobileNetV2

# ==============================================================================
# DERMAI SKIN TYPE CLASSIFICATION MODEL (KAGGLE DATASET)
# ==============================================================================
# Instructions:
# 1. Download the Kaggle dataset: https://www.kaggle.com/datasets/killa92/facial-skin-analysis-and-type-classification
# 2. Extract it into a folder named "dataset" in the same directory as this script.
#    Structure should be:
#      dataset/
#        ├── Dry/
#        ├── Normal/
#        └── Oily/
# 3. Run this script: python train_model.py
# 4. It will train the model using Transfer Learning and save "skin_model.h5"
# ==============================================================================

DATASET_DIR = "dataset"
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 10

def build_and_train_model():
    if not os.path.exists(DATASET_DIR):
        print(f"Error: Dataset directory '{DATASET_DIR}' not found.")
        print("Please download and extract the Kaggle dataset first.")
        return

    print("Loading and preprocessing dataset...")
    # Load dataset with an 80/20 train/validation split
    train_ds = tf.keras.preprocessing.image_dataset_from_directory(
        DATASET_DIR,
        validation_split=0.2,
        subset="training",
        seed=123,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="categorical"
    )

    val_ds = tf.keras.preprocessing.image_dataset_from_directory(
        DATASET_DIR,
        validation_split=0.2,
        subset="validation",
        seed=123,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="categorical"
    )
    
    class_names = train_ds.class_names
    print(f"Detected classes: {class_names}")
    num_classes = len(class_names)

    # Use MobileNetV2 for fast and accurate Transfer Learning
    print("Building model architecture (MobileNetV2 base)...")
    base_model = MobileNetV2(input_shape=IMG_SIZE + (3,), include_top=False, weights='imagenet')
    base_model.trainable = False # Freeze base model

    inputs = tf.keras.Input(shape=IMG_SIZE + (3,))
    # Normalize inputs for MobileNetV2
    x = tf.keras.applications.mobilenet_v2.preprocess_input(inputs) 
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(num_classes, activation='softmax')(x)
    
    model = keras.Model(inputs, outputs)

    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    print(f"Starting training for {EPOCHS} epochs...")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS
    )

    # Save the trained model
    model.save("skin_model.h5")
    print("Model saved successfully as 'skin_model.h5'!")
    
    # Save the class names to a text file for the backend to use
    with open("class_names.txt", "w") as f:
        f.write(",".join(class_names))

if __name__ == "__main__":
    build_and_train_model()
