"""
GlowMix Vision Dataset Exploration Script
----------------------------------------
Recursively scans a user-specified dataset directory to analyze its folder hierarchy,
count valid image files (.jpg, .jpeg, .png, .bmp, .webp), track image format extensions,
and print a clean summary report of the dataset structure.
"""

import os
import sys

# Allowed image extensions
VALID_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def explore_glowmix_dataset(dataset_path: str = None):
    """
    Scans and analyzes the GlowMix dataset structure from the given root directory.

    Parameters:
    -----------
    dataset_path : str, optional
        Path to the root directory of the dataset.
        If None, prompts the user via console input.
    """
    print("=" * 70)
    print(" GLOWMIX VISION DATASET EXPLORATION & STRUCTURAL ANALYSIS")
    print("=" * 70)

    # Prompt user for dataset path if not provided
    if not dataset_path:
        try:
            dataset_path = input("Enter the dataset path: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\n[CANCELLED] Dataset path input cancelled by user.")
            sys.exit(0)

    # Clean quotes if user copied path with surrounding double/single quotes
    if dataset_path:
        dataset_path = dataset_path.strip("\"'")

    # Validate directory path existence
    if not dataset_path or not os.path.exists(dataset_path):
        print(f"\n[ERROR] Provided path '{dataset_path}' does not exist.")
        sys.exit(1)

    if not os.path.isdir(dataset_path):
        print(f"\n[ERROR] Provided path '{dataset_path}' is not a directory.")
        sys.exit(1)

    print(f"\nScanning root directory: '{os.path.abspath(dataset_path)}'...\n")

    folder_counts = {}
    extensions_found = set()
    total_images_count = 0
    total_folders_count = 0

    try:
        # Recursively traverse directory hierarchy
        for root, dirs, files in os.walk(dataset_path):
            total_folders_count += 1
            rel_folder = os.path.relpath(root, dataset_path)
            folder_display_name = "." if rel_folder == "." else rel_folder

            image_files_in_folder = 0

            for f in files:
                ext = os.path.splitext(f)[1].lower()
                if ext in VALID_IMAGE_EXTENSIONS:
                    image_files_in_folder += 1
                    total_images_count += 1
                    extensions_found.add(ext)

            folder_counts[folder_display_name] = image_files_in_folder

    except Exception as e:
        print(f"[ERROR] Failed scanning directory structure: {e}")
        sys.exit(1)

    # Display Analysis Report
    print("=" * 70)
    print(" FOLDER HIERARCHY & IMAGE COUNTS")
    print("=" * 70)

    if folder_counts:
        print(f"{'Folder Relative Path':<45} | {'Image Count':<15}")
        print("-" * 65)
        for folder_name, count in folder_counts.items():
            print(f"{folder_name:<45} | {count:<15}")
    else:
        print("No subdirectories found.")

    print("\n" + "=" * 70)
    print(" SUMMARY REPORT")
    print("=" * 70)
    print(f"  Root Path              : {os.path.abspath(dataset_path)}")
    print(f"  Total Folders Scanned  : {total_folders_count}")
    print(f"  Total Images Found     : {total_images_count}")
    print(
        f"  Image Formats Found    : {', '.join(sorted(extensions_found)) if extensions_found else 'None'}"
    )

    print("=" * 70)
    print(" ANALYSIS COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    explore_glowmix_dataset()
