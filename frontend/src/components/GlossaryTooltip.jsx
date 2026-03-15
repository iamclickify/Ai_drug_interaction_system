import React from 'react';
import Tooltip from './Tooltip';

const glossary = {
  "LogP": "Partition coefficient. A measure of lipophilicity (fat-solubility). High LogP (>5) suggests the drug crosses membranes easily but may have poor water solubility.",
  "TPSA": "Topological Polar Surface Area. Values < 140 Å² are generally good for cell membrane permeability and intestinal absorption.",
  "SMILES": "Simplified Molecular Input Line Entry System. A notation system for representing chemical structures as strings of text.",
  "Half-life": "The time required for the concentration of a drug in the body to reduce by 50%. Dictates dosing frequency.",
  "Vd": "Volume of Distribution. A theoretical volume that relates the amount of drug in the body to the concentration in the plasma.",
  "Clearance": "The rate at which the active drug is removed from the body per unit of time (L/hr).",
  "CYP450": "Cytochrome P450 enzymes. A major family of enzymes responsible for the metabolism of most drugs in the liver.",
  "COX-1": "An enzyme that protects the stomach lining and supports kidney function. Inhibition causes most NSAID side effects.",
  "COX-2": "An enzyme primarily responsible for pain and inflammation at injury sites.",
  "Ro5": "Lipinski's Rule of Five. A rule of thumb to evaluate druglikeness and oral bioavailability.",
  "MW": "Molecular Weight. Smaller molecules (< 500 Da) are generally more likely to be absorbed orally.",
  "HBD": "Hydrogen Bond Donors. At least one hydrogen atom attached to an electronegative atom (N, O, S).",
  "HBA": "Hydrogen Bond Acceptors. Atoms with lone pairs (N, O, S) that can accept a hydrogen bond.",
  "Bioavailability": "The fraction of an administered dose of unchanged drug that reaches the systemic circulation.",
  "Protein Binding": "The degree to which a drug attaches to proteins within the blood, such as albumin. Only 'free' drug is active.",
  "IUPAC": "International Union of Pure and Applied Chemistry. The standard naming system for chemical compounds.",
  "SAR": "Structure-Activity Relationship. The relationship between the chemical structure of a molecule and its biological activity.",
  "Enantiomer": "One of a pair of optical isomers that are mirror images of each other. Often one is active while the other is inactive or toxic.",
  "NSAID": "Non-Steroidal Anti-Inflammatory Drug. A class of drugs that reduce pain, decrease fever, prevent blood clots and, in higher doses, decrease inflammation.",
  "GI": "Gastrointestinal. Relating to the stomach and the intestines.",
  "Prostaglandin": "Lipid compounds that have diverse hormone-like effects, including mediating inflammation and protecting the stomach lining.",
  "In vivo": "Processes or studies performed or taking place in a living organism.",
  "OTC": "Over-the-Counter. Medicines that can be sold directly to people without a prescription.",
  "PPI": "Proton Pump Inhibitor. Medication that reduces the amount of acid produced by the stomach, often used to prevent NSAID-induced ulcers.",
  "Potency": "A measure of drug activity expressed in terms of the amount required to produce an effect of given intensity.",
  "Cationic": "Positively charged. Important for ionic bonding in enzyme active sites."
};

const GlossaryTooltip = ({ term, children }) => {
  const explanation = glossary[term] || "Terminology detail for pharmacological analysis.";
  
  return (
    <Tooltip term={term} explanation={explanation}>
      {children}
    </Tooltip>
  );
};

export default GlossaryTooltip;
