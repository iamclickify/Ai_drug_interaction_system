from sqlalchemy import Column, Integer, String, Float
from database import Base

class Drug(Base):
    __tablename__ = "drugs"

    id = Column(Integer, primary_key=True, index=True)
    drug_name = Column(String, unique=True, index=True)
    category = Column(String)
    eco_toxicity = Column(Float)
    biodegradability = Column(Float)
    persistence = Column(Float)
    cost = Column(Float)
    clinical_use = Column(String, nullable=True)
    
    # Research Fields
    iupac_name = Column(String, nullable=True)
    smiles = Column(String, nullable=True)
    half_life = Column(String, nullable=True)
    dosage_range = Column(String, nullable=True)
    cox_selectivity = Column(String, nullable=True)
    gi_toxicity_risk = Column(String, nullable=True)
    cardio_risk = Column(String, nullable=True)
    year_discovery = Column(Integer, nullable=True)
    molecular_weight = Column(Float, nullable=True)
    logp = Column(Float, nullable=True)
    hbd = Column(Integer, nullable=True)
    hba = Column(Integer, nullable=True)
    tpsa = Column(Float, nullable=True)
    rotatable_bonds = Column(Integer, nullable=True)

class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    drug_a = Column(String)
    drug_b = Column(String)
    severity_score = Column(Float)
    label = Column(String) # Low, Moderate, High
    explanation = Column(String)
