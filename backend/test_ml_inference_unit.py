import io
import pytest
from PIL import Image
from app.ai.model_loader import model_loader
from app.ai.preprocessing import preprocess_pil_image, preprocess_image_bytes
from app.ai.inference import run_skin_condition_inference

def test_model_loader_singleton():
    model, metadata = model_loader.load_model()
    assert model is not None
    assert metadata is not None
    assert len(metadata.get("classes", [])) == 8
    print("[PASS] Model loader successfully loaded 8-class EfficientNet-B0 model and metadata!")

def test_preprocessing():
    img = Image.new('RGB', (300, 400), color='red')
    tensor = preprocess_pil_image(img)
    assert tensor.shape == (1, 3, 224, 224)
    print("[PASS] Image preprocessing tensor shape verified: (1, 3, 224, 224)!")

def test_inference_pipeline():
    img = Image.new('RGB', (256, 256), color='blue')
    result = run_skin_condition_inference(img)
    
    assert "predicted_category" in result
    assert "confidence" in result
    assert "is_low_confidence" in result
    assert "model" in result
    assert result["model"]["name"] == "EfficientNet-B0"
    assert result["model"]["version"] == "2.0.0"
    assert len(result["class_probabilities"]) == 8
    
    print(f"[PASS] Real ML Model Inference Output verified:")
    print(f"       Predicted Category: {result['predicted_category']}")
    print(f"       Confidence: {result['confidence'] * 100:.2f}%")
    print(f"       Low Confidence Flag: {result['is_low_confidence']}")

def test_corrupted_image_handling():
    corrupted_bytes = b"NOT_AN_IMAGE_FILE_DATA"
    try:
        run_skin_condition_inference(corrupted_bytes)
        assert False, "Should have raised ValueError for corrupted image bytes"
    except ValueError as e:
        print(f"[PASS] Corrupted image validation correctly caught: {e}")

if __name__ == '__main__':
    test_model_loader_singleton()
    test_preprocessing()
    test_inference_pipeline()
    test_corrupted_image_handling()
    print("\n[ALL ML INFERENCE UNIT TESTS PASSED SUCCESSFULLY!]")
