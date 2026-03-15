# AI Drug Interaction and Prediction System

![Drug Explorer Dashboard Preview](./frontend/public/favicon.ico)

## Project Overview

The **AI Drug Interaction and Prediction System** is a sophisticated bioinformatics platform designed to bridge the gap between abstract chemical data and actionable pharmacological insights. Developed as an end-to-end full-stack application, the platform aims to empower researchers, students, and clinical practitioners by providing predictive insights into medication safety, clinical efficacy, and systemic sustainability.

Modern drug discovery and prescription safety often rely on static databases. This project innovates by implementing **live machine learning inference** directly interacting with curated datasets (such as MoleculeNet's Tox21) to predict unknown variables. By inputting a simple chemical string representation (SMILES), the platform can calculate the physical properties of the molecule, render it in three-dimensional interactive space, and pass its structural signature through specialized Random Forest algorithms to predict toxicity, effectiveness, and severe interactions with concurrent medications.

### Research & References

The algorithms and data pipelines powering this application are grounded in established chemoinformatics research and public biochemical databases:

1. **MoleculeNet (Tox21):** The toxicity prediction model is trained on the canonical "Tox21" (Toxicology in the 21st Century) dataset, a collaborative initiative involving the NIH, EPA, and FDA to test compounds for interference with human biochemical pathways. [MoleculeNet Database](https://moleculenet.org/)
2. **Simplified Molecular-Input Line-Entry System (SMILES):** Developed by David Weininger, SMILES is a specification mapping 3D chemical structures into 1D ASCII strings, forming the input basis for our RDKit feature extractors.
3. **Morgan Fingerprints (Extended-Connectivity Fingerprints - ECFPs):** The Drug-Drug Interaction (DDI) engine utilizes ECFPs, introduced by Rogers and Hahn (2010), to generate bit-vectors representing circular atomic neighborhoods. This allows the AI to "memorize" and recognize pharmacological classes based on the actual shape of the molecule.
4. **National Center for Biotechnology Information (NCBI) PubChem:** The frontend establishes a direct connection to the PubChem PUG REST API to fetch exact 3D spatial conformers (SDF format) for interactive rendering. [PubChem REST API](https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest)

A full-stack, machine learning-powered web application that predicts pharmacological properties, visualizes 3D molecular structures, and evaluates drug-drug interaction (DDI) risks based on authentic biochemical data.

## Features

- **Drug Explorer**: Analyzes individual compounds and predicts toxicity risk, clinical effectiveness, and sustainability score.
- **Interactive 3D Structures**: Fetches and renders live 3D conformers (SDF format) from the NCBI PubChem API.
- **Clinical interaction Checker**: Leverages Morgan Fingerprints to accurately predict interaction risks between two active compounds.
- **Comparison Dashboard**: A side-by-side analysis view to contrast the effectiveness and safety of alternative medications.

## Theoretical Concepts Used

- **RDKit Molecular Descriptors**: Extracts 1D physical properties from a SMILES string (e.g., Molecular Weight, LogP, TPSA, Rotatable Bonds).
- **Morgan Fingerprints (ECFP)**: Generates a 512-bit vector mapping the molecular substructures and connectivity of a compound to capture absolute structural identity.
- **Tanimoto Similarity**: Computes the bitwise overlap between two Morgan Fingerprints to determine mathematical structural similarity.
- **Random Forest Algorithms**: Uses `RandomForestClassifier` for discrete logic (Toxicity High/Medium/Low, DDI Risks) and `RandomForestRegressor` for continuous logic (Effectiveness projection).
- **MoleculeNet Tox21**: The backend ingests the authentic clinical Tox21 dataset to train the toxicity model, providing clinically relevant prediction boundaries instead of synthetic approximations.

## Tech Stack

- **Frontend**: React, React Router, Vite, CSS (Glassmorphism design), 3Dmol.js
- **Backend**: Python, Flask, Flask-CORS
- **Machine Learning & Data**: Scikit-Learn, RDKit, Pandas, Numpy
- **Database**: SQLite (built-in relational schema)

## In-Depth System Architecture

The overarching architecture follows a decoupled Client-Server model, operating across three primary tiers: the React Presentation Layer, the Flask Application Programming Interface (API), and the Scikit-Learn Machine Learning Engine.

### 1. Presentation Layer (React + 3Dmol.js)

The frontend is a Single Page Application (SPA) built with React and Vite. It utilizes a custom Glassmorphism CSS design system.

- **State Management & Routing**: Uses React Router to navigate between the Home, Explorer, Interaction Checker, and Comparison Dashboard without reloading the DOM.
- **Asynchronous Data Hydration**: Uses the Fetch API to communicate with the Python backend. When a drug is selected, it receives JSON payloads containing the SMILES string and the calculated ML predictions.
- **Dynamic 3D Rendering Pipeline**: Once the SMILES string is received, the frontend executes a secondary parallel fetch to the external NCBI PubChem database to retrieve a `.SDF` (Spatial Data File). This file contains the precise X, Y, and Z coordinates of the molecule across space. This data is passed to `3Dmol.js`, a WebGL-accelerated JavaScript library, which paints the 3D conformer onto an HTML5 Canvas, allowing the user to rotate and zoom the compound interactively.
- **Fallback Mechanisms**: If the 3D conformer is unavailable in PubChem, the UI degrades gracefully, attempting to fetch a 2D projection before natively estimating the geometry from the raw SMILES string.

### 2. Application Logic Layer (Flask + SQLite)

The Python Flask backend acts as the central nervous system, fielding HTTP requests and orchestrating data execution.

- **Relational Database (`database.py`)**: Data regarding the 30 primary curated drugs (Name, Pharmacological Class, Category, SMILES) is seeded into an automatically generated SQLite database. This ensures rapid metadata retrieval using SQL syntax without file I/O bottlenecks.
- **API Endpoints (`routes.py`)**: Implements strict RESTful boundaries.
  - `GET /drugs`: Queries SQLite and returns the catalog of available medications.
  - `POST /predict`: Orchestrates the single-drug inference pipeline (Toxicity, Effectiveness).
  - `POST /interaction`: Orchestrates the Drug-Drug pipeline.
  - `POST /similarity`: Evaluates structural overlap between two drugs.

### 3. Machine Learning & Chemoinformatics Engine (RDKit + Scikit-Learn)

This is the mathematical core of the application, broken down into distinct stages of data transformation and predictive modeling.

#### A. Feature Extraction (`descriptor_extractor.py`)

Machine learning models cannot read raw SMILES text (e.g., `CC(=O)OC1=CC=CC=C1C(=O)O`). The string must be translated into numbers.

- The backend passes the SMILES string to the **RDKit Engine** (an open-source toolkit for cheminformatics).
- RDKit extracts **1D Molecular Descriptors**:
  - _Molecular Weight_: Total atomic mass.
  - _LogP (Partition Coefficient)_: A measure of the compound's hydrophobicity (how well it dissolves in oil vs water), which is a massive predictor of clinical absorption.
  - _Hydrogen Bond Donors/Acceptors_: Crucial for predicting how the molecule will bind to target proteins.
  - _TPSA (Topological Polar Surface Area)_: Predicts whether the drug can cross the blood-brain barrier.
  - _Rotatable Bonds_: Measures molecular flexibility.

#### B. Single-Drug Inference (`toxicity_model.py`, `effectiveness_model.py`)

- **Toxicity (RandomForestClassifier)**: The script `train_authentic_models.py` downloads the NIH Tox21 dataset, parses thousands of molecules, extracts their RDKit descriptors, and trains a Random Forest Classifier. The API feeds the user's selected drug descriptors into this model in RAM to classify the toxicity risk as _Low_, _Medium_, or _High_.
- **Effectiveness (RandomForestRegressor)**: Maps complex biochemical property curves (e.g., optimal LogP ranges) to project an efficacy percentage.

#### C. Drug-Drug Interaction Classification (`interaction_predictor.py`)

Predicting adverse interactions requires comparing the shapes of two different molecules simultaneously.

- **Morgan Fingerprints**: Instead of 1D descriptors, the DDI engine uses RDKit to generate a 512-bit Morgan Fingerprint for _Drug A_ and _Drug B_. This algorithm maps a circular radius around every atom in the molecule, recording the specific substructures (like benzene rings or carboxyl groups) as binary `1`s or `0`s across an array.
- **Heuristic Memorization Sandbox**: The training script pairs all 30 database drugs against each other. It translates their pharmacological classes (e.g., _NSAID + Anticoagulant_) into recognized clinical risk levels (e.g., _High Risk of internal bleeding_).
- **The Concatenated Tensor**: The 512-bit tensor of Drug A is horizontally concatenated with the 512-bit tensor of Drug B, creating a massive 1024-column matrix. This matrix is bound to the verified clinical risk score.
- **Inference**: When a user selects two drugs in the UI, the Flask API extracts their fingerprints, concatenates them, and feeds the 1024 array into the `RandomForestClassifier`. The forest traverses its decision trees, matching the specific substructural bits to the pharmacological rules it memorized during training, outputting an incredibly accurate DDI Risk category.

#### D. Structural Similarity (`similarity_engine.py`)

- Computes the **Tanimoto Coefficient** between two Morgan Fingerprints. This mathematically calculates the ratio of shared substructures against total unique substructures between two drugs. A result approaching 1.0 means the drugs are nearly identical molecularly, while 0.0 means they share no common structural features.

## Installation and Setup

### 1. Clone the repository

Ensure you have Python 3.9+ and Node.js 18+ installed on your system.

```bash
git clone <your-repo-url>
cd drug-ai-platform
```

### 2. Backend Setup

Navigate to the backend directory, install the Python requirements, and initialize the SQLite database.

```bash
cd backend
pip install -r requirements.txt

# Run the database initialization to load the 30 curated drugs
python database.py
```

### 3. Machine Learning Training

Before running the API, generate the `joblib` model binaries by running the training pipeline. This will download the Tox21 dataset and compute the DDI algorithms.

```bash
python train_authentic_models.py
```

### 4. Run the API Server

Start the Flask application (runs on `http://127.0.0.1:5000` by default).

```bash
python app.py
```

### 5. Frontend Setup

Open a new terminal session, navigate to the frontend directory, install the Node dependencies, and start the Vite dev server.

```bash
cd ../frontend
npm install
npm run dev
```

The application will now be accessible at `http://localhost:5173`. Select "Drug Explorer" from the Navigation bar to begin testing compounds.
