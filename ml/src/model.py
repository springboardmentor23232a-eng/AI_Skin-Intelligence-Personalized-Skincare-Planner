import torch
import torch.nn as nn
from torchvision import models

def build_model(arch_name='efficientnet_b0', num_classes=13, pretrained=True):
    weights = 'DEFAULT' if pretrained else None

    if arch_name == 'efficientnet_b0':
        model = models.efficientnet_b0(weights=weights)
        in_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(in_features, num_classes)
    elif arch_name == 'resnet34':
        model = models.resnet34(weights=weights)
        in_features = model.fc.in_features
        model.fc = nn.Linear(in_features, num_classes)
    else:
        raise ValueError(f"Unsupported architecture: {arch_name}")

    return model
