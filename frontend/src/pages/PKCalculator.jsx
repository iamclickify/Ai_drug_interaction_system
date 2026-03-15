import React, { useState, useEffect } from 'react';
import { Calculator, Beaker, Info } from 'lucide-react';
import { fetchDrugs } from '../services/api';
import GlossaryTooltip from '../components/GlossaryTooltip';

const pkPresets = {
  'Ibuprofen': { vd: 0.12, cl: 0.05, f: 0.95, halfLife: 3, proteinBinding: 99 },
  'Naproxen': { vd: 0.16, cl: 0.013, f: 0.95, halfLife: 14.5, proteinBinding: 99 },
  'Aspirin': { vd: 0.15, cl: 0.6, f: 0.7, halfLife: 0.25, proteinBinding: 50 },
  'Celecoxib': { vd: 5.7, cl: 0.45, f: 0.4, halfLife: 11, proteinBinding: 97 },
  'Diclofenac': { vd: 0.17, cl: 0.26, f: 0.55, halfLife: 1.5, proteinBinding: 99.7 },
  'Meloxicam': { vd: 0.15, cl: 0.008, f: 0.89, halfLife: 17.5, proteinBinding: 99.4 },
  'Indomethacin': { vd: 0.34, cl: 0.07, f: 0.98, halfLife: 4.5, proteinBinding: 99 },
  'Ketorolac': { vd: 0.11, cl: 0.035, f: 1.0, halfLife: 5.5, proteinBinding: 99 },
  'Piroxicam': { vd: 0.14, cl: 0.003, f: 1.0, halfLife: 50, proteinBinding: 99 }
};

