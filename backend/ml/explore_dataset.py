import os
import sys
import pandas as pd


def explore_skin_type_dataset():
    # Resolve CSV filepath dynamically relative to script location
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    csv_path = os.path.join(base_dir, "datasets", "Skin_Type_OG.csv")

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
    print(" 1. FIRST 5 ROWS (head())")
    print("=" * 70)
    print(df.head())
    print("\n")

    print("=" * 70)
    print(" 2. DATASET SHAPE (Rows, Columns)")
    print("=" * 70)
    print(f"Rows: {df.shape[0]}, Columns: {df.shape[1]}")
    print("\n")

    print("=" * 70)
    print(" 3. COLUMN NAMES")
    print("=" * 70)
    for idx, col in enumerate(df.columns, 1):
        print(f"  {idx}. {col}")
    print("\n")

    print("=" * 70)
    print(" 4. DATA TYPES")
    print("=" * 70)
    print(df.dtypes)
    print("\n")

    print("=" * 70)
    print(" 5. MISSING VALUES PER COLUMN")
    print("=" * 70)
    print(df.isnull().sum())
    print("\n")

    print("=" * 70)
    print(" 6. UNIQUE VALUES IN CATEGORICAL COLUMNS")
    print("=" * 70)
    categorical_cols = df.select_dtypes(include=["object", "category"]).columns
    if len(categorical_cols) > 0:
        for col in categorical_cols:
            unique_vals = df[col].unique()
            print(f"Column '{col}' ({len(unique_vals)} unique values):")
            print(f"  {list(unique_vals)}\n")
    else:
        print("No categorical columns found.\n")

    print("=" * 70)
    print(" 7. DISTRIBUTION OF TARGET COLUMN: 'Skin_Type'")
    print("=" * 70)
    if "Skin_Type" in df.columns:
        print(df["Skin_Type"].value_counts())
    else:
        print("[WARNING] Column 'Skin_Type' not found in dataset. Looking for similar columns...")
        matches = [c for c in df.columns if "skin" in c.lower() or "type" in c.lower()]
        if matches:
            for m in matches:
                print(f"Distribution for column '{m}':")
                print(df[m].value_counts())
                print()
        else:
            print("No matching target column found.")
    print("\n")

    print("=" * 70)
    print(" 8. SUMMARY STATISTICS (describe(include='all'))")
    print("=" * 70)
    print(df.describe(include="all"))
    print("\n")

    print("=" * 70)
    print(" EXPLORATION COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    explore_skin_type_dataset()
