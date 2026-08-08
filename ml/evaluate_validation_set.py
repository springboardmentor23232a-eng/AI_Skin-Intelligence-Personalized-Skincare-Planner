import os
import numpy as np
import pandas as pd
from PIL import Image
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models

LABEL_COLUMNS = [
    'Acne_Severity (0-5)', 'blackheads', 'whiteheads', 'Open pores (0-5)', 
    'Excessive oil (0-5)', 'Skin irritation (0-5)', 'Skin sensitivity (0-5)', 
    'Redness Severity (0-5)', 'Fine line around eyes(0-5)', 'Eye puffiness(0-5)', 
    'Dark circles around eyes(0-5)', 'Wrinkes on forehead(0-5)', 
    'Skin elasticity(0-5)(5-not elastic at all)', 'Dehydration (0-5)(5 very dehydrated)', 
    'pigmentation(0-5)', 'post acne marks(0-5)', 'uneven skin(0-5)', 'freckles(0-5)'
]

class SkinDataset(Dataset):
    def __init__(self, df, img_dir, label_cols, transform=None):
        self.df = df.reset_index(drop=True)
        self.img_dir = img_dir
        self.label_cols = label_cols
        self.transform = transform
        
        self.img_map = {}
        for root, _, filenames in os.walk(img_dir):
            for f in filenames:
                self.img_map[f] = os.path.join(root, f)

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        img_id = str(row['Image_ID']).strip()
        
        img_path = self.img_map.get(img_id)
        if not img_path:
            for ext in ['.jpg', '.png', '.jpeg', '.JPG']:
                if f"{img_id}{ext}" in self.img_map:
                    img_path = self.img_map[f"{img_id}{ext}"]
                    break
        
        if not img_path or not os.path.exists(img_path):
            image = Image.new("RGB", (224, 224), color=0)
        else:
            try:
                image = Image.open(img_path).convert("RGB")
            except Exception:
                image = Image.new("RGB", (224, 224), color=0)
                
        if self.transform:
            image = self.transform(image)
            
        labels = row[self.label_cols].values.astype(np.float32) / 5.0
        return image, torch.tensor(labels, dtype=torch.float32)

def evaluate():
    base_path = r"c:\Users\LAXMI PRANEETHA\OneDrive\Desktop\AI-Skin\ml\skin_type_classification_dataset"
    valid_xlsx = os.path.join(base_path, "skinanalysis_valid1.xlsx")
    valid_img_dir = os.path.join(base_path, "valid")
    model_path = r"c:\Users\LAXMI PRANEETHA\OneDrive\Desktop\AI-Skin\ml\models\skin_assessment_model.pth"
    
    df_valid = pd.read_excel(valid_xlsx)
    
    val_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    dataset = SkinDataset(df_valid, valid_img_dir, LABEL_COLUMNS, val_transforms)
    loader = DataLoader(dataset, batch_size=8, shuffle=False)
    
    # Reconstruct model
    model = models.resnet18()
    num_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Linear(num_features, 128),
        nn.ReLU(),
        nn.Dropout(0.2),
        nn.Linear(128, len(LABEL_COLUMNS)),
        nn.Sigmoid()
    )
    
    if os.path.exists(model_path):
        model.load_state_dict(torch.load(model_path))
        print("Model loaded successfully.")
    else:
        print("Model file not found!")
        return
        
    model.eval()
    criterion = nn.MSELoss()
    
    all_preds = []
    all_labels = []
    total_loss = 0.0
    
    with torch.no_grad():
        for images, labels in loader:
            outputs = model(images)
            loss = criterion(outputs, labels)
            total_loss += loss.item() * images.size(0)
            
            # Scale to [0, 5]
            all_preds.append(outputs.numpy() * 5.0)
            all_labels.append(labels.numpy() * 5.0)
            
    val_loss_normalized = total_loss / len(dataset)
    preds_np = np.concatenate(all_preds, axis=0)
    labels_np = np.concatenate(all_labels, axis=0)
    
    mse_scaled = np.mean((labels_np - preds_np) ** 2)
    rmse_scaled = np.sqrt(mse_scaled)
    mae_scaled = np.mean(np.abs(labels_np - preds_np))
    
    print("\n--- QUANTITATIVE EVALUATION RESULTS ---")
    print(f"Validation Loss (Normalized MSE [0, 1]): {val_loss_normalized:.5f}")
    print(f"Validation MSE (Scaled [0, 5]): {mse_scaled:.5f}")
    print(f"Validation RMSE (Scaled [0, 5]): {rmse_scaled:.5f}")
    print(f"Validation MAE (Scaled [0, 5]): {mae_scaled:.5f}")
    
    # Check predictions range
    print("\n--- PREDICTIONS RANGE DISTRIBUTION (Scaled [0, 5]) ---")
    flat_preds = preds_np.flatten()
    print(f"Predictions Min: {np.min(flat_preds):.4f}")
    print(f"Predictions Max: {np.max(flat_preds):.4f}")
    print(f"Predictions Mean: {np.mean(flat_preds):.4f}")
    print(f"Predictions Std: {np.std(flat_preds):.4f}")
    
    # Labeled validation set comparisons
    print("\n--- SAMPLE VALIDATION IMAGES COMPARISONS ---")
    print("Image_ID | Predicted Total Severity | Predicted Health Score | True Total Severity | True Health Score")
    for i in range(min(5, len(df_valid))):
        img_id = df_valid.iloc[i]['Image_ID']
        pred_sev = np.sum(preds_np[i])
        pred_score = int(100 * (1 - pred_sev / 90.0))
        true_sev = np.sum(labels_np[i])
        true_score = int(100 * (1 - true_sev / 90.0))
        print(f"{img_id} | {pred_sev:.2f} | {pred_score} | {true_sev:.2f} | {true_score}")

if __name__ == "__main__":
    evaluate()
