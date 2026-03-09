import numpy as np
from rdkit import Chem
from rdkit.Chem import Descriptors

def get_molecular_features(smiles):
    """
    Extracts molecular descriptors from a SMILES string.
    
    Expected descriptors:
    1. Molecular Weight (MolWt)
    2. LogP (MolLogP)
    3. Number of Hydrogen Bond Donors (NumHDonors)
    4. Number of Hydrogen Bond Acceptors (NumHAcceptors)
    5. Topological Polar Surface Area (TPSA)
    6. Number of Rotatable Bonds (NumRotatableBonds)
    
    Args:
        smiles (str): A string representation of the molecule.
        
    Returns:
        np.ndarray: A 1D numpy array containing the 6 descriptors as floats.
        None: If the SMILES string is invalid.
    """
    try:
        # Generate RDKit molecule object from SMILES string
        mol = Chem.MolFromSmiles(smiles)
        
        # Check if the molecule was successfully instantiated
        if mol is None:
            raise ValueError(f"Invalid SMILES string provided: {smiles}")
            
        # Extract features
        mol_wt = Descriptors.MolWt(mol)
        log_p = Descriptors.MolLogP(mol)
        num_h_donors = Descriptors.NumHDonors(mol)
        num_h_acceptors = Descriptors.NumHAcceptors(mol)
        tpsa = Descriptors.TPSA(mol)
        num_rotatable_bonds = Descriptors.NumRotatableBonds(mol)
        
        # Combine into a numeric vector
        features = [
            mol_wt,
            log_p,
            num_h_donors,
            num_h_acceptors,
            tpsa,
            num_rotatable_bonds
        ]
        
        return np.array(features, dtype=float)
        
    except Exception as e:
        print(f"Error extracting features for SMILES '{smiles}': {e}")
        return None

if __name__ == "__main__":
    # Test valid SMILES (Aspirin)
    test_smiles = "CC(=O)OC1=CC=CC=C1C(=O)O"
    print(f"Testing Extracting Features for Aspirin: {test_smiles}")
    features = get_molecular_features(test_smiles)
    if features is not None:
        print("Extracted Features:", features)
        
    # Test invalid SMILES
    print("\nTesting Invalid SMILES: 'INVALID_SMILES'")
    invalid_features = get_molecular_features("INVALID_SMILES")
    if invalid_features is None:
        print("Handled invalid SMILES properly.")
