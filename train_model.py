
import os
import pickle
import numpy as np
import pandas as pd
from PIL import Image

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models
from sklearn.preprocessing import LabelEncoder, StandardScaler

# Paths
DATA_DIR = "data"
SKIN_CSV = os.path.join(DATA_DIR, "Skincare Treatment Dataset.csv")
SKIN_V2_DIR = os.path.join(DATA_DIR, "Skin v2")
SKIN_TYPE_DIR = os.path.join(DATA_DIR, "skin_type_classification_dataset")

# Standard concerns/classes across your datasets
CONCERNS_LIST = ["Acne", "Dark Spots", "Open Pores", "Redness", "Wrinkles"]

def train_and_export():
    print("Initializing training pipeline with real dataset image folders...")

    df_skin = pd.read_csv(SKIN_CSV) if os.path.exists(SKIN_CSV) else pd.DataFrame()
    encoders = {}
    
    if not df_skin.empty:
        for col in ['Age_Group', 'Skin_Type', 'Concern', 'Ingredients', 'Effects']:
            if col in df_skin.columns:
                le = LabelEncoder()
                df_skin[f"{col}_encoded"] = le.fit_transform(df_skin[col].astype(str))
                encoders[col] = le

    scaler = StandardScaler()
    scaler.fit(np.random.rand(10, 4))
    encoders['scaler'] = scaler

    with open('encoders.pkl', 'wb') as f:
        pickle.dump(encoders, f)

    # Custom Multi-Modal Dataset scanning real image directories
    class RealSkinMultiModalDataset(Dataset):
        def __init__(self, root_dirs, transform=None):
            self.transform = transform
            self.samples = []
            self.classes = [c.lower() for c in CONCERNS_LIST]

            for r_dir in root_dirs:
                if os.path.exists(r_dir):
                    print(f"Scanning directory: {r_dir}")
                    for subfolder in os.listdir(r_dir):
                        sub_path = os.path.join(r_dir, subfolder)
                        if os.path.isdir(sub_path):
                            # Match subfolder name to concern index
                            matched_idx = 0
                            for idx, c_name in enumerate(self.classes):
                                if c_name in subfolder.lower() or subfolder.lower() in c_name:
                                    matched_idx = idx
                                    break
                            
                            for img_name in os.listdir(sub_path):
                                if img_name.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.bmp', '.jfif')):
                                    self.samples.append((os.path.join(sub_path, img_name), matched_idx))

            print(f"Total valid images discovered across folders: {len(self.samples)}")

            if len(self.samples) == 0:
                print("Warning: No images found! Using synthetic fallback.")
                self.samples = [("dummy", 0)]

        def __len__(self):
            return len(self.samples)

        def __getitem__(self, idx):
            path, label_idx = self.samples[idx]
            
            if path != "dummy" and os.path.exists(path):
                try:
                    image = Image.open(path).convert("RGB")
                except Exception:
                    image = Image.new("RGB", (224, 224), color=(200, 200, 200))
            else:
                image = Image.new("RGB", (224, 224), color=(200, 200, 200))

            if self.transform:
                img_tensor = self.transform(image)
            else:
                img_tensor = transforms.ToTensor()(image)

            # Tabular feature vector (8 elements matching model fusion layer)
            tab_vector = torch.tensor([25.0, 7.0, 0.0, 2.5, 5.0, 25.0, 7.5, 2.0], dtype=torch.float32)

            # Multi-output target severities across 5 concerns
            targets = torch.zeros(5, dtype=torch.float32)
            targets[label_idx] = 4.0  # Assign high severity for the ground-truth category

            return img_tensor, tab_vector, targets

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    # Scan both dataset directories
    dataset = RealSkinMultiModalDataset([SKIN_V2_DIR, SKIN_TYPE_DIR], transform=transform)
    dataloader = DataLoader(dataset, batch_size=32, shuffle=True)

    class MultiModalModel(nn.Module):
        def __init__(self, num_outputs=5):
            super().__init__()
            resnet = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
            resnet.fc = nn.Identity()  # 512-dim image feature vector
            self.backbone = resnet
            
            self.fc = nn.Sequential(
                nn.Linear(512 + 8, 128),
                nn.ReLU(),
                nn.Dropout(0.3),
                nn.Linear(128, num_outputs)
            )

        def forward(self, img, tab):
            feats = self.backbone(img)
            fused = torch.cat([feats, tab], dim=1)
            return torch.relu(self.fc(fused))

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training on device: {device}")
    
    model = MultiModalModel(num_outputs=5).to(device)
    optimizer = optim.Adam(model.parameters(), lr=1e-4)
    criterion = nn.MSELoss()

    model.train()
    epochs = 5
    for epoch in range(epochs):
        total_loss = 0.0
        for imgs, tabs, targets in dataloader:
            imgs, tabs, targets = imgs.to(device), tabs.to(device), targets.to(device)
            optimizer.zero_grad()
            outputs = model(imgs, tabs)
            loss = criterion(outputs, targets)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
        print(f"Epoch [{epoch+1}/{epochs}] - Loss: {total_loss/len(dataloader):.4f}")

    torch.save(model.state_dict(), "model.pth")
    print("Training complete! Updated model weights saved to 'model.pth'.")

if __name__ == "__main__":
    train_and_export()
