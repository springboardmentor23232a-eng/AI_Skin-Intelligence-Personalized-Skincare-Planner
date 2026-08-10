import torch
import torch.nn.functional as F
from PIL import Image
from typing import Dict, Any, Union
from app.ai.model_loader import model_loader
from app.ai.preprocessing import preprocess_image_bytes, preprocess_pil_image

CONFIDENCE_THRESHOLD = 0.60

def run_skin_condition_inference(image_input: Union[bytes, Image.Image]) -> Dict[str, Any]:
    """
    Executes PyTorch model inference for skin condition classification.
    Returns structured results including predicted class, confidence, low-confidence warning,
    model metadata, and class probability distribution.
    """
    model, metadata = model_loader.load_model()
    device = model_loader.device

    # Preprocess image into tensor
    if isinstance(image_input, bytes):
        input_tensor = preprocess_image_bytes(image_input).to(device)
    elif isinstance(image_input, Image.Image):
        input_tensor = preprocess_pil_image(image_input).to(device)
    else:
        raise ValueError("Invalid image input format. Expected bytes or PIL Image.")

    # Perform Forward Pass
    model.eval()
    with torch.no_grad():
        outputs = model(input_tensor)
        probabilities = F.softmax(outputs, dim=1).squeeze(0)

    classes = metadata.get("classes", [])
    prob_list = probabilities.cpu().numpy().tolist()

    # Get Top Prediction
    top_prob, top_idx = torch.max(probabilities, dim=0)
    top_confidence = float(top_prob.item())
    predicted_category = classes[top_idx.item()] if top_idx.item() < len(classes) else "Unknown"

    # Per-Class Probabilities Dictionary
    class_probs = {cls: round(float(prob) * 100, 1) for cls, prob in zip(classes, prob_list)}

    # Low-Confidence Warning & Safety Check
    is_low_confidence = top_confidence < CONFIDENCE_THRESHOLD

    warning_msg = None
    if is_low_confidence:
        warning_msg = (
            f"Low confidence prediction ({round(top_confidence * 100, 1)}%). "
            "This result is an experimental demo analysis and should not be relied upon without "
            "verification by a qualified dermatologist."
        )

    summary_msg = (
        f"AI scan identified '{predicted_category}' with {round(top_confidence * 100, 1)}% model confidence. "
        "This is an experimental AI analysis trained on the SCIN dataset."
    )

    # Legacy Metric Compatibility Mapping
    # (Maps clinical category prediction into legacy metrics for backward compatibility)
    metrics_legacy = {
        "Acne": class_probs.get("Acneiform & Follicular Disorders", 15.0),
        "Redness": class_probs.get("Urticaria & Reactive Rashes", 20.0),
        "Dryness": class_probs.get("Eczematous & Inflammatory Dermatitis", 25.0),
        "Oiliness": round(max(10.0, 100.0 - class_probs.get("Eczematous & Inflammatory Dermatitis", 50.0)), 1),
        "Sensitivity": class_probs.get("Eczematous & Inflammatory Dermatitis", 20.0),
        "Hyperpigmentation": class_probs.get("Vascular & Purpuric Conditions", 15.0)
    }

    return {
        "predicted_category": predicted_category,
        "confidence": round(top_confidence, 4),
        "is_low_confidence": is_low_confidence,
        "warning": warning_msg,
        "summary": summary_msg,
        "priority_concern": predicted_category,
        "class_probabilities": class_probs,
        "metrics": metrics_legacy,
        "model": {
            "name": "EfficientNet-B0",
            "full_name": metadata.get("model_name", "SCIN_EFFICIENTNET_B0_Clinical_Category_Classifier"),
            "version": metadata.get("model_version", "2.0.0"),
            "architecture": metadata.get("architecture", "efficientnet_b0"),
            "dataset": metadata.get("dataset", "SCIN"),
            "is_experimental": True,
            "disclaimer": "EXPERIMENTAL DEMO MODEL ONLY. NOT FOR MEDICAL DIAGNOSIS."
        }

    }
