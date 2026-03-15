import React, { useState } from 'react';
import { Layers, ChevronRight, BookOpen, Beaker } from 'lucide-react';

const classificationTree = [
  {
    className: 'Salicylates',
    color: '#f59e0b',
    description: 'The oldest class of NSAIDs, derived from salicylic acid. Aspirin is the prototype and the only NSAID that irreversibly inhibits COX.',
    sharedProps: 'Irreversible COX-1 inhibition, antiplatelet effect, risk of Reye\'s syndrome in children',
    clinicalSignificance: 'Low-dose aspirin is a cornerstone of cardiovascular prevention. High doses are used for anti-inflammatory effects in conditions like Kawasaki disease.',
    drugs: [
      { name: 'Aspirin', halfLife: '15-20 min (parent)', selectivity: 'Irreversible non-selective', giRisk: 'Moderate-High', cvRisk: 'Low (protective)' },
      { name: 'Diflunisal', halfLife: '8-12 hours', selectivity: 'Non-selective (reversible)', giRisk: 'Moderate', cvRisk: 'Low' }
    ]
  },
  {
    className: 'Propionic Acid Derivatives',
    color: '#3b82f6',
    description: 'The most commonly used OTC NSAID class. Well-tolerated with a good balance of efficacy and safety. All members have a propionic acid side chain.',
    sharedProps: 'Reversible non-selective COX inhibition, chiral centers (S-enantiomer active), good oral bioavailability',
    clinicalSignificance: 'First-line for mild to moderate pain. Ibuprofen and Naproxen are available OTC. Naproxen has the lowest CV risk of all NSAIDs.',
    drugs: [
      { name: 'Ibuprofen', halfLife: '2-4 hours', selectivity: 'Non-selective', giRisk: 'Low-Moderate', cvRisk: 'Low' },
      { name: 'Naproxen', halfLife: '12-17 hours', selectivity: 'Non-selective', giRisk: 'Moderate', cvRisk: 'Lowest' },
      { name: 'Ketoprofen', halfLife: '2-4 hours', selectivity: 'Non-selective', giRisk: 'Moderate', cvRisk: 'Low' },
      { name: 'Flurbiprofen', halfLife: '5-6 hours', selectivity: 'Non-selective', giRisk: 'Moderate', cvRisk: 'Low' }
    ]
  },
  {
    className: 'Acetic Acid Derivatives',
    color: '#10b981',
    description: 'Potent NSAIDs often used for moderate-severe pain and specific clinical situations. Higher potency but also higher toxicity profile.',
    sharedProps: 'High potency, good tissue penetration, significant GI and renal toxicity potential',
    clinicalSignificance: 'Diclofenac is the most prescribed NSAID worldwide. Ketorolac approaches opioid-level analgesia. Indomethacin closes PDA in neonates.',
    drugs: [
      { name: 'Diclofenac', halfLife: '1-2 hours', selectivity: 'Slightly COX-2 preferential', giRisk: 'Moderate-High', cvRisk: 'Moderate-High' },
      { name: 'Indomethacin', halfLife: '4-5 hours', selectivity: 'Non-selective (CNS penetrant)', giRisk: 'High', cvRisk: 'Moderate' },
      { name: 'Ketorolac', halfLife: '5-6 hours', selectivity: 'Non-selective (COX-1 preferred)', giRisk: 'Very High', cvRisk: 'Moderate' },
      { name: 'Sulindac', halfLife: '7-8 hours (active metabolite: 16h)', selectivity: 'Non-selective prodrug', giRisk: 'Moderate', cvRisk: 'Low' }
    ]
  },
  {
    className: 'Enolic Acid Derivatives (Oxicams)',
    color: '#a78bfa',
    description: 'Characterized by extremely long half-lives enabling once-daily dosing. The enol structure allows tight COX binding.',
    sharedProps: 'Very long half-lives, high protein binding (>99%), once-daily dosing possible',
    clinicalSignificance: 'Preferred for chronic conditions requiring stable plasma concentrations. Piroxicam has the highest GI risk of all NSAIDs due to prolonged COX-1 inhibition.',
    drugs: [
      { name: 'Piroxicam', halfLife: '50 hours', selectivity: 'Non-selective', giRisk: 'Very High', cvRisk: 'Moderate' },
      { name: 'Meloxicam', halfLife: '15-20 hours', selectivity: 'Preferential COX-2', giRisk: 'Low-Moderate', cvRisk: 'Moderate' },
      { name: 'Tenoxicam', halfLife: '60-75 hours', selectivity: 'Non-selective', giRisk: 'High', cvRisk: 'Moderate' }
    ]
  },
  {
    className: 'COX-2 Selective Inhibitors (Coxibs)',
    color: '#ef4444',
    description: 'Designed to selectively inhibit COX-2, sparing COX-1 (stomach protection). Exploit a hydrophilic side-pocket unique to the COX-2 active site (Val523 instead of Ile523).',
    sharedProps: 'Selective COX-2 inhibition, lower GI toxicity, increased cardiovascular risk, sulfonamide moiety',
    clinicalSignificance: 'Rofecoxib (Vioxx) was withdrawn in 2004 due to increased MI risk — a landmark event in drug safety. Celecoxib remains available with cardiovascular warnings.',
    drugs: [
      { name: 'Celecoxib', halfLife: '11 hours', selectivity: 'Highly COX-2 selective', giRisk: 'Low', cvRisk: 'Moderate-High' },
      { name: 'Etoricoxib', halfLife: '22 hours', selectivity: 'Highly COX-2 selective', giRisk: 'Low', cvRisk: 'High' },
      { name: 'Rofecoxib ⚠️ WITHDRAWN', halfLife: '17 hours', selectivity: 'Highly COX-2 selective', giRisk: 'Low', cvRisk: 'Very High (WITHDRAWN)' }
    ]
  }
];

