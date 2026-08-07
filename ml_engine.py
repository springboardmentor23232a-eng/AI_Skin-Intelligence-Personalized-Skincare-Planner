
import os
import pickle
import numpy as np
import pandas as pd
from PIL import Image
from typing import Dict, List, Any, Tuple

import torch
import torch.nn as nn
from torchvision import transforms, models

SKIN_CSV = "Skincare Treatment Dataset.csv"
CONCERNS_LIST = ["Acne", "Open Pores", "Redness", "Wrinkles", "Dark Spots"]

class MultiModalSkinModel(nn.Module):
    def __init__(self, num_outputs=5):
        super().__init__()
        resnet = models.resnet18()
        resnet.fc = nn.Identity()
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


class SkinAssessmentEngine:
    def __init__(self):
        self.device = torch.device("cpu")
        self.model = MultiModalSkinModel(num_outputs=5).to(self.device)
        
        if os.path.exists("model.pth"):
            self.model.load_state_dict(torch.load("model.pth", map_location=self.device))
        self.model.eval()

        try:
            self.treatment_df = pd.read_csv(SKIN_CSV)
        except Exception:
            self.treatment_df = pd.DataFrame()

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])

    def query_treatments(self, age_group: str, skin_type: str, concern: str) -> List[Dict[str, Any]]:
        """Queries Skincare Treatment Dataset for active ingredients and effects."""
        if self.treatment_df.empty:
            return [{"ingredients": "Salicylic Acid + Niacinamide", "effects": "Controls sebum and reduces inflammation"}]

        matched = self.treatment_df[
            (self.treatment_df['Age_Group'] == age_group) &
            (self.treatment_df['Skin_Type'] == skin_type) &
            (self.treatment_df['Concern'].str.contains(concern, case=False, na=False))
        ]
        if matched.empty:
            matched = self.treatment_df[self.treatment_df['Concern'].str.contains(concern, case=False, na=False)]

        results = []
        for _, row in matched.head(2).iterrows():
            results.append({
                "ingredients": row.get('Ingredients', ''),
                "concentrations": row.get('Concentrations', ''),
                "effects": row.get('Effects', '')
            })
        return results

    def analyze(self, image: Image.Image, form_data: Dict[str, Any]) -> Dict[str, Any]:
        """Executes multi-modal inference and computes metrics matching SQL tables."""
        img_tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        tab_vector = torch.tensor([[
            float(form_data.get('age', 25)),
            float(form_data.get('sleep', 7.0)),
            1.0 if form_data.get('is_sensitive', False) else 0.0,
            float(form_data.get('water_intake', 2.0)),
            float(form_data.get('stress_level', 5.0)),
            25.0, 7.5, 2.0
        ]], dtype=torch.float32).to(self.device)

        with torch.no_grad():
            severities = self.model(img_tensor, tab_vector).cpu().numpy()[0]

        # Map detected concerns and severities (0-5 scale)
        detected_concerns = []
        for idx, name in enumerate(CONCERNS_LIST):
            sev = float(severities[idx])
            if sev >= 1.0:  # Threshold for detection
                treatments = self.query_treatments(
                    form_data.get('age_group', '25-36'),
                    form_data.get('primary_skin_type', 'Normal'),
                    name
                )
                detected_concerns.append({
                    "concern_name": name,
                    "severity": f"{sev:.1f}/5.0",
                    "priority": int(sev * 20),
                    "treatments": treatments
                })

        # Sort concerns by priority/severity
        detected_concerns = sorted(detected_concerns, key=lambda x: x['priority'], reverse=True)

        # Weighted Skin Health Score (1 to 100)
        avg_sev = float(np.mean(severities)) if len(severities) > 0 else 0.0
        condition_score = max(20.0, 100.0 - (avg_sev * 16.0))
        
        water = form_data.get('water_intake', 2.0)
        sleep = form_data.get('sleep', 7.0)
        consistency = form_data.get('routine_consistency', 80.0)
        
        health_score = int(
            (condition_score * 0.35) +
            (consistency * 0.20) +
            (min(100.0, (sleep / 8.0) * 100.0) * 0.15) +
            (min(100.0, (water / 3.0) * 100.0) * 0.10) +
            (85.0 * 0.20) # lifestyle baseline
        )
        health_score = max(1, min(100, health_score))

        # Hybrid Risk Factor Analysis with Dynamic Escalation
        risk_level = "Low"
        risk_notes = []
        sun = form_data.get('sun_exposure', 'Moderate')
        
        if sun == "High":
            risk_notes.append("High UV exposure increases risk of photoaging and hyperpigmentation.")
        if water < 1.5:
            risk_notes.append("Sub-optimal hydration impairs skin barrier restoration.")

        max_detected_sev = max([float(c['severity'].split('/')[0]) for c in detected_concerns]) if detected_concerns else 0.0

        if max_detected_sev >= 3.5 or len(detected_concerns) >= 3:
            risk_level = "High"
            risk_notes.append(f"DYNAMIC ESCALATION: High visual severity ({max_detected_sev}/5.0) detected. Overall risk escalated to HIGH.")
        elif max_detected_sev >= 2.0 or sun == "High":
            risk_level = "Medium"
            risk_notes.append(f"Moderate visual severity ({max_detected_sev}/5.0) detected.")
        else:
            risk_notes.append("Skin markers and lifestyle habits are within healthy baselines.")

        return {
            "skin_health_score": health_score,
            "overall_condition": f"{len(detected_concerns)} active concerns identified. Dominant: {detected_concerns[0]['concern_name'] if detected_concerns else 'None'}",
            "notes": "Automated multi-modal analysis completed successfully.",
            "concerns": detected_concerns,
            "risk_factor": {
                "risk_name": "Photo-Aging & Barrier Risk" if sun == "High" else "Dermal Integrity Risk",
                "description": " ".join(risk_notes),
                "risk_level": risk_level
            }
        }

engine = SkinAssessmentEngine()