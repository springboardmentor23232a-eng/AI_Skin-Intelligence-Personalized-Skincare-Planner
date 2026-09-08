# AI Skincare Planner — ML Pipeline

This folder is a **real, runnable machine learning pipeline** for the skin
analysis feature — not a placeholder. It's split into two tracks so the
app is honest about what it's actually running:

| Track | What it is | Runs in this sandbox? |
|---|---|---|
| **Production pipeline** (`training/train_cnn.py`) | Transfer-learning CNN (MobileNetV2 backbone) for skin-type classification + multi-label concern detection, trained on real photos. | Needs `tensorflow` and a real, labeled skin-image dataset — neither is available here, so it's provided complete and documented but not executed in this environment. |
| **Demo pipeline** (`training/train_demo.py`) | A real scikit-learn classifier trained on real (procedurally generated, clearly synthetic) sample images, using genuine image-feature extraction (color histograms + texture). | **Yes.** This is trained and saved as part of this delivery, and is what `inference/serve.py` loads by default. |

**Nothing here claims medical accuracy.** Every prediction returned by
`inference/serve.py` includes `"disclaimer"` text, and the backend always
labels results as an AI-assisted informational estimate, never a diagnosis.

---

## 1. Dataset structure

Both pipelines expect the same folder layout so you can drop in a real
dataset later without changing code:

```
ml/dataset/
├── train/
│   ├── oily/          *.jpg / *.png
│   ├── dry/
│   ★   combination/
│   ├── normal/
│   └── sensitive/
├── val/
│   ├── oily/
│   ├── dry/
│   ├── combination/
│   ├── normal/
│   └── sensitive/
└── concerns.csv        # multi-label concern annotations (optional, for the CNN track)
```

`concerns.csv` (optional — used only by `train_cnn.py`) has one row per
image:

```csv
filepath,acne,dryness,oiliness,redness,pigmentation,uneven_tone
train/oily/img001.jpg,1,0,1,0,0,0
```

For the demo pipeline, `ml/dataset/sample/` is generated automatically by
`preprocessing/generate_sample_dataset.py` — see below.

### Using a real dataset

Public dermatology datasets (e.g. HAM10000, ISIC) are built for lesion
classification (melanoma, etc.), not cosmetic skin-type/concern labeling,
so they're a poor fit for this use case and aren't bundled here. To train
on real data: collect/label photos into the folder structure above, then
run `train_cnn.py` (production track) or `train_demo.py` (demo track) —
both auto-detect a real dataset if `ml/dataset/train/` is populated, and
fall back to the synthetic sample set otherwise.

---

## 2. Setup

```bash
cd ml
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

`requirements.txt` lists both tracks' dependencies. If you only want the
demo track (no TensorFlow), install `requirements-demo.txt` instead — it's
a minimal subset that installs quickly and is what this sandbox used.

---

## 3. Generate the synthetic sample dataset (demo track)

Real skin photos aren't available in this environment, so this script
procedurally generates a small, clearly-synthetic image set with
consistent, learnable color/texture patterns per class — enough to prove
the pipeline genuinely trains, evaluates, and predicts end-to-end.

```bash
python preprocessing/generate_sample_dataset.py
```

This creates `ml/dataset/sample/train/<class>/*.png` and
`ml/dataset/sample/val/<class>/*.png` for the 5 skin-type classes plus
concern-style texture variants.

---

## 4. Train (demo track — runs here)

```bash
python training/train_demo.py
```

This:
1. Loads `ml/dataset/train/` if present, else the generated sample set.
2. Extracts real image features (RGB color histograms + Local Binary
   Pattern texture descriptors via scikit-image).
3. Trains a `RandomForestClassifier` for skin type and a
   `MultiOutputClassifier` (logistic regression) for concern flags.
4. Evaluates on the held-out validation split and prints accuracy /
   classification report.
5. Saves the trained model to `ml/models/demo_model.joblib`.

## 5. Train (production track — CNN, for later)

```bash
pip install tensorflow==2.16.*
python training/train_cnn.py --data-dir ml/dataset --epochs 20
```

Fine-tunes a MobileNetV2 backbone (ImageNet weights) with a custom head:
one softmax output (skin type, 5 classes) and one sigmoid multi-label
output (concerns). Saves to `ml/models/cnn_model.h5` plus
`ml/models/cnn_labels.json`.

## 6. Evaluate

```bash
python training/evaluate.py --model ml/models/demo_model.joblib
```

## 7. Run inference locally

```bash
python inference/predict.py --image /path/to/photo.jpg
```

## 8. Run the inference microservice (what the backend calls)

```bash
python inference/serve.py
# Flask app on http://localhost:5001
```

`POST /predict` with `multipart/form-data`, field `image` → JSON:

```json
{
  "skin_type": "Oily",
  "skin_type_confidence": 0.81,
  "concerns": [
    {"name": "Acne", "confidence": 0.74, "severity": "Moderate", "priority": 1}
  ],
  "skin_health_score": 78,
  "overall_condition": "Good",
  "model": "demo-rf-v1",
  "disclaimer": "AI-assisted informational estimate — not a medical diagnosis."
}
```

The Node backend (`backend/src/utils/mlClient.js`) calls this endpoint
when `ML_SERVICE_URL` is set in `backend/.env`. If the service is
unreachable or errors, the backend automatically falls back to the
lightweight simulated analysis (`backend/src/utils/aiAnalysis.js`) so the
app never breaks — it just runs the less-accurate mode and doesn't crash.

## 9. Folder reference

```
ml/
├── dataset/                  Dataset root (see structure above)
├── preprocessing/
│   ├── preprocess.py          Image loading, resizing, feature extraction
│   └── generate_sample_dataset.py  Synthetic demo dataset generator
├── training/
│   ├── train_demo.py          Runnable scikit-learn pipeline (this sandbox)
│   ├── train_cnn.py           TensorFlow/Keras CNN pipeline (production)
│   └── evaluate.py            Shared evaluation/reporting
├── inference/
│   ├── predict.py             CLI single-image inference
│   └── serve.py               Flask microservice used by the backend
├── models/                    Saved model artifacts (generated, gitignored)
├── requirements.txt           Full dependency set (both tracks)
├── requirements-demo.txt      Minimal deps for the demo track only
└── README.md
```
