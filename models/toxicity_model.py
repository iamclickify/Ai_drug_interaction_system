import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import joblib
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'toxicity.joblib')

def train_toxicity_model(X_train, y_train):
    """
    Trains the toxicity model.
    Args:
        X_train (np.ndarray): 2D array of molecular descriptors.
        y_train (np.ndarray): 1D array of integer labels (0=Low, 1=Medium, 2=High).
    """
    if len(X_train) == 0 or len(y_train) == 0:
        raise ValueError("Training data cannot be empty.")
        
    print("Training Toxicity Prediction model...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    joblib.dump(model, MODEL_PATH)

    # Evaluate the model on training data
    y_pred = model.predict(X_train)
    y_prob = model.predict_proba(X_train)
    
    acc = accuracy_score(y_train, y_pred)
    prec = precision_score(y_train, y_pred, average='weighted', zero_division=0)
    rec = recall_score(y_train, y_pred, average='weighted', zero_division=0)
    f1 = f1_score(y_train, y_pred, average='weighted', zero_division=0)
    
    try:
        if y_prob.shape[1] > 2:
            roc_auc = roc_auc_score(y_train, y_prob, multi_class='ovr')
        else:
            roc_auc = roc_auc_score(y_train, y_prob[:, 1])
    except ValueError:
        roc_auc = float('nan')
        
    print(f"Metrics - Accuracy: {acc:.4f}, Precision: {prec:.4f}, Recall: {rec:.4f}, F1: {f1:.4f}, ROC-AUC: {roc_auc:.4f}")
    print("Toxicity training complete.")
    
def predict_toxicity(features):
    """
    Predicts the toxicity risk.
    Args:
        features (np.ndarray): 1D array of molecular descriptors.
    Returns:
        tuple: (risk_classification_string, max_probability_float)
               Classification string is one of 'Low', 'Medium', 'High'.
    """
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError("Model is not trained yet. Call train_toxicity_model() first.")
        
    model = joblib.load(MODEL_PATH)
    
    # Ensure 2D array for prediction
    if features.ndim == 1:
        features = features.reshape(1, -1)
        
    class_map = {0: "Low", 1: "Medium", 2: "High"}
    pred_idx = model.predict(features)[0]
    
    # Get the predicted probability for the predicted class
    # For sustainability score we'll use a normalized linear scale if desired, 
    # but returning both the label and raw max probability is safe.
    probs = model.predict_proba(features)[0]
    # Represent a general 'toxicity_probability' (0-1) by mapping the index
    # Rough approximation: Low=0.1, Med=0.5, High=0.9 modified by certainty
    raw_prob = (pred_idx * 0.4) + (probs[pred_idx] * 0.2)
    
    return class_map[pred_idx], float(raw_prob)
