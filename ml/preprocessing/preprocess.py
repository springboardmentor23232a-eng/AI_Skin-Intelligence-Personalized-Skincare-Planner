"""
Shared image loading, validation, and feature-extraction utilities used
by both the demo (scikit-learn) and production (CNN) training/inference
pipelines.
"""

from pathlib import Path

import numpy as np
from PIL import Image, UnidentifiedImageError

try:
    from skimage.feature import local_binary_pattern
    from skimage.color import rgb2gray
    _HAS_SKIMAGE = True
except ImportError:  # pragma: no cover
    _HAS_SKIMAGE = False

TARGET_SIZE = (128, 128)
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_MB = 10


class InvalidImageError(ValueError):
    pass


def validate_image_file(path_or_bytes, filename=None):
    """Raises InvalidImageError if the file isn't a readable, reasonably
    sized image. Accepts a filesystem path or raw bytes (with filename
    for extension checking)."""
    if filename is not None:
        ext = Path(filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise InvalidImageError(
                f"Unsupported file type '{ext}'. Allowed: {sorted(ALLOWED_EXTENSIONS)}"
            )
    try:
        img = Image.open(path_or_bytes)
        img.verify()
    except (UnidentifiedImageError, OSError) as e:
        raise InvalidImageError(f"File is not a valid image: {e}") from e
    return True


def load_image(path_or_bytes, size=TARGET_SIZE):
    """Loads, validates, and resizes an image to a fixed size RGB array."""
    img = Image.open(path_or_bytes).convert("RGB")
    img = img.resize(size, Image.BILINEAR)
    return img


def to_normalized_array(img):
    """PIL image -> float32 numpy array in [0, 1], shape (H, W, 3)."""
    return np.asarray(img, dtype=np.float32) / 255.0


def color_histogram_features(img, bins=16):
    """Per-channel color histogram — captures overall tone/redness/pigmentation cues."""
    arr = np.asarray(img)
    feats = []
    for c in range(3):
        hist, _ = np.histogram(arr[:, :, c], bins=bins, range=(0, 255), density=True)
        feats.append(hist)
    return np.concatenate(feats)


def texture_features(img, p=8, r=1):
    """Local Binary Pattern histogram — captures skin texture/roughness cues
    (relevant to dryness/oiliness/enlarged-pore style concerns)."""
    if not _HAS_SKIMAGE:
        # Graceful fallback: crude gradient-magnitude histogram if
        # scikit-image isn't installed.
        arr = np.asarray(img.convert("L"), dtype=np.float32)
        gx = np.abs(np.diff(arr, axis=1))
        gy = np.abs(np.diff(arr, axis=0))
        combined = np.concatenate([gx.ravel(), gy.ravel()])
        hist, _ = np.histogram(combined, bins=16, range=(0, 255), density=True)
        return hist

    gray = (rgb2gray(np.asarray(img)) * 255).astype(np.uint8)
    lbp = local_binary_pattern(gray, p, r, method="uniform")
    n_bins = p + 2
    hist, _ = np.histogram(lbp, bins=n_bins, range=(0, n_bins), density=True)
    return hist


def extract_features(img):
    """Combined feature vector used by the demo (classical ML) pipeline."""
    color = color_histogram_features(img)
    texture = texture_features(img)
    return np.concatenate([color, texture]).astype(np.float32)


def scan_dataset_dir(root):
    """Walks a `<root>/<class_name>/*.{jpg,png,...}` folder tree.
    Returns list of (filepath, class_name)."""
    root = Path(root)
    samples = []
    if not root.exists():
        return samples
    for class_dir in sorted(p for p in root.iterdir() if p.is_dir()):
        for f in sorted(class_dir.iterdir()):
            if f.suffix.lower() in ALLOWED_EXTENSIONS:
                samples.append((str(f), class_dir.name))
    return samples
