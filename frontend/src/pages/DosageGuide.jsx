import React, { useState } from 'react';
import { Clock, Pill, ShieldAlert, AlertTriangle, Coffee, Moon } from 'lucide-react';

const dosageData = [
  {
    drug: 'Ibuprofen',
    brands: 'Advil, Motrin',
    otc: true,
    doses: {
      child: { dose: '5-10 mg/kg per dose', max: '40 mg/kg/day', freq: 'Every 6-8 hours', notes: 'Use weight-based dosing. Liquid suspension available.' },
      adult: { dose: '200-400 mg per dose', max: '1200 mg/day (OTC)', freq: 'Every 4-6 hours', notes: 'Take with food or milk. Do not exceed 10 days without doctor.' },
      senior: { dose: '200 mg per dose', max: '800 mg/day', freq: 'Every 6-8 hours', notes: 'Start low. Higher GI bleed risk. Consider PPI co-prescription.' }
    },
    food: 'Take with food or milk to reduce stomach upset',
    duration: 'Max 10 days for pain, 3 days for fever (OTC)',
    avoid: 'Alcohol, other NSAIDs, blood thinners'
  },
  {
    drug: 'Naproxen',
    brands: 'Aleve, Naprosyn',
    otc: true,
    doses: {
      child: { dose: '5-7 mg/kg per dose', max: '15 mg/kg/day', freq: 'Every 8-12 hours', notes: 'Not generally recommended under 12 years OTC.' },
      adult: { dose: '220-550 mg per dose', max: '660 mg/day (OTC)', freq: 'Every 8-12 hours', notes: 'Longer lasting than Ibuprofen — fewer daily doses needed.' },
      senior: { dose: '220 mg per dose', max: '440 mg/day', freq: 'Every 12 hours', notes: 'Lowest cardiovascular risk among NSAIDs. Preferred for cardiac patients.' }
    },
    food: 'Take with food or a full glass of water',
    duration: 'Max 10 days for pain (OTC)',
    avoid: 'Alcohol, Aspirin, other NSAIDs'
  },
  {
    drug: 'Aspirin',
    brands: 'Bayer, Ecotrin',
    otc: true,
    doses: {
      child: { dose: 'NOT RECOMMENDED', max: 'DO NOT USE', freq: 'N/A', notes: '⚠️ Risk of Reye\'s Syndrome in children under 18 with viral infections.' },
      adult: { dose: '325-650 mg per dose', max: '4000 mg/day', freq: 'Every 4-6 hours', notes: 'Low-dose (81 mg) used for heart protection. High doses for pain.' },
      senior: { dose: '325 mg per dose', max: '2000 mg/day', freq: 'Every 6 hours', notes: 'Low-dose aspirin therapy (81 mg) may be prescribed for cardiac prevention.' }
    },
    food: 'Take with food. Enteric-coated forms reduce stomach irritation',
    duration: 'Low-dose for heart: indefinite under doctor supervision. Pain: max 10 days',
    avoid: 'Ibuprofen (interferes with cardiac aspirin), alcohol, blood thinners'
  },
  {
    drug: 'Celecoxib',
    brands: 'Celebrex',
    otc: false,
    doses: {
      child: { dose: 'Specialist prescription only', max: 'Varies', freq: 'Varies', notes: 'Used in juvenile rheumatoid arthritis under specialist care.' },
      adult: { dose: '100-200 mg per dose', max: '400 mg/day', freq: 'Once or twice daily', notes: 'COX-2 selective: lower GI risk but higher cardiovascular risk.' },
      senior: { dose: '100 mg per dose', max: '200 mg/day', freq: 'Once daily', notes: 'Start at lowest dose. Monitor cardiovascular status.' }
    },
    food: 'Can be taken with or without food',
    duration: 'As prescribed — long-term use requires monitoring',
    avoid: 'Sulfonamide allergy (cross-reactivity possible), heart disease patients'
  },
  {
    drug: 'Diclofenac',
    brands: 'Voltaren, Cataflam',
    otc: false,
    doses: {
      child: { dose: '1-3 mg/kg/day divided', max: '150 mg/day', freq: 'Every 8 hours', notes: 'Topical gel available OTC for localized pain.' },
      adult: { dose: '50 mg per dose', max: '150 mg/day', freq: 'Every 8 hours', notes: 'Available as tablets, topical gel, and suppositories.' },
      senior: { dose: '25-50 mg per dose', max: '100 mg/day', freq: 'Every 8-12 hours', notes: 'Topical gel preferred in elderly (lower systemic absorption).' }
    },
    food: 'Take with food to reduce stomach upset',
    duration: 'Short-term prescriptions preferred',
    avoid: 'Aspirin, other NSAIDs, in patients with heart failure'
  }
];

