import React, { useState, useEffect } from 'react';
import { fetchDrugs, predictDrug } from '../services/api';
import { BookOpen, ExternalLink, CheckCircle, XCircle, Download, Clock } from 'lucide-react';
import LiteratureBridge from '../components/LiteratureBridge';
import GlossaryTooltip from '../components/GlossaryTooltip';

const lipinskiRules = (descriptors, weight) => {
  if (!descriptors || descriptors.length < 5) return null;
  const mw = weight || descriptors[0];
  const logP = descriptors[1];
  const hbd = descriptors[2];
  const hba = descriptors[3];
  
  return [
    { rule: 'Molecular Weight ≤ 500 Da', value: `${mw.toFixed(1)} Da`, pass: mw <= 500 },
    { rule: 'LogP ≤ 5', value: logP.toFixed(2), pass: logP <= 5 },
    { rule: 'H-Bond Donors ≤ 5', value: hbd.toString(), pass: hbd <= 5 },
    { rule: 'H-Bond Acceptors ≤ 10', value: hba.toString(), pass: hba <= 10 }
  ];
};

const milestones = {
  'Aspirin': [
    { year: 1763, event: 'Rev. Edward Stone reports willow bark cures fever' },
    { year: 1828, event: 'Salicin isolated from willow bark by Johann Buchner' },
    { year: 1897, event: 'Felix Hoffmann at Bayer synthesizes Acetylsalicylic Acid' },
    { year: 1899, event: 'Bayer markets Aspirin commercially' },
    { year: 1971, event: 'John Vane discovers mechanism (COX inhibition) — wins Nobel Prize 1982' },
    { year: 1988, event: 'ISIS-2 trial proves low-dose aspirin prevents MI' }
  ],
  'Ibuprofen': [
    { year: 1961, event: 'Synthesized by Stewart Adams at Boots pharmacy' },
    { year: 1962, event: 'Patent filed in the UK' },
    { year: 1969, event: 'Approved as prescription drug in UK' },
    { year: 1974, event: 'FDA approval in USA' },
    { year: 1984, event: 'Switched to OTC status — first prescription NSAID to go OTC' }
  ],
  'Celecoxib': [
    { year: 1998, event: 'FDA approved as first COX-2 selective inhibitor' },
    { year: 2000, event: 'CLASS trial compares GI safety vs non-selective NSAIDs' },
    { year: 2004, event: 'Rofecoxib (Vioxx) withdrawn — Celecoxib survives with CV warnings' },
    { year: 2005, event: 'Black box warning added for cardiovascular risk' },
    { year: 2016, event: 'PRECISION trial shows non-inferiority to Ibuprofen/Naproxen for CV events' }
  ],
  'Diclofenac': [
    { year: 1973, event: 'Synthesized by Alfred Sallmann at Ciba-Geigy' },
    { year: 1974, event: 'Launched in Japan as Voltaren' },
    { year: 1988, event: 'Topical gel formulation introduced' },
    { year: 2007, event: 'Studies confirm CV risk similar to COX-2 inhibitors' },
    { year: 2020, event: 'Voltaren gel approved for OTC use in USA' }
  ]
};

const ResearchHub = () => {
  const [drugs, setDrugs] = useState([]);
  const [selectedDrug, setSelectedDrug] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lipinski, setLipinski] = useState(null);
  const [activeTab, setActiveTab] = useState('lipinski');
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDrugs = async () => {
      const data = await fetchDrugs();
      if (data.length === 0) {
        setError("Database unreachable. Please ensure the backend server is running on port 5000.");
      } else {
        setError(null);
      }
      setDrugs(data.sort((a, b) => a.drug_name.localeCompare(b.drug_name)));
    };
    loadDrugs();
  }, []);

  const handleAnalyze = async () => {
    if (!selectedDrug) return;
    setLoading(true);
    try {
      const result = await predictDrug(selectedDrug);
      setPrediction(result);
      const rules = lipinskiRules(result.descriptors, result.weight);
      setLipinski(rules);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const drugMilestones = milestones[selectedDrug] || null;
  const violations = lipinski ? lipinski.filter(r => !r.pass).length : 0;

  return (
    <div className="container" style={{ animation: 'fadeIn 0.5s ease' }}>
      <h1 className="page-title">Research Reference Hub</h1>
      <p className="page-subtitle" style={{ maxWidth: '800px', marginBottom: '2rem' }}>
        Lipinski's Rule of Five validation, drug development timelines, molecular descriptor summaries, and curated external research links.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2.5fr', gap: '2rem' }}>
        
        {/* Selection */}
        <div className="glass-card" style={{ alignSelf: 'start' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} color="var(--accent-primary)" /> Select Compound
          </h2>
          <div className="form-group">
            <select className="form-select" value={selectedDrug} onChange={e => setSelectedDrug(e.target.value)}>
              <option value="">-- Select --</option>
              {drugs.map(d => (
                <option key={d.id} value={d.drug_name}>{d.drug_name}</option>
              ))}
            </select>
          </div>
          <button className="btn-primary" style={{ width: '100%' }} onClick={handleAnalyze} disabled={!selectedDrug || loading}>
            {loading ? 'Loading...' : 'Analyze Compound'}
          </button>

          {error && (
            <div style={{ color: 'var(--accent-danger)', marginTop: '1rem', padding: '0.75rem', fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>
              {error}
            </div>
          )}

          {/* External Links */}
          {selectedDrug && (
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>External Resources</h3>
              {[
                { label: 'PubChem', url: `https://pubchem.ncbi.nlm.nih.gov/compound/${selectedDrug}` },
                { label: 'DrugBank', url: `https://go.drugbank.com/unearth/q?utf8=%E2%9C%93&query=${selectedDrug}` },
                { label: 'ChEMBL', url: `https://www.ebi.ac.uk/chembl/g/#search_results/all/query=${selectedDrug}` },
                { label: 'WHO Essential Medicines', url: 'https://list.essentialmeds.org/' },
                { label: 'ClinicalTrials.gov', url: `https://clinicaltrials.gov/search?term=${selectedDrug}` }
              ].map(link => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.625rem 0.875rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '0.5rem',
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <ExternalLink size={14} color="var(--accent-primary)" />
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div>
          {loading && (
            <div className="loader-container"><div className="loader" /></div>
          )}

          {prediction && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.5s ease' }}>
              
              {/* Tabs */}
              <div className="tab-nav">
                {[
                  { key: 'lipinski', label: "Lipinski's Ro5" },
                  { key: 'descriptors', label: 'Molecular Descriptors' },
                  { key: 'timeline', label: 'Development Timeline' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Lipinski Tab */}
              {activeTab === 'lipinski' && lipinski && (
                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>Lipinski's Rule of Five — {selectedDrug}</h2>
                    <span className={`badge ${violations === 0 ? 'badge-green' : violations <= 1 ? 'badge-yellow' : 'badge-red'}`}>
                      {violations === 0 ? 'All Rules Passed' : `${violations} Violation${violations > 1 ? 's' : ''}`}
                    </span>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    Lipinski's <GlossaryTooltip term="Ro5">Rule of Five</GlossaryTooltip> predicts oral <GlossaryTooltip term="Bioavailability">bioavailability</GlossaryTooltip>. A drug is likely to be poorly absorbed if it violates 2 or more rules. This is a key filter in early-stage drug discovery.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    {lipinski.map((rule, idx) => (
                      <div key={idx} style={{ padding: '1.25rem', background: rule.pass ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '0.75rem', border: `1px solid ${rule.pass ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, textAlign: 'center' }}>
                        {rule.pass ? <CheckCircle size={24} color="var(--accent-secondary)" /> : <XCircle size={24} color="var(--accent-danger)" />}
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: rule.pass ? 'var(--accent-secondary)' : 'var(--accent-danger)', margin: '0.5rem 0' }}>{rule.value}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{rule.rule}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Descriptors Tab */}
              {activeTab === 'descriptors' && (
                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>Molecular Descriptor Summary — {selectedDrug}</h2>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.15)', borderRadius: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>IUPAC Name</div>
                      <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontFamily: 'monospace', wordBreak: 'break-all' }}>{prediction.iupac_name}</div>
                    </div>
                    <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.15)', borderRadius: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>SMILES</div>
                      <div style={{ fontSize: '0.95rem', color: 'var(--accent-primary)', fontFamily: 'monospace', wordBreak: 'break-all' }}>{prediction.smiles}</div>
                    </div>
                  </div>

                  <table>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <th>Descriptor</th>
                        <th>Value</th>
                        <th>Significance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'Molecular Weight', value: `${(prediction.weight || prediction.descriptors[0]).toFixed(2)} g/mol`, sig: 'Affects absorption and distribution.' },
                        { name: 'LogP', value: prediction.descriptors[1].toFixed(2), sig: <GlossaryTooltip term="LogP">Lipophilicity measure.</GlossaryTooltip> },
                        { name: 'H-Bond Donors', value: prediction.descriptors[2], sig: <GlossaryTooltip term="HBD">Affects permeability.</GlossaryTooltip> },
                        { name: 'H-Bond Acceptors', value: prediction.descriptors[3], sig: <GlossaryTooltip term="HBA">Affects solubility.</GlossaryTooltip> },
                        { name: 'TPSA', value: `${prediction.descriptors[4].toFixed(2)} Å²`, sig: <GlossaryTooltip term="TPSA">Topological polar surface area.</GlossaryTooltip> },
                        { name: 'Rotatable Bonds', value: prediction.descriptors[5], sig: 'Molecular flexibility.' }
                      ].map(d => (
                        <tr key={d.name}>
                          <td style={{ fontWeight: 600 }}>{d.name}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: '1.05rem', color: 'var(--accent-primary)' }}>{d.value}</td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{d.sig}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TIMELINE Tab */}
              {activeTab === 'timeline' && (
                <div className="glass-card">
                  <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                    Development Timeline — {selectedDrug}
                  </h2>
                  {drugMilestones ? (
                    <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                      {/* Timeline line */}
                      <div style={{ position: 'absolute', left: '8px', top: 0, bottom: 0, width: '2px', background: 'var(--accent-primary)' }} />
                      
                      {drugMilestones.map((ms, idx) => (
                        <div key={idx} style={{ position: 'relative', marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
                          {/* Dot */}
                          <div style={{ position: 'absolute', left: '-1.52rem', top: '4px', width: '14px', height: '14px', borderRadius: '50%', background: 'var(--accent-primary)', border: '2px solid var(--bg-primary)' }} />
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <span style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: '1.1rem', minWidth: '50px' }}>{ms.year}</span>
                            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{ms.event}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                      <Clock size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                      <p>Timeline data available for: {Object.keys(milestones).join(', ')}</p>
                      <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Select one of these drugs to view historical milestones.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Research Bridge */}
              <LiteratureBridge activeDrug={selectedDrug} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResearchHub;
