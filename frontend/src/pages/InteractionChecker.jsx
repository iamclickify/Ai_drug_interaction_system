import React, { useState, useEffect } from 'react';
import { fetchDrugs, analyzeDrugs } from '../services/api';
import { ShieldAlert, AlertTriangle, CheckCircle, Info, Plus, Trash2, LayoutGrid, Leaf, DollarSign, Lightbulb } from 'lucide-react';

const InteractionChecker = () => {
  const [availableDrugs, setAvailableDrugs] = useState([]);
  const [selectedDrugs, setSelectedDrugs] = useState([]);
  const [currentDrug, setCurrentDrug] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDrugs = async () => {
      const data = await fetchDrugs();
      if (data.length === 0) {
        setError("Database unreachable. Please ensure the backend server is running on port 5000.");
      } else {
        setError(null);
      }
      setAvailableDrugs(data.sort((a, b) => a.drug_name.localeCompare(b.drug_name)));
    };
    loadDrugs();
  }, []);

  const addDrug = () => {
    if (!currentDrug) return;
    if (selectedDrugs.includes(currentDrug)) {
      setError("Drug already added.");
      return;
    }
    setSelectedDrugs([...selectedDrugs, currentDrug]);
    setCurrentDrug('');
    setError(null);
  };

  const removeDrug = (name) => {
    setSelectedDrugs(selectedDrugs.filter(d => d !== name));
    setAnalysis(null);
  };

  const handleAnalyze = async () => {
    if (selectedDrugs.length < 2) {
      setError("Please select at least two drugs to check interactions.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeDrugs(selectedDrugs);
      setAnalysis(result);
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (label) => {
    switch (label) {
      case 'Low': return 'var(--accent-secondary)';
      case 'Moderate': return 'var(--accent-warning)';
      case 'High': return 'var(--accent-danger)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="container">
      <h1 className="page-title">Drug Interaction AI</h1>
      <p className="page-subtitle">Analyze clinical interaction risks, environmental toxicity, and cost impact for complex drug regimens.</p>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <label className="form-label">Search & Add Drugs</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select 
                className="form-select"
                value={currentDrug}
                onChange={(e) => setCurrentDrug(e.target.value)}
              >
                <option value="">-- Select a drug --</option>
                {availableDrugs.map(d => (
                  <option key={d.id} value={d.drug_name}>{d.drug_name} ({d.category})</option>
                ))}
              </select>
              <button 
                onClick={addDrug}
                className="btn-primary"
                style={{ padding: '0 1rem', borderRadius: '0.5rem' }}
              >
                <Plus size={24} />
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {selectedDrugs.map(name => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', padding: '0.5rem 1rem', borderRadius: '2rem', border: '1px solid rgba(59, 130, 246, 0.2)', fontWeight: 600 }}>
              {name}
              <button onClick={() => removeDrug(name)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0 }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {selectedDrugs.length === 0 && <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No drugs selected yet...</p>}
        </div>

        <button 
          onClick={handleAnalyze}
          disabled={selectedDrugs.length < 2 || loading}
          className="btn-primary"
          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
        >
          {loading ? 'Analyzing Complexity...' : 'Analyze Regimen'}
        </button>

        {error && <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', borderRadius: '0.5rem', textAlign: 'center' }}>{error}</div>}
      </div>

      {analysis && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.5s ease' }}>
          
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div className="glass-card" style={{ borderTop: `4px solid ${getRiskColor(analysis.overall_risk_label)}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <ShieldAlert style={{ color: getRiskColor(analysis.overall_risk_label) }} />
                <h3 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Interaction Risk</h3>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: getRiskColor(analysis.overall_risk_label) }}>
                {analysis.overall_risk_label}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Based on {analysis.interactions.length} analyzed pair(s)</p>
            </div>

            <div className="glass-card" style={{ borderTop: '4px solid var(--accent-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Leaf style={{ color: 'var(--accent-secondary)' }} />
                <h3 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Eco Score</h3>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-secondary)' }}>{analysis.eco_score.toFixed(1)}/100</div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginTop: '0.75rem', overflow: 'hidden' }}>
                <div style={{ width: `${analysis.eco_score}%`, height: '100%', background: 'linear-gradient(to right, #10b981, #34d399)' }}></div>
              </div>
            </div>

            <div className="glass-card" style={{ borderTop: '4px solid var(--accent-warning)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <DollarSign style={{ color: 'var(--accent-warning)' }} />
                <h3 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated Cost</h3>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>${analysis.total_cost.toFixed(2)}</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Monthly estimate for regimen</p>
            </div>
          </div>

          {/* Interaction Details */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <LayoutGrid color="var(--accent-primary)" /> Interaction Breakdown
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {analysis.interactions.map((it, idx) => (
                <div key={idx} style={{ padding: '1.25rem', borderRadius: '0.75rem', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{it.pair[0]} + {it.pair[1]}</h4>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', padding: '0.25rem 0.5rem', borderRadius: '4px', background: `${getRiskColor(it.label)}20`, color: getRiskColor(it.label), border: `1px solid ${getRiskColor(it.label)}40` }}>
                      {it.label} Risk
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>{it.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div style={{ background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(167, 139, 250, 0.1))', padding: '2rem', borderRadius: '1rem', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
              <Lightbulb color="#fbbf24" /> Sustainable Recommendations
            </h2>
            {analysis.recommendations.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {analysis.recommendations.map((rec, idx) => (
                  <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Substitution for {rec.original}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                      Try <span style={{ color: 'var(--accent-secondary)', textDecoration: 'underline' }}>{rec.suggested}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{rec.reason}</p>
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.75rem', fontWeight: 700 }}>
                      <span style={{ color: 'var(--accent-secondary)' }}>+{rec.eco_benefit.toFixed(0)}% Eco Benefit</span>
                      <span style={{ color: rec.cost_diff <= 0 ? 'var(--accent-primary)' : 'var(--accent-warning)' }}>
                        {rec.cost_diff <= 0 ? `$${Math.abs(rec.cost_diff).toFixed(2)} cheaper` : `$${rec.cost_diff.toFixed(2)} more`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No specific alternatives found. Your current regimen selections are among the most sustainable in their class.</p>
            )}
          </div>
        </div>
      )}

      {/* Verified Sources Authentication Section */}
      <div style={{ marginTop: '4rem', padding: '2rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center' }}>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>
          Data Authenticity & Verified Sources
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem', opacity: 0.7 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
            <CheckCircle size={16} color="var(--accent-secondary)" /> EMA Environmental Risk
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
            <CheckCircle size={16} color="var(--accent-secondary)" /> Sustainable Healthcare Coalition
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
            <CheckCircle size={16} color="var(--accent-secondary)" /> PubChem Molecular Data
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
            <CheckCircle size={16} color="var(--accent-secondary)" /> NHS SDU Costing Models
          </div>
        </div>
        <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '800px', margin: '1.5rem auto 0', lineHeight: '1.6' }}>
          Sustainability scores and interaction profiles are generated using a high-fidelity simulation model predicated on 
          standardized ETR (Environmental Toxicity Rating) and PBT (Persistence, Bioaccumulation, Toxicity) benchmarks from the sources cited above.
        </p>
      </div>
    </div>
  );
};

export default InteractionChecker;
