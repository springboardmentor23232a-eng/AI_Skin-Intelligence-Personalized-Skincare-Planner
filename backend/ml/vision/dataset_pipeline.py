"""
GlowMix Vision Dataset Pipeline Module
-------------------------------------
Loads, normalizes, and optimizes the GlowMix skin condition image dataset
using TensorFlow data pipelines (tf.keras.utils.image_dataset_from_directory & tf.data API).
"""

import os
import sys


def create_vision_dataset_pipeline(dataset_path: str = None):
    """
    Creates and optimizes an in-memory image dataset pipeline for model training.

    Parameters:
    -----------
    dataset_path : str, optional
        Path to the root directory containing class subfolders (e.g. acne, dark spots, wrinkles).
        If None, prompts user via console input.
    """
    try:
        import tensorflow as tf
    except ImportError:
        print("[ERROR] TensorFlow is not installed in your Python environment.")
        print("Please install TensorFlow using: pip install tensorflow")
        sys.exit(1)

    print("=" * 60)
    print(" GLOWMIX VISION DATASET PIPELINE INITIALIZATION")
    print("=" * 60)

    # Prompt user for dataset path if not provided
    if not dataset_path:
        try:
            dataset_path = input("Enter the dataset path: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\n[CANCELLED] Dataset path input cancelled by user.")
            sys.exit(0)

    # Strip surrounding quotes if present
    if dataset_path:
        dataset_path = dataset_path.strip("\"'")

    # 1. Validate dataset directory existence
    if not dataset_path or not os.path.exists(dataset_path):
        print(f"\n[ERROR] Dataset path '{dataset_path}' does not exist.")
        sys.exit(1)

    if not os.path.isdir(dataset_path):
        print(f"\n[ERROR] Path '{dataset_path}' is not a directory.")
        sys.exit(1)

    # 2. Verify that at least one class subfolder exists
    subfolders = [
        d for d in os.listdir(dataset_path)
        if os.path.isdir(os.path.join(dataset_path, d))
    ]

    if not subfolders:
        print(f"\n[ERROR] No class subfolders found inside '{dataset_path}'.")
        print("Expected folder structure: root/class_name/image_files")
        sys.exit(1)

    abs_dataset_path = os.path.abspath(dataset_path)

    # Configuration Hyperparameters
    IMAGE_SIZE = (224, 224)
    BATCH_SIZE = 32
    VALIDATION_SPLIT = 0.20
    SEED = 42
    LABEL_MODE = "int"

    print(f"\nLoading image dataset from: '{abs_dataset_path}'...\n")

    try:
        # Load Training Dataset (80%)
        train_ds = tf.keras.utils.image_dataset_from_directory(
            abs_dataset_path,
            subset="training",
            validation_split=VALIDATION_SPLIT,
            seed=SEED,
            image_size=IMAGE_SIZE,
            batch_size=BATCH_SIZE,
            label_mode=LABEL_MODE,
        )

        # Load Validation Dataset (20%)
        val_ds = tf.keras.utils.image_dataset_from_directory(
            abs_dataset_path,
            subset="validation",
            validation_split=VALIDATION_SPLIT,
            seed=SEED,
            image_size=IMAGE_SIZE,
            batch_size=BATCH_SIZE,
            label_mode=LABEL_MODE,
        )

        class_names = train_ds.class_names
        num_classes = len(class_names)

        # 3. Apply Rescaling Normalization (1./255) via tf.data .map() API
        normalization_layer = tf.keras.layers.Rescaling(1.0 / 255)
        train_ds_normalized = train_ds.map(
            lambda x, y: (normalization_layer(x), y),
            num_parallel_calls=tf.data.AUTOTUNE,
        )
        val_ds_normalized = val_ds.map(
            lambda x, y: (normalization_layer(x), y),
            num_parallel_calls=tf.data.AUTOTUNE,
        )

        # 4. Optimize Pipeline Performance using AUTOTUNE, cache(), and prefetch()
        AUTOTUNE = tf.data.AUTOTUNE
        train_ds_optimized = train_ds_normalized.cache().prefetch(buffer_size=AUTOTUNE)
        val_ds_optimized = val_ds_normalized.cache().prefetch(buffer_size=AUTOTUNE)

        # Extract sample batch for shape inspection
        sample_images, sample_labels = next(iter(train_ds_normalized))

        training_batches = tf.data.experimental.cardinality(train_ds).numpy()
        validation_batches = tf.data.experimental.cardinality(val_ds).numpy()

        # Print Detailed Summary Report
        print("\n" + "=" * 60)
        print("DATASET PIPELINE SUMMARY")
        print("=" * 60)
        print(f"Dataset Path       : {abs_dataset_path}")
        print(f"Number of Classes  : {num_classes}")
        print(f"Class Names        : {class_names}")
        print(f"Batch Size         : {BATCH_SIZE}")
        print(f"Image Size         : {IMAGE_SIZE}")
        print(f"Training Batches   : {training_batches}")
        print(f"Validation Batches : {validation_batches}")
        print("\nDisplay one sample batch:")
        print(f"Images Shape : {sample_images.shape}")
        print(f"Labels Shape : {sample_labels.shape}")

        print("\n" + "=" * 60)
        print("DATASET PIPELINE READY FOR MODEL TRAINING")
        print("=" * 60)

        return train_ds_optimized, val_ds_optimized, class_names

    except Exception as e:
        print(f"\n[ERROR] Exception occurred in dataset pipeline: {e}")
        sys.exit(1)


if __name__ == "__main__":
    create_vision_dataset_pipeline()
