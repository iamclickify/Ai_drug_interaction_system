import React, { useState, useEffect, useRef } from 'react';
import { fetchDrugs, predictDrug } from '../services/api';

const DrugExplorer = () => {
  const [drugs, setDrugs] = useState([]);
  const [selectedDrug, setSelectedDrug] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const viewerRef = useRef(null);
  const viewerInstance = useRef(null);

  useEffect(() => {
    const loadDrugs = async () => {
      const data = await fetchDrugs();
      setDrugs(data.sort((a, b) => a.drug_name.localeCompare(b.drug_name)));
    };
    loadDrugs();
  }, []);

  // Effect to initialize or update the 3Dmol viewer when prediction changes
  useEffect(() => {
    if (prediction && prediction.smiles && viewerRef.current && window.$3Dmol) {
      // Clear container and initialize
      viewerRef.current.innerHTML = '';
      
      const config = { backgroundColor: 'transparent' };
      viewerInstance.current = window.$3Dmol.createViewer(viewerRef.current, config);
      
      const viewer = viewerInstance.current;
      
      const load3DModel = async () => {
        try {
           // Try 3D SDF by Name first (most reliable for canonical names)
           let response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(selectedDrug)}/SDF?record_type=3d`);
           if (!response.ok) {
              // Try 3D SDF by SMILES
              response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(prediction.smiles)}/SDF?record_type=3d`);
           }
           if (!response.ok) {
              // Try 2D SDF by Name
              response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(selectedDrug)}/SDF?record_type=2d`);
           }
           
           if (response.ok) {
             const modelData = await response.text();
             viewer.addModel(modelData, "sdf");
             viewer.setStyle({}, { stick: { colorscheme: 'Jmol', radius: 0.15 }, sphere: { scale: 0.3 } });
             viewer.zoomTo();
             viewer.render();
             viewer.spin("y", 1);
           } else {
             throw new Error("Could not fetch structure from PubChem");
           }
        } catch (err) {
           console.warn("3D Viewer error:", err);
           if (viewerRef.current) {
             viewerRef.current.innerHTML = "<div style='padding:1rem;color:var(--text-secondary);text-align:center;margin-top:2rem;'>3D Structure unavailable<br/>for this compound.</div>";
           }
        }
      };
      
      load3DModel();
    }
    
    // Cleanup spin on unmount
    return () => {
      if (viewerInstance.current) {
        viewerInstance.current.stopAnimate();
      }
    };
  }, [prediction]);

  const handlePredict = async () => {
    if (!selectedDrug) return;
    
    setLoading(true);
    setError(null);
    setPrediction(null);
    if (viewerInstance.current) {
      viewerInstance.current.clear();
    }
    
    try {
      const result = await predictDrug(selectedDrug);
      setPrediction(result);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
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
      <h1 className="page-title">Drug Explorer</h1>
      <p className="page-subtitle">Analyze single pharmaceutical compounds using predictive AI and 3D Visualizations.</p>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div className="form-group">
          <label className="form-label">Select a Medication to Analyze</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <select 
              className="form-select"
              value={selectedDrug}
              onChange={(e) => setSelectedDrug(e.target.value)}
            >
              <option value="">-- Select a Drug --</option>
              {drugs.map(drug => (
                <option key={drug.id} value={drug.drug_name}>
                  {drug.drug_name} ({drug.drug_class || drug.category})
                </option>
              ))}
            </select>
            <button 
              className="btn-primary" 
              onClick={handlePredict}
              disabled={!selectedDrug || loading}
              style={{ padding: '0 2rem' }}
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>
        
        {error && (
          <div style={{ color: 'var(--accent-danger)', marginTop: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>
            {error}
          </div>
        )}
      </div>

      {loading && (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      )}

      {prediction && !loading && (
        <div className="glass-card" style={{ animation: 'fadeIn 0.5s ease' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', marginBottom: '2rem' }}>
            
            <div>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{selectedDrug}</h2>
              <div style={{ padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', display: 'inline-block', marginBottom: '1rem' }}>
                <code style={{ color: 'var(--accent-primary)', fontSize: '0.875rem' }}>{prediction.smiles}</code>
              </div>
              
              <h3 style={{ marginTop: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Predictions</h3>
          
              <div className="dashboard-grid" style={{ marginTop: '0' }}>
                {/* Effectiveness */}
                <div className="stat-block">
                  <div className="stat-label">Projected Effectiveness</div>
                  <div className="stat-value" style={{ color: getAccuracyColor(prediction.effectiveness_score) }}>
                    {(prediction.effectiveness_score * 100).toFixed(1)}%
                  </div>
                  <div className="progress-container">
                    <div 
                      className="progress-bar" 
                      style={{ 
                        width: `${prediction.effectiveness_score * 100}%`,
                        backgroundColor: getAccuracyColor(prediction.effectiveness_score)
                      }}
                    ></div>
                  </div>
                </div>

                {/* Toxicity */}
                <div className="stat-block">
                  <div className="stat-label">Toxicity Risk Category</div>
                  <div className="stat-value" style={{ color: getRiskColor(prediction.toxicity_risk) }}>
                    {prediction.toxicity_risk}
                  </div>
                  <div className="progress-container">
                    <div 
                      className="progress-bar" 
                      style={{ 
                        width: `${prediction.toxicity_risk === "High" ? 100 : (prediction.toxicity_risk === "Medium" ? 50 : 20)}%`,
                        backgroundColor: getRiskColor(prediction.toxicity_risk)
                      }}
                    ></div>
                  </div>
                </div>

                {/* Sustainability */}
                <div className="stat-block">
                  <div className="stat-label">Sustainability Score</div>
                  <div className="stat-value" style={{ color: getAccuracyColor(prediction.sustainability_score) }}>
                    {(prediction.sustainability_score * 100).toFixed(1)}%
                  </div>
                  <div className="progress-container">
                    <div 
                      className="progress-bar" 
                      style={{ 
                        width: `${Math.min(100, prediction.sustainability_score * 100)}%`,
                        backgroundColor: getAccuracyColor(prediction.sustainability_score)
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3D Viewer Container */}
            <div style={{ 
              background: 'rgba(0, 0, 0, 0.2)', 
              borderRadius: '1rem', 
              border: '1px solid var(--glass-border)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              marginBottom: '1.5rem',
              position: 'relative'
            }}>
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255, 255, 255, 0.02)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Interactive 3D Structure
              </div>
              <div ref={viewerRef} style={{ width: '100%', height: '300px', cursor: 'grab', position: 'relative' }}></div>
            </div>

            {/* External Citations Component */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.05)',
              borderRadius: '1rem',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              padding: '1.25rem'
            }}>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1rem' }}>Authentic References</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Verify AI predictions against established clinical databases:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a 
                  href={`https://pubchem.ncbi.nlm.nih.gov/compound/${selectedDrug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', textAlign: 'center', padding: '0.5rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  View on PubChem
                </a>
                <a 
                  href={`https://go.drugbank.com/unithermacodes?utf8=%E2%9C%93&query=${selectedDrug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', textAlign: 'center', padding: '0.5rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  Verify on DrugBank
                </a>
                <a 
                  href={`https://www.ebi.ac.uk/chembl/g/#search_results/all/query=${selectedDrug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', textAlign: 'center', padding: '0.5rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  Explore in ChEMBL
                </a>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default DrugExplorer;

