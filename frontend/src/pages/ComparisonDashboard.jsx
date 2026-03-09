import React, { useState, useEffect } from 'react';
import { fetchDrugs, predictDrug } from '../services/api';

const ComparisonDashboard = () => {
  const [drugs, setDrugs] = useState([]);
  const [drugA, setDrugA] = useState('');
  const [drugB, setDrugB] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDrugs = async () => {
      const data = await fetchDrugs();
      setDrugs(data.sort((a, b) => a.drug_name.localeCompare(b.drug_name)));
    };
    loadDrugs();
  }, []);

  const handleCompare = async () => {
    if (!drugA || !drugB) return;
    if (drugA === drugB) {
      setError("Please select two different drugs to compare.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const [resA, resB] = await Promise.all([
        predictDrug(drugA),
        predictDrug(drugB)
      ]);
      // The API now returns a flat dictionary structure
      setResults([resA, resB]);
    } catch (err) {
      setError("Failed to generate predictive comparison.");
    } finally {
      setLoading(false);
    }
  };

  const getAccuracyColor = (val, inv = false) => {
    const perc = val * 100;
    if (inv) {
      if (perc < 30) return 'var(--accent-secondary)'; // Green
      if (perc < 70) return 'var(--accent-warning)';   // Yellow
      return 'var(--accent-danger)';                   // Red
    }
    if (perc > 70) return 'var(--accent-secondary)'; // Green
    if (perc > 30) return 'var(--accent-warning)';   // Yellow
    return 'var(--accent-danger)';                   // Red
  };

  const getRiskColor = (riskStr) => {
      if (riskStr === 'Low') return 'var(--accent-secondary)';
      if (riskStr === 'Medium' || riskStr === 'Moderate') return 'var(--accent-warning)';
      return 'var(--accent-danger)';
  };

  return (
    <div className="container">
      <h1 className="page-title">Comparison Dashboard</h1>
      <p className="page-subtitle">Analyze structured predictive differences between two medications side-by-side.</p>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">First Drug</label>
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
            <label className="form-label">Second Drug</label>
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
          {loading ? 'Generating Analysis Grid...' : 'Compare Side-by-Side'}
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
        <div className="glass-card" style={{ animation: 'fadeIn 0.5s ease', padding: 0, overflow: 'hidden' }}>
          <table>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                <th style={{ width: '20%', paddingLeft: '2rem' }}>Metric Base</th>
                <th style={{ width: '40%' }}>
                   <div style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{drugA}</div>
                   <div style={{ fontSize: '0.875rem', fontWeight: 400, fontFamily: 'monospace' }}>{results[0].smiles.substring(0,20)}...</div>
                </th>
                <th style={{ width: '40%' }}>
                  <div style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{drugB}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 400, fontFamily: 'monospace' }}>{results[1].smiles.substring(0,20)}...</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {/* PRIMARY PREDICTIONS */}
              <tr>
                 <td colSpan="3" style={{ padding: '1rem 2rem', background: 'rgba(0,0,0,0.1)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase' }}>AI Predictions</td>
              </tr>
              <tr>
                <td style={{ paddingLeft: '2rem', fontWeight: 600 }}>Projected Effectiveness</td>
                <td>
                  <div style={{ color: getAccuracyColor(results[0].effectiveness_score), fontWeight: 700, fontSize: '1.25rem' }}>
                    {(results[0].effectiveness_score * 100).toFixed(1)}%
                  </div>
                </td>
                <td>
                   <div style={{ color: getAccuracyColor(results[1].effectiveness_score), fontWeight: 700, fontSize: '1.25rem' }}>
                    {(results[1].effectiveness_score * 100).toFixed(1)}%
                  </div>
                </td>
              </tr>
              <tr>
                <td style={{ paddingLeft: '2rem', fontWeight: 600 }}>Toxicity Risk</td>
                 <td>
                  <div style={{ color: getRiskColor(results[0].toxicity_risk), fontWeight: 700, fontSize: '1.25rem' }}>
                    {results[0].toxicity_risk}
                  </div>
                </td>
                <td>
                   <div style={{ color: getRiskColor(results[1].toxicity_risk), fontWeight: 700, fontSize: '1.25rem' }}>
                    {results[1].toxicity_risk}
                  </div>
                </td>
              </tr>
              <tr>
                <td style={{ paddingLeft: '2rem', fontWeight: 600 }}>Sustainability Score</td>
                <td>
                  <div style={{ color: getAccuracyColor(results[0].sustainability_score), fontWeight: 700, fontSize: '1.25rem' }}>
                    {(results[0].sustainability_score * 100).toFixed(1)}%
                  </div>
                </td>
                <td>
                   <div style={{ color: getAccuracyColor(results[1].sustainability_score), fontWeight: 700, fontSize: '1.25rem' }}>
                    {(results[1].sustainability_score * 100).toFixed(1)}%
                  </div>
                </td>
              </tr>
              
              {/* DESCRIPTORS */}
              <tr>
                 <td colSpan="3" style={{ padding: '1rem 2rem', background: 'rgba(0,0,0,0.1)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase' }}>Molecular Vectors</td>
              </tr>
              <tr>
                 <td style={{ paddingLeft: '2rem' }}>Molecular Weight</td>
                 <td style={{ fontWeight: 600 }}>{results[0].descriptors[0].toFixed(1)}</td>
                 <td style={{ fontWeight: 600 }}>{results[1].descriptors[0].toFixed(1)}</td>
              </tr>
              <tr>
                 <td style={{ paddingLeft: '2rem' }}>LogP</td>
                 <td style={{ fontWeight: 600 }}>{results[0].descriptors[1].toFixed(2)}</td>
                 <td style={{ fontWeight: 600 }}>{results[1].descriptors[1].toFixed(2)}</td>
              </tr>
              <tr>
                 <td style={{ paddingLeft: '2rem' }}>H-Bond Donors</td>
                 <td style={{ fontWeight: 600 }}>{results[0].descriptors[2]}</td>
                 <td style={{ fontWeight: 600 }}>{results[1].descriptors[2]}</td>
              </tr>
              <tr>
                 <td style={{ paddingLeft: '2rem' }}>H-Bond Acceptors</td>
                 <td style={{ fontWeight: 600 }}>{results[0].descriptors[3]}</td>
                 <td style={{ fontWeight: 600 }}>{results[1].descriptors[3]}</td>
              </tr>
              <tr>
                 <td style={{ paddingLeft: '2rem' }}>TPSA</td>
                 <td style={{ fontWeight: 600 }}>{results[0].descriptors[4].toFixed(1)}</td>
                 <td style={{ fontWeight: 600 }}>{results[1].descriptors[4].toFixed(1)}</td>
              </tr>
              <tr>
                 <td style={{ paddingLeft: '2rem' }}>Rotatable Bonds</td>
                 <td style={{ fontWeight: 600 }}>{results[0].descriptors[5]}</td>
                 <td style={{ fontWeight: 600 }}>{results[1].descriptors[5]}</td>
              </tr>

            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ComparisonDashboard;
