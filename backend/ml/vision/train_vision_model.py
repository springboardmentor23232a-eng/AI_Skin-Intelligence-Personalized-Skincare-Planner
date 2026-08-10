"""
GlowMix Vision AI Model Training Script
--------------------------------------
Trains an EfficientNetB0 transfer learning vision model on the GlowMix skin condition
image dataset for 5 epochs, evaluates model performance metrics, saves the trained
model (.keras) and class names JSON into backend/ml/models/, and plots training curves.
"""

import os
import sys
import json


def train_glowmix_vision_model(dataset_path: str = None, epochs: int = 5):
    """
    Loads image dataset, builds EfficientNetB0 classifier, trains model for specified epochs,
    saves model & class names, and displays training history graphs.

    Parameters:
    -----------
    dataset_path : str, optional
        Path to the root directory containing class subfolders.
        If None, prompts user via console input.
    epochs : int, default=5
        Number of initial training epochs.
    """
    try:
        import tensorflow as tf
        from tensorflow.keras import layers, models
        from tensorflow.keras.applications.efficientnet import preprocess_input
    except ImportError:
        print("[ERROR] TensorFlow is not installed in your Python environment.")
        print("Please install TensorFlow using: pip install tensorflow")
        sys.exit(1)

    try:
        import matplotlib.pyplot as plt
    except ImportError:
        print("[ERROR] Matplotlib is not installed in your Python environment.")
        print("Please install Matplotlib using: pip install matplotlib")
        sys.exit(1)

    print("=" * 65)
    print(" GLOWMIX VISION MODEL TRAINING PIPELINE")
    print("=" * 65)

    # 1. Ask user for dataset path if not provided
    if not dataset_path:
        try:
            dataset_path = input("Enter dataset path: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\n[CANCELLED] Input cancelled by user.")
            sys.exit(0)

    if dataset_path:
        dataset_path = dataset_path.strip("\"'")

    # Validate dataset path
    if not dataset_path or not os.path.exists(dataset_path):
        print(f"\n[ERROR] Provided dataset path '{dataset_path}' does not exist.")
        sys.exit(1)

    if not os.path.isdir(dataset_path):
        print(f"\n[ERROR] Provided path '{dataset_path}' is not a directory.")
        sys.exit(1)

    abs_dataset_path = os.path.abspath(dataset_path)

    # Hyperparameters (Memory-Optimized for CPU)
    IMAGE_SIZE = (224, 224)
    BATCH_SIZE = 16
    VALIDATION_SPLIT = 0.20
    SEED = 42

    print(f"\n[INFO] Loading training and validation image datasets from '{abs_dataset_path}'...\n")

    try:
        # 2. Load Training & Validation Datasets
        train_ds = tf.keras.utils.image_dataset_from_directory(
            abs_dataset_path,
            subset="training",
            validation_split=VALIDATION_SPLIT,
            seed=SEED,
            image_size=IMAGE_SIZE,
            batch_size=BATCH_SIZE,
            label_mode="int",
        )

        val_ds = tf.keras.utils.image_dataset_from_directory(
            abs_dataset_path,
            subset="validation",
            validation_split=VALIDATION_SPLIT,
            seed=SEED,
            image_size=IMAGE_SIZE,
            batch_size=BATCH_SIZE,
            label_mode="int",
        )

        class_names = train_ds.class_names
        num_classes = len(class_names)

        # 1. Apply EfficientNet Preprocessing (image tensors only) via tf.data API
        train_ds_proc = train_ds.map(lambda x, y: (preprocess_input(x), y), num_parallel_calls=tf.data.AUTOTUNE)
        val_ds_proc = val_ds.map(lambda x, y: (preprocess_input(x), y), num_parallel_calls=tf.data.AUTOTUNE)

        # 2. Data Augmentation Layer (Applied to Training Dataset Only)
        data_augmentation = tf.keras.Sequential(
            [
                layers.RandomFlip("horizontal"),
                layers.RandomRotation(0.05),
                layers.RandomZoom(0.10),
            ],
            name="data_augmentation",
        )

        train_ds_aug = train_ds_proc.map(
            lambda x, y: (data_augmentation(x, training=True), y),
            num_parallel_calls=tf.data.AUTOTUNE,
        )

        # Prefetch with AUTOTUNE (Cache disabled for memory optimization)
        AUTOTUNE = tf.data.AUTOTUNE
        train_ds_opt = train_ds_aug.prefetch(buffer_size=AUTOTUNE)
        val_ds_opt = val_ds_proc.prefetch(buffer_size=AUTOTUNE)

        print(f"[INFO] Classes Found ({num_classes}): {class_names}\n")

        # 3. Build EfficientNetB0 Model Architecture
        print("[INFO] Constructing EfficientNetB0 transfer learning architecture...")
        base_model = tf.keras.applications.EfficientNetB0(
            weights="imagenet",
            include_top=False,
            input_shape=(224, 224, 3),
        )
        base_model.trainable = False  # Freeze base feature extractor

        inputs = layers.Input(shape=(224, 224, 3), name="input_image")
        x = base_model(inputs, training=False)
        x = layers.GlobalAveragePooling2D(name="global_avg_pooling")(x)
        x = layers.Dropout(0.30, name="head_dropout_1")(x)
        x = layers.Dense(128, activation="relu", name="dense_128")(x)
        x = layers.Dropout(0.20, name="head_dropout_2")(x)
        outputs = layers.Dense(num_classes, activation="softmax", name="output_predictions")(x)

        model = models.Model(inputs=inputs, outputs=outputs, name="GlowMix_Vision_Model")

        # Compile Model
        optimizer = tf.keras.optimizers.Adam(learning_rate=0.0001)
        model.compile(
            optimizer=optimizer,
            loss="sparse_categorical_crossentropy",
            metrics=["accuracy"],
        )
        print("[INFO] Model built and compiled successfully.")

        # Print Information Message before training starts
        print("\nRunning memory-optimized training configuration...")
        print("Batch Size                 : 16")
        print("Dataset Cache              : Disabled")
        print("EfficientNet preprocessing : Enabled")
        print("Data augmentation          : Enabled")
        print("Base model                 : Frozen")

        # 4. Train Model
        print(f"\n[INFO] Starting model training for {epochs} epochs...\n")
        history = model.fit(
            train_ds_opt,
            validation_data=val_ds_opt,
            epochs=epochs,
            verbose=1,
        )

        # 5. Evaluate Metrics
        final_train_acc = history.history["accuracy"][-1]
        final_val_acc = history.history["val_accuracy"][-1]
        final_train_loss = history.history["loss"][-1]
        final_val_loss = history.history["val_loss"][-1]

        print("\n" + "=" * 65)
        print(" FINAL MODEL PERFORMANCE METRICS")
        print("=" * 65)
        print(f" Final Training Accuracy   : {final_train_acc * 100:.2f}% ({final_train_acc:.4f})")
        print(f" Final Validation Accuracy : {final_val_acc * 100:.2f}% ({final_val_acc:.4f})")
        print(f" Final Training Loss       : {final_train_loss:.4f}")
        print(f" Final Validation Loss     : {final_val_loss:.4f}")
        print("=" * 65 + "\n")

        # 6. Save Trained Model (.keras) & 7. Class Names JSON
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        models_dir = os.path.join(base_dir, "models")
        os.makedirs(models_dir, exist_ok=True)

        model_path = os.path.join(models_dir, "vision_model.keras")
        class_names_path = os.path.join(models_dir, "class_names.json")

        print(f"[INFO] Saving trained model to '{model_path}'...")
        model.save(model_path)
        print(f"[SUCCESS] Trained model saved successfully!")

        print(f"[INFO] Saving class names JSON to '{class_names_path}'...")
        with open(class_names_path, "w") as f:
            json.dump(class_names, f, indent=2)
        print(f"[SUCCESS] Class names saved successfully!")

        # 8. Plot Training History Graphs
        print("\n[INFO] Rendering training history accuracy and loss curves...")
        acc = history.history["accuracy"]
        val_acc = history.history["val_accuracy"]
        loss = history.history["loss"]
        val_loss = history.history["val_loss"]
        epochs_range = range(1, epochs + 1)

        plt.figure(figsize=(12, 5))

        # Accuracy Subplot
        plt.subplot(1, 2, 1)
        plt.plot(epochs_range, acc, "o-", label="Training Accuracy", color="tab:blue", linewidth=2)
        plt.plot(epochs_range, val_acc, "s-", label="Validation Accuracy", color="tab:orange", linewidth=2)
        plt.title("Training vs Validation Accuracy", fontsize=12, fontweight="bold")
        plt.xlabel("Epoch", fontsize=10)
        plt.ylabel("Accuracy", fontsize=10)
        plt.legend(loc="lower right")
        plt.grid(True, linestyle="--", alpha=0.5)

        # Loss Subplot
        plt.subplot(1, 2, 2)
        plt.plot(epochs_range, loss, "o-", label="Training Loss", color="tab:blue", linewidth=2)
        plt.plot(epochs_range, val_loss, "s-", label="Validation Loss", color="tab:orange", linewidth=2)
        plt.title("Training vs Validation Loss", fontsize=12, fontweight="bold")
        plt.xlabel("Epoch", fontsize=10)
        plt.ylabel("Loss", fontsize=10)
        plt.legend(loc="upper right")
        plt.grid(True, linestyle="--", alpha=0.5)

        plt.tight_layout()
        plt.show()

        print("\n" + "=" * 65)
        print("VISION MODEL TRAINING COMPLETED SUCCESSFULLY")
        print("=" * 65)

    except Exception as e:
        print(f"\n[ERROR] Exception occurred during model training: {e}")
        sys.exit(1)


if __name__ == "__main__":
    train_glowmix_vision_model()
