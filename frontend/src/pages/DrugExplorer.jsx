import React, { useState, useEffect, useRef } from 'react';
import { fetchDrugs, predictDrug } from '../services/api';
import Tooltip from '../components/Tooltip';
import { useRole } from '../context/RoleContext';

const DrugExplorer = () => {
  const { role } = useRole();
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
      <h1 className="page-title">NSAID Drug Explorer</h1>
      <p className="page-subtitle">Analyze pharmaceutical compounds using 3D Visualizations and Cheminformatics Models.</p>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div className="form-group">
          <label className="form-label">Select a Medication to Analyze</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <select 
              className="form-select"
              value={selectedDrug}
              onChange={(e) => setSelectedDrug(e.target.value)}
            >
              <option value="">-- Select an NSAID --</option>
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
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: '2.5rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{prediction.drug_name}</h2>
                  <div style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    {prediction.iupac_name}
                  </div>
                  <div style={{ padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', display: 'inline-block', marginBottom: '1rem' }}>
                    <code style={{ color: 'var(--accent-primary)', fontSize: '0.875rem' }}>{prediction.smiles}</code>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="stat-label">Discovery Year</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{prediction.year_discovery}</div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                 <div>
                    <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Pharmacology Overview</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{prediction.pharmacology_explanation}</p>
                 </div>
                 <div>
                    <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Mechanistic Reasoning</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{prediction.mechanistic_reasoning}</p>
                 </div>
              </div>

              <h3 style={{ marginTop: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Pharmacokinetics & Clinical Profile
              </h3>
          
              <div className="dashboard-grid" style={{ marginTop: '0', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="stat-block">
                  <div className="stat-label">
                    <Tooltip term="Half-life" explanation="Time required for the concentration of the drug in the plasma to decrease by 50%.">Half-life</Tooltip>
                  </div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{prediction.half_life}</div>
                </div>
                
                <div className="stat-block">
                  <div className="stat-label">Typical Dosage</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{prediction.dosage_range}</div>
                </div>

                <div className="stat-block">
                  <div className="stat-label">
                    <Tooltip term="COX Selectivity" explanation="Cyclooxygenase (COX) enzyme responsible for producing prostaglandins involved in inflammation. Selectivity defines relative inhibition of COX-1 vs COX-2.">COX Selectivity</Tooltip>
                  </div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{prediction.cox_selectivity}</div>
                </div>
                
                <div className="stat-block" style={{ borderLeft: `3px solid ${getRiskColor(prediction.gi_toxicity_risk)}` }}>
                  <div className="stat-label">GI Toxicity Risk</div>
                  <div style={{ color: getRiskColor(prediction.gi_toxicity_risk), fontWeight: 700, fontSize: '1.125rem' }}>
                    {prediction.gi_toxicity_risk}
                  </div>
                </div>
              </div>

              {/* Advanced Cheminformatics (Researcher Only) */}
              {role === 'researcher' && (
                <>
                  <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Molecular Properties (RDKit)
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                     <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="stat-label" style={{ fontSize: '0.75rem' }}>Molecular Weight</div>
                        <div style={{ fontSize: '1.125rem' }}>{prediction.weight ? prediction.weight.toFixed(2) : prediction.descriptors[0].toFixed(2)} g/mol</div>
                     </div>
                     <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="stat-label" style={{ fontSize: '0.75rem' }}>
                           <Tooltip term="LogP" explanation="Partition coefficient measuring lipophilicity of a drug and its ability to cross biological membranes.">LogP (Lipophilicity)</Tooltip>
                        </div>
                        <div style={{ fontSize: '1.125rem' }}>{prediction.descriptors[1].toFixed(2)}</div>
                     </div>
                     <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="stat-label" style={{ fontSize: '0.75rem' }}>
                           <Tooltip term="TPSA" explanation="Topological polar surface area. A proxy for optimizing a drug's cell permeability.">TPSA</Tooltip>
                        </div>
                        <div style={{ fontSize: '1.125rem' }}>{prediction.descriptors[4].toFixed(2)} Å²</div>
                     </div>
                     <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="stat-label" style={{ fontSize: '0.75rem' }}>H-Bond Donors</div>
                        <div style={{ fontSize: '1.125rem' }}>{prediction.descriptors[2]}</div>
                     </div>
                     <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="stat-label" style={{ fontSize: '0.75rem' }}>H-Bond Acceptors</div>
                        <div style={{ fontSize: '1.125rem' }}>{prediction.descriptors[3]}</div>
                     </div>
                     <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="stat-label" style={{ fontSize: '0.75rem' }}>Rotatable Bonds</div>
                        <div style={{ fontSize: '1.125rem' }}>{prediction.descriptors[5]}</div>
                     </div>
                  </div>
                </>
              )}

            </div>

            {/* Right Column: 3D Viewer & References */}
            <div>
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
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255, 255, 255, 0.02)', fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Interactive 3D Structure</span>
                  <Tooltip term="Viewer Info" explanation="Drag to rotate, scroll to zoom. The 3D view visualizes spatial structural alignments crucial for COX active site binding.">
                    <span style={{ cursor: 'pointer', color: 'var(--accent-primary)' }}>💡</span>
                  </Tooltip>
                </div>
                <div ref={viewerRef} style={{ width: '100%', height: '300px', cursor: 'grab', position: 'relative' }}></div>
              </div>

              {/* Functional Group Educational Tooltips */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.05)',
                borderRadius: '1rem',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                padding: '1.25rem',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1rem' }}>Key Functional Groups</h4>
                <ul style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li>
                    <Tooltip term="Carboxylic Acid Group" explanation="Provides acidity and plays a major role in binding structurally to the positively charged residues in the lipophilic channel of the cyclooxygenase enzyme.">Carboxylic Acid (-COOH)</Tooltip> (often present in NSAIDs)
                  </li>
                  <li>
                    <Tooltip term="Aromatic Rings" explanation="Contributes to molecular stability, rigidity, and necessary hydrophobic interactions within the active site of the COX enzyme.">Aromatic Restricting Systems</Tooltip>
                  </li>
                </ul>
              </div>

              {/* External Citations Component */}
              <div style={{
                background: 'rgba(59, 130, 246, 0.05)',
                borderRadius: '1rem',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                padding: '1.25rem'
              }}>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1rem' }}>Authentic References</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <a 
                    href={`https://pubchem.ncbi.nlm.nih.gov/compound/${selectedDrug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', textAlign: 'center', padding: '0.5rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.875rem' }}
                  >
                    View on PubChem
                  </a>
                  <a 
                    href={`https://go.drugbank.com/unithermacodes?utf8=%E2%9C%93&query=${selectedDrug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', textAlign: 'center', padding: '0.5rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.875rem' }}
                  >
                    Verify on DrugBank
                  </a>
                  <a 
                    href={`https://www.ebi.ac.uk/chembl/g/#search_results/all/query=${selectedDrug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', textAlign: 'center', padding: '0.5rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.875rem' }}
                  >
                    Explore in ChEMBL
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrugExplorer;

