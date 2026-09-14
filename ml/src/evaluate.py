import os
import json
import numpy as np
import pandas as pd
import torch
from torch.utils.data import DataLoader
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
from dataset import SCINDataset, get_transforms
from model import build_model

def evaluate_best_model(model_checkpoint_path='ml/models/EXP-02_best.pth'):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"=========================================================================")
    print(f"EVALUATING MODEL STRICTLY ON UNTOUCHED HELD-OUT TEST SET")
    print(f"Checkpoint: {model_checkpoint_path} | Device: {device}")
    print(f"=========================================================================")

    if not os.path.exists(model_checkpoint_path):
        raise FileNotFoundError(f"Checkpoint file not found: {model_checkpoint_path}")

    checkpoint = torch.load(model_checkpoint_path, map_location=device)
    arch_name = checkpoint.get('arch_name', 'efficientnet_b0')
    target_classes = checkpoint.get('target_classes')
    class_to_idx = checkpoint.get('class_to_idx')

    # Load Test Split
    test_df = pd.read_csv('ml/data/splits/test_cases.csv')
    _, val_transform = get_transforms(img_size=224)
    test_dataset = SCINDataset(test_df, class_to_idx, transform=val_transform)
    test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False, num_workers=0)

    model = build_model(arch_name=arch_name, num_classes=len(target_classes), pretrained=False).to(device)
    model.load_state_dict(checkpoint['model_state_dict'])
    model.eval()

    test_preds, test_targets, test_confs = [], [], []

    with torch.no_grad():
        for imgs, targets in test_loader:
            imgs, targets = imgs.to(device), targets.to(device)
            outputs = model(imgs)
            probs = torch.softmax(outputs, dim=1)
            confs, preds = torch.max(probs, dim=1)

            test_preds.extend(preds.cpu().numpy())
            test_targets.extend(targets.cpu().numpy())
            test_confs.extend(confs.cpu().numpy())

    # Overall Metrics
    test_acc = accuracy_score(test_targets, test_preds)
    macro_prec, macro_rec, macro_f1, _ = precision_recall_fscore_support(test_targets, test_preds, average='macro', zero_division=0)
    weighted_prec, weighted_rec, weighted_f1, _ = precision_recall_fscore_support(test_targets, test_preds, average='weighted', zero_division=0)
    avg_conf = np.mean(test_confs)

    # Per-Class Metrics
    per_class_prec, per_class_rec, per_class_f1, per_class_supp = precision_recall_fscore_support(
        test_targets, test_preds, average=None, zero_division=0
    )

    per_class_df = pd.DataFrame({
        'Class Name': target_classes,
        'Precision': [round(p * 100, 2) for p in per_class_prec],
        'Recall': [round(r * 100, 2) for r in per_class_rec],
        'F1-Score': [round(f * 100, 2) for f in per_class_f1],
        'Support (Test Images)': per_class_supp
    })

    conf_mat = confusion_matrix(test_targets, test_preds, labels=list(range(len(target_classes))))

    print("\n--- OVERALL TEST SET PERFORMANCE ---")
    print(f"Test Accuracy: {test_acc*100:.2f}%")
    print(f"Macro Precision: {macro_prec*100:.2f}%")
    print(f"Macro Recall: {macro_rec*100:.2f}%")
    print(f"Macro F1-Score: {macro_f1*100:.2f}%")
    print(f"Weighted F1-Score: {weighted_f1*100:.2f}%")
    print(f"Average Model Confidence: {avg_conf*100:.2f}%")

    print("\n--- PER-CLASS PERFORMANCE TABLE ---")
    print(per_class_df.to_string(index=False))

    print("\n--- CONFUSION MATRIX ---")
    print(conf_mat)

    # Export Production Model Weights & Metadata
    os.makedirs('ml/models', exist_ok=True)
    prod_model_path = 'ml/models/skin_condition_model.pth'
    torch.save(checkpoint, prod_model_path)

    metadata = {
        "model_name": f"SCIN_{arch_name.upper()}_Classifier",
        "model_version": "1.0.0",
        "architecture": arch_name,
        "dataset": "SCIN (Skin Condition Image Network)",
        "dataset_version": "2024_Official_Release",
        "num_classes": len(target_classes),
        "classes": target_classes,
        "class_to_idx": class_to_idx,
        "metrics": {
            "test_accuracy": round(test_acc * 100, 2),
            "macro_precision": round(macro_prec * 100, 2),
            "macro_recall": round(macro_rec * 100, 2),
            "macro_f1": round(macro_f1 * 100, 2),
            "weighted_f1": round(weighted_f1 * 100, 2),
            "average_confidence": round(avg_conf * 100, 2)
        },
        "per_class_metrics": per_class_df.to_dict(orient='records'),
        "confusion_matrix": conf_mat.tolist(),
        "input_resolution": "224x224",
        "normalization": {
            "mean": [0.485, 0.456, 0.406],
            "std": [0.229, 0.224, 0.225]
        }
    }

    with open('ml/models/model_metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)

    print(f"\nSaved production model to {prod_model_path}")
    print("Saved metadata to ml/models/model_metadata.json")

    return metadata, per_class_df, conf_mat

if __name__ == '__main__':
    evaluate_best_model()