const DosageGuide = () => {
  const [selectedDrug, setSelectedDrug] = useState(dosageData[0].drug);
  const [ageGroup, setAgeGroup] = useState('adult');

  const drug = dosageData.find(d => d.drug === selectedDrug);
  const doseInfo = drug?.doses[ageGroup];

  return (
    <div className="container" style={{ animation: 'fadeIn 0.5s ease' }}>
      <h1 className="page-title">Dosage & Timing Guide</h1>
      <p className="page-subtitle" style={{ maxWidth: '800px', marginBottom: '2rem' }}>
        Educational reference for common NSAID dosing schedules, organized by age group. 
        <strong style={{ color: 'var(--accent-danger)' }}> Always follow your doctor's or pharmacist's instructions.</strong>
      </p>

      {/* Disclaimer */}
      <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem 1.5rem', borderRadius: '0.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <ShieldAlert size={24} color="var(--accent-danger)" />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Dosage information is for <strong style={{ color: 'var(--text-primary)' }}>educational reference only</strong>. Individual dosing may vary based on medical history, weight, and concurrent medications.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: '2rem' }}>
        
        {/* Selection */}
        <div className="glass-card" style={{ alignSelf: 'start' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Pill size={20} color="var(--accent-primary)" /> Select Medication
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
            {dosageData.map(d => (
              <button
                key={d.drug}
                onClick={() => setSelectedDrug(d.drug)}
                style={{
                  padding: '0.875rem 1rem',
                  textAlign: 'left',
                  background: selectedDrug === d.drug ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${selectedDrug === d.drug ? 'var(--accent-primary)' : 'transparent'}`,
                  borderRadius: '0.5rem',
                  color: 'var(--text-primary)',
                  fontWeight: selectedDrug === d.drug ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div>{d.drug}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{d.brands}</div>
              </button>
            ))}
          </div>

          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Age Group</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { key: 'child', label: 'Child (Under 12)', icon: '👶' },
              { key: 'adult', label: 'Adult (18-64)', icon: '🧑' },
              { key: 'senior', label: 'Senior (65+)', icon: '👴' }
            ].map(ag => (
              <button
                key={ag.key}
                onClick={() => setAgeGroup(ag.key)}
                style={{
                  padding: '0.75rem 1rem',
                  background: ageGroup === ag.key ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${ageGroup === ag.key ? 'var(--accent-secondary)' : 'transparent'}`,
                  borderRadius: '0.5rem',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                  fontWeight: ageGroup === ag.key ? 600 : 400
                }}
              >
                {ag.icon} {ag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Detail Pane */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Drug Header */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{drug.drug}</h2>
                <span style={{ color: 'var(--text-secondary)' }}>Brand: <strong>{drug.brands}</strong></span>
              </div>
              <span className={`badge ${drug.otc ? 'badge-green' : 'badge-purple'}`}>
                {drug.otc ? 'OTC Available' : 'Prescription Only'}
              </span>
            </div>

            {/* Dose Card */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1.25rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.75rem', textAlign: 'center' }}>
                <Pill size={24} color="var(--accent-primary)" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Dose</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{doseInfo.dose}</div>
              </div>
              <div style={{ padding: '1.25rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.75rem', textAlign: 'center' }}>
                <Clock size={24} color="var(--accent-secondary)" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Frequency</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{doseInfo.freq}</div>
              </div>
              <div style={{ padding: '1.25rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.75rem', textAlign: 'center' }}>
                <AlertTriangle size={24} color="var(--accent-danger)" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Max Daily</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-danger)' }}>{doseInfo.max}</div>
              </div>
            </div>

            {/* Notes */}
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.15)', borderRadius: '0.5rem', marginBottom: '1.5rem', borderLeft: '3px solid var(--accent-primary)' }}>
              <strong style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Clinical Notes</strong>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{doseInfo.notes}</p>
            </div>
          </div>

          {/* Do's and Don'ts */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>📋 Do's & Don'ts</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <h4 style={{ color: 'var(--accent-secondary)', marginBottom: '0.75rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Coffee size={16} /> DO
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--accent-secondary)' }}>✓</span> {drug.food}
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--accent-secondary)' }}>✓</span> Stick to the {drug.duration.toLowerCase()}
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--accent-secondary)' }}>✓</span> Store at room temperature away from moisture
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--accent-secondary)' }}>✓</span> Drink a full glass of water with each dose
                  </li>
                </ul>
              </div>
              <div>
                <h4 style={{ color: 'var(--accent-danger)', marginBottom: '0.75rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Moon size={16} /> DON'T
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--accent-danger)' }}>✗</span> Avoid: {drug.avoid}
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--accent-danger)' }}>✗</span> Don't crush or chew enteric-coated tablets
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--accent-danger)' }}>✗</span> Don't take on an empty stomach
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--accent-danger)' }}>✗</span> Don't double up if you miss a dose
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DosageGuide;
