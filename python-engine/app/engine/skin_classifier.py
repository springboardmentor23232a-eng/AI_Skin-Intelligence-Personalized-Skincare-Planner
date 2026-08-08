"""
Skin Type Classifier Module
Uses TensorFlow model to predict skin type from images
"""
import tensorflow as tf
import numpy as np
import os
from typing import Tuple

# Class names for skin type classification (updated to match model output)
CLASS_NAMES = ['combination', 'dry', 'normal']

class SkinClassifier:
    def __init__(self, model_path: str = None):
        """
        Initialize the skin classifier with the TensorFlow model
        
        Args:
            model_path: Path to the .keras model file
        """
        if model_path is None:
            # Default path relative to this file
            model_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                'my_skin_type_classifier_model.keras'
            )
        
        self.model_path = model_path
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load the TensorFlow model"""
        try:
            if os.path.exists(self.model_path):
                self.model = tf.keras.models.load_model(self.model_path)
                print(f"Skin classifier model loaded successfully from {self.model_path}")
            else:
                raise FileNotFoundError(f"Model file not found at {self.model_path}")
        except Exception as e:
            print(f"Error loading skin classifier model: {e}")
            self.model = None  # Set to None so we can check later
    
    def predict_skin_type(self, img_path: str) -> Tuple[str, float]:
        """
        Predict skin type from an image
        
        Args:
            img_path: Path to the image file
            
        Returns:
            Tuple of (predicted_class, confidence_score)
        """
        if self.model is None:
            raise RuntimeError("Model not loaded")
        
        try:
            # Preprocess image to match model input (224x224)
            img = tf.keras.utils.load_img(img_path, target_size=(224, 224))
            img_array = tf.keras.utils.img_to_array(img)
            img_array = tf.expand_dims(img_array, 0)  # Create a batch
            
            # Make prediction
            predictions = self.model.predict(img_array, verbose=0)
            score = tf.nn.softmax(predictions[0])
            
            # Get the predicted class and confidence
            predicted_class = CLASS_NAMES[np.argmax(score)]
            confidence = 100 * np.max(score)
            
            return predicted_class, float(confidence)
            
        except Exception as e:
            print(f"Error predicting skin type: {e}")
            raise
    
    def predict_skin_type_from_array(self, img_array: np.ndarray) -> Tuple[str, float]:
        """
        Predict skin type from a numpy array (already loaded image)
        
        Args:
            img_array: Image as numpy array
            
        Returns:
            Tuple of (predicted_class, confidence_score)
        """
        if self.model is None:
            raise RuntimeError("Model not loaded")
        
        try:
            # Resize if needed and create batch
            if len(img_array.shape) == 3:
                img_array = tf.image.resize(img_array, [224, 224])
                img_array = tf.expand_dims(img_array, 0)
            elif len(img_array.shape) == 4:
                img_array = tf.image.resize(img_array, [224, 224])
            
            # Make prediction
            predictions = self.model.predict(img_array, verbose=0)
            score = tf.nn.softmax(predictions[0])
            
            # Get the predicted class and confidence
            predicted_class = CLASS_NAMES[np.argmax(score)]
            confidence = 100 * np.max(score)
            
            return predicted_class, float(confidence)
            
        except Exception as e:
            print(f"Error predicting skin type from array: {e}")
            raise

# Global classifier instance
_classifier_instance = None

def get_classifier() -> SkinClassifier:
    """Get or create the global classifier instance"""
    global _classifier_instance
    if _classifier_instance is None:
        _classifier_instance = SkinClassifier()
    return _classifier_instance