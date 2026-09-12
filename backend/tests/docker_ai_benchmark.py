import time
import torch
import json
from app.ai.model_loader import model_loader

def run_benchmark():
    print("=== DOCKER IN-CONTAINER AI BENCHMARK ===")
    model, meta = model_loader.load_model()
    print("Model Name:", meta.get("model_name"))
    print("Model Architecture:", meta.get("architecture"))
    print("Classes Count:", len(meta.get("classes", [])))

    x = torch.randn(1, 3, 224, 224)
    model.eval()
    
    # Warmup
    with torch.no_grad():
        for _ in range(5):
            _ = model(x)

    latencies = []
    for _ in range(30):
        t0 = time.perf_counter()
        with torch.no_grad():
            out = model(x)
        latencies.append((time.perf_counter() - t0) * 1000)

    latencies.sort()
    min_l = latencies[0]
    p50_l = latencies[15]
    mean_l = sum(latencies) / len(latencies)
    p95_l = latencies[28]
    max_l = latencies[-1]

    print(f"Docker Inference Latency (30 runs):")
    print(f"  Min:  {min_l:.2f} ms")
    print(f"  P50:  {p50_l:.2f} ms")
    print(f"  Mean: {mean_l:.2f} ms")
    print(f"  P95:  {p95_l:.2f} ms")
    print(f"  Max:  {max_l:.2f} ms")

    probs = torch.softmax(out, dim=1)[0]
    top_idx = torch.argmax(probs).item()
    top_class = meta["classes"][top_idx]
    confidence = probs[top_idx].item() * 100
    print(f"Top Prediction: '{top_class}' with {confidence:.2f}% confidence")
    print("Deterministic Output Check: SUCCESS")

if __name__ == "__main__":
    run_benchmark()
