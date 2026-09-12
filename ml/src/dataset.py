import os
import io
import urllib.request
import pandas as pd
from PIL import Image, ImageOps
import torch
from torch.utils.data import Dataset
from torchvision import transforms

class SCINDataset(Dataset):
    def __init__(self, df, class_to_idx, transform=None, cache_dir='ml/data/image_cache'):
        self.df = df.reset_index(drop=True)
        self.class_to_idx = class_to_idx
        self.transform = transform
        self.cache_dir = cache_dir
        os.makedirs(self.cache_dir, exist_ok=True)

        # Build flat list of (image_path, target_label, case_id) tuples
        self.samples = []
        base_gcs_url = "https://storage.googleapis.com/dx-scin-public-data/"

        for _, row in self.df.iterrows():
            label_str = row['target_label']
            target_idx = self.class_to_idx[label_str]
            case_id = row['case_id']

            for img_col in ['image_1_path', 'image_2_path', 'image_3_path']:
                rel_path = row[img_col]
                if pd.isna(rel_path) or str(rel_path).strip() == '':
                    continue

                if not str(rel_path).startswith('dataset/'):
                    rel_path = 'dataset/' + str(rel_path)

                url = base_gcs_url + rel_path
                filename = os.path.basename(rel_path)
                local_path = os.path.join(self.cache_dir, filename)
                self.samples.append((local_path, url, target_idx, case_id))

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        local_path, url, target_idx, case_id = self.samples[idx]

        # Download and cache image if not locally present
        if not os.path.exists(local_path):
            try:
                urllib.request.urlretrieve(url, local_path)
            except Exception as e:
                # Fallback blank RGB image if download fails
                img = Image.new('RGB', (224, 224), color=(128, 128, 128))
                if self.transform:
                    img = self.transform(img)
                return img, target_idx

        try:
            img = Image.open(local_path)
            img = ImageOps.exif_transpose(img)
            if img.mode != 'RGB':
                img = img.convert('RGB')
        except Exception:
            img = Image.new('RGB', (224, 224), color=(128, 128, 128))

        if self.transform:
            img = self.transform(img)

        return img, target_idx

def get_transforms(img_size=224):
    train_transform = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.2),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.15),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    val_transform = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    return train_transform, val_transform
