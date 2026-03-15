import sqlite3
import csv
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '../datasets/drugs.db')
CSV_PATH = os.path.join(os.path.dirname(__file__), '../datasets/nsaids.csv')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Drop existing drugs table if it exists
    cursor.execute('DROP TABLE IF EXISTS drugs')

    # Create new advanced drugs table
    cursor.execute('''
    CREATE TABLE drugs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        drug_name TEXT NOT NULL,
        iupac_name TEXT,
        formula TEXT,
        weight REAL,
        smiles TEXT NOT NULL,
        drug_class TEXT,
        year_discovery INTEGER,
        clinical_use TEXT,
        half_life TEXT,
        dosage_range TEXT,
        cox_selectivity TEXT,
        bioavailability TEXT,
        protein_binding TEXT,
        metabolism_pathway TEXT,
        gi_toxicity_risk TEXT,
        cardio_risk TEXT,
        pharmacology_explanation TEXT,
        mechanistic_reasoning TEXT
    )
    ''')

    if not os.path.exists(CSV_PATH):
        print(f"Error: Could not find {CSV_PATH}")
        return

    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        drugs_data = []
        for row in reader:
            drugs_data.append((
                row['drug_name'],
                row['iupac_name'],
                row['formula'],
                float(row['weight']) if row['weight'] else None,
                row['smiles'],
                row['drug_class'],
                int(row['year_discovery']) if row['year_discovery'] else None,
                row['clinical_use'],
                row['half_life'],
                row['dosage_range'],
                row['cox_selectivity'],
                row['bioavailability'],
                row['protein_binding'],
                row['metabolism_pathway'],
                row['gi_toxicity_risk'],
                row['cardio_risk'],
                row['pharmacology_explanation'],
                row['mechanistic_reasoning']
            ))

    cursor.executemany('''
    INSERT INTO drugs (
        drug_name, iupac_name, formula, weight, smiles, drug_class, year_discovery,
        clinical_use, half_life, dosage_range, cox_selectivity, bioavailability,
        protein_binding, metabolism_pathway, gi_toxicity_risk, cardio_risk,
        pharmacology_explanation, mechanistic_reasoning
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', drugs_data)

    conn.commit()
    conn.close()
    
    print(f"Successfully initialized the advanced NSAID database with {len(drugs_data)} drugs.")

if __name__ == "__main__":
    init_db()
