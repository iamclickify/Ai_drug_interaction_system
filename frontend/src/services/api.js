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

export const predictDrug = async (drugName) => {
  try {
    const response = await axios.post(`${API_URL}/predict`, { drug_name: drugName });
    return response.data;
  } catch (error) {
    console.error("Error predicting drug", error);
    throw error;
  }
};

export const checkInteraction = async (drugA, drugB) => {
  try {
    const response = await axios.post(`${API_URL}/interaction`, { drugA, drugB });
    return response.data;
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
