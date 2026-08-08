import os
import pandas as pd
import numpy as np
from PIL import Image
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models

# Standardized targets
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
        
        # Build image filenames recursive map
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

def train():
    # Resolve path relative to this script's directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_path = os.path.join(script_dir, "skin_type_classification_dataset")
    
    train_xlsx = os.path.join(base_path, "skinalaysis_labeling_train1.xlsx")
    train_img_dir = os.path.join(base_path, "train")
    
    print("Loading data from:", train_xlsx)
    df = pd.read_excel(train_xlsx)
    
    # 1. Clean column alignments
    df = df.rename(columns={'dark spots(0-5)': 'pigmentation(0-5)'})
    
    # 2. Clean invalid labels
    df['Fine line around eyes(0-5)'] = df['Fine line around eyes(0-5)'].clip(upper=5)
    
    # 3. Handle duplicates
    df = df.drop_duplicates(subset=['Image_ID'], keep='first')
    
    # 4. Preprocessing transforms
    train_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    dataset = SkinDataset(df, train_img_dir, LABEL_COLUMNS, train_transforms)
    loader = DataLoader(dataset, batch_size=8, shuffle=True)
    
    print("Setting up transfer learning model...")
    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
    
    # Freeze backbone parameters
    for param in model.parameters():
        param.requires_grad = False
        
    # Custom regression head
    num_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Linear(num_features, 128),
        nn.ReLU(),
        nn.Dropout(0.2),
        nn.Linear(128, len(LABEL_COLUMNS)),
        nn.Sigmoid()
    )
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = model.to(device)
    
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.fc.parameters(), lr=0.005)
    
    print("Training the classification head (2 epochs)...")
    for epoch in range(2):
        model.train()
        total_loss = 0.0
        for images, labels in loader:
            images = images.to(device)
            labels = labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            total_loss += loss.item() * images.size(0)
            
        epoch_loss = total_loss / len(dataset)
        print(f"Epoch {epoch+1}/2 - Loss: {epoch_loss:.4f}")
        
    models_dir = os.path.join(script_dir, "models")
    os.makedirs(models_dir, exist_ok=True)
    model_save_path = os.path.join(models_dir, "skin_assessment_model.pth")
    torch.save(model.state_dict(), model_save_path)
    print(f"Model saved successfully to: {model_save_path}")

if __name__ == "__main__":
    train()
