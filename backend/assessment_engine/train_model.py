import os
import io
import time
import random
import pickle
import numpy as np
import pandas as pd
from PIL import Image, UnidentifiedImageError
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models
from sklearn.preprocessing import LabelEncoder, StandardScaler

# ==============================================================================
# GOOGLE GENAI SDK INITIALIZATION (GOOGLE AI STUDIO MODE)
# ==============================================================================
from google import genai
from google.genai import types

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
PRIMARY_MODEL = os.getenv("PRIMARY_MODEL", "gemini-2.5-flash")
FALLBACK_MODEL = os.getenv("FALLBACK_MODEL", "gemini-3.5-flash-lite")

try:
    if GEMINI_API_KEY:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    else:
        gemini_client = genai.Client()
    print("🤖 Google AI Studio Client initialized successfully!")
except Exception as e:
    gemini_client = None
    print(f"⚠️ Gemini Client failed to initialize ({e}). Gemini multimodal features disabled.")


# --- RETRY UTILITY WITH MODEL FALLBACK & RATE LIMIT HANDLING ---

def generate_content_with_fallback(
    client: genai.Client,
    contents: Any,
    config: Optional[types.GenerateContentConfig] = None,
    primary_model: str = PRIMARY_MODEL,
    fallback_model: str = FALLBACK_MODEL,
    max_retries_per_model: int = 3,
    initial_delay: float = 2.0
):
    """Generates content with backoff for 429 rate limits, falling back across active Gemini 3 models on quota exhaustion."""
    models_to_try = [primary_model, fallback_model, "gemini-3.7-flash"]
    models_to_try = list(dict.fromkeys(models_to_try))
    last_exception = None

    for current_model in models_to_try:
        for attempt in range(max_retries_per_model + 1):
            try:
                response = client.models.generate_content(
                    model=current_model,
                    contents=contents,
                    config=config,
                )
                # Proactive delay between calls to avoid hitting rate limits
                time.sleep(4)
                return response
            except Exception as e:
                last_exception = e
                err_msg = str(e).lower()
                is_rate_limit = "429" in err_msg or "resource_exhausted" in err_msg or "quota" in err_msg

                if is_rate_limit:
                    if attempt < max_retries_per_model:
                        jitter = random.uniform(0.1, 0.5)
                        delay = (initial_delay * (2 ** attempt)) + jitter
                        print(f"⚠️ Rate limit on {current_model}. Retrying in {delay:.2f}s... (Attempt {attempt + 1}/{max_retries_per_model})")
                        time.sleep(delay)
                    else:
                        print(f"⚠️ Model {current_model} quota/rate limit exhausted. Switching to fallback model...")
                        time.sleep(4)
                        break
                else:
                    print(f"⚠️ Model {current_model} error: {e}. Switching to fallback model...")
                    break

    if last_exception:
        raise last_exception
    raise RuntimeError("All Gemini model quotas exhausted.")


# Paths
DATA_DIR = "data"
SKIN_CSV = os.path.join(DATA_DIR, "Skincare Treatment Dataset.csv")
SKIN_V2_DIR = os.path.join(DATA_DIR, "Skin v2")
SKIN_TYPE_DIR = os.path.join(DATA_DIR, "skin_type_classification_dataset")

# Standard concerns/classes across datasets
CONCERNS_LIST = ["Acne", "Dark Spots", "Open Pores", "Redness", "Wrinkles"]


# ==============================================================================
# STRUCTURED GENAI ASSESSMENT SCHEMAS
# ==============================================================================
class ConcernAssessment(BaseModel):
    concern_name: str = Field(description="Name of concern: Acne, Dark Spots, Open Pores, Redness, or Wrinkles")
    severity: float = Field(description="Severity score rating from 0.0 to 5.0")
    clinical_note: str = Field(description="Brief observation regarding this skin concern")


class GeminiSkinAssessmentResponse(BaseModel):
    primary_concern: str = Field(description="Most prominent detected skin concern")
    overall_health_score: float = Field(description="Overall skin score from 0 to 100")
    detected_concerns: List[ConcernAssessment]


