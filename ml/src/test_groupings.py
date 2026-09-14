import pandas as pd
import ast

def test_groupings():
    cases = pd.read_csv('ml/data/scin_cases.csv')
    labels = pd.read_csv('ml/data/scin_labels.csv')
    df = pd.merge(cases, labels, on='case_id', how='left')

    def get_primary(val):
        if pd.isna(val) or val == '{}' or val == '[]' or str(val).strip() == '':
            return None
        try:
            d = ast.literal_eval(val)
            if not d:
                return None
            return max(d.items(), key=lambda x: x[1])[0]
        except Exception:
            return None

    df['primary_condition'] = df['weighted_skin_condition_label'].apply(get_primary)
    valid_df = df[df['primary_condition'].notna()].copy()
    valid_df['num_images'] = valid_df[['image_1_path', 'image_2_path', 'image_3_path']].notna().sum(axis=1)

    print("=========================================================================")
    print("OPTION C: MEDICAL CLINICAL CATEGORY GROUPING ANALYSIS")
    print("=========================================================================")

    # Medically Meaningful Clinical Category Mapping
    category_mapping = {
        # 1. Eczematous & Inflammatory Dermatitis
        'Eczema': 'Eczematous & Inflammatory Dermatitis',
        'Allergic Contact Dermatitis': 'Eczematous & Inflammatory Dermatitis',
        'Irritant Contact Dermatitis': 'Eczematous & Inflammatory Dermatitis',
        'CD - Contact dermatitis': 'Eczematous & Inflammatory Dermatitis',
        'Acute dermatitis, NOS': 'Eczematous & Inflammatory Dermatitis',
        'Lichen Simplex Chronicus': 'Eczematous & Inflammatory Dermatitis',
        'Stasis Dermatitis': 'Eczematous & Inflammatory Dermatitis',

        # 2. Urticaria & Reactive Erythemas
        'Urticaria': 'Urticaria & Reactive Rashes',
        'Drug Rash': 'Urticaria & Reactive Rashes',
        'Hypersensitivity': 'Urticaria & Reactive Rashes',
        'Viral Exanthem': 'Urticaria & Reactive Rashes',
        'Pityriasis rosea': 'Urticaria & Reactive Rashes',
        'Photodermatitis': 'Urticaria & Reactive Rashes',

        # 3. Dermatological Infections & Infestations
        'Folliculitis': 'Infections & Infestations',
        'Tinea': 'Infections & Infestations',
        'Tinea Versicolor': 'Infections & Infestations',
        'Impetigo': 'Infections & Infestations',
        'Herpes Zoster': 'Infections & Infestations',
        'Herpes Simplex': 'Infections & Infestations',
        'Scabies': 'Infections & Infestations',
        'Molluscum Contagiosum': 'Infections & Infestations',

        # 4. Acneiform & Hair/Follicular Disorders
        'Acne': 'Acneiform & Follicular Disorders',
        'Rosacea': 'Acneiform & Follicular Disorders',
        'Keratosis pilaris': 'Acneiform & Follicular Disorders',

        # 5. Papulosquamous Disorders
        'Psoriasis': 'Papulosquamous Disorders',
        'Lichen planus/lichenoid eruption': 'Papulosquamous Disorders',

        # 6. Vascular & Purpuric Lesions
        'Pigmented purpuric eruption': 'Vascular & Purpuric Conditions',
        'Leukocytoclastic Vasculitis': 'Vascular & Purpuric Conditions',
        'O/E - ecchymoses present': 'Vascular & Purpuric Conditions',
        'Purpura': 'Vascular & Purpuric Conditions',

        # 7. Physical Trauma & Insect Bites
        'Insect Bite': 'Trauma & Insect Bites',
        'Abrasion, scrape, or scab': 'Trauma & Insect Bites'
    }

    valid_df['clinical_category'] = valid_df['primary_condition'].apply(
        lambda x: category_mapping.get(x, 'Other Clinical Disorders')
    )

    counts = valid_df['clinical_category'].value_counts()
    print("Clinical Categories Distribution:")
    for cat, cnt in counts.items():
        imgs = valid_df[valid_df['clinical_category'] == cat]['num_images'].sum()
        pct = round(cnt / len(valid_df) * 100, 2)
        print(f"  - {cat:<40}: {cnt:>4} cases ({imgs:>4} imgs) [{pct:>5.2f}%]")

if __name__ == '__main__':
    test_groupings()
