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
      // Priority: use specific fields if available, otherwise fallback to array
      weight: details.molecular_weight || details.weight || (details.descriptors ? details.descriptors[0] : 300),
      logp: details.logp !== undefined ? details.logp : (details.descriptors ? details.descriptors[1] : 2.5),
      hbd: details.hbd !== undefined ? details.hbd : (details.descriptors ? details.descriptors[2] : 2),
      hba: details.hba !== undefined ? details.hba : (details.descriptors ? details.descriptors[3] : 4),
      tpsa: details.tpsa !== undefined ? details.tpsa : (details.descriptors ? details.descriptors[4] : 70),
      rb: details.rotatable_bonds !== undefined ? details.rotatable_bonds : (details.descriptors ? details.descriptors[5] : 5),
      mr: details.molar_refractivity !== undefined ? details.molar_refractivity : (details.descriptors ? details.descriptors[6] : 60),
      descriptors: details.descriptors || [
        details.molecular_weight || 300,
        details.logp || 2.5,
        details.hbd || 2,
        details.hba || 4,
        details.tpsa || 70,
        details.rotatable_bonds || 5,
        details.molar_refractivity || 60
      ],
      eco_components: details.eco_components || { toxicity: 5, biodegradability: 5, persistence: 5 },
      individual_cost: details.individual_cost || 10,
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
    "Nurofen": "Ibuprofen",
    "Brufen": "Ibuprofen",
    "Aleve": "Naproxen",
    "Naprosyn": "Naproxen",
    "Anaprox": "Naproxen",
    "Aspirin": "Aspirin",
    "Bayer": "Aspirin",
    "Excedrin": "Aspirin",
    "Ecotrin": "Aspirin",
    "Tylenol": "Acetaminophen",
    "Panadol": "Acetaminophen",
    "Calpol": "Acetaminophen",
    "NyQuil": "Acetaminophen",
    "DayQuil": "Acetaminophen",
    "Theraflu": "Acetaminophen",
    "Voltaren": "Diclofenac",
    "Cataflam": "Diclofenac",
    "Zipsor": "Diclofenac",
    "Celebrex": "Celecoxib",
    "Celebra": "Celecoxib",
    "Mobic": "Meloxicam",
    "Vivlodex": "Meloxicam",
    "Indocin": "Indomethacin",
    "Tivorbex": "Indomethacin",
    "Toradol": "Ketorolac",
    "Sprix": "Ketorolac",
    "Feldene": "Piroxicam",
    "Relafen": "Nabumetone",
    "Lodine": "Etodolac",
    "Daypro": "Oxaprozin",
    "Disalcid": "Salsalate",
    "Clinoril": "Sulindac",
    "Tolectin": "Tolmetin",
    "Ponstel": "Mefenamic Acid",
    "Meclomen": "Meclofenamate",
    "Orudis": "Ketoprofen",
    "Oruvail": "Ketoprofen",
    "Ansaid": "Flurbiprofen"
  };
};
