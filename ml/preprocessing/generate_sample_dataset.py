"""
Generates a small, clearly-synthetic sample image dataset so the ML
pipeline in this repo can be trained and evaluated end-to-end without
requiring a real, licensed skin-photo dataset (none is available in this
environment, and public dermatology datasets like HAM10000/ISIC are built
for lesion classification, not cosmetic skin-type labeling).

This is NOT real skin data. It exists purely to prove the training /
evaluation / inference pipeline genuinely runs on real image bytes,
extracts real features, and produces real (if not clinically meaningful)
predictions. Swap in a real, properly-licensed dataset with the same
folder layout to get meaningful results — see ml/README.md.

Each class gets a distinct, learnable-but-noisy color + texture signature
so a classifier trained on this data will show non-trivial (not 100%,
not random) accuracy, the way a real dataset would.
"""

import os
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ML_DIR = Path(__file__).resolve().parent.parent
OUT_DIR = ML_DIR / "dataset" / "sample"

IMAGE_SIZE = 128

# Each class: (base RGB tone, texture roughness, blotchiness)
SKIN_TYPE_PROFILES = {
    "oily":        {"base": (210, 175, 150), "roughness": 0.15, "blotch": 0.35, "sheen": 0.55},
    "dry":         {"base": (225, 195, 175), "roughness": 0.55, "blotch": 0.15, "sheen": 0.05},
    "combination": {"base": (215, 182, 158), "roughness": 0.30, "blotch": 0.25, "sheen": 0.30},
    "normal":      {"base": (220, 188, 165), "roughness": 0.10, "blotch": 0.10, "sheen": 0.15},
    "sensitive":   {"base": (230, 160, 150), "roughness": 0.20, "blotch": 0.45, "sheen": 0.10},
}


def _clamp(v):
    return max(0, min(255, int(v)))


def make_synthetic_face(profile, seed):
    rng = random.Random(seed)
    rnd = np.random.default_rng(seed)

    # Jitter the base tone per-sample so classes overlap somewhat — a real
    # dataset is never perfectly separable, and neither should this be.
    base = tuple(_clamp(c + rng.randint(-22, 22)) for c in profile["base"])
    img = Image.new("RGB", (IMAGE_SIZE, IMAGE_SIZE), base)
    arr = np.array(img).astype(np.float32)

    # Roughness -> per-pixel noise (texture), plus a shared baseline noise
    # floor so low-roughness classes aren't trivially "flat".
    noise_strength = 12 + profile["roughness"] * 32
    arr += rnd.normal(0, noise_strength, arr.shape)

    # Blotchiness -> a handful of soft colored patches (redness/pigmentation-like)
    img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    draw = ImageDraw.Draw(img)
    n_blotches = int(profile["blotch"] * 12) + rng.randint(0, 3)
    for _ in range(n_blotches):
        cx, cy = rng.randint(10, IMAGE_SIZE - 10), rng.randint(10, IMAGE_SIZE - 10)
        r = rng.randint(3, 10)
        shade = (
            _clamp(base[0] + rng.randint(-25, 25)),
            _clamp(base[1] - rng.randint(0, 30)),
            _clamp(base[2] - rng.randint(0, 30)),
        )
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=shade)

    # Sheen -> bright soft highlight patches (oiliness-like)
    n_sheen = int(profile["sheen"] * 10) + rng.randint(0, 2)
    for _ in range(n_sheen):
        cx, cy = rng.randint(10, IMAGE_SIZE - 10), rng.randint(10, IMAGE_SIZE - 10)
        r = rng.randint(4, 14)
        shade = (_clamp(base[0] + 35), _clamp(base[1] + 35), _clamp(base[2] + 30))
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=shade)

    img = img.filter(ImageFilter.GaussianBlur(radius=1.2))
    return img


def generate(n_train=40, n_val=10):
    for split, n in (("train", n_train), ("val", n_val)):
        for cls, profile in SKIN_TYPE_PROFILES.items():
            out_dir = OUT_DIR / split / cls
            out_dir.mkdir(parents=True, exist_ok=True)
            for i in range(n):
                seed = hash((split, cls, i)) % (2**31)
                img = make_synthetic_face(profile, seed)
                img.save(out_dir / f"{cls}_{i:03d}.png")
    print(f"Synthetic sample dataset written to {OUT_DIR}")
    print(f"Classes: {list(SKIN_TYPE_PROFILES.keys())}")
    print(f"Train images/class: {n_train}  Val images/class: {n_val}")


if __name__ == "__main__":
    generate()
