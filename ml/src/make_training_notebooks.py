import json
import os

def create_training_and_evaluation_notebooks():
    os.makedirs("ml/notebooks", exist_ok=True)
    
    # 1. Training Notebook
    nb_train = {
        "cells": [
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "# Phase 6 — Model Development & Training Notebook\n",
                    "\n",
                    "This notebook implements transfer learning model training on the SCIN dataset using **EfficientNet-B0** and **ResNet34** backbones.\n",
                    "\n",
                    "## Training Configurations & Experiment Tracker\n",
                    "- **EXP-01**: Baseline EfficientNet-B0 (Unweighted Cross-Entropy Loss)\n",
                    "- **EXP-02**: EfficientNet-B0 (Weighted Cross-Entropy Loss for Class Imbalance)\n",
                    "- **EXP-03**: ResNet34 (Weighted Cross-Entropy Loss)"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "import sys\n",
                    "sys.path.append('../src')\n",
                    "from train import train_experiment\n",
                    "\n",
                    "# Run EXP-01: Baseline EfficientNet-B0\n",
                    "history_exp1, path_exp1 = train_experiment(\n",
                    "    exp_id='EXP-01',\n",
                    "    arch_name='efficientnet_b0',\n",
                    "    use_class_weights=False,\n",
                    "    num_epochs=6,\n",
                    "    batch_size=32,\n",
                    "    lr=1e-4\n",
                    ")"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Run EXP-02: Weighted EfficientNet-B0\n",
                    "history_exp2, path_exp2 = train_experiment(\n",
                    "    exp_id='EXP-02',\n",
                    "    arch_name='efficientnet_b0',\n",
                    "    use_class_weights=True,\n",
                    "    num_epochs=6,\n",
                    "    batch_size=32,\n",
                    "    lr=1e-4\n",
                    ")"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Run EXP-03: Weighted ResNet34\n",
                    "history_exp3, path_exp3 = train_experiment(\n",
                    "    exp_id='EXP-03',\n",
                    "    arch_name='resnet34',\n",
                    "    use_class_weights=True,\n",
                    "    num_epochs=6,\n",
                    "    batch_size=32,\n",
                    "    lr=1e-4\n",
                    ")"
                ]
            }
        ],
        "metadata": {"language_info": {"name": "python"}},
        "nbformat": 4,
        "nbformat_minor": 2
    }

    # 2. Evaluation Notebook
    nb_eval = {
        "cells": [
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "# Phase 7 — Model Evaluation Notebook (Held-Out Test Set)\n",
                    "\n",
                    "This notebook evaluates the best validated deep learning model **strictly on the held-out untouched test set** (`ml/data/splits/test_cases.csv`).\n",
                    "\n",
                    "## Evaluated Metrics\n",
                    "- Test Accuracy & Average Confidence\n",
                    "- Macro & Weighted Precision, Recall, F1-Score\n",
                    "- Per-Class Precision, Recall, F1-Score\n",
                    "- Confusion Matrix & Error Analysis"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "import sys\n",
                    "sys.path.append('../src')\n",
                    "from evaluate import evaluate_best_model\n",
                    "\n",
                    "# Evaluate EXP-02 Best Model on Untouched Test Set\n",
                    "metadata, per_class_df, conf_mat = evaluate_best_model('../models/EXP-02_best.pth')"
                ]
            }
        ],
        "metadata": {"language_info": {"name": "python"}},
        "nbformat": 4,
        "nbformat_minor": 2
    }

    with open("ml/notebooks/02_training.ipynb", "w", encoding="utf-8") as f:
        json.dump(nb_train, f, indent=2)

    with open("ml/notebooks/03_evaluation.ipynb", "w", encoding="utf-8") as f:
        json.dump(nb_eval, f, indent=2)

    print("Created ml/notebooks/02_training.ipynb and ml/notebooks/03_evaluation.ipynb successfully!")

if __name__ == '__main__':
    create_training_and_evaluation_notebooks()