# ==============================================================================
# GEMINI VISION ANALYSIS UTILITY
# ==============================================================================
def analyze_image_with_gemini(image_path: str) -> Optional[GeminiSkinAssessmentResponse]:
    """Uses Gemini to generate a structured dermatological image assessment."""
    if not gemini_client:
        print("Gemini client unavailable.")
        return None

    try:
        pil_img = Image.open(image_path).convert("RGB")
        
        prompt = """
        Analyze this facial/skin image as an expert AI dermatologist.
        Evaluate the severity (0.0 to 5.0 scale) for these 5 concern categories:
        1. Acne
        2. Dark Spots
        3. Open Pores
        4. Redness
        5. Wrinkles

        Provide the primary concern, overall health score (0-100), and detailed concern items.
        """

        response = generate_content_with_fallback(
            client=gemini_client,
            contents=[pil_img, prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=GeminiSkinAssessmentResponse,
                temperature=0.2,
            ),
            primary_model=PRIMARY_MODEL,
            fallback_model=FALLBACK_MODEL
        )

        return GeminiSkinAssessmentResponse.model_validate_json(response.text)
    except Exception as e:
        print(f"Gemini image assessment error: {e}")
        return None


def batch_analyze_dataset_images(image_paths: List[str]):
    """Processes batch image analysis with explicit delays between continuous calls."""
    results = []
    for idx, path in enumerate(image_paths):
        print(f"Processing image {idx + 1}/{len(image_paths)}: {path}")
        res = analyze_image_with_gemini(path)
        if res:
            results.append(res)
        time.sleep(4)
    return results


# ==============================================================================
# PYTORCH MULTI-MODAL MODEL & DATASET
# ==============================================================================
class MultiModalSkinModel(nn.Module):
    """Architecture matched for state_dict key alignment."""
    def __init__(self, num_outputs=5):
        super().__init__()
        try:
            resnet = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
        except Exception:
            resnet = models.resnet18(pretrained=True)
            
        resnet.fc = nn.Identity()  # 512-dim image feature vector
        self.backbone = resnet
        
        self.fc = nn.Sequential(
            nn.Linear(512 + 8, 128),
            nn.ReLU(),
            nn.Linear(128, num_outputs)
        )

    def forward(self, img, tab):
        feats = self.backbone(img)
        fused = torch.cat([feats, tab], dim=1)
        return torch.relu(self.fc(fused))


class RealSkinMultiModalDataset(Dataset):
    """Custom Multi-Modal Dataset scanning real image directories."""
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
            except (UnidentifiedImageError, OSError, Exception):
                image = Image.new("RGB", (224, 224), color=(200, 200, 200))
        else:
            image = Image.new("RGB", (224, 224), color=(200, 200, 200))

        if self.transform:
            img_tensor = self.transform(image)
        else:
            img_tensor = transforms.ToTensor()(image)

        tab_vector = torch.tensor([25.0, 7.0, 0.0, 2.5, 5.0, 25.0, 7.5, 2.0], dtype=torch.float32)

        targets = torch.zeros(5, dtype=torch.float32)
        targets[label_idx] = 4.0

        return img_tensor, tab_vector, targets


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
    scaler.fit(np.random.rand(10, 8))
    encoders['scaler'] = scaler

    with open('encoders.pkl', 'wb') as f:
        pickle.dump(encoders, f)

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    dataset = RealSkinMultiModalDataset([SKIN_V2_DIR, SKIN_TYPE_DIR], transform=transform)
    dataloader = DataLoader(dataset, batch_size=32, shuffle=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training on device: {device}")
    
    model = MultiModalSkinModel(num_outputs=5).to(device)
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
        
        avg_loss = total_loss / len(dataloader) if len(dataloader) > 0 else 0.0
        print(f"Epoch [{epoch+1}/{epochs}] - Loss: {avg_loss:.4f}")

    torch.save(model.state_dict(), "model.pth")
    print("Training complete! Updated model weights saved to 'model.pth'.")


if __name__ == "__main__":
    train_and_export()