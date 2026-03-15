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
    
    # helper
    def serialize_drug(drug):
        return {
            'id': drug['id'],
            'drug_name': drug['drug_name'],
            'iupac_name': drug['iupac_name'],
            'formula': drug['formula'],
            'weight': drug['weight'],
            'smiles': drug['smiles'],
            'drug_class': drug['drug_class'],
            'year_discovery': drug['year_discovery'],
            'clinical_use': drug['clinical_use'],
            'half_life': drug['half_life'],
            'dosage_range': drug['dosage_range'],
            'cox_selectivity': drug['cox_selectivity'],
            'bioavailability': drug['bioavailability'],
            'protein_binding': drug['protein_binding'],
            'metabolism_pathway': drug['metabolism_pathway'],
            'gi_toxicity_risk': drug['gi_toxicity_risk'],
            'cardio_risk': drug['cardio_risk'],
            'pharmacology_explanation': drug['pharmacology_explanation'],
            'mechanistic_reasoning': drug['mechanistic_reasoning']
        }
        
    @app.route('/drugs', methods=['GET'])
    def get_drugs():
        conn = get_db_connection()
        drugs = conn.execute('SELECT * FROM drugs').fetchall()
        conn.close()
        
        drugs_list = [serialize_drug(drug) for drug in drugs]
        return jsonify(drugs_list)

    def fetch_drug_full(drug_name):
        conn = get_db_connection()
        drug = conn.execute('SELECT * FROM drugs WHERE LOWER(drug_name) = ?', (drug_name.strip().lower(),)).fetchone()
        conn.close()
        return drug

    @app.route('/predict', methods=['POST'])
    def predict():
        data = request.json
        if not data or 'drug_name' not in data:
            return jsonify({"error": "Please provide 'drug_name'"}), 400
            
        drug_name = data['drug_name']
        drug_record = fetch_drug_full(drug_name)
        
        if not drug_record:
            return jsonify({"error": f"Drug '{drug_name}' not found in database"}), 404
            
        smiles = drug_record['smiles']
        
        features = get_molecular_features(smiles)
        if features is None:
            return jsonify({"error": f"Failed to extract features for SMILES: {smiles}"}), 500
            
        results = process_single_prediction(features)
        
        response = serialize_drug(drug_record)
        response.update({
            "toxicity_risk": results["toxicity_risk"],
            "effectiveness_score": results["effectiveness"],
            "sustainability_score": results["sustainability"],
            "descriptors": features.tolist()
        })
        
        return jsonify(response)


    @app.route('/interaction', methods=['POST'])
    def interaction():
        data = request.json
        if not data or 'drugA' not in data or 'drugB' not in data:
            return jsonify({"error": "Please provide 'drugA' and 'drugB'"}), 400
            
        drug_a_name = data['drugA']
        drug_b_name = data['drugB']
        
        drug_a = fetch_drug_full(drug_a_name)
        drug_b = fetch_drug_full(drug_b_name)
        
        if not drug_a: return jsonify({"error": f"Drug '{drug_a_name}' not found"}), 404
        if not drug_b: return jsonify({"error": f"Drug '{drug_b_name}' not found"}), 404
            
        try:
            results = process_interaction(drug_a['smiles'], drug_b['smiles'])
        except Exception as e:
            return jsonify({"error": str(e)}), 500
            
        # Compile an educational interaction reasoning specifically based on NSAIDs
        pharmacological_explanation = (
            f"The combination of {drug_a['drug_name']} ({drug_a['cox_selectivity']}) and "
            f"{drug_b['drug_name']} ({drug_b['cox_selectivity']}) increases the overall "
            f"pharmacological blockade of cyclooxygenase enzymes."
        )
        
        mechanistic_reasoning = (
            f"Simultaneous displacement from protein binding sites (both are highly bound: "
            f"{drug_a['protein_binding']} and {drug_b['protein_binding']}) and additive anti-platelet "
            f"or GI irritant effects exponentially raise toxicity without contributing supplementary efficacy."
        )

        
        return jsonify({
            "interaction_risk": results["interaction_risk"],
            "combined_toxicity_estimate": results["combined_toxicity"],
            "recommendation": results["recommendation"],
            "pharmacological_explanation": pharmacological_explanation,
            "mechanistic_reasoning": mechanistic_reasoning
        })


    @app.route('/similarity', methods=['POST'])
    def similarity():
        data = request.json
        if not data or 'drugA' not in data or 'drugB' not in data:
            return jsonify({"error": "Please provide 'drugA' and 'drugB'"}), 400
            
        drug_a = fetch_drug_full(data['drugA'])
        drug_b = fetch_drug_full(data['drugB'])
        
        if not drug_a: return jsonify({"error": f"Drug '{data['drugA']}' not found"}), 404
        if not drug_b: return jsonify({"error": f"Drug '{data['drugB']}' not found"}), 404
            
        sim_score = calculate_similarity(drug_a['smiles'], drug_b['smiles'])
        
        if sim_score is None:
            return jsonify({"error": "Failed to calculate similarity"}), 500
            
        return jsonify({
            "similarity_score": sim_score
        })
