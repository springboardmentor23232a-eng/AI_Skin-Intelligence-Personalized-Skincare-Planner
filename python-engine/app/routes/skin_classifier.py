"""
Skin Type Classification Routes
Provides endpoints for predicting skin type from images using TensorFlow model
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Dict
import os
import tempfile
import uuid

from app.engine.skin_classifier import get_classifier

router = APIRouter()

@router.post("/predict-skin-type")
async def predict_skin_type(file: UploadFile = File(...)) -> Dict:
    """
    Predict skin type from an uploaded image file
    
    Args:
        file: Image file (jpg, png, jpeg)
        
    Returns:
        Dictionary with predicted skin type and confidence score
    """
    # Validate file type
    allowed_extensions = {'.jpg', '.jpeg', '.png'}
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}"
        )
    
    # Check if classifier is available
    classifier = get_classifier()
    if classifier.model is None:
        raise HTTPException(
            status_code=503,
            detail="Skin classifier model is not available. Please check the model file and TensorFlow compatibility."
        )
    
    # Create temporary file
    temp_file_path = None
    try:
        # Generate unique temporary filename
        temp_filename = f"{uuid.uuid4()}{file_ext}"
        temp_file_path = os.path.join(tempfile.gettempdir(), temp_filename)
        
        # Save uploaded file to temporary location
        with open(temp_file_path, "wb") as temp_file:
            content = await file.read()
            temp_file.write(content)
        
        # Make prediction
        predicted_class, confidence = classifier.predict_skin_type(temp_file_path)
        
        return {
            "success": True,
            "skin_type": predicted_class,
            "confidence": confidence,
            "message": f"Predicted skin type: {predicted_class} with {confidence:.2f}% confidence"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing image: {str(e)}"
        )
    finally:
        # Clean up temporary file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception as e:
                print(f"Error removing temporary file: {e}")

@router.get("/classifier-info")
async def get_classifier_info() -> Dict:
    """
    Get information about the skin classifier
    
    Returns:
        Dictionary with classifier information
    """
    try:
        classifier = get_classifier()
        return {
            "success": True,
            "model_loaded": classifier.model is not None,
            "model_path": classifier.model_path,
            "supported_classes": ['combination', 'dry', 'normal'],
            "input_size": [224, 224]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting classifier info: {str(e)}"
        )