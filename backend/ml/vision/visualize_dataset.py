"""
GlowMix Vision Dataset Visualization Script
-------------------------------------------
Visualizes a sample 3x3 grid (9 images) from one training batch of the GlowMix
image dataset to verify image loading, dimensions, and class label mappings.
"""

import os
import sys


def visualize_dataset(dataset_path: str = None):
    """
    Loads one batch from the image dataset and displays a 3x3 grid of sample images with class labels.

    Parameters:
    -----------
    dataset_path : str, optional
        Path to the root directory containing class subfolders.
        If None, prompts user via console input.
    """
    try:
        import tensorflow as tf
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

    print("=" * 60)
    print(" GLOWMIX VISION DATASET VISUALIZATION")
    print("=" * 60)

    # Prompt user for dataset path if not provided
    if not dataset_path:
        try:
            dataset_path = input("Enter the dataset path: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\n[CANCELLED] Dataset path input cancelled by user.")
            sys.exit(0)

    # Clean quotes if present
    if dataset_path:
        dataset_path = dataset_path.strip("\"'")

    # Validate directory existence
    if not dataset_path or not os.path.exists(dataset_path):
        print(f"\n[ERROR] Dataset path '{dataset_path}' does not exist.")
        sys.exit(1)

    if not os.path.isdir(dataset_path):
        print(f"\n[ERROR] Path '{dataset_path}' is not a directory.")
        sys.exit(1)

    abs_path = os.path.abspath(dataset_path)

    # Configuration Parameters
    IMAGE_SIZE = (224, 224)
    BATCH_SIZE = 32
    VALIDATION_SPLIT = 0.20
    SEED = 42

    print(f"\nLoading training dataset from: '{abs_path}'...\n")

    try:
        # Load single training batch
        train_ds = tf.keras.utils.image_dataset_from_directory(
            abs_path,
            subset="training",
            validation_split=VALIDATION_SPLIT,
            seed=SEED,
            image_size=IMAGE_SIZE,
            batch_size=BATCH_SIZE,
        )

        class_names = train_ds.class_names

        # Print Class Mapping
        print("\n" + "=" * 60)
        print(" CLASS LABEL MAPPING")
        print("=" * 60)
        for idx, class_name in enumerate(class_names):
            print(f" {idx} -> {class_name}")
        print("=" * 60 + "\n")

        # Extract only one training batch
        images_batch, labels_batch = next(iter(train_ds))

        # Create 3x3 Grid (9 Images)
        plt.figure(figsize=(10, 10))
        plt.suptitle("GlowMix Vision Dataset — 3x3 Sample Batch Verification", fontsize=14, fontweight="bold")

        for i in range(min(9, len(images_batch))):
            ax = plt.subplot(3, 3, i + 1)
            img = images_batch[i].numpy().astype("uint8")
            label_idx = int(labels_batch[i])
            class_name = class_names[label_idx]

            plt.imshow(img)
            plt.title(f"{class_name} ({label_idx})", fontsize=11, fontweight="bold", pad=6)
            plt.axis("off")

        plt.tight_layout()
        print("[INFO] Displaying 3x3 Matplotlib visualization window...")
        plt.show()

        print("\n" + "=" * 60)
        print("VISUAL DATASET VERIFICATION COMPLETED SUCCESSFULLY")
        print("=" * 60)

    except Exception as e:
        print(f"\n[ERROR] Exception occurred during dataset visualization: {e}")
        sys.exit(1)


if __name__ == "__main__":
    visualize_dataset()
