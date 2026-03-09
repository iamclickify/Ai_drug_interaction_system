import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'effectiveness.joblib')

def train_effectiveness_model(X_train, y_train):
    """
    Trains the effectiveness model.
    Args:
        X_train (np.ndarray): 2D array of molecular descriptors.
        y_train (np.ndarray): 1D array of effectiveness scores (0 to 1).
    """
    if len(X_train) == 0 or len(y_train) == 0:
        raise ValueError("Training data cannot be empty.")
        
    print("Training Effectiveness Prediction model...")
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    joblib.dump(model, MODEL_PATH)
    print("Effectiveness training complete.")
    
def predict_effectiveness(features):
    """
    Predicts the effectiveness score for a given set of descriptors.
    Args:
        features (np.ndarray): 1D array of molecular descriptors.
    Returns:
        float: Predicted effectiveness score strictly between 0 and 1.
    """
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError("Model is not trained yet. Call train_effectiveness_model() first.")
        
    model = joblib.load(MODEL_PATH)
    
    # Ensure 2D array for prediction
    if features.ndim == 1:
        features = features.reshape(1, -1)
        
    predictions = model.predict(features)
    
    # Clamp output to ensure score is strictly between 0 and 1
    score = np.clip(predictions[0], 0.0, 1.0)
    return float(score)
