import os
import json
import torch
import torch.nn as nn
from torchvision import models

class ModelLoader:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
            cls._instance.model = None
            cls._instance.metadata = None
            cls._instance.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
            cls._instance.is_loaded = False
        return cls._instance

    def load_model(self):
        if self.is_loaded:
            return self.model, self.metadata

        # Resolve paths relative to project root
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        project_root = os.path.dirname(backend_dir)

        weights_path = os.path.join(project_root, 'ml', 'models', 'skin_condition_improved.pth')
        if not os.path.exists(weights_path):
            weights_path = os.path.join(project_root, 'ml', 'models', 'EXP-IMP-03_checkpoint.pth')

        metadata_path = os.path.join(project_root, 'ml', 'models', 'improved_model_metadata.json')

        print(f"[AI ModelLoader] Loading model weights from: {weights_path}")
        print(f"[AI ModelLoader] Loading metadata from: {metadata_path}")

        if not os.path.exists(weights_path):
            raise FileNotFoundError(f"Model checkpoint not found at {weights_path}")

        # Load Metadata
        if os.path.exists(metadata_path):
            with open(metadata_path, 'r', encoding='utf-8') as f:
                self.metadata = json.load(f)
        else:
            self.metadata = {
                "model_name": "SCIN_EFFICIENTNET_B0_Clinical_Category_Classifier",
                "model_version": "2.0.0",
                "architecture": "efficientnet_b0",
                "classes": [
                    "Acneiform & Follicular Disorders",
                    "Eczematous & Inflammatory Dermatitis",
                    "Infections & Infestations",
                    "Other Clinical Disorders",
                    "Papulosquamous Disorders",
                    "Trauma & Insect Bites",
                    "Urticaria & Reactive Rashes",
                    "Vascular & Purpuric Conditions"
                ]
            }

        # Build EfficientNet-B0 Model Structure
        classes = self.metadata.get("classes", [])
        num_classes = len(classes)

        model = models.efficientnet_b0(weights=None)
        in_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(in_features, num_classes)

        # Load Weights
        checkpoint = torch.load(weights_path, map_location=self.device)
        if isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
            model.load_state_dict(checkpoint['model_state_dict'])
        else:
            model.load_state_dict(checkpoint)

        model.to(self.device)
        model.eval()

        self.model = model
        self.is_loaded = True
        print(f"[AI ModelLoader] Model successfully loaded on {self.device} with {num_classes} classes!")
        return self.model, self.metadata

model_loader = ModelLoader()
