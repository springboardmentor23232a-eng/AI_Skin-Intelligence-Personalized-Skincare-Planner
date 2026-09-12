import io
from typing import Any
from PIL import Image, ImageOps

try:
    import torch
    from torchvision import transforms
    TORCH_AVAILABLE = True
except ImportError:
    torch = None
    transforms = None
    TORCH_AVAILABLE = False

# Preprocessing Configuration matching training pipeline
IMG_SIZE = 224
NORMALIZE_MEAN = [0.485, 0.456, 0.406]
NORMALIZE_STD = [0.229, 0.224, 0.225]

def get_inference_transforms():
    if not TORCH_AVAILABLE or transforms is None:
        raise RuntimeError("PyTorch/torchvision runtime is not installed.")
    return transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=NORMALIZE_MEAN, std=NORMALIZE_STD)
    ])

def preprocess_image_bytes(image_bytes: bytes) -> Any:
    """
    Validates, applies EXIF orientation correction, converts to RGB,
    resizes to 224x224, normalizes, and returns a PyTorch tensor (1, 3, 224, 224).
    """
    if not TORCH_AVAILABLE or torch is None:
        raise RuntimeError("PyTorch runtime is not installed.")
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img = ImageOps.exif_transpose(img)
        if img.mode != 'RGB':
            img = img.convert('RGB')
    except Exception as e:
        raise ValueError(f"Corrupted or invalid image file: {str(e)}")

    transform = get_inference_transforms()
    tensor = transform(img)
    return tensor.unsqueeze(0)  # Add batch dimension: (1, 3, 224, 224)

def preprocess_pil_image(img: Image.Image) -> Any:
    """
    Preprocesses a PIL Image object into a PyTorch tensor (1, 3, 224, 224).
    """
    if not TORCH_AVAILABLE or torch is None:
        raise RuntimeError("PyTorch runtime is not installed.")
    img = ImageOps.exif_transpose(img)
    if img.mode != 'RGB':
        img = img.convert('RGB')
    transform = get_inference_transforms()
    tensor = transform(img)
    return tensor.unsqueeze(0)
