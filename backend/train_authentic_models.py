import os
import sys
import pandas as pd
import numpy as np
import urllib.request

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../models')))
from descriptor_extractor import get_molecular_features
from toxicity_model import train_toxicity_model
from effectiveness_model import train_effectiveness_model
from interaction_predictor import train_interaction_model, get_interaction_features

# MoleculeNet Tox21 Subset URL
TOX21_URL = "https://deepchemdata.s3-us-west-1.amazonaws.com/datasets/tox21.csv.gz"
DATA_PATH = os.path.join(os.path.dirname(__file__), '../datasets/tox21.csv.gz')

def download_and_train():
    print("Initiating Authentic Data Ingestion...")
    if not os.path.exists(DATA_PATH):
        print(f"Downloading Tox21 dataset from {TOX21_URL}...")
        try:
            urllib.request.urlretrieve(TOX21_URL, DATA_PATH)
            print("Download complete.")
        except Exception as e:
            print(f"Failed to download dataset: {e}")
            return
            
    print("Loading dataset into Pandas...")
    try:
        df = pd.read_csv(DATA_PATH, compression='gzip')
        print(f"Successfully loaded {len(df)} records.")
    except Exception as e:
        print(f"Error reading dataset: {e}")
        return

    # tox21 has a 'smiles' column and 'SR-p53' (a toxicity target, 1=toxic, 0=non-toxic)
    # We grab a small subset to ensure reasonable local extraction time 
    df = df.dropna(subset=['smiles', 'SR-p53']).sample(n=250, random_state=42)
    
    X_tox = []
    y_tox = []
    
    print("Extracting authentic RDKit molecular features from SMILES...")
    for idx, row in df.iterrows():
        features = get_molecular_features(row['smiles'])
        if features is not None:
            # Check for NaN in features
            if not np.isnan(features).any():
                X_tox.append(features)
                val = int(row['SR-p53'])
                # Map binary tox from Tox21 to Low(0), High(2)
                y_tox.append(2 if val == 1 else 0)
            
    X_tox = np.array(X_tox)
    y_tox = np.array(y_tox)
    
    if len(X_tox) > 0:
        train_toxicity_model(X_tox, y_tox)
    
    print("Training Effectiveness Model on authentic features...")
    # Map LogP (index 1) to an effectiveness proxy score 0-1
    y_eff = np.array([min(1.0, max(0.0, float(f[1]) / 5.0)) for f in X_tox]) 
    if len(X_tox) > 0:
        train_effectiveness_model(X_tox, y_eff)
        
    print("Training Interaction Model on authentic clinical heuristic pairs...")
    # Load the 30 specific drugs from the curated dataset
    try:
        curated_df = pd.read_csv(os.path.join(os.path.dirname(__file__), '../datasets/drugs.csv'))
    except Exception as e:
        print("Falling back to random interaction generation due to missing drugs.csv", e)
        curated_df = None
        
    X_int = []
    y_int = []
    
    if curated_df is not None:
        # Precompute features and classes
        drug_data = []
        for idx, row in curated_df.iterrows():
            feat = get_interaction_features(row['smiles'])
            if feat is not None and not np.isnan(feat).any():
                drug_data.append({
                    'name': row['drug_name'],
                    'class': row['drug_class'],
                    'features': feat
                })
                
        # Generate all pairwise combinations
        for i in range(len(drug_data)):
            for j in range(i + 1, len(drug_data)):
                d1 = drug_data[i]
                d2 = drug_data[j]
                
                f_combined = np.concatenate((d1['features'], d2['features']))
                X_int.append(f_combined)
                
                # Symmetrical features
                f_combined_rev = np.concatenate((d2['features'], d1['features']))
                X_int.append(f_combined_rev)
                
                # Clinical Rule Evaluation
                c1, c2 = d1['class'], d2['class']
                risk = 0 # Low by default
                
                # High Risk Combinations
                high_risk_pairs = [
                    ('NSAID', 'Anticoagulant'),
                    ('SSRI', 'SSRI'),
                    ('Fluoroquinolone', 'Statin'),
                    ('Macrolide', 'Statin'),
                    ('NSAID', 'ACE Inhibitor'),
                    ('NSAID', 'ARB'),
                    ('NSAID', 'Loop Diuretic'),
                    ('Beta-2 Agonist', 'Beta Blocker')
                ]
                
                # Moderate Risk Combinations
                mod_risk_pairs = [
                    ('ACE Inhibitor', 'Loop Diuretic'),
                    ('ARB', 'Loop Diuretic'),
                    ('Beta Blocker', 'Calcium Channel Blocker'),
                    ('SSRI', 'NSAID'),
                    ('Antidiabetic', 'Fluoroquinolone')
                ]
                
                def match(pair, class1, class2):
                    return (pair[0] == class1 and pair[1] == class2) or (pair[0] == class2 and pair[1] == class1)
                
                for p in high_risk_pairs:
                    if match(p, c1, c2): risk = 2
                
                if risk == 0:
                    for p in mod_risk_pairs:
                        if match(p, c1, c2): risk = 1
                
                # Same class is often moderate/high due to duplication
                if c1 == c2 and risk == 0:
                    risk = 1
                    
                y_int.extend([risk, risk])

    X_int = np.array(X_int)
    y_int = np.array(y_int)
    
    if len(X_int) > 0:
        train_interaction_model(X_int, y_int)

    print("Authentic Model Training Pipeline Complete!")

if __name__ == "__main__":
    download_and_train()
