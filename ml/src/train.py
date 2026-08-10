import os
import json
import time
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
from dataset import SCINDataset, get_transforms
from model import build_model

def train_experiment(exp_id='EXP-01', arch_name='efficientnet_b0', use_class_weights=False, num_epochs=8, batch_size=32, lr=1e-4):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"--- Starting Training Experiment {exp_id} ({arch_name}) on Device: {device} ---")

    # Load split metadata
    train_df = pd.read_csv('ml/data/splits/train_cases.csv')
    val_df = pd.read_csv('ml/data/splits/val_cases.csv')

    # Define Class Index Mapping
    target_classes = [
        'Eczema',
        'Allergic Contact Dermatitis',
        'Urticaria',
        'Insect Bite',
        'Folliculitis',
        'Psoriasis',
        'Tinea',
        'Impetigo',
        'Herpes Zoster',
        'Pigmented purpuric eruption',
        'Acne',
        'Drug Rash',
        'Other / Rare Condition'
    ]
    class_to_idx = {c: i for i, c in enumerate(target_classes)}

    train_transform, val_transform = get_transforms(img_size=224)

    train_dataset = SCINDataset(train_df, class_to_idx, transform=train_transform)
    val_dataset = SCINDataset(val_df, class_to_idx, transform=val_transform)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

    # Class Weighting Calculation if requested
    if use_class_weights:
        class_counts = [0] * len(target_classes)
        for _, _, target_idx, _ in train_dataset.samples:
            class_counts[target_idx] += 1
        total_samples = sum(class_counts)
        weights = [total_samples / (len(target_classes) * max(c, 1)) for c in class_counts]
        class_weights_tensor = torch.tensor(weights, dtype=torch.float).to(device)
        criterion = nn.CrossEntropyLoss(weight=class_weights_tensor)
        print(f"Using Inverse Class Frequency Weighting: {weights}")
    else:
        criterion = nn.CrossEntropyLoss()
        print("Using Unweighted Cross-Entropy Loss.")

    model = build_model(arch_name=arch_name, num_classes=len(target_classes), pretrained=True).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-2)

    best_val_f1 = 0.0
    best_model_path = f"ml/models/{exp_id}_best.pth"
    os.makedirs("ml/models", exist_ok=True)

    history = []

    for epoch in range(1, num_epochs + 1):
        # --- Training Phase ---
        model.train()
        running_loss = 0.0
        train_preds, train_targets = [], []
        start_time = time.time()

        for imgs, targets in train_loader:
            imgs, targets = imgs.to(device), targets.to(device)
            optimizer.zero_grad()
            outputs = model(imgs)
            loss = criterion(outputs, targets)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * imgs.size(0)
            preds = torch.argmax(outputs, dim=1)
            train_preds.extend(preds.cpu().numpy())
            train_targets.extend(targets.cpu().numpy())

        train_loss = running_loss / len(train_dataset)
        train_acc = accuracy_score(train_targets, train_preds)

        # --- Validation Phase ---
        model.eval()
        val_running_loss = 0.0
        val_preds, val_targets = [], []

        with torch.no_grad():
            for imgs, targets in val_loader:
                imgs, targets = imgs.to(device), targets.to(device)
                outputs = model(imgs)
                loss = criterion(outputs, targets)

                val_running_loss += loss.item() * imgs.size(0)
                preds = torch.argmax(outputs, dim=1)
                val_preds.extend(preds.cpu().numpy())
                val_targets.extend(targets.cpu().numpy())

        val_loss = val_running_loss / len(val_dataset)
        val_acc = accuracy_score(val_targets, val_preds)
        val_prec, val_rec, val_f1, _ = precision_recall_fscore_support(val_targets, val_preds, average='macro', zero_division=0)
        _, _, val_weighted_f1, _ = precision_recall_fscore_support(val_targets, val_preds, average='weighted', zero_division=0)

        elapsed = time.time() - start_time
        print(f"Epoch [{epoch}/{num_epochs}] ({elapsed:.1f}s) | Train Loss: {train_loss:.4f} Acc: {train_acc*100:.2f}% | Val Loss: {val_loss:.4f} Acc: {val_acc*100:.2f}% Macro-F1: {val_f1*100:.2f}% Weighted-F1: {val_weighted_f1*100:.2f}%")

        history.append({
            'epoch': epoch,
            'train_loss': round(train_loss, 4),
            'train_acc': round(train_acc * 100, 2),
            'val_loss': round(val_loss, 4),
            'val_acc': round(val_acc * 100, 2),
            'val_macro_f1': round(val_f1 * 100, 2),
            'val_weighted_f1': round(val_weighted_f1 * 100, 2)
        })

        if val_f1 > best_val_f1:
            best_val_f1 = val_f1
            torch.save({
                'model_state_dict': model.state_dict(),
                'arch_name': arch_name,
                'target_classes': target_classes,
                'class_to_idx': class_to_idx,
                'exp_id': exp_id,
                'val_f1': val_f1,
                'val_acc': val_acc
            }, best_model_path)
            print(f"  --> Saved new best checkpoint to {best_model_path}")

    # Save training history JSON
    history_file = f"ml/experiments/{exp_id}_history.json"
    os.makedirs("ml/experiments", exist_ok=True)
    with open(history_file, "w") as f:
        json.dump(history, f, indent=2)

    return history, best_model_path

if __name__ == '__main__':
    train_experiment()
