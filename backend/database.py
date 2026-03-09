import sqlite3
import csv
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '../datasets/drugs.db')
CSV_PATH = os.path.join(os.path.dirname(__file__), '../datasets/drugs.csv')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create drugs table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS drugs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        drug_name TEXT NOT NULL,
        smiles TEXT NOT NULL,
        drug_class TEXT,
        category TEXT
    )
    ''')
    
    # Clear existing data
    cursor.execute('DELETE FROM drugs')

    # Read CSV and populate DB
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"Missing {CSV_PATH}")

    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        drugs_data = []
        for row in reader:
            drugs_data.append((
                row['drug_name'],
                row['smiles'],
                row['drug_class'],
                row['category']
            ))

    cursor.executemany('''
    INSERT INTO drugs (drug_name, smiles, drug_class, category)
    VALUES (?, ?, ?, ?)
    ''', drugs_data)

    conn.commit()
    conn.close()
    
    print(f"Successfully initialized the database with {len(drugs_data)} drugs from drugs.csv")

if __name__ == "__main__":
    init_db()
