import os
import logging
from io import BytesIO
from PIL import Image
from fastapi import HTTPException

import torch
import torch.nn as nn
from torchvision import models
import torchvision.transforms as transforms

logger = logging.getLogger("uvicorn")

# Setup relative paths to the model directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "..", "ml", "models", "skin_assessment_model.pth")
MODEL_PATH = os.path.normpath(MODEL_PATH)

LABEL_COLUMNS = [
    'Acne_Severity (0-5)', 'blackheads', 'whiteheads', 'Open pores (0-5)', 
    'Excessive oil (0-5)', 'Skin irritation (0-5)', 'Skin sensitivity (0-5)', 
    'Redness Severity (0-5)', 'Fine line around eyes(0-5)', 'Eye puffiness(0-5)', 
    'Dark circles around eyes(0-5)', 'Wrinkes on forehead(0-5)', 
    'Skin elasticity(0-5)(5-not elastic at all)', 'Dehydration (0-5)(5 very dehydrated)', 
    'pigmentation(0-5)', 'post acne marks(0-5)', 'uneven skin(0-5)', 'freckles(0-5)'
]

CONCERN_MAP = {
    'Acne_Severity (0-5)': 'Acne',
    'blackheads': 'Blackheads',
    'whiteheads': 'Whiteheads',
    'Open pores (0-5)': 'Open Pores',
    'Excessive oil (0-5)': 'Excessive Oil',
    'Skin irritation (0-5)': 'Skin Irritation',
    'Skin sensitivity (0-5)': 'Skin Sensitivity',
    'Redness Severity (0-5)': 'Redness',
    'Fine line around eyes(0-5)': 'Fine Lines',
    'Eye puffiness(0-5)': 'Eye Puffiness',
    'Dark circles around eyes(0-5)': 'Dark Circles',
    'Wrinkes on forehead(0-5)': 'Forehead Wrinkles',
    'Skin elasticity(0-5)(5-not elastic at all)': 'Loss of Elasticity',
    'Dehydration (0-5)(5 very dehydrated)': 'Dehydration',
    'pigmentation(0-5)': 'Pigmentation',
    'post acne marks(0-5)': 'Post Acne Marks',
    'uneven skin(0-5)': 'Uneven Skin',
    'freckles(0-5)': 'Freckles'
}

# Read opt-in development mock environment variable
DEV_MOCK = os.getenv("DEV_MOCK_ASSESSMENT", "false").lower() == "true"

device = torch.device("cpu")
model = None
model_loaded = False

try:
    if os.path.exists(MODEL_PATH):
        backbone = models.resnet18()
        num_features = backbone.fc.in_features
        backbone.fc = nn.Sequential(
            nn.Linear(num_features, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, len(LABEL_COLUMNS)),
            nn.Sigmoid()
        )
        state_dict = torch.load(MODEL_PATH, map_location=device)
        backbone.load_state_dict(state_dict)
        backbone.eval()
        model = backbone
        model_loaded = True
        logger.info(f"ML Model successfully loaded from: {MODEL_PATH}")
    else:
        logger.warning(f"ML Model file not found at path: {MODEL_PATH}")
except Exception as e:
    logger.error(f"Error loading PyTorch model: {e}", exc_info=True)

# Image preprocessing transforms matching model training configuration
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])