const getRiskBadge = (risk) => {
  if (risk.includes('Very High') || risk.includes('WITHDRAWN')) return 'badge-red';
  if (risk.includes('High')) return 'badge-red';
  if (risk.includes('Moderate')) return 'badge-yellow';
  if (risk.includes('Low')) return 'badge-green';
  return 'badge-blue';
};

const DrugClassExplorer = () => {
  const [selectedClass, setSelectedClass] = useState(classificationTree[0].className);

  const activeClass = classificationTree.find(c => c.className === selectedClass);

  return (
    <div className="container" style={{ animation: 'fadeIn 0.5s ease' }}>
      <h1 className="page-title">NSAID Classification Explorer</h1>
      <p className="page-subtitle" style={{ maxWidth: '800px', marginBottom: '2rem' }}>
        Explore the chemical classification of NSAIDs. Click a drug class to view member drugs, shared pharmacological properties, and clinical significance.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2.5fr', gap: '2rem' }}>
        
        {/* Class Tree */}
        <div className="glass-card" style={{ alignSelf: 'start' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={20} color="var(--accent-primary)" /> Drug Classes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {classificationTree.map(cls => (
              <button
                key={cls.className}
                onClick={() => setSelectedClass(cls.className)}
                style={{
                  padding: '0.875rem 1rem',
                  textAlign: 'left',
                  background: selectedClass === cls.className ? `${cls.color}22` : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${selectedClass === cls.className ? cls.color : 'transparent'}`,
                  borderRadius: '0.5rem',
                  color: selectedClass === cls.className ? cls.color : 'var(--text-primary)',
                  fontWeight: selectedClass === cls.className ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cls.color, flexShrink: 0 }} />
                <span style={{ fontSize: '0.95rem' }}>{cls.className}</span>
                <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.5 }} />
              </button>
            ))}
          </div>
        </div>

        {/* Class Detail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Class Overview */}
          <div className="glass-card" style={{ borderTop: `4px solid ${activeClass.color}` }}>
            <h2 style={{ fontSize: '1.75rem', color: activeClass.color, marginBottom: '0.75rem' }}>{activeClass.className}</h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1.5rem' }}>{activeClass.description}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.15)', borderRadius: '0.5rem', borderLeft: `3px solid ${activeClass.color}` }}>
                <h4 style={{ color: activeClass.color, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Beaker size={16} /> Shared Properties
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{activeClass.sharedProps}</p>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.15)', borderRadius: '0.5rem', borderLeft: '3px solid var(--accent-primary)' }}>
                <h4 style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen size={16} /> Clinical Significance
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{activeClass.clinicalSignificance}</p>
              </div>
            </div>
          </div>

          {/* Member Drugs Table */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <th style={{ paddingLeft: '1.5rem' }}>Drug Name</th>
                  <th>Half-Life</th>
                  <th>COX Selectivity</th>
                  <th>GI Risk</th>
                  <th>CV Risk</th>
                </tr>
              </thead>
              <tbody>
                {activeClass.drugs.map(drug => (
                  <tr key={drug.name}>
                    <td style={{ paddingLeft: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {drug.name}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>{drug.halfLife}</td>
                    <td style={{ fontSize: '0.9rem' }}>{drug.selectivity}</td>
                    <td><span className={`badge ${getRiskBadge(drug.giRisk)}`}>{drug.giRisk}</span></td>
                    <td><span className={`badge ${getRiskBadge(drug.cvRisk)}`}>{drug.cvRisk}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrugClassExplorer;
