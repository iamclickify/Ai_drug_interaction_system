import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '../datasets/drugs.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS drugs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        drug_name TEXT NOT NULL,
        smiles TEXT NOT NULL,
        drug_class TEXT,
        target_protein TEXT,
        category TEXT
    )
    ''')
    
    # Clear existing data just in case
    cursor.execute('DELETE FROM drugs')

    # Data
    drugs_data = [
        ("Aspirin", "CC(=O)OC1=CC=CC=C1C(=O)O", "NSAID", "COX-1, COX-2", "Analgesic"),
        ("Ibuprofen", "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O", "NSAID", "COX-1, COX-2", "Analgesic"),
        ("Paracetamol", "CC(=O)NC1=CC=C(O)C=C1", "Analgesic", "COX-3 (putative)", "Analgesic"),
        ("Diclofenac", "OC(=O)CC1=C(NC2=C(Cl)C=CC=C2Cl)C=CC=C1", "NSAID", "COX-1, COX-2", "Analgesic"),
        ("Naproxen", "CC(C1=CC2=C(C=C1)C=C(OC)C=C2)C(=O)O", "NSAID", "COX-1, COX-2", "Analgesic"),
        ("Amoxicillin", "CC1(C(N2C(S1)C(C2=O)NC(=O)C(C3=CC=CC=C3)N)C(=O)O)C", "Antibiotic", "Penicillin-binding proteins", "Antibacterial"),
        ("Lisinopril", "O=C(O)C(N(CC(CC1=CC=CC=C1)N)C(=O)C2CCCC2)C", "ACE Inhibitor", "Angiotensin-converting enzyme", "Antihypertensive"),
        ("Levothyroxine", "O=C(O)C(N)CC1=CC(I)=C(OC2=CC(I)=C(O)C(I)=C2)C(I)=C1", "Thyroid Hormone", "Thyroid hormone receptor", "Hormone replacement"),
        ("Atorvastatin", "CC(C)C1=C(C(=C(N1CC(CC(CC(=O)O)O)O)C2=CC=C(C=C2)F)C3=CC=CC=C3)C(=O)NC4=CC=CC=C4", "Statin", "HMG-CoA reductase", "Lipid-lowering"),
        ("Metformin", "CN(C)C(=NC(=N)N)N", "Biguanide", "AMPK", "Antidiabetic"),
        ("Amlodipine", "CCOC(=O)C1=C(COCCN)NC(=C(C1C2=CC=CC=C2Cl)C(=O)OC)C", "Calcium Channel Blocker", "Voltage-gated calcium channels", "Antihypertensive"),
        ("Metoprolol", "CC(C)NCC(COC1=CC=C(C=C1)CC(=O)OC)O", "Beta Blocker", "Beta-1 adrenergic receptor", "Antihypertensive"),
        ("Omeprazole", "CC1=CN=C(C(=C1OC)C)CS(=O)C2=NC3=C(N2)C=C(C=C3)OC", "Proton Pump Inhibitor", "H+/K+ ATPase", "Antacid"),
        ("Losartan", "CCCC1=NC(=C(N1CC2=CC=C(C=C2)C3=CC=CC=C3N4N=NN=N4)CO)Cl", "ARB", "Angiotensin II receptor", "Antihypertensive"),
        ("Albuterol", "CC(C)(C)NCC(C1=CC(=C(C=C1)O)CO)O", "Beta-2 Agonist", "Beta-2 adrenergic receptor", "Bronchodilator"),
        ("Gabapentin", "C1(CCCCC1)(CC(=O)O)CN", "Anticonvulsant", "Voltage-gated calcium channels", "Neuropathic pain"),
        ("Hydrochlorothiazide", "C1=CC2=C(C=C1Cl)S(=O)(=O)N=C(N2)N", "Thiazide Diuretic", "Sodium-chloride symporter", "Antihypertensive"),
        ("Sertraline", "CN[C@H]1CC[C@@H](C2=C(C1)C=CC(=C2)Cl)C3=CC=CC=C3Cl", "SSRI", "Serotonin transporter", "Antidepressant"),
        ("Simvastatin", "CCC(C)(C)C(=O)OC1CC2(C)CCC3C(C2C=CC1)C=CC(C3)C(C)CC4CC(=O)OC4C", "Statin", "HMG-CoA reductase", "Lipid-lowering"),
        ("Montelukast", "CC(C)(C)C1=CC(=C(C=C1)C(C2=CC=CC=C2)C3=CC=C(C=C3)C(=O)O)SC4=CC=C(C=C4)C5=CC=CC=C5", "Leukotriene Receptor Antagonist", "CysLT1 receptor", "Antiasthmatic"),
        ("Pantoprazole", "CC1=CN=C(C(=C1OC)C)CS(=O)C2=NC3=C(N2)C=C(C=C3)OC", "Proton Pump Inhibitor", "H+/K+ ATPase", "Antacid"),
        ("Furosemide", "C1=CC(=C(C=C1C(=O)O)Cl)S(=O)(=O)N", "Loop Diuretic", "Na-K-Cl cotransporter", "Diuretic"),
        ("Fluoxetine", "CNCCC(C1=CC=CC=C1)OC2=CC=C(C=C2)C(F)(F)F", "SSRI", "Serotonin transporter", "Antidepressant"),
        ("Citalopram", "CN(C)CCCC1(C2=C(CO1)C=C(C=C2)C#N)C3=CC=C(C=C3)F", "SSRI", "Serotonin transporter", "Antidepressant"),
        ("Escitalopram", "CN(C)CCCC1(C2=C(CO1)C=C(C=C2)C#N)C3=CC=C(C=C3)F", "SSRI", "Serotonin transporter", "Antidepressant"),
        ("Tramadol", "CN(C)CC1(C(CCC1)C2=CC(=CC=C2)OC)O", "Opioid Analgesic", "Mu-opioid receptor", "Analgesic"),
        ("Trazodone", "C1COCCN1CCCN2C(=O)N(C3=C2C=CC=C3)C4=CC(=CC=C4)Cl", "SARI", "5-HT2A receptor", "Antidepressant"),
        ("Duloxetine", "CNCCC(C1=CC=CS1)OC2=CC=CC=C2", "SNRI", "Serotonin & Norepinephrine transporters", "Antidepressant"),
        ("Venlafaxine", "CN(C)CC(C1(CCCCC1)O)C2=CC=C(C=C2)OC", "SNRI", "Serotonin & Norepinephrine transporters", "Antidepressant"),
        ("Warfarin", "CC(=O)CC(C1=CC=CC=C1)C2=C(C3=CC=CC=C3OC2=O)O", "Anticoagulant", "Vitamin K epoxide reductase", "Anticoagulant"),
        ("Clopidogrel", "COC(=O)C(C1=CC=CC=C1Cl)N2CCC3=C(C2)C=CS3", "Antiplatelet", "P2Y12 receptor", "Antiplatelet"),
        ("Oxycodone", "CN1CCC23C4C1CC5=C2C(=C(C=C5)O)OC3C(CC4=O)O", "Opioid Analgesic", "Mu-opioid receptor", "Analgesic"),
        ("Azithromycin", "CCC1C(C(C(N(CC(CC(C(C(C(C(=O)O1)C)OC2CC(C(C(O2)C)O)(C)N(C)C)C)C)C)O)C)C)C)O)C", "Macrolide", "50S ribosomal subunit", "Antibiotic"),
        ("Ranitidine", "CN/C(=C\\[NO])NCCSC1=CC=C(O1)CN(C)C", "H2 Antagonist", "H2 receptor", "Antacid"),
        ("Doxycycline", "CC1(C(C2(C(CC3C(C2=C(C(=O)C1=O)O)C(=O)C(C(=C3O)N(C)C)O)O)O)C)O", "Tetracycline", "30S ribosomal subunit", "Antibiotic"),
        ("Cetirizine", "C1CN(CCN1CC2=CC=C(C=C2)Cl)CCOCO", "Antihistamine", "H1 receptor", "Antiallergic"),
        ("Atenolol", "CC(C)NCC(COC1=CC=C(C=C1)CC(=O)N)O", "Beta Blocker", "Beta-1 adrenergic receptor", "Antihypertensive"),
        ("Carvedilol", "COC1=CC=CC=C1OCCNCC(COC2=C3C(=CC=CC3=CC=C2)N)O", "Alpha/Beta Blocker", "Alpha-1 and Beta adrenergic receptors", "Antihypertensive"),
        ("Ciprofloxacin", "C1CC1N2C=C(C(=O)C3=CC(=C(C=C32)F)N4CCNCC4)C(=O)O", "Fluoroquinolone", "DNA gyrase", "Antibiotic"),
        ("Cephalexin", "CC1=C(N2C(C(C2=O)NC(=O)C(C3=CC=CC=C3)N)SC1)C(=O)O", "Cephalosporin", "Penicillin-binding proteins", "Antibacterial"),
        ("Spironolactone", "CC12CCC3C(C1CCC24CCC(=O)O4)CCC5=CC(=O)CCC35C", "Potassium-sparing Diuretic", "Mineralocorticoid receptor", "Diuretic"),
        ("Glipizide", "CC1=CN=C(C(=N1)C)C(=O)NCCC2=CC=C(C=C2)S(=O)(=O)NC(=O)NC3CCCCC3", "Sulfonylurea", "ATP-sensitive potassium channels", "Antidiabetic"),
        ("Clonazepam", "C1=CC=C(C=C1)C2=NC(C(=O)NC3=C2C=C(C=C3)N(=O)=O)Cl", "Benzodiazepine", "GABA-A receptor", "Anticonvulsant"),
        ("Diazepam", "CN1C(=O)CN=C(C2=C1C=CC(=C2)Cl)C3=CC=CC=C3", "Benzodiazepine", "GABA-A receptor", "Anxiolytic"),
        ("Lorazepam", "C1=CC=C(C=C1)C2=NC(C(=O)NC3=C2C=C(C=C3)Cl)O", "Benzodiazepine", "GABA-A receptor", "Anxiolytic"),
        ("Alprazolam", "CC1=NN2C(=N1)C3=C(C=C(C=C3)Cl)C(=NC2)C4=CC=CC=C4", "Benzodiazepine", "GABA-A receptor", "Anxiolytic"),
        ("Zolpidem", "CC1=CC=C(C=C1)C2=C(N3C=C(C=CC3=N2)C)CC(=O)N(C)C", "Z-drug", "GABA-A receptor", "Sedative"),
        ("Mirtazapine", "CN1CCN2C(C1)C3=CC=CC=C3CC4=CC=CC=C42", "TeCA", "Alpha-2 adrenergic receptor", "Antidepressant"),
        ("Quetiapine", "C1CN(CCN1CCO)C2=NC3=CC=CC=C3SC4=CC=CC=C42", "Atypical Antipsychotic", "5-HT2A and D2 receptors", "Antipsychotic"),
        ("Aripiprazole", "C1CCC(CC1)N2CCN(CC2)CCCC3=C(C=C(C=C3)Cl)ONC", "Atypical Antipsychotic", "D2 receptor", "Antipsychotic"),
        ("Olanzapine", "CC1=CC2=C(S1)NC3=CC=CC=C3C(=N2)N4CCN(CC4)C", "Atypical Antipsychotic", "5-HT2 and D2 receptors", "Antipsychotic"),
        ("Risperidone", "CC1=C(C(=O)N2CCCCC2=N1)CCN3CCC(CC3)C4=NOC5=C4C=CC=C5F", "Atypical Antipsychotic", "5-HT2A and D2 receptors", "Antipsychotic")
    ]

    cursor.executemany('''
    INSERT INTO drugs (drug_name, smiles, drug_class, target_protein, category)
    VALUES (?, ?, ?, ?, ?)
    ''', drugs_data)

    conn.commit()
    conn.close()
    
    print(f"Successfully initialized the database with {len(drugs_data)} drugs at {DB_PATH}")

if __name__ == "__main__":
    init_db()