const PKCalculator = () => {
  const [drugs, setDrugs] = useState([]);
  const [selectedDrug, setSelectedDrug] = useState('');
  const [weight, setWeight] = useState(70);
  const [dose, setDose] = useState(400);
  const [interval, setInterval] = useState(8);
  const [crCl, setCrCl] = useState(100); // mL/min
  const [results, setResults] = useState(null);

  useEffect(() => {
    const loadDrugs = async () => {
      const data = await fetchDrugs();
      setDrugs(data.sort((a, b) => a.drug_name.localeCompare(b.drug_name)));
    };
    loadDrugs();
  }, []);

  const handleDrugChange = (drugName) => {
    setSelectedDrug(drugName);
    if (pkPresets[drugName]) {
      const p = pkPresets[drugName];
      setInterval(p.halfLife > 10 ? 24 : p.halfLife > 4 ? 12 : 8);
    }
  };

  const parseValue = (str) => {
    if (!str) return 0;
    // Extract first number found: "1.5-2h" -> 1.5, "99%" -> 99
    const match = str.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[0]) : 0;
  };

  const handleCalculate = () => {
    const drugRecord = drugs.find(d => d.drug_name === selectedDrug);
    if (!selectedDrug || (!pkPresets[selectedDrug] && !drugRecord)) return;

    // Determine base parameters from preset OR database fallback
    const preset = pkPresets[selectedDrug] || {};
    
    // Fallback logic
    const fValue = preset.f !== undefined ? preset.f : (parseValue(drugRecord?.bioavailability) / 100 || 0.8);
    const clValue = preset.cl !== undefined ? preset.cl : 0.05; // Default clearance if unknown
    const vdValue = preset.vd !== undefined ? preset.vd : 0.2; // Default Vd for NSAIDs (L/kg)
    const hlValue = preset.halfLife !== undefined ? preset.halfLife : parseValue(drugRecord?.half_life);
    const pbValue = preset.proteinBinding !== undefined ? preset.proteinBinding : parseValue(drugRecord?.protein_binding);

    const adjustedCl = clValue * (crCl / 100); 
    const tau = interval; 
    const doseInMg = dose;
    const F = fValue;
    const Vd = vdValue * weight; 
    const CL = adjustedCl * weight; 

    // Steady-state average concentration
    const Css_avg = (F * doseInMg) / (CL * tau);

    // Peak (Cmax approx)
    const Cmax = (F * doseInMg) / Vd;

    // Trough (Cmin approx)
    const ke = hlValue > 0 ? (0.693 / hlValue) : 0;
    const Cmin = Cmax * Math.exp(-ke * tau);

    // Loading dose
    const loadingDose = (Css_avg * Vd) / F;

    // Time to steady state (4-5 half-lives)
    const tss = hlValue * 5;

    setResults({
      Css_avg: isFinite(Css_avg) ? Css_avg.toFixed(2) : "N/A",
      Cmax: isFinite(Cmax) ? Cmax.toFixed(2) : "N/A",
      Cmin: isFinite(Cmin) ? Cmin.toFixed(3) : "N/A",
      loadingDose: isFinite(loadingDose) ? loadingDose.toFixed(1) : "N/A",
      Vd_total: Vd.toFixed(1),
      CL_total: CL.toFixed(3),
      tss: tss.toFixed(1),
      ke: ke.toFixed(4),
      halfLife: hlValue,
      proteinBinding: pbValue
    });
  };

  return (
    <div className="container" style={{ animation: 'fadeIn 0.5s ease' }}>
      <h1 className="page-title">Pharmacokinetics Calculator</h1>
      <p className="page-subtitle" style={{ maxWidth: '800px', marginBottom: '2rem' }}>
        Calculate steady-state concentrations, loading doses, and clearance parameters using drug-specific pharmacokinetic presets.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
        
        {/* Input Panel */}
        <div className="glass-card" style={{ alignSelf: 'start' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calculator size={20} color="var(--accent-primary)" /> Parameters
          </h2>

          <div className="form-group">
            <label className="form-label">Select Drug</label>
            <select className="form-select" value={selectedDrug} onChange={e => handleDrugChange(e.target.value)}>
              <option value="">-- Select --</option>
              {drugs.map(d => (
                <option key={d.id} value={d.drug_name}>{d.drug_name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Patient Weight (kg)</label>
            <input type="number" className="form-input" value={weight} onChange={e => setWeight(Number(e.target.value))} min={20} max={200} />
          </div>

          <div className="form-group">
            <label className="form-label">Dose per Administration (mg)</label>
            <input type="number" className="form-input" value={dose} onChange={e => setDose(Number(e.target.value))} min={10} max={2000} />
          </div>

          <div className="form-group">
            <label className="form-label">Dosing Interval (hours)</label>
            <select className="form-select" value={interval} onChange={e => setInterval(Number(e.target.value))}>
              <option value={4}>Every 4 hours</option>
              <option value={6}>Every 6 hours</option>
              <option value={8}>Every 8 hours</option>
              <option value={12}>Every 12 hours</option>
              <option value={24}>Every 24 hours</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Creatinine Clearance (mL/min)</label>
            <input type="number" className="form-input" value={crCl} onChange={e => setCrCl(Number(e.target.value))} min={10} max={150} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>Normal: 90-120 mL/min</span>
          </div>

          <button className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={handleCalculate} disabled={!selectedDrug}>
            Calculate PK Parameters
          </button>
        </div>

        {/* Results */}
        <div>
          {!results ? (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', textAlign: 'center', opacity: 0.7 }}>
              <Beaker size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Select a drug and enter parameters</h3>
              <p style={{ maxWidth: '400px', color: 'var(--text-secondary)' }}>Results will display calculated PK values with formulas.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.5s ease' }}>
              
              {/* Key Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                {[
                  { label: 'Css (Avg)', value: `${results.Css_avg} mg/L`, formula: 'F × Dose / (CL × τ)', color: 'var(--accent-primary)' },
                  { label: 'Cmax (Peak)', value: `${results.Cmax} mg/L`, formula: 'F × Dose / Vd', color: 'var(--accent-secondary)' },
                  { label: 'Cmin (Trough)', value: `${results.Cmin} mg/L`, formula: 'Cmax × e^(-ke × τ)', color: 'var(--accent-warning)' },
                  { label: 'Loading Dose', value: `${results.loadingDose} mg`, formula: 'Css × Vd / F', color: '#a78bfa' }
                ].map(m => (
                  <div key={m.label} className="glass-card" style={{ padding: '1.25rem', textAlign: 'center', borderTop: `3px solid ${m.color}` }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{m.label}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: m.color, marginBottom: '0.25rem' }}>{m.value}</div>
                    <code style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>{m.formula}</code>
                  </div>
                ))}
              </div>

              {/* Drug-Specific Parameters */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Info size={18} color="var(--accent-primary)" /> Drug-Specific Parameters — {selectedDrug}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {[
                    { label: 'Volume of Distribution (Vd)', value: <GlossaryTooltip term="Vd">{results.Vd_total} L</GlossaryTooltip> },
                    { label: 'Total Clearance (CL)', value: <GlossaryTooltip term="Clearance">{results.CL_total} L/hr</GlossaryTooltip> },
                    { label: 'Elimination Rate (ke)', value: `${results.ke} hr⁻¹` },
                    { label: 'Half-Life (t½)', value: <GlossaryTooltip term="Half-life">{results.halfLife} hours</GlossaryTooltip> },
                    { label: 'Time to Steady State', value: `${results.tss} hours (~${(results.tss / 24).toFixed(1)} days)` },
                    { label: 'Protein Binding', value: <GlossaryTooltip term="Protein Binding">{results.proteinBinding}%</GlossaryTooltip> }
                  ].map(p => (
                    <div key={p.label} style={{ padding: '1rem', background: 'rgba(0,0,0,0.15)', borderRadius: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{p.label}</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Renal Note */}
              {crCl < 60 && (
                <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '0.5rem', borderLeft: '3px solid var(--accent-warning)' }}>
                  <strong style={{ color: 'var(--accent-warning)' }}>⚠️ Renal Impairment Detected:</strong>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginTop: '0.25rem' }}>
                    CrCl of {crCl} mL/min indicates reduced renal function. NSAID clearance is significantly impaired. Consider dose reduction or alternative analgesics. 
                    All NSAIDs reduce renal prostaglandins that maintain afferent arteriolar dilation — use is strongly cautioned in CKD patients.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PKCalculator;
