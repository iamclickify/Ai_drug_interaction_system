import os
import sys
import numpy as np

# Add models directory to path so we can import them
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../models')))

from effectiveness_model import train_effectiveness_model, predict_effectiveness
from toxicity_model import train_toxicity_model, predict_toxicity
from interaction_predictor import train_interaction_model, predict_interaction
from similarity_engine import calculate_similarity

def init_models():
    """
    Initializes the models with authentic Tox21 and computed data if they do not exist.
    """
    import train_authentic_models
    train_authentic_models.download_and_train()

# Ensure models are built on boot if they don't exist
try:
    predict_effectiveness(np.random.rand(6))
except RuntimeError:
    init_models()

def process_single_prediction(features):
    """
    Calculates effectiveness, toxicity, and the derived Sustainability Score.
    """
    eff_score = predict_effectiveness(features)
    tox_class, tox_prob = predict_toxicity(features)
    
    # Sustainability Score formula requirement:
    # 0.6 * effectiveness_score + 0.4 * (1 - toxicity_probability)
    sust_score = (0.6 * eff_score) + (0.4 * (1.0 - tox_prob))
    
    return {
        "effectiveness": eff_score,
        "toxicity_risk": tox_class,
        "toxicity_probability": tox_prob,
        "sustainability": sust_score
    }

def process_interaction(smilesA, smilesB):
    """
    Calculates interaction risk, combined toxicity estimate, and a medical recommendation.
    """
    risk_label = predict_interaction(smilesA, smilesB)
    
    # We still need toxicity features for the combined estimate,
    # pulling them internally here for separation of concerns
    import descriptor_extractor
    feat_a = descriptor_extractor.get_molecular_features(smilesA)
    feat_b = descriptor_extractor.get_molecular_features(smilesB)
    
    _, tox_prob_a = predict_toxicity(feat_a)
    _, tox_prob_b = predict_toxicity(feat_b)
    
    combined_tox = min(1.0, tox_prob_a + tox_prob_b + (0.2 if risk_label == "High" else 0.0))
    
    recommendations = {
        "Low": "Safe",
        "Moderate": "Caution",
        "High": "Avoid"
    }
    
    return {
        "interaction_risk": risk_label,
        "combined_toxicity": combined_tox,
        "recommendation": recommendations[risk_label]
    }