def run_skin_inference(image_bytes: bytes) -> dict:
    """Runs image preprocessing and model regression inference, returning scaled [0, 5] severities."""
    global model, model_loaded
    
    if not model_loaded:
        if DEV_MOCK:
            # Explicit opt-in dev mock mode (returns mock realistic severity data)
            logger.info("ML Model missing. Falling back to opt-in DEV MOCK inference.")
            import random
            outputs = [random.uniform(0.0, 1.0) for _ in range(len(LABEL_COLUMNS))]
        else:
            # Default production behavior: raise 503 error
            raise HTTPException(
                status_code=503,
                detail="ML assessment model is currently unavailable."
            )
    else:
        try:
            img = Image.open(BytesIO(image_bytes)).convert("RGB")
            tensor = preprocess(img).unsqueeze(0).to(device)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid image format. Ensure you upload a valid JPG/PNG file: {e}"
            )
            
        with torch.no_grad():
            outputs = model(tensor).cpu().numpy()[0]
            
    # 1. The 18 model output predictions before scaling
    logger.info("================== ML INFERENCE DEBUG LOG ==================")
    logger.info("1. The 18 model output predictions before scaling:")
    for col_idx, col_name in enumerate(LABEL_COLUMNS):
        logger.info(f"   - {col_name}: {float(outputs[col_idx]):.6f}")
        
    # Scale from [0, 1] regression targets back to [0, 5] range
    predictions = {}
    for idx, col_name in enumerate(LABEL_COLUMNS):
        predictions[col_name] = round(float(outputs[idx]) * 5.0, 2)
        
    # 2. The 18 predictions after converting them to the 0-5 severity range
    logger.info("2. The 18 predictions after converting them to the 0-5 severity range:")
    for col_name, val in predictions.items():
        logger.info(f"   - {col_name}: {val:.2f}")
        
    # 3. The name of each of the 18 skin characteristics together with its predicted severity
    logger.info("3. The name of each of the 18 skin characteristics together with its predicted severity:")
    for col_name, val in predictions.items():
        char_name = CONCERN_MAP.get(col_name, col_name)
        logger.info(f"   - {char_name}: {val:.2f} / 5.0")
        
    return predictions


def calculate_skin_health_score(severities: dict) -> int:
    """Calculates a project-level skin health index out of 100 based on severity totals."""
    total_severity = sum(severities.values())
    max_possible_severity = len(LABEL_COLUMNS) * 5.0  # 18 targets * 5.0 = 90.0 max score
    
    # Calculate score where lower severity total yields a higher health score
    score = int(100.0 * (1.0 - (total_severity / max_possible_severity)))
    score = max(0, min(100, score))
    
    # 4. The sum of all 18 severity values
    logger.info(f"4. The sum of all 18 severity values: {total_severity:.2f}")
    
    # 5. The final calculated skin health score
    logger.info(f"5. The final calculated skin health score: {score}")
    
    # 6. The exact formula used to calculate the score
    logger.info("6. The exact formula used to calculate the score: 100 * (1 - sum(severities) / 90)")
    
    return score


def determine_overall_condition(score: int) -> str:
    """Determines general skin condition status matching score ranges."""
    if score >= 85:
        return "Excellent"
    elif score >= 70:
        return "Good"
    elif score >= 50:
        return "Fair"
    else:
        return "Needs Attention"


def identify_prioritized_concerns(severities: dict) -> list:
    """Filters concerns with severity >= 1.0 and assigns priority ratings."""
    concerns = []
    for raw_key, severity in severities.items():
        if severity >= 1.0:
            # Assign priority labels
            if severity >= 4.0:
                priority = "HIGH"
            elif severity >= 2.5:
                priority = "MEDIUM"
            else:
                priority = "LOW"
                
            concern_name = CONCERN_MAP.get(raw_key, raw_key)
            concerns.append({
                "concern_name": concern_name,
                "severity": severity,
                "priority": priority
            })
            
    # Sort concerns by severity descending (highest priority action items first)
    concerns.sort(key=lambda x: x["severity"], reverse=True)
    return concerns


