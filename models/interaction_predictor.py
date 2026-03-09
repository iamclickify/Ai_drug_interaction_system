import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib
import os
import sys

# Ensure feature extraction can be imported if needed inside models
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from descriptor_extractor import get_molecular_features

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'interaction.joblib')

from rdkit import Chem
from rdkit.Chem import AllChem

def get_interaction_features(smiles):
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        return None
    fp = AllChem.GetMorganFingerprintAsBitVect(mol, 2, nBits=512)
    return np.array(fp, dtype=float)

def train_interaction_model(X_train, y_train):
    """
    Trains the interaction model using combined features.
    Args:
        X_train (np.ndarray): 2D array of combined features for two drugs
                              (1024 features total: 512 from drugA + 512 from drugB)
        y_train (np.ndarray): 1D array of integer interaction risks (0=Low, 1=Moderate, 2=High).
    """
    if len(X_train) == 0 or len(y_train) == 0:
        raise ValueError("Training data cannot be empty.")
        
    print("Training Drug Interaction Prediction model...")
    # Use higher estimators and pure nodes to ensure memorization of clinical rules
    model = RandomForestClassifier(n_estimators=200, max_depth=None, random_state=42)
    model.fit(X_train, y_train)
    joblib.dump(model, MODEL_PATH)

    # Evaluate metric
    y_pred = model.predict(X_train)
    from sklearn.metrics import accuracy_score
    print(f"Interaction Model Training Accuracy (Memorization): {accuracy_score(y_train, y_pred)*100:.1f}%")
    print("Interaction training complete.")
    
def predict_interaction(smilesA, smilesB):
    """
    Predicts the drug interaction risk given two SMILES.
    """
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError("Model is not trained yet. Call train_interaction_model() first.")
        
    features_a = get_interaction_features(smilesA)
    features_b = get_interaction_features(smilesB)
    
    if features_a is None or features_b is None:
        raise ValueError("Invalid SMILES input resulting in feature extraction failure.")
        
    # Combine features
    combined = np.concatenate((features_a, features_b)).reshape(1, -1)
    
    model = joblib.load(MODEL_PATH)
    pred_idx = model.predict(combined)[0]
    
    class_map = {0: "Low", 1: "Moderate", 2: "High"}
    return class_map[pred_idx]
