from sqlalchemy import Column, Integer, String, Float
from database import Base

class Drug(Base):
    __tablename__ = "drugs"

    id = Column(Integer, primary_key=True, index=True)
    drug_name = Column(String, unique=True, index=True)
    brand_name = Column(String, nullable=True)
    category = Column(String)
    eco_toxicity = Column(Float)
    biodegradability = Column(Float)
    persistence = Column(Float)
    cost = Column(Float)
    clinical_use = Column(String, nullable=True)
    symptoms = Column(String, nullable=True) # Common symptoms treated (e.g., headache, fever)
    
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
    molar_refractivity = Column(Float, nullable=True)
    
    # Quantitative Sustainability & Cost
    unit_price = Column(Float, default=1.0) # Estimated USD per standard unit (pill/vial)
    default_course_days = Column(Integer, default=7) # Standard treatment duration
    chemical_footprint_index = Column(Float, default=10.0) # Estimated mg of waste per g produced

class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    drug_a = Column(String)
    drug_b = Column(String)
    severity_score = Column(Float)
    label = Column(String) # Low, Moderate, High
    explanation = Column(String)
    mechanism = Column(String, nullable=True) # Physiological mechanism (e.g., CYP450 inhibition)
    feasibility = Column(String, nullable=True) # Feasible, Caution, Infeasible