def generate_rule_based_risks(severities: dict) -> list:
    """Applies rule-based conditional checks on predicted severities to evaluate risk factors."""
    risks = []
    
    # 7. Which risk-factor rules were evaluated
    logger.info("7. Which risk-factor rules were evaluated:")
    logger.info("   - Rule 1 (Barrier): Skin Barrier Compromise (evaluated if irritation >= 2.5 or sensitivity >= 2.5)")
    logger.info("   - Rule 2 (Photoaging): Photoaging & Hyperpigmentation (evaluated if pigmentation >= 2.5 or freckles >= 3.0)")
    logger.info("   - Rule 3 (Acne Scar): Inflammatory Acne Scarring (evaluated if acne >= 3.0 or acne_marks >= 3.0)")
    logger.info("   - Rule 4 (Dehydration): Epidermal Dehydration (evaluated if dehydration >= 3.0)")
    logger.info("   - Rule 5 (Aging): Loss of Elasticity & Fine Lines (evaluated if fine_lines >= 3.0 or forehead_wrinkles >= 3.0 or elasticity >= 3.0)")
    
    triggered_rules = []
    
    # Extract values for risk conditions
    acne = severities.get('Acne_Severity (0-5)', 0.0)
    acne_marks = severities.get('post acne marks(0-5)', 0.0)
    pigmentation = severities.get('pigmentation(0-5)', 0.0)
    freckles = severities.get('freckles(0-5)', 0.0)
    irritation = severities.get('Skin irritation (0-5)', 0.0)
    sensitivity = severities.get('Skin sensitivity (0-5)', 0.0)
    dehydration = severities.get('Dehydration (0-5)(5 very dehydrated)', 0.0)
    fine_lines = severities.get('Fine line around eyes(0-5)', 0.0)
    forehead_wrinkles = severities.get('Wrinkes on forehead(0-5)', 0.0)
    elasticity = severities.get('Skin elasticity(0-5)(5-not elastic at all)', 0.0)

    # 1. Skin Barrier Compromise
    if irritation >= 2.5 or sensitivity >= 2.5:
        level = "HIGH" if (irritation >= 4.0 or sensitivity >= 4.0) else "MEDIUM"
        triggered_rules.append("Rule 1 (Barrier): Skin Barrier Compromise")
        risks.append({
            "risk_name": "Skin Barrier Compromise",
            "risk_level": level,
            "description": "Elevated skin sensitivity or irritation suggests a compromised skin barrier. Avoid harsh active acids and focus on ceramide-rich moisturizers."
        })
        
    # 2. Hyperpigmentation & Photoaging
    if pigmentation >= 2.5 or freckles >= 3.0:
        level = "HIGH" if (pigmentation >= 4.0) else "MEDIUM"
        triggered_rules.append("Rule 2 (Photoaging): Photoaging & Hyperpigmentation")
        risks.append({
            "risk_name": "Photoaging & Hyperpigmentation",
            "risk_level": level,
            "description": "Increased dark spots or freckles show exposure to UV damage. Daily broad-spectrum SPF 30+ sunscreen application is highly recommended."
        })

    # 3. Acne Scarring Risk
    if acne >= 3.0 or acne_marks >= 3.0:
        level = "HIGH" if (acne >= 4.0) else "MEDIUM"
        triggered_rules.append("Rule 3 (Acne Scar): Inflammatory Acne Scarring")
        risks.append({
            "risk_name": "Inflammatory Acne Scarring",
            "risk_level": level,
            "description": "Elevated acne or post-acne marks indicate a risk of long-term scarring and post-inflammatory hyperpigmentation. Consider non-comedogenic salicylic formulas."
        })

    # 4. Epidermal Dehydration
    if dehydration >= 3.0:
        triggered_rules.append("Rule 4 (Dehydration): Epidermal Dehydration")
        risks.append({
            "risk_name": "Epidermal Dehydration",
            "risk_level": "MEDIUM",
            "description": "High dehydration levels can weaken the skin barrier, leading to flakiness, irritation, and fine lines. Ensure adequate daily water intake."
        })

    # 5. Loss of Structural Integrity
    if fine_lines >= 3.0 or forehead_wrinkles >= 3.0 or elasticity >= 3.0:
        triggered_rules.append("Rule 5 (Aging): Loss of Elasticity & Fine Lines")
        risks.append({
            "risk_name": "Loss of Elasticity & Fine Lines",
            "risk_level": "MEDIUM",
            "description": "Early signs of fine lines, forehead wrinkles, or reduced skin elasticity. Consider introducing gentle retinoids and antioxidants into your evening routine."
        })

    # 8. Which risk-factor rules were triggered
    logger.info("8. Which risk-factor rules were triggered:")
    if triggered_rules:
        for r_name in triggered_rules:
            logger.info(f"   - {r_name} (TRIGGERED)")
    else:
        logger.info("   - None")

    return risks
