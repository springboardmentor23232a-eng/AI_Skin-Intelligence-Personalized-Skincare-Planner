# Machine Learning Experiment Log

This log tracks all deep learning model training experiments performed on the **Skin Condition Image Network (SCIN)** dataset.

## Experiment Tracker

| Exp ID | Model Architecture | Learning Rate | Batch Size | Epochs | Data Augmentation | Loss Function | Class Weighting | Validation Accuracy | Validation Macro F1 | Validation Loss | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **EXP-01** | EfficientNet-B0 | 1e-4 | 32 | 10 | Standard (Flips, Rotation, Jitter) | Cross-Entropy | None (Unweighted) | Pending | Pending | Pending | Baseline transfer learning model |
| **EXP-02** | EfficientNet-B0 | 1e-4 | 32 | 10 | Standard (Flips, Rotation, Jitter) | Weighted Cross-Entropy | Inverse Class Frequencies | Pending | Pending | Pending | Class imbalance mitigation via inverse weighting |
| **EXP-03** | ResNet34 | 1e-4 | 32 | 10 | Standard (Flips, Rotation, Jitter) | Weighted Cross-Entropy | Inverse Class Frequencies | Pending | Pending | Pending | Architecture comparison (ResNet34 backbone) |

---

## Detailed Experiment Logs

### EXP-01: Baseline EfficientNet-B0 (Unweighted Cross-Entropy)
- **Objective**: Establish baseline performance using pre-trained ImageNet weights on SCIN 13-class dataset.
- **Model**: `torchvision.models.efficientnet_b0`
- **Optimizer**: AdamW (`lr=1e-4`, `weight_decay=1e-2`)
- **Loss**: `nn.CrossEntropyLoss()`

### EXP-02: EfficientNet-B0 (Weighted Cross-Entropy)
- **Objective**: Improve minority class recall (e.g. Acne, Drug Rash, Impetigo) using inverse class frequency loss weighting.
- **Model**: `torchvision.models.efficientnet_b0`
- **Optimizer**: AdamW (`lr=1e-4`, `weight_decay=1e-2`)
- **Loss**: `nn.CrossEntropyLoss(weight=class_weights)`

### EXP-03: ResNet34 Comparison (Weighted Cross-Entropy)
- **Objective**: Evaluate residual architecture performance vs EfficientNet backbone.
- **Model**: `torchvision.models.resnet34`
- **Optimizer**: AdamW (`lr=1e-4`, `weight_decay=1e-2`)
- **Loss**: `nn.CrossEntropyLoss(weight=class_weights)`
