import json
import os

def create_notebook():
    os.makedirs("ml/notebooks", exist_ok=True)

    nb = {
        "cells": [
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "# Phase 2 — SCIN Dataset Exploration Notebook\n",
                    "\n",
                    "This notebook performs an exhaustive dataset quality inspection and exploratory data analysis (EDA) of the **Skin Condition Image Network (SCIN)** dataset published by Google Health and Stanford Medicine.\n",
                    "\n",
                    "## Objectives\n",
                    "- Inspect total image count, case count, and unique contributor/case identifiers.\n",
                    "- Analyze ground-truth dermatologist condition labels (`scin_cases.csv` and `scin_labels.csv`).\n",
                    "- Evaluate missing labels, corrupted image checks, and resolution statistics.\n",
                    "- Map dataset labels against application skin metrics (`Acne`, `Redness`, `Dryness`, `Oiliness`, `Sensitivity`, `Hyperpigmentation`).\n",
                    "- Inspect demographic, Monk Skin Tone (eMST), and Fitzpatrick Skin Type (eFST) distributions.\n",
                    "- Formulate group-aware splitting to prevent train/test data leakage."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "import os\n",
                    "import ast\n",
                    "import pandas as pd\n",
                    "import numpy as np\n",
                    "import matplotlib.pyplot as plt\n",
                    "import seaborn as sns\n",
                    "from PIL import Image\n",
                    "\n",
                    "# Load SCIN Metadata\n",
                    "cases_path = '../data/scin_cases.csv'\n",
                    "labels_path = '../data/scin_labels.csv'\n",
                    "\n",
                    "cases = pd.read_csv(cases_path)\n",
                    "labels = pd.read_csv(labels_path)\n",
                    "df = pd.merge(cases, labels, on='case_id', how='left')\n",
                    "\n",
                    "print(f\"Total Cases: {len(df)}\")\n",
                    "print(f\"Cases Columns: {cases.shape[1]}\")\n",
                    "print(f\"Labels Columns: {labels.shape[1]}\")"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 1. Class Distribution Analysis & Missing Data Inspection"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Extract primary condition with highest dermatologist consensus weight\n",
                    "def get_primary_condition(val):\n",
                    "    if pd.isna(val) or val == '{}' or val == '[]' or str(val).strip() == '':\n",
                    "        return None\n",
                    "    try:\n",
                    "        d = ast.literal_eval(val)\n",
                    "        if not d:\n",
                    "            return None\n",
                    "        return max(d.items(), key=lambda x: x[1])[0]\n",
                    "    except Exception:\n",
                    "        return None\n",
                    "\n",
                    "df['primary_condition'] = df['weighted_skin_condition_label'].apply(get_primary_condition)\n",
                    "\n",
                    "missing_count = df['primary_condition'].isna().sum()\n",
                    "valid_df = df[df['primary_condition'].notna()]\n",
                    "\n",
                    "print(f\"Cases with missing/ungradable dermatologist labels: {missing_count} ({missing_count/len(df)*100:.2f}%)\")\n",
                    "print(f\"Cases with valid consensus dermatologist labels: {len(valid_df)}\")\n",
                    "print(f\"Unique primary condition classes: {valid_df['primary_condition'].nunique()}\")\n",
                    "\n",
                    "# Top 20 Primary Condition Distribution\n",
                    "top20 = valid_df['primary_condition'].value_counts().head(20)\n",
                    "plt.figure(figsize=(12, 6))\n",
                    "sns.barplot(x=top20.values, y=top20.index, palette='crest')\n",
                    "plt.title('Top 20 SCIN Dermatologist Consensus Conditions')\n",
                    "plt.xlabel('Number of Cases')\n",
                    "plt.ylabel('Condition')\n",
                    "plt.tight_layout()\n",
                    "plt.show()"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 2. Monk Skin Tone & Fitzpatrick Skin Type Representation"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "fig, axes = plt.subplots(1, 2, figsize=(14, 5))\n",
                    "\n",
                    "mst_counts = df['monk_skin_tone_label_us'].value_counts().sort_index()\n",
                    "sns.barplot(x=mst_counts.index.astype(str), y=mst_counts.values, ax=axes[0], palette='magma')\n",
                    "axes[0].set_title('Monk Skin Tone Distribution (eMST 1 to 10)')\n",
                    "axes[0].set_xlabel('Monk Skin Tone Scale')\n",
                    "axes[0].set_ylabel('Cases')\n",
                    "\n",
                    "fst_counts = df['fitzpatrick_skin_type'].value_counts(dropna=True)\n",
                    "sns.barplot(x=fst_counts.index, y=fst_counts.values, ax=axes[1], palette='viridis')\n",
                    "axes[1].set_title('Fitzpatrick Skin Type Distribution (FST1 - FST6)')\n",
                    "axes[1].set_xlabel('Fitzpatrick Scale')\n",
                    "axes[1].set_ylabel('Cases')\n",
                    "\n",
                    "plt.tight_layout()\n",
                    "plt.show()"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 3. Data Leakage Prevention Strategy\n",
                    "\n",
                    "Each entry in SCIN has a unique `case_id`. Each case contains between 1 and 3 image files. Images originating from the same `case_id` will be grouped together so that no patient/case images cross between training, validation, and testing splits."
                ]
            }
        ],
        "metadata": {
            "language_info": {
                "name": "python"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 2
    }

    with open("ml/notebooks/01_dataset_exploration.ipynb", "w", encoding="utf-8") as f:
        json.dump(nb, f, indent=2)

    print("Created ml/notebooks/01_dataset_exploration.ipynb successfully!")

if __name__ == '__main__':
    create_notebook()
