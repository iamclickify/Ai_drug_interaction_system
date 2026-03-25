import pandas as pd
import os
import difflib
from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base
from models import Drug, Interaction

# Category-based clinical knowledge with standardized courses
CAT_DETAILS = {
    "Analgesic": ("Helps reduce pain, fever, and swelling. Used for everyday aches.", "1-3g daily", "2-6 hours", "pain, headache, fever", 5, 12, 1.25),
    "Antibiotic": ("Fights bacterial infections. Not for viruses like the cold.", "250-500mg", "1-8 hours", "infection, bacteria", 7, 35, 4.50),
    "Antidiabetic": ("Helps manage blood sugar for people with diabetes.", "500-1000mg", "4-12 hours", "diabetes, sugar", 30, 25, 0.85),
    "Statin": ("Lowers bad cholesterol to keep your heart healthy.", "10-40mg", "14-20 hours", "cholesterol, heart", 30, 15, 0.45),
    "ACE Inhibitor": ("Relaxes blood vessels to lower high blood pressure.", "5-20mg", "12-24 hours", "hypertension, BP", 30, 18, 0.60),
    "PPI": ("Reduces stomach acid to treat heartburn and ulcers.", "20-40mg", "1-2 hours", "acid, heartburn", 14, 22, 0.95),
    "Antihistamine": ("Treats allergy symptoms like sneezing and itching.", "5-10mg", "8-24 hours", "allergy, itching", 30, 12, 0.40),
    "Antidepressant": ("Helps balance mood and treat anxiety or depression.", "20-100mg", "21-70 hours", "mood, anxiety", 30, 45, 1.20)
}

# Mapping: Category -> (Info, Dose, Half-Life, Symptoms, Default Course Days, Chemical Footprint mg/g, Price per Unit USD)
# Default for missing categories
DEFAULT_DETAIL = ("General pharmaceutical agent.", "Variable", "Unknown", "general", 7, 20.0, 1.0)

BRAND_MAP = {
    "Ibuprofen": "Advil", "Aspirin": "Bayer", "Paracetamol": "Tylenol", "Amoxicillin": "Amoxil",
    "Metformin": "Glucophage", "Atorvastatin": "Lipitor", "Lisinopril": "Zestril", "Amlodipine": "Norvasc",
    "Omeprazole": "Prilosec", "Naproxen": "Aleve", "Sertraline": "Zoloft", "Atorvastatin": "Lipitor",
    "Escitalopram": "Lexapro", "Amlodipine": "Norvasc", "Furosemide": "Lasix", "Albuterol": "Ventolin"
}

def get_best_category_match(cat_name):
    if not cat_name or pd.isna(cat_name):
        return "General", DEFAULT_DETAIL
    
    if cat_name in CAT_DETAILS:
        return cat_name, CAT_DETAILS[cat_name]
    
    matches = difflib.get_close_matches(cat_name, CAT_DETAILS.keys(), n=1, cutoff=0.6)
    if matches:
        return matches[0], CAT_DETAILS[matches[0]]
    
    return cat_name, DEFAULT_DETAIL

def seed_data():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    csv_path = os.path.join(os.path.dirname(__file__), '../datasets/drugs_sustainable.csv')
    df = pd.read_csv(csv_path)
    
    drug_objects = []
    for row in df.to_dict('records'):
        drug_name = row['drug_name']
        brand = BRAND_MAP.get(drug_name, drug_name)
        cat, details = get_best_category_match(row['category'])
        info, dose, life, symp, days, footprint, price = details
        
        drug = Drug(
            drug_name=drug_name,
            brand_name=brand,
            category=cat,
            eco_toxicity=row['eco_toxicity'],
            biodegradability=row['biodegradability'],
            persistence=row['persistence'],
            cost=row['cost'],
            clinical_use=info,
            symptoms=symp,
            dosage_range=dose,
            half_life=life,
            unit_price=price + (hash(drug_name) % 5 / 10.0), # Add slight variance
            default_course_days=days,
            chemical_footprint_index=footprint + (row['persistence'] * 2),
            # Other fields for consistency
            molecular_weight=200.0 + (row['eco_toxicity'] * 15),
            logp=1.5 + (row['persistence'] / 4),
            hbd=int(row['biodegradability'] / 2.5),
            hba=int(row['eco_toxicity'] * 1.2),
            tpsa=50.0 + (row['persistence'] * 4),
            rotatable_bonds=int(row['cost'] % 8),
            molar_refractivity=40.0 + (row['eco_toxicity'] * 8),
            iupac_name=f"{drug_name} Molecular Structure",
            smiles="C1=CC=CC=C1"
        )
        drug_objects.append(drug)
    
    db.bulk_save_objects(drug_objects)
    
    interactions = [
        Interaction(drug_a="Ibuprofen", drug_b="Warfarin", severity_score=95.0, label="High", explanation="Severe bleeding risk.", feasibility="Infeasible"),
        Interaction(drug_a="Ibuprofen", drug_b="Aspirin", severity_score=70.0, label="Moderate", explanation="Reduced antiplatelet efficacy.", feasibility="Caution")
    ]
    db.bulk_save_objects(interactions)
    
    db.commit()
    db.close()
    print("Database seeded with Quantitative Cost & Sustainability metrics.")

if __name__ == "__main__":
    seed_data()
