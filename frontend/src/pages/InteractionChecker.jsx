import React, { useState, useEffect } from 'react';
import { fetchDrugs, checkInteraction } from '../services/api';
import { ShieldAlert, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const InteractionChecker = () => {
  const [drugs, setDrugs] = useState([]);
  const [drugA, setDrugA] = useState('');
  const [drugB, setDrugB] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDrugs = async () => {
      const data = await fetchDrugs();
      setDrugs(data.sort((a, b) => a.drug_name.localeCompare(b.drug_name)));
    };
    loadDrugs();
  }, []);

  const handleCheck = async () => {
    if (!drugA || !drugB) return;
    if (drugA === drugB) {
      setError("Please select two different drugs.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const analysis = await checkInteraction(drugA, drugB);
      setResult(analysis);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getRiskUIProps = (risk) => {
    switch (risk) {
      case 'Low':
        return { color: 'var(--accent-secondary)', icon: <CheckCircle size={32} /> };
      case 'Medium':
        return { color: 'var(--accent-warning)', icon: <AlertTriangle size={32} /> };
      case 'High':
        return { color: 'var(--accent-danger)', icon: <ShieldAlert size={32} /> };
      default:
        return { color: 'var(--text-primary)', icon: <Info size={32} /> };
    }
  };

  return (
    <div className="container">
      <h1 className="page-title">Interaction Checker</h1>
      <p className="page-subtitle">Cross-reference two medications to identify structural interactions and combined risks.</p>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Drug A</label>
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
            <label className="form-label">Drug B</label>
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
          onClick={handleCheck}
          disabled={!drugA || !drugB || loading}
          style={{ width: '100%', padding: '1rem', fontSize: '1.125rem' }}
        >
          {loading ? 'Analyzing Neural Linkages...' : 'Check Interaction'}
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

      {result && !loading && (
        <div className="glass-card" style={{ animation: 'fadeIn 0.5s ease', borderLeft: `4px solid ${getRiskUIProps(result.interaction_risk).color}` }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px dashed var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ color: getRiskUIProps(result.interaction_risk).color }}>
                 {getRiskUIProps(result.interaction_risk).icon}
              </div>
              <div>
                <h3 className="stat-label" style={{ marginBottom: '0.25rem' }}>Interaction Risk Level</h3>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: getRiskUIProps(result.interaction_risk).color }}>
                  {result.interaction_risk} Risk
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
               <h3 className="stat-label" style={{ marginBottom: '0.25rem' }}>Agents Analyzed</h3>
               <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>{drugA} + {drugB}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem', marginBottom: '2rem' }}>
            <div className="stat-block" style={{ background: 'rgba(0,0,0,0.2)' }}>
               <div className="stat-label">Combined Toxicity Risk</div>
               <div className="stat-value" style={{ color: result.combined_toxicity_estimate > 0.7 ? 'var(--accent-danger)' : 'var(--text-primary)' }}>
                  {(result.combined_toxicity_estimate * 100).toFixed(1)}%
               </div>
               <div className="progress-container">
                  <div 
                    className="progress-bar" 
                    style={{ 
                      width: `${Math.min(100, result.combined_toxicity_estimate * 100)}%`,
                      backgroundColor: result.combined_toxicity_estimate > 0.7 ? 'var(--accent-danger)' : 'var(--accent-warning)'
                    }}
                  ></div>
              </div>
            </div>

            <div style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '0.75rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <div className="stat-label" style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>Clinical Recommendation</div>
              <p style={{ fontSize: '1.125rem', lineHeight: '1.7' }}>
                {result.recommendation}
              </p>
            </div>
          </div>

          {/* Educational Mechanistic Explanation Container */}
          <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <h3 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Info size={24} color="var(--accent-primary)" />
                Pharmacological & Mechanistic Context
             </h3>
             <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--accent-warning)' }}>Educational Reference Only:</strong> The interaction rationale below is generated by combining the known mechanistic properties of the selected NSAIDs.
             </p>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Drug A Panel */}
                <div style={{ background: 'rgba(0,0,0,0.15)', padding: '1.5rem', borderRadius: '0.5rem', borderLeft: '3px solid #60a5fa' }}>
                   <h4 style={{ color: '#60a5fa', marginBottom: '1rem', fontSize: '1.1rem' }}>{drugA} Profile</h4>
                   {result.pharmacology_a && (
                      <div style={{ marginBottom: '1rem' }}>
                         <div className="stat-label" style={{ color: 'var(--text-secondary)' }}>Pharmacology</div>
                         <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>{result.pharmacology_a}</p>
                      </div>
                   )}
                   {result.mechanistic_a && (
                      <div>
                         <div className="stat-label" style={{ color: 'var(--text-secondary)' }}>Mechanism</div>
                         <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>{result.mechanistic_a}</p>
                      </div>
                   )}
                </div>

                {/* Drug B Panel */}
                <div style={{ background: 'rgba(0,0,0,0.15)', padding: '1.5rem', borderRadius: '0.5rem', borderLeft: '3px solid #a78bfa' }}>
                   <h4 style={{ color: '#a78bfa', marginBottom: '1rem', fontSize: '1.1rem' }}>{drugB} Profile</h4>
                   {result.pharmacology_b && (
                      <div style={{ marginBottom: '1rem' }}>
                         <div className="stat-label" style={{ color: 'var(--text-secondary)' }}>Pharmacology</div>
                         <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>{result.pharmacology_b}</p>
                      </div>
                   )}
                   {result.mechanistic_b && (
                      <div>
                         <div className="stat-label" style={{ color: 'var(--text-secondary)' }}>Mechanism</div>
                         <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>{result.mechanistic_b}</p>
                      </div>
                   )}
                </div>
             </div>

             <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid rgba(245, 158, 11, 0.2)', marginTop: '0.5rem' }}>
                <div className="stat-label" style={{ color: 'var(--accent-warning)', marginBottom: '0.5rem' }}>Combined Pathway Interaction Analysis</div>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                   Concurrent administration of two NSAIDs yields no synergistic anti-inflammatory efficacy while strictly compounding the adverse effect profile. Specifically, dual blockades of constitutive COX-1 exponentially decrease synthesis of cytoprotective gastric prostaglandins, leading to high ulceration risk. Furthermore, dual competition for hepatic CYP450 enzymes (such as CYP2C9) and plasma protein binding sites (albumin) can unpredictably alter the pharmacokinetics and free-fraction concentrations of both {drugA} and {drugB}.
                </p>
             </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default InteractionChecker;
