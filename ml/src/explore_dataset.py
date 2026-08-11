import pandas as pd
import json
import ast

def explore():
    cases = pd.read_csv('ml/data/scin_cases.csv')
    labels = pd.read_csv('ml/data/scin_labels.csv')

    df = pd.merge(cases, labels, on='case_id', how='left')

    print("==================================================")
    print("SCIN DATASET METADATA ANALYSIS")
    print("==================================================")
    print(f"Total Cases: {len(df)}")

    # Image path columns
    img_cols = ['image_1_path', 'image_2_path', 'image_3_path']
    total_imgs = 0
    for col in img_cols:
        total_imgs += df[col].notna().sum()
    print(f"Total Images Referenced: {total_imgs}")

    # Parse weighted_skin_condition_label
    condition_counts = {}
    weighted_condition_counts = {}
    missing_labels_count = 0

    for val in df['weighted_skin_condition_label']:
        if pd.isna(val) or val == '{}' or val == '[]' or str(val).strip() == '':
            missing_labels_count += 1
            continue
        try:
            d = ast.literal_eval(val)
            if not d:
                missing_labels_count += 1
                continue
            for cond, weight in d.items():
                condition_counts[cond] = condition_counts.get(cond, 0) + 1
                weighted_condition_counts[cond] = weighted_condition_counts.get(cond, 0.0) + weight
        except Exception:
            missing_labels_count += 1

    cond_df = pd.DataFrame([
        {'condition': k, 'case_count': v, 'weighted_sum': round(weighted_condition_counts[k], 2)}
        for k, v in condition_counts.items()
    ]).sort_values(by='case_count', ascending=False)

    print(f"\nCases with missing/unusable dermatologist labels: {missing_labels_count} ({missing_labels_count/len(df)*100:.2f}%)")
    print(f"Cases with valid dermatologist labels: {len(df) - missing_labels_count}")
    print(f"Total Unique Dermatologist Condition Labels Found: {len(cond_df)}")

    print("\n--- Top 30 Dermatologist Conditions by Case Count ---")
    print(cond_df.head(30).to_string(index=False))

    print("\n==================================================")
    print("COMPARISON WITH APPLICATION SKIN METRICS")
    print("==================================================")
    app_metrics = ['Acne', 'Redness', 'Dryness', 'Oiliness', 'Sensitivity', 'Hyperpigmentation']
    for metric in app_metrics:
        matches = cond_df[cond_df['condition'].str.contains(metric, case=False, na=False)]
        print(f"\nMatches for application metric '{metric}':")
        if len(matches) > 0:
            print(matches.to_string(index=False))
        else:
            print(f"  [NONE] '{metric}' is NOT a primary dermatologist label in SCIN.")

    print("\n==================================================")
    print("SKIN TONE & DEMOGRAPHIC METADATA")
    print("==================================================")
    print("Fitzpatrick Skin Type distribution:")
    print(df['fitzpatrick_skin_type'].value_counts(dropna=False).to_string())

    print("\nMonk Skin Tone (US) distribution (from labels):")
    print(df['monk_skin_tone_label_us'].value_counts(dropna=False).to_string())

    print("\nSex at birth distribution:")
    print(df['sex_at_birth'].value_counts(dropna=False).to_string())

    print("\nAge group distribution:")
    print(df['age_group'].value_counts(dropna=False).to_string())

if __name__ == '__main__':
    explore()
