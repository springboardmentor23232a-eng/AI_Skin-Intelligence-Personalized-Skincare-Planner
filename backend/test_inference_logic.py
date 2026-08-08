import os
from app.services.assessment_service import run_skin_inference, calculate_skin_health_score, generate_rule_based_risks, identify_prioritized_concerns

# Find a test image file
dataset_path = r"c:\Users\LAXMI PRANEETHA\OneDrive\Desktop\AI-Skin\ml\skin_type_classification_dataset"
test_dir = os.path.join(dataset_path, "test")

# Get first file in test_dir
test_files = []
for root, _, filenames in os.walk(test_dir):
    for f in filenames:
        if f.lower().endswith(('.png', '.jpg', '.jpeg')):
            test_files.append(os.path.join(root, f))
            break
    if test_files:
        break

if not test_files:
    print("No test images found!")
else:
    test_img = test_files[0]
    print(f"Testing image: {test_img}")
    with open(test_img, "rb") as f:
        img_bytes = f.read()
        
    print("\nRunning skin inference...")
    severities = run_skin_inference(img_bytes)
    
    print("\nCalculating score...")
    score = calculate_skin_health_score(severities)
    
    print("\nIdentifying concerns...")
    concerns = identify_prioritized_concerns(severities)
    print("Concerns count:", len(concerns))
    
    print("\nGenerating risks...")
    risks = generate_rule_based_risks(severities)
    print("Risks triggered:", risks)
