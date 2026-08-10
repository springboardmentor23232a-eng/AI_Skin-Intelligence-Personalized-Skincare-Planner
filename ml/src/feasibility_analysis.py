import os
import ast
import pandas as pd
import numpy as np
from sklearn.model_selection import StratifiedGroupKFold

def perform_feasibility_analysis():
    cases = pd.read_csv('ml/data/scin_cases.csv')
    labels = pd.read_csv('ml/data/scin_labels.csv')
    df = pd.merge(cases, labels, on='case_id', how='left')

    # Get primary condition label with highest weight
    def get_primary_label(val):
        if pd.isna(val) or val == '{}' or val == '[]' or str(val).strip() == '':
            return None
        try:
            d = ast.literal_eval(val)
            if not d:
                return None
            return max(d.items(), key=lambda x: x[1])[0]
        except Exception:
            return None

    df['primary_condition'] = df['weighted_skin_condition_label'].apply(get_primary_label)
    
    # Filter cases with valid consensus dermatologist primary labels
    labeled_df = df[df['primary_condition'].notna()].copy()
    
    # Calculate image count per case
    img_cols = ['image_1_path', 'image_2_path', 'image_3_path']
    labeled_df['num_images'] = labeled_df[img_cols].notna().sum(axis=1)
    
    # Selected Candidate Top 12 Clinical Classes
    target_classes = [
        'Eczema',
        'Allergic Contact Dermatitis',
        'Urticaria',
        'Insect Bite',
        'Folliculitis',
        'Psoriasis',
        'Tinea',
        'Impetigo',
        'Herpes Zoster',
        'Pigmented purpuric eruption',
        'Acne',
        'Drug Rash'
    ]

    # Map conditions not in target_classes to "Other / Rare Condition"
    labeled_df['target_label'] = labeled_df['primary_condition'].apply(
        lambda x: x if x in target_classes else 'Other / Rare Condition'
    )

    # Perform Group-Aware Stratified Split (70% Train, 15% Val, 15% Test)
    # Step 1: Split into Train+Val (85%) and Test (15%)
    sgkf_test = StratifiedGroupKFold(n_splits=7, shuffle=True, random_state=42)
    train_val_idx, test_idx = next(sgkf_test.split(labeled_df, labeled_df['target_label'], groups=labeled_df['case_id']))
    
    train_val_df = labeled_df.iloc[train_val_idx].copy()
    test_df = labeled_df.iloc[test_idx].copy()
    
    # Step 2: Split Train+Val into Train (70/85 = ~82.35%) and Val (15/85 = ~17.65%)
    sgkf_val = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=42)
    train_idx, val_idx = next(sgkf_val.split(train_val_df, train_val_df['target_label'], groups=train_val_df['case_id']))
    
    train_df = train_val_df.iloc[train_idx].copy()
    val_df = train_val_df.iloc[val_idx].copy()

    total_cases = len(labeled_df)
    total_images = labeled_df['num_images'].sum()

    print("=========================================================================")
    print("CLASS-COVERAGE FEASIBILITY ANALYSIS & GROUP-AWARE SPLIT SUMMARY")
    print("=========================================================================")
    print(f"Total Labeled Cases Analyzed: {total_cases}")
    print(f"Total Images Analyzed: {total_images}")
    print("Split Ratios: ~70% Train, ~15% Validation, ~15% Test (Grouped by case_id)\n")

    summary_rows = []
    all_target_categories = target_classes + ['Other / Rare Condition']

    for cls in all_target_categories:
        cls_df = labeled_df[labeled_df['target_label'] == cls]
        cls_cases = len(cls_df)
        cls_images = cls_df['num_images'].sum()
        pct_dataset = round((cls_cases / total_cases) * 100, 2)
        
        tr_cases = len(train_df[train_df['target_label'] == cls])
        tr_images = train_df[train_df['target_label'] == cls]['num_images'].sum()
        
        va_cases = len(val_df[val_df['target_label'] == cls])
        va_images = val_df[val_df['target_label'] == cls]['num_images'].sum()
        
        te_cases = len(test_df[test_df['target_label'] == cls])
        te_images = test_df[test_df['target_label'] == cls]['num_images'].sum()

        summary_rows.append({
            'Class Name': cls,
            'Total Cases': cls_cases,
            'Total Images': cls_images,
            '% of Dataset': f"{pct_dataset}%",
            'Train Cases (Imgs)': f"{tr_cases} ({tr_images})",
            'Val Cases (Imgs)': f"{va_cases} ({va_images})",
            'Test Cases (Imgs)': f"{te_cases} ({te_images})"
        })

    feasibility_df = pd.DataFrame(summary_rows)
    print(feasibility_df.to_string(index=False))

    # Check for case leakage across splits
    tr_cases_set = set(train_df['case_id'])
    va_cases_set = set(val_df['case_id'])
    te_cases_set = set(test_df['case_id'])

    tr_va_overlap = tr_cases_set.intersection(va_cases_set)
    tr_te_overlap = tr_cases_set.intersection(te_cases_set)
    va_te_overlap = va_cases_set.intersection(te_cases_set)

    print("\n=========================================================================")
    print("DATA LEAKAGE VERIFICATION")
    print("=========================================================================")
    print(f"Train & Val case_id overlap: {len(tr_va_overlap)}")
    print(f"Train & Test case_id overlap: {len(tr_te_overlap)}")
    print(f"Val & Test case_id overlap: {len(va_te_overlap)}")
    if len(tr_va_overlap) == 0 and len(tr_te_overlap) == 0 and len(va_te_overlap) == 0:
        print("PASS: 0% Data Leakage across splits! All images belonging to a case_id are 100% isolated to a single split.")
    else:
        print("FAIL: Data leakage detected!")

    # Save split dataframes for training
    os.makedirs('ml/data/splits', exist_ok=True)
    train_df.to_csv('ml/data/splits/train_cases.csv', index=False)
    val_df.to_csv('ml/data/splits/val_cases.csv', index=False)
    test_df.to_csv('ml/data/splits/test_cases.csv', index=False)
    print("\nSaved split files to ml/data/splits/ (train_cases.csv, val_cases.csv, test_cases.csv)")

if __name__ == '__main__':
    perform_feasibility_analysis()
