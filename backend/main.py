from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import uvicorn

from database import engine, get_db, Base
from models import Drug, Interaction
from ml_model import predict_interaction
from pydantic import BaseModel
import sys
import os

# Add local paths
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../models')))
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

from similarity_engine import calculate_similarity

# Initialize DB
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Drug Interaction & Sustainable Recommendation System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    drug_names: List[str]

@app.get("/drugs")
def get_all_drugs(db: Session = Depends(get_db)):
    return db.query(Drug).all()

@app.post("/analyze")
def analyze_drugs(request: AnalysisRequest, db: Session = Depends(get_db)):
    drug_names = request.drug_names
    if not drug_names:
        raise HTTPException(status_code=400, detail="Please select at least one drug.")

    selected_drugs = []
    for name in drug_names:
        drug = db.query(Drug).filter(Drug.drug_name == name).first()
        if not drug:
            raise HTTPException(status_code=404, detail=f"Drug '{name}' not found.")
        selected_drugs.append(drug)

    # 1. Interaction Analysis
    interactions = []
    total_severity = 0
    max_severity = 0
    
    for i in range(len(selected_drugs)):
        for j in range(i + 1, len(selected_drugs)):
            d_a = selected_drugs[i]
            d_b = selected_drugs[j]
            
            # Check if we have a known interaction in DB
            db_interaction = db.query(Interaction).filter(
                ((Interaction.drug_a == d_a.drug_name) & (Interaction.drug_b == d_b.drug_name)) |
                ((Interaction.drug_a == d_b.drug_name) & (Interaction.drug_b == d_a.drug_name))
            ).first()
            
            if db_interaction:
                score = db_interaction.severity_score
                label = db_interaction.label
                explanation = db_interaction.explanation
            else:
                score, label = predict_interaction(d_a, d_b)
                explanation = f"AI predicted a {label} risk based on molecular properties."

            interactions.append({
                "pair": [d_a.drug_name, d_b.drug_name],
                "score": score,
                "label": label,
                "explanation": explanation
            })
            total_severity += score
            max_severity = max(max_severity, score)

    # 2. Eco Score Calculation
    def calc_eco(d):
        return ((10 - d.eco_toxicity) + d.biodegradability + (10 - d.persistence)) / 30 * 100
    
    eco_scores = [calc_eco(d) for d in selected_drugs]
    avg_eco_score = sum(eco_scores) / len(eco_scores)

    # 3. Cost Estimation
    total_cost = sum(d.cost for d in selected_drugs)

    # 4. Recommendation System
    recommendations = []
    for d in selected_drugs:
        # Suggest better alternatives in same category
        alternatives = db.query(Drug).filter(
            Drug.category == d.category,
            Drug.drug_name != d.drug_name
        ).all()
        
        for alt in alternatives:
            alt_eco = calc_eco(alt)
            orig_eco = calc_eco(d)
            if alt_eco > orig_eco + 5: # Better by at least 5 points
                recommendations.append({
                    "original": d.drug_name,
                    "suggested": alt.drug_name,
                    "reason": f"Higher sustainability score ({alt_eco:.1f} vs {orig_eco:.1f}) and potentially lower toxicity.",
                    "eco_benefit": alt_eco - orig_eco,
                    "cost_diff": alt.cost - d.cost
                })

    return {
        "interactions": interactions,
        "overall_risk_score": max_severity,
        "overall_risk_label": "High" if max_severity > 70 else "Moderate" if max_severity > 30 else "Low",
        "eco_score": avg_eco_score,
        "total_cost": total_cost,
        "recommendations": recommendations[:5],
        "drug_details": [
            {
                "drug_name": d.drug_name,
                "category": d.category,
                "clinical_use": d.clinical_use,
                "iupac_name": d.iupac_name,
                "smiles": d.smiles,
                "half_life": d.half_life,
                "dosage_range": d.dosage_range,
                "cox_selectivity": d.cox_selectivity,
                "gi_toxicity_risk": d.gi_toxicity_risk,
                "cardio_risk": d.cardio_risk,
                "year_discovery": d.year_discovery,
                "molecular_weight": d.molecular_weight,
                "logp": d.logp,
                "hbd": d.hbd,
                "hba": d.hba,
                "tpsa": d.tpsa,
                "rotatable_bonds": d.rotatable_bonds,
                "descriptors": [d.molecular_weight, d.logp, d.hbd, d.hba, d.tpsa, d.rotatable_bonds]
            } for d in selected_drugs
        ]
    }

@app.post("/predict")
def predict_compat(request: dict, db: Session = Depends(get_db)):
    drug_name = request.get("drug_name")
    if not drug_name:
        raise HTTPException(status_code=400, detail="Missing drug_name")
    
    drug = db.query(Drug).filter(Drug.drug_name == drug_name).first()
    if not drug:
        raise HTTPException(status_code=404, detail="Drug not found")
    
    # Use analyze logic internally
    res = analyze_drugs(AnalysisRequest(drug_names=[drug_name]), db)
    details = res["drug_details"][0]
    return {
        **details,
        "toxicity_risk": res["overall_risk_label"],
        "effectiveness_score": 85,
        "sustainability_score": res["eco_score"]
    }

@app.post("/interaction")
def interaction_compat(request: dict, db: Session = Depends(get_db)):
    drug_a = request.get("drugA")
    drug_b = request.get("drugB")
    if not drug_a or not drug_b:
        raise HTTPException(status_code=400, detail="Missing drugA or drugB")
    
    res = analyze_drugs(AnalysisRequest(drug_names=[drug_a, drug_b]), db)
    inter = res["interactions"][0]
    return {
        "interaction_risk": inter["label"],
        "combined_toxicity_estimate": inter["score"] / 100,
        "recommendation": inter["explanation"]
    }

@app.post("/similarity")
def similarity_compat(request: dict, db: Session = Depends(get_db)):
    drug_a_name = request.get("drugA")
    drug_b_name = request.get("drugB")
    
    d_a = db.query(Drug).filter(Drug.drug_name == drug_a_name).first()
    d_b = db.query(Drug).filter(Drug.drug_name == drug_b_name).first()
    
    if not d_a or not d_b:
        raise HTTPException(status_code=404, detail="One or both drugs not found")
    
    sim = calculate_similarity(d_a.smiles, d_b.smiles)
    return {"similarity_score": sim if sim is not None else 0.5}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
