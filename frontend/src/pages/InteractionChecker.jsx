import React, { useState, useEffect } from 'react';
import { fetchDrugs, checkInteraction } from '../services/api';
import { ShieldAlert, AlertTriangle, CheckCircle, Info, Plus, Trash2, LayoutGrid } from 'lucide-react';

const InteractionChecker = () => {
  const [drugs, setDrugs] = useState([]);
  const [selectedDrugs, setSelectedDrugs] = useState([]);
  const [currentDrug, setCurrentDrug] = useState('');
  const [results, setResults] = useState([]);
  const [regimenRisk, setRegimenRisk] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDrugs = async () => {
      const data = await fetchDrugs();
      setDrugs(data.sort((a, b) => a.drug_name.localeCompare(b.drug_name)));
    };
    loadDrugs();
  }, []);

  const addDrug = () => {
    if (!currentDrug) return;
    if (selectedDrugs.includes(currentDrug)) {
      setError("Drug already added to regimen.");
      return;
    }
    if (selectedDrugs.length >= 5) {
      setError("Maximum 5 drugs allowed for polypharmacy analysis.");
      return;
    }
    setSelectedDrugs([...selectedDrugs, currentDrug]);
    setCurrentDrug('');
    setError(null);
  };

  const removeDrug = (name) => {
    setSelectedDrugs(selectedDrugs.filter(d => d !== name));
    setRegimenRisk(null);
    setResults([]);
  };

  const handleCheck = async () => {
    if (selectedDrugs.length < 2) {
      setError("Please select at least two drugs for interaction analysis.");
      return;
    }
    
    setLoading(true);
    setError(null);
    const pairResults = [];
    
    try {
      // Analyze all pairs
      for (let i = 0; i < selectedDrugs.length; i++) {
        for (let j = i + 1; j < selectedDrugs.length; j++) {
          const res = await checkInteraction(selectedDrugs[i], selectedDrugs[j]);
          pairResults.push({
            pair: [selectedDrugs[i], selectedDrugs[j]],
            ...res
          });
        }
      }
      
      setResults(pairResults);
      
      // Calculate Overall Regimen Risk
      const maxRisk = pairResults.reduce((acc, r) => {
        const levels = { 'Low': 1, 'Moderate': 2, 'High': 3 };
        return Math.max(acc, levels[r.interaction_risk] || 0);
      }, 0);
      
      const riskMapping = { 1: 'Low', 2: 'Moderate', 3: 'High' };
      setRegimenRisk(riskMapping[maxRisk] || 'Low');

    } catch (err) {
      setError(err.response?.data?.error || "An error occurred during multi-drug analysis.");
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
      <h1 className="page-title">Polypharmacy Interaction Analyzer</h1>
      <p className="page-subtitle">Analyze complex medication regimens. Add up to 5 drugs to identify multi-way interactions and compounding toxicities.</p>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label className="form-label">Add Drug to Regimen</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select 
                className="form-select"
                value={currentDrug}
                onChange={(e) => setCurrentDrug(e.target.value)}
              >
                <option value="">-- Search Drugs --</option>
                {drugs.map(drug => (
                  <option key={drug.id} value={drug.drug_name}>{drug.drug_name}</option>
                ))}
              </select>
              <button className="btn-secondary" onClick={addDrug} style={{ padding: '0.75rem' }}>
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Selected Regimen Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {selectedDrugs.map(name => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '2rem', color: 'var(--text-primary)' }}>
              <span style={{ fontWeight: 600 }}>{name}</span>
              <Trash2 size={14} style={{ cursor: 'pointer', color: 'var(--accent-danger)' }} onClick={() => removeDrug(name)} />
            </div>
          ))}
          {selectedDrugs.length === 0 && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>No drugs added yet. Use the search above.</p>
          )}
        </div>
        
        <button 
          className="btn-primary" 
          onClick={handleCheck}
          disabled={selectedDrugs.length < 2 || loading}
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

      {regimenRisk && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Regimen Summary Card */}
          <div className="glass-card" style={{ borderLeft: `4px solid ${getRiskUIProps(regimenRisk).color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ color: getRiskUIProps(regimenRisk).color }}>
                  {getRiskUIProps(regimenRisk).icon}
                </div>
                <div>
                  <h3 className="stat-label" style={{ marginBottom: '0.25rem' }}>Regimen Safety Profile</h3>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: getRiskUIProps(regimenRisk).color }}>
                    {regimenRisk} Combined Risk
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 className="stat-label" style={{ marginBottom: '0.25rem' }}>Regimen Composition</h3>
                <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{selectedDrugs.join(' + ')}</div>
              </div>
            </div>
          </div>

          {/* Risk Matrix Title */}
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LayoutGrid size={24} color="var(--accent-primary)" />
            Regimen Interaction Matrix
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
            {results.map((res, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', border: `1px solid ${getRiskUIProps(res.interaction_risk).color}22` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{res.pair[0]} ↔ {res.pair[1]}</div>
                  <span className="badge" style={{ background: `${getRiskUIProps(res.interaction_risk).color}22`, color: getRiskUIProps(res.interaction_risk).color }}>
                    {res.interaction_risk}
                  </span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {res.recommendation}
                </p>
                <div style={{ marginTop: '1rem', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                  <div style={{ width: `${res.combined_toxicity_estimate * 100}%`, height: '100%', background: getRiskUIProps(res.interaction_risk).color, borderRadius: '2px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractionChecker;
