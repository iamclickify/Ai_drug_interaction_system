# AI Drug Interaction Risk & Sustainable Recommendation System
## Technical & Scientific Documentation

### 1. Executive Summary
The **AI Drug Interaction Risk & Sustainable Recommendation System** is a modular full-stack application designed to bridge the gap between clinical safety and environmental sustainability in pharmaceuticals. By utilizing machine learning and a verified clinical database, the platform allows users to analyze the health risks, environmental toxicity, and cost-effectiveness of various medications.

---

### 2. Getting Started

#### Prerequisites
- **Python 3.9+**
- **Node.js 18+**
- **npm**

#### Setup & Launch
1. **Initialize Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python seed_db.py  # Only required for first-time use
   python main.py     # Backend runs on http://127.0.0.1:5000
   ```

2. **Initialize Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev        # Frontend usually runs on http://localhost:5173
   ```

3. **Quick Start (Windows)**:
   Simply run the `start.bat` file in the root directory to launch both services simultaneously.

---

### 3. Core Features

#### A. Consumer Portal (Patient-Centric)
- **Symptom Solver (NLP)**: A natural language interface to describe symptoms. The system uses a keyword-based AI engine to map symptoms to relevant drug categories.
- **Medicine Cabinet**: A personalized portal to track current medications and view aggregated safety scores.
- **Dosage Guide & Side Effects**: Standardized clinical benchmarks and toxicity risk visualizations (GI & Cardiovascular).

#### B. Researcher Portal (Data-Centric)
- **Drug Interaction AI**: Analyzes complex drug regimens (2+ drugs) for clinical interaction risks and environmental impact.
- **Drug Explorer**: Deep-dive tool for individual compounds, displaying molecular properties and SMILES data.
- **Comparison Dashboard**: Side-by-side analysis of treatment options for sustainability and cost.

---

### 4. Scientific Models & Calculations

#### I. Interaction Risk Model
Prioritizes **known clinical pairs** from the database (30+ verified pairs indexed). If a pair is unknown, it utilizes a predictive model based on molecular attributes (LogP, TPSA, MW).

#### II. Sustainability (Eco-Score)
`Eco Score = ((10 - Tox) + BioDeg + (10 - Pers)) / 30 * 100`

---

### 5. Verified Sources & Authentication
Data models are predicated on benchmarks from:
- **EMA** (European Medicines Agency) - ERA guidelines.
- **Sustainable Healthcare Coalition (SHC)** - Carbon footprinting.
- **NHS SDU** - Life-cycle models.
- **PubChem / ChemSpider** - Molecular descriptors.

---

### 6. Future Scope
- **Real-time Clinical API Integration** (OpenFDA/DrugBank).
- **3D Molecule Viewer** for structural visualization.
- **Advanced LLM Triage** for complex symptom analysis.

---
*Developed as a high-fidelity pharmaceutical R&D simulation platform.*
