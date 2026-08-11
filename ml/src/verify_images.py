import os
import pandas as pd
import urllib.request
from PIL import Image

def verify_sample_images():
    cases = pd.read_csv('ml/data/scin_cases.csv')
    labels = pd.read_csv('ml/data/scin_labels.csv')
    df = pd.merge(cases, labels, on='case_id', how='left')

    os.makedirs('ml/data/sample_images', exist_ok=True)
    
    # Filter cases with valid dermatologist labels
    valid_df = df[df['weighted_skin_condition_label'].notna() & (df['weighted_skin_condition_label'] != '{}')]
    print(f"Total valid labeled cases: {len(valid_df)}")

    # Collect first 50 image URLs
    base_gcs_url = "https://storage.googleapis.com/dx-scin-public-data/"
    
    downloaded_stats = []
    corrupted_count = 0

    print("Downloading sample images (up to 50) from GCS public storage...")
    count = 0
    for idx, row in valid_df.iterrows():
        if count >= 50:
            break
        for img_col in ['image_1_path', 'image_2_path', 'image_3_path']:
            path_rel = row[img_col]
            if pd.isna(path_rel):
                continue
            
            # Construct full URL
            # Example path_rel: dataset/images/0001.jpg or images/0001.jpg
            if not path_rel.startswith('dataset/'):
                path_rel = 'dataset/' + path_rel
            
            url = base_gcs_url + path_rel
            local_filename = os.path.basename(path_rel)
            local_path = os.path.join('ml/data/sample_images', local_filename)

            try:
                if not os.path.exists(local_path):
                    urllib.request.urlretrieve(url, local_path)
                
                # Verify PIL read
                with Image.open(local_path) as img:
                    img.verify()
                
                with Image.open(local_path) as img:
                    w, h = img.size
                    mode = img.mode
                    downloaded_stats.append({'filename': local_filename, 'width': w, 'height': h, 'mode': mode})
                    count += 1
                    if count >= 50:
                        break
            except Exception as e:
                print(f"Error downloading/verifying {url}: {e}")
                corrupted_count += 1

    stats_df = pd.DataFrame(downloaded_stats)
    print("\n=== SAMPLE IMAGE VERIFICATION RESULTS ===")
    print(f"Successfully verified images: {len(stats_df)}")
    print(f"Corrupted / Failed images: {corrupted_count}")
    if len(stats_df) > 0:
        print("\nWidth stats:")
        print(stats_df['width'].describe())
        print("\nHight stats:")
        print(stats_df['height'].describe())
        print("\nColor Modes:")
        print(stats_df['mode'].value_counts())

if __name__ == '__main__':
    verify_sample_images()
