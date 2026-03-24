# Pharmaguide AI: Clinical Safety & Eco-Impact Research Platform

Pharmaguide AI is a high-fidelity, clinically-authenticated research and consumer safety tool. It bridges the gap between complex pharmaceutical data and consumer safety by providing real-time interaction checking, molecular descriptor validation, and an AI-driven symptom solver.

## 🚀 Core Features

### 1. Consumer Portal
- **AI Symptom Solver (NLP)**: Advanced natural language processing that maps consumer symptoms (e.g., "tummy ache", "itchy eyes") to recommended pharmacological agents.
- **Medicine Cabinet Scan**: A safety-first tool that decodes brand-name medications (Advil, Aleve, Tylenol) to identify hidden active ingredient overlaps.
- **Side Effect Matrix**: Clear, clinical summaries of risks associated with common medications.

### 2. Researcher Portal
- **Advanced Interaction Checker**: A data-driven engine that analyzes pairs of compounds for clinical interaction risks and environmental toxicity.
- **Research Hub**: 
    - **Lipinski's Rule of Five (Ro5)**: Real-time validation of oral bioavailability metrics.
    - **Molecular Descriptors**: High-precision data including TPSA, Rotatable Bonds, and SMILES strings.
    - **Eco-Impact & Cost Analysis**: In-depth transparency guide for environmental toxicity scoring and clinical cost modeling.
- **Data Explorer**: Comprehensive database of 111+ pharmacological agents with synchronized clinical metrics.

---

## 🛠️ Getting Started

### Prerequisites
- **Python 3.9+**
- **Node.js 18+**

### Setup & Launch
1. **Initialize Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python seed_db.py  # Required for first-time use to populate 111-drug dataset
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

## 🔬 Scientific Models & Calculations

### I. Interaction Risk Model
Prioritizes **known clinical pairs** from the database (30+ verified pairs indexed). If a pair is unknown, it utilizes a predictive model based on molecular attributes (LogP, TPSA, MW).

### II. Sustainability (Eco-Score)
The platform models environmental impact using the following formula:
`Eco Score = ((10 - Tox) + BioDeg + (10 - Pers)) / 30 * 100`

---

## 🛠️ Tech Stack

### Frontend
- **React 18**: Modern UI assembly with functional components and hooks.
- **Vanilla CSS & Glassmorphism**: Premium, high-fidelity design system.
- **Lucide React**: Professional iconography.

### Backend
- **FastAPI**: High-performance Python web framework.
- **SQLAlchemy & SQLite**: Robust ORM for clinical data management.
- **Scikit-Learn**: TF-IDF and Random Forest models for NLP and risk prediction.

## 🧪 Data Sources & References
- **EMA** (European Medicines Agency) - ERA guidelines.
- **Sustainable Healthcare Coalition (SHC)** - Carbon footprinting.
- **PubChem / DrugBank**: Molecular properties and clinical mechanisms.
- **NHS SDU**: Life-cycle models.

## 🔮 Future Scope
- **Real-time API Integration**: Live fetching from NIH and EMA databases.
- **3D Molecule Viewer**: Structural visualization for researchers.
- **EMR Integration**: Personalized safety alerts based on patient records.

---
**DISCLAIMER**: Pharmaguide AI is for EDUCATIONAL PURPOSES ONLY. This platform provides pharmacological data analysis and should not be used as clinical advice. Always consult a licensed healthcare professional for medical decisions.
