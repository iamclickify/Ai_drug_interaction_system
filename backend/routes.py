from flask import request, jsonify
import sqlite3
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../models')))

from descriptor_extractor import get_molecular_features
from model_loader import process_single_prediction, process_interaction, calculate_similarity

DB_PATH = os.path.join(os.path.dirname(__file__), '../datasets/drugs.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def register_routes(app):
    
    # ------------------------------------------------------------------
    # GET /drugs
    # ------------------------------------------------------------------
    @app.route('/drugs', methods=['GET'])
    def get_drugs():
        conn = get_db_connection()
        drugs = conn.execute('SELECT id, drug_name, smiles, drug_class, category FROM drugs').fetchall()
        conn.close()
        
        drugs_list = [{
            'id': drug['id'],
            'drug_name': drug['drug_name'],
            'smiles': drug['smiles'],
            'drug_class': drug['drug_class'],
            'category': drug['category']
        } for drug in drugs]
        
        return jsonify(drugs_list)

    # ------------------------------------------------------------------
    # Helper to fetch SMILES for a drug
    # ------------------------------------------------------------------
    def fetch_smiles(drug_name):
        conn = get_db_connection()
        # Ensure robust matching
        drug = conn.execute('SELECT smiles FROM drugs WHERE LOWER(drug_name) = ?', (drug_name.strip().lower(),)).fetchone()
        conn.close()
        return drug['smiles'] if drug else None

    # ------------------------------------------------------------------
    # POST /predict
    # ------------------------------------------------------------------
    @app.route('/predict', methods=['POST'])
    def predict():
        data = request.json
        if not data or 'drug_name' not in data:
            return jsonify({"error": "Please provide 'drug_name'"}), 400
            
        drug_name = data['drug_name']
        smiles = fetch_smiles(drug_name)
        
        if not smiles:
            return jsonify({"error": f"Drug '{drug_name}' not found in database"}), 404
            
        features = get_molecular_features(smiles)
        if features is None:
            return jsonify({"error": f"Failed to extract features for SMILES: {smiles}"}), 500
            
        results = process_single_prediction(features)
        
        return jsonify({
            "toxicity_risk": results["toxicity_risk"],
            "effectiveness_score": results["effectiveness"],
            "sustainability_score": results["sustainability"],
            "smiles": smiles,           # Included for 3D visualization
            "descriptors": features.tolist() # Included for frontend comparison display
        })

    # ------------------------------------------------------------------
    # POST /interaction
    # ------------------------------------------------------------------
    @app.route('/interaction', methods=['POST'])
    def interaction():
        data = request.json
        if not data or 'drugA' not in data or 'drugB' not in data:
            return jsonify({"error": "Please provide 'drugA' and 'drugB'"}), 400
            
        drug_a_name = data['drugA']
        drug_b_name = data['drugB']
        
        smiles_a = fetch_smiles(drug_a_name)
        smiles_b = fetch_smiles(drug_b_name)
        
        if not smiles_a: return jsonify({"error": f"Drug '{drug_a_name}' not found"}), 404
        if not smiles_b: return jsonify({"error": f"Drug '{drug_b_name}' not found"}), 404
            
        try:
            results = process_interaction(smiles_a, smiles_b)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
        return jsonify({
            "interaction_risk": results["interaction_risk"],
            "combined_toxicity_estimate": results["combined_toxicity"],
            "recommendation": results["recommendation"]
        })

    # ------------------------------------------------------------------
    # POST /similarity
    # ------------------------------------------------------------------
    @app.route('/similarity', methods=['POST'])
    def similarity():
        data = request.json
        if not data or 'drugA' not in data or 'drugB' not in data:
            return jsonify({"error": "Please provide 'drugA' and 'drugB'"}), 400
            
        drug_a_name = data['drugA']
        drug_b_name = data['drugB']
        
        smiles_a = fetch_smiles(drug_a_name)
        smiles_b = fetch_smiles(drug_b_name)
        
        if not smiles_a: return jsonify({"error": f"Drug '{drug_a_name}' not found"}), 404
        if not smiles_b: return jsonify({"error": f"Drug '{drug_b_name}' not found"}), 404
            
        sim_score = calculate_similarity(smiles_a, smiles_b)
        
        if sim_score is None:
            return jsonify({"error": "Failed to calculate similarity"}), 500
            
        return jsonify({
            "similarity_score": sim_score
        })
