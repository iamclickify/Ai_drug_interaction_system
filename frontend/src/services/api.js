import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const fetchDrugs = async () => {
  try {
    const response = await axios.get(`${API_URL}/drugs`);
    return response.data;
  } catch (error) {
    console.error("Error fetching drugs", error);
    return [];
  }
};

export const analyzeDrugs = async (drugNames) => {
  try {
    const response = await axios.post(`${API_URL}/analyze`, { drug_names: drugNames });
    return response.data;
  } catch (error) {
    console.error("Error analyzing drugs", error);
    throw error;
  }
};

export const predictDrug = async (drugName) => {
  try {
    const res = await analyzeDrugs([drugName]);
    // Map new analysis format to old predict format for compatibility
    const details = res.drug_details && res.drug_details[0] ? res.drug_details[0] : {};
    return {
      ...res,
      ...details,
      drug_name: drugName,
      toxicity_risk: res.overall_risk_label,
      effectiveness_score: 85,
      sustainability_score: res.eco_score,
      // Use real descriptors if available
      descriptors: details.descriptors || [300, 2.5, 2, 4, 70, 5], 
      iupac_name: details.iupac_name || "Generic IUPAC Name",
      smiles: details.smiles || "C1=CC=CC=C1"
    };
  } catch (error) {
    console.error("Error predicting drug", error);
    throw error;
  }
};

export const checkInteraction = async (drugA, drugB) => {
  try {
    const res = await analyzeDrugs([drugA, drugB]);
    const inter = res.interactions.find(i => 
      (i.pair[0] === drugA && i.pair[1] === drugB) || 
      (i.pair[0] === drugB && i.pair[1] === drugA)
    );
    return {
      interaction_risk: inter ? inter.label : 'Low',
      combined_toxicity_estimate: inter ? inter.score / 100 : 0.1,
      recommendation: inter ? inter.explanation : 'No interaction detected.',
    };
  } catch (error) {
    console.error("Error checking interaction", error);
    throw error;
  }
};

// Phase 2: OTC Brand Dictionary (Hardcoded for frontend speed)
export const getBrandMap = () => {
  return {
    "Advil": "Ibuprofen",
    "Motrin": "Ibuprofen",
    "Aleve": "Naproxen",
    "Naprosyn": "Naproxen",
    "Aspirin": "Aspirin",
    "Bayer": "Aspirin",
    "Excedrin": "Aspirin", // (mixed, but contains aspirin)
    "Tylenol": "Acetaminophen", // Not an NSAID, but crucial for collision detection
    "NyQuil": "Acetaminophen",
    "DayQuil": "Acetaminophen",
    "Theraflu": "Acetaminophen",
    "Voltaren": "Diclofenac",
    "Cataflam": "Diclofenac",
    "Celebrex": "Celecoxib",
    "Mobic": "Meloxicam",
    "Indocin": "Indomethacin",
    "Toradol": "Ketorolac",
    "Feldene": "Piroxicam",
    "Relafen": "Nabumetone"
  };
};
