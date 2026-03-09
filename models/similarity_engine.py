from rdkit import Chem
from rdkit.Chem import AllChem
from rdkit import DataStructs

def calculate_similarity(smilesA, smilesB):
    """
    Calculates the Tanimoto similarity between two molecules
    using Morgan fingerprints (ECFP4 equivalent, radius 2).

    Args:
        smilesA (str): SMILES string for first molecule.
        smilesB (str): SMILES string for second molecule.

    Returns:
        float: Tanimoto similarity score (0.0 to 1.0).
        None if either SMILES string is invalid.
    """
    try:
        molA = Chem.MolFromSmiles(smilesA)
        molB = Chem.MolFromSmiles(smilesB)

        if molA is None or molB is None:
            return None

        # Generate Morgan fingerprints
        fpA = AllChem.GetMorganFingerprintAsBitVect(molA, 2, nBits=2048)
        fpB = AllChem.GetMorganFingerprintAsBitVect(molB, 2, nBits=2048)

        # Calculate Tanimoto similarity
        similarity = DataStructs.TanimotoSimilarity(fpA, fpB)
        
        return float(similarity)
    except Exception as e:
        print(f"Error calculating similarity for {smilesA} and {smilesB}: {e}")
        return None

if __name__ == "__main__":
    aspirin = "CC(=O)OC1=CC=CC=C1C(=O)O"
    ibuprofen = "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O"
    sim = calculate_similarity(aspirin, ibuprofen)
    print(f"Similarity between Aspirin and Ibuprofen: {sim}")
