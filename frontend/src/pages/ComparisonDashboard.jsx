import React, { useState, useEffect } from 'react';
import { fetchDrugs, predictDrug } from '../services/api';
import Tooltip from '../components/Tooltip';
import { Share2, Users } from 'lucide-react';
import { useRole } from '../context/RoleContext';

const ComparisonDashboard = () => {
  const { role } = useRole();
  const [drugs, setDrugs] = useState([]);
  const [drugA, setDrugA] = useState('');
  const [drugB, setDrugB] = useState('');
  const [results, setResults] = useState(null);
  const [similarityScore, setSimilarityScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Scenario state
  const [scenarioAge, setScenarioAge] = useState('Adult');
  const [scenarioCondition, setScenarioCondition] = useState('Osteoarthritis');
  const [scenarioDuration, setScenarioDuration] = useState('Chronic');
  const [scenarioAnalysis, setScenarioAnalysis] = useState(null);

  useEffect(() => {
    const loadDrugs = async () => {
      const data = await fetchDrugs();
      setDrugs(data.sort((a, b) => a.drug_name.localeCompare(b.drug_name)));
    };
    loadDrugs();
  }, []);

  const fetchSimilarity = async (dA, dB) => {
    try {
      const res = await fetch('http://localhost:5000/similarity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drugA: dA, drugB: dB })
      });
      const data = await res.json();
      if (res.ok) setSimilarityScore(data.similarity_score);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompare = async () => {
    if (!drugA || !drugB) return;
    if (drugA === drugB) {
      setError("Please select two different NSAIDs to compare.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setResults(null);
    setScenarioAnalysis(null);
    
    try {
      const [resA, resB] = await Promise.all([
        predictDrug(drugA),
        predictDrug(drugB)
      ]);
      setResults([resA, resB]);
      await fetchSimilarity(drugA, drugB);
    } catch (err) {
      setError("Failed to generate predictive comparison.");
    } finally {
      setLoading(false);
    }
  };

  const runScenario = () => {
    if (!results) return;
    // Educational simple logic just based on the data
    const d1 = results[0];
    const d2 = results[1];
    
    let analysis = `Based on a ${scenarioAge} patient requiring ${scenarioDuration} treatment for ${scenarioCondition}:\n\n`;
    
    if (scenarioDuration === 'Chronic' || scenarioAge === 'Elderly') {
      const saferGI = (d1.gi_toxicity_risk === 'Low' || d1.gi_toxicity_risk === 'Low-Moderate') ? d1.drug_name : 
                     (d2.gi_toxicity_risk === 'Low' || d2.gi_toxicity_risk === 'Low-Moderate') ? d2.drug_name : null;
      
      if (saferGI) {
         analysis += `➤ For chronic/elderly populations where upper GI bleeding is a major concern, NSAIDs with lower GI toxicity risk like **${saferGI}** are generally preferred over agents with higher baseline COX-1 blockade.\n`;
      } else {
         analysis += `➤ Both **${d1.drug_name}** and **${d2.drug_name}** carry elevated GI risk (${d1.gi_toxicity_risk} and ${d2.gi_toxicity_risk} respectively). Co-administration of a PPI might be pharmacologically indicated.\n`;
      }

      if (d1.cardio_risk === 'High' || d2.cardio_risk === 'High') {
         analysis += `➤ *CAUTION:* COX-2 selective agents like **${d1.cardio_risk==='High'?d1.drug_name:d2.drug_name}** increase thrombotic cardiovascular risk, an important factor in elderly patients.\n`;
      }
    } else {
      analysis += `➤ For acute/short-term scenarios, rapid onset agents are typically desired. **${d1.drug_name}** Half-life: ${d1.half_life} | **${d2.drug_name}** Half-life: ${d2.half_life}.\n`;
    }

    setScenarioAnalysis(analysis);
  };

  const getRiskColor = (riskStr) => {
      if (!riskStr) return 'var(--text-primary)';
      if (riskStr.includes('Low')) return 'var(--accent-secondary)';
      if (riskStr.includes('Moderate') || riskStr.includes('Medium')) return 'var(--accent-warning)';
      return 'var(--accent-danger)';
  };

  return (
    <div className="container">
      <h1 className="page-title">Drug Comparison Tool</h1>
      <p className="page-subtitle">Analyze structural similarities, molecular descriptors, and clinical scenarios.</p>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">First NSAID</label>
            <select 
              className="form-select"
              value={drugA}
              onChange={(e) => setDrugA(e.target.value)}
            >
              <option value="">-- Select First Drug --</option>
              {drugs.map(drug => (
                <option key={drug.id} value={drug.drug_name}>{drug.drug_name}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Second NSAID</label>
            <select 
              className="form-select"
              value={drugB}
              onChange={(e) => setDrugB(e.target.value)}
            >
              <option value="">-- Select Second Drug --</option>
              {drugs.map(drug => (
                <option key={drug.id} value={drug.drug_name}>{drug.drug_name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <button 
          className="btn-primary" 
          onClick={handleCompare}
          disabled={!drugA || !drugB || loading}
          style={{ width: '100%', padding: '1rem', fontSize: '1.125rem' }}
        >
          {loading ? 'Generating Analysis...' : 'Compare Side-by-Side'}
        </button>

        {error && (
          <div style={{ color: 'var(--accent-danger)', marginTop: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem', textAlign: 'center' }}>
            {error}
          </div>
        )}
      </div>

      {loading && (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      )}

      {results && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.5s ease' }}>
          
          {/* MAIN TABLE */}
          <div className="glass-card" style={{ padding: 0, overflow: 'x-auto' }}>
            <table>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                  <th style={{ width: '25%', paddingLeft: '2rem' }}>Pharmacological Metric</th>
                  <th style={{ width: '37.5%' }}>
                     <div style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{drugA}</div>
                     <div style={{ fontSize: '0.875rem', fontWeight: 400, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{results[0].iupac_name}</div>
                  </th>
                  <th style={{ width: '37.5%' }}>
                    <div style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{drugB}</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 400, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{results[1].iupac_name}</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* CLINICAL */}
                <tr>
                   <td colSpan="3" style={{ padding: '0.75rem 2rem', background: 'rgba(0,0,0,0.2)', color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase' }}>Clinical Profile</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '2rem', fontWeight: 600 }}><Tooltip term="Half-life" explanation="Plasma concentration halving time">Half-life</Tooltip></td>
                  <td>{results[0].half_life}</td>
                  <td>{results[1].half_life}</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '2rem', fontWeight: 600 }}>Typical Dose</td>
                  <td>{results[0].dosage_range}</td>
                  <td>{results[1].dosage_range}</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '2rem', fontWeight: 600 }}><Tooltip term="COX Selectivity" explanation="Ratio of COX-2 vs COX-1 inhibition.">COX Selectivity</Tooltip></td>
                  <td>{results[0].cox_selectivity}</td>
                  <td>{results[1].cox_selectivity}</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '2rem', fontWeight: 600 }}>GI Toxicity Risk</td>
                   <td>
                    <div style={{ color: getRiskColor(results[0].gi_toxicity_risk), fontWeight: 700 }}>{results[0].gi_toxicity_risk}</div>
                  </td>
                  <td>
                     <div style={{ color: getRiskColor(results[1].gi_toxicity_risk), fontWeight: 700 }}>{results[1].gi_toxicity_risk}</div>
                  </td>
                </tr>
                 <tr>
                  <td style={{ paddingLeft: '2rem', fontWeight: 600 }}>Cardiovascular Risk</td>
                   <td>
                    <div style={{ color: getRiskColor(results[0].cardio_risk), fontWeight: 700 }}>{results[0].cardio_risk}</div>
                  </td>
                  <td>
                     <div style={{ color: getRiskColor(results[1].cardio_risk), fontWeight: 700 }}>{results[1].cardio_risk}</div>
                  </td>
                </tr>

                {/* DESCRIPTORS (Researcher Only) */}
                {role === 'researcher' && (
                  <>
                    <tr>
                       <td colSpan="3" style={{ padding: '0.75rem 2rem', background: 'rgba(0,0,0,0.2)', color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase' }}>Molecular Descriptors</td>
                    </tr>
                    <tr>
                       <td style={{ paddingLeft: '2rem', fontWeight: 600 }}>Molecular Weight</td>
                       <td>{results[0].weight ? results[0].weight.toFixed(1) : results[0].descriptors[0].toFixed(1)} g/mol</td>
                       <td>{results[1].weight ? results[1].weight.toFixed(1) : results[1].descriptors[0].toFixed(1)} g/mol</td>
                    </tr>
                    <tr>
                       <td style={{ paddingLeft: '2rem', fontWeight: 600 }}><Tooltip term="LogP" explanation="Lipophilicity metric">LogP</Tooltip></td>
                       <td>{results[0].descriptors[1].toFixed(2)}</td>
                       <td>{results[1].descriptors[1].toFixed(2)}</td>
                    </tr>
                    <tr>
                       <td style={{ paddingLeft: '2rem', fontWeight: 600 }}><Tooltip term="TPSA" explanation="Topological Polar Surface Area">TPSA</Tooltip></td>
                       <td>{results[0].descriptors[4].toFixed(1)} Å²</td>
                       <td>{results[1].descriptors[4].toFixed(1)} Å²</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );
};

export default ComparisonDashboard;

