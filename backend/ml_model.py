import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib
import os
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Drug, Interaction

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'interaction_model.joblib')
ENCODER_PATH = os.path.join(os.path.dirname(__file__), 'category_encoder.joblib')

def train_model():
    db = SessionLocal()
    drugs = db.query(Drug).all()
    interactions = db.query(Interaction).all()
    
    if not interactions:
        print("No interactions found to train on.")
        return

    # Create feature mapping
    drug_map = {d.drug_name: d for d in drugs}
    
    data = []
    for inter in interactions:
        d_a = drug_map.get(inter.drug_a)
        d_b = drug_map.get(inter.drug_b)
        if d_a and d_b:
            # Features: cost, eco_toxicity, biodegradability, persistence for both
            features = [
                d_a.eco_toxicity, d_a.biodegradability, d_a.persistence, d_a.cost,
                d_b.eco_toxicity, d_b.biodegradability, d_b.persistence, d_b.cost
            ]
            data.append(features + [inter.severity_score])
    
    # Synthesize some low-risk interactions for variety
    for _ in range(20):
        d1, d2 = np.random.choice(drugs, 2, replace=False)
        if not any((i.drug_a == d1.drug_name and i.drug_b == d2.drug_name) or (i.drug_a == d2.drug_name and i.drug_b == d1.drug_name) for i in interactions):
            features = [
                d1.eco_toxicity, d1.biodegradability, d1.persistence, d1.cost,
                d2.eco_toxicity, d2.biodegradability, d2.persistence, d2.cost
            ]
            data.append(features + [np.random.uniform(0, 15)]) # Low score

    df = pd.DataFrame(data)
    X = df.iloc[:, :-1]
    y = df.iloc[:, -1]
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    joblib.dump(model, MODEL_PATH)
    print(f"Model trained and saved to {MODEL_PATH}")
    db.close()

def predict_interaction(drug_a_obj, drug_b_obj):
    if not os.path.exists(MODEL_PATH):
        train_model()
        
    model = joblib.load(MODEL_PATH)
    features = np.array([[
        drug_a_obj.eco_toxicity, drug_a_obj.biodegradability, drug_a_obj.persistence, drug_a_obj.cost,
        drug_b_obj.eco_toxicity, drug_b_obj.biodegradability, drug_b_obj.persistence, drug_b_obj.cost
    ]])
    
    score = model.predict(features)[0]
    score = max(0, min(100, score)) # Clamp
    
    if score < 30: label = "Low"
    elif score < 70: label = "Moderate"
    else: label = "High"
    
    return float(score), label

if __name__ == "__main__":
    train_model()
