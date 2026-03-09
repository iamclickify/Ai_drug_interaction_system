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
