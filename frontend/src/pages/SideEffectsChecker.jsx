import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, Activity, Heart, Brain, Eye, Droplets } from 'lucide-react';

const sideEffectsDB = {
  'Ibuprofen': {
    gi: {
      common: ['Nausea', 'Heartburn', 'Stomach pain', 'Diarrhea', 'Bloating'],
      uncommon: ['Stomach ulcers', 'GI bleeding', 'Vomiting blood'],
      rare: ['Perforation of stomach wall', 'Esophageal stricture']
    },
    cardiovascular: {
      common: ['Mild fluid retention', 'Slight blood pressure increase'],
      uncommon: ['Edema (swelling)', 'Palpitations'],
      rare: ['Heart attack (with chronic high-dose use)', 'Stroke', 'Heart failure exacerbation']
    },
    renal: {
      common: ['Mild fluid retention'],
      uncommon: ['Decreased urine output', 'Elevated creatinine'],
      rare: ['Acute kidney injury', 'Interstitial nephritis', 'Renal papillary necrosis']
    },
    cns: {
      common: ['Headache', 'Dizziness'],
      uncommon: ['Drowsiness', 'Confusion'],
      rare: ['Aseptic meningitis', 'Depression']
    },
    dermatologic: {
      common: ['Rash', 'Itching'],
      uncommon: ['Hives', 'Photosensitivity'],
      rare: ['Stevens-Johnson Syndrome', 'Toxic Epidermal Necrolysis']
    },
    redFlags: ['Black or bloody stools', 'Vomiting blood (coffee-ground appearance)', 'Chest pain or shortness of breath', 'Sudden severe headache', 'Swelling of face, throat, or tongue (anaphylaxis)', 'Skin blistering or peeling']
  },
  'Naproxen': {
    gi: {
      common: ['Heartburn', 'Nausea', 'Stomach upset', 'Constipation'],
      uncommon: ['GI bleeding', 'Ulceration', 'Dyspepsia'],
      rare: ['GI perforation', 'Pancreatitis']
    },
    cardiovascular: {
      common: ['Mild edema'],
      uncommon: ['Blood pressure increase'],
      rare: ['Cardiovascular events (lowest risk among NSAIDs)']
    },
    renal: {
      common: ['Fluid retention'],
      uncommon: ['Decreased renal function'],
      rare: ['Acute kidney injury', 'Hyperkalemia']
    },
    cns: {
      common: ['Headache', 'Drowsiness'],
      uncommon: ['Vertigo', 'Tinnitus'],
      rare: ['Cognitive dysfunction', 'Depression']
    },
    dermatologic: {
      common: ['Rash'],
      uncommon: ['Bruising', 'Ecchymosis'],
      rare: ['Stevens-Johnson Syndrome', 'Alopecia']
    },
    redFlags: ['Blood in stool or black tarry stools', 'Unexplained weight gain or severe swelling', 'Chest pain', 'Vision changes', 'Difficulty breathing']
  },
  'Aspirin': {
    gi: {
      common: ['Heartburn', 'Nausea', 'Stomach irritation'],
      uncommon: ['GI bleeding', 'Ulcers'],
      rare: ['GI perforation', 'Hemorrhagic gastritis']
    },
    cardiovascular: {
      common: ['Antiplatelet effect (therapeutic at low dose)'],
      uncommon: ['Increased bleeding time'],
      rare: ['Cerebral hemorrhage']
    },
    renal: {
      common: ['Mild effects at low dose'],
      uncommon: ['Reduced renal blood flow'],
      rare: ['Renal papillary necrosis']
    },
    cns: {
      common: ['Tinnitus (ringing in ears) at high doses'],
      uncommon: ['Hearing loss', 'Dizziness'],
      rare: ['Salicylism (confusion, delirium at toxic doses)']
    },
    dermatologic: {
      common: ['Easy bruising'],
      uncommon: ['Urticaria', 'Angioedema'],
      rare: ['Aspirin-exacerbated respiratory disease']
    },
    redFlags: ['⚠️ Reye\'s Syndrome in children with viral infections', 'Ringing in ears (tinnitus — sign of toxicity)', 'Severe stomach pain or bloody vomit', 'Uncontrollable bleeding from cuts', 'Breathing difficulty or wheezing']
  },
  'Celecoxib': {
    gi: {
      common: ['Mild indigestion', 'Abdominal pain'],
      uncommon: ['Nausea', 'Flatulence'],
      rare: ['GI bleeding (lower risk than non-selective NSAIDs)', 'Ulceration']
    },
    cardiovascular: {
      common: ['Peripheral edema'],
      uncommon: ['Hypertension', 'Palpitations'],
      rare: ['Myocardial infarction', 'Stroke', 'Thromboembolic events']
    },
    renal: {
      common: ['Fluid retention'],
      uncommon: ['Elevated BUN/creatinine'],
      rare: ['Acute renal failure']
    },
    cns: {
      common: ['Headache', 'Dizziness'],
      uncommon: ['Insomnia'],
      rare: ['Hallucinations (rare)']
    },
    dermatologic: {
      common: ['Rash'],
      uncommon: ['Pruritus'],
      rare: ['Erythema multiforme', 'Exfoliative dermatitis']
    },
    redFlags: ['Chest pain or sudden weakness on one side', 'Slurred speech (stroke warning)', 'Allergic reaction if sulfonamide allergy exists', 'Severe skin reactions', 'Sudden weight gain (fluid retention)']
  },
  'Diclofenac': {
    gi: {
      common: ['Nausea', 'Diarrhea', 'Abdominal pain', 'Dyspepsia'],
      uncommon: ['GI bleeding', 'Ulcers', 'Liver enzyme elevation'],
      rare: ['Hepatotoxicity', 'GI perforation', 'Pancreatitis']
    },
    cardiovascular: {
      common: ['Edema', 'Mild hypertension'],
      uncommon: ['Palpitations'],
      rare: ['MI, Stroke (risk similar to COX-2 inhibitors)']
    },
    renal: {
      common: ['Fluid retention'],
      uncommon: ['Reduced urine output'],
      rare: ['Acute renal failure', 'Interstitial nephritis']
    },
    cns: {
      common: ['Headache', 'Dizziness'],
      uncommon: ['Somnolence', 'Tinnitus'],
      rare: ['Aseptic meningitis', 'Convulsions']
    },
    dermatologic: {
      common: ['Rash', 'Contact dermatitis (topical)'],
      uncommon: ['Eczema', 'Photosensitivity'],
      rare: ['Bullous dermatitis', 'SJS/TEN']
    },
    redFlags: ['Yellowing of skin or eyes (liver damage)', 'Dark urine or clay-colored stools', 'Severe upper abdominal pain', 'Chest pain or shortness of breath', 'Severe skin blistering']
  }
};

const bodySystemIcons = {
  gi: { icon: <Droplets size={20} />, label: 'Gastrointestinal', color: '#f59e0b' },
  cardiovascular: { icon: <Heart size={20} />, label: 'Cardiovascular', color: '#ef4444' },
  renal: { icon: <Activity size={20} />, label: 'Renal (Kidney)', color: '#3b82f6' },
  cns: { icon: <Brain size={20} />, label: 'Central Nervous System', color: '#a78bfa' },
  dermatologic: { icon: <Eye size={20} />, label: 'Skin / Dermatologic', color: '#10b981' }
};

const SideEffectsChecker = () => {
  const [selectedDrug, setSelectedDrug] = useState('Ibuprofen');
  const [activeSystem, setActiveSystem] = useState('gi');

  const data = sideEffectsDB[selectedDrug];
  const systemData = data[activeSystem];
  const sysInfo = bodySystemIcons[activeSystem];

  return (
    <div className="container" style={{ animation: 'fadeIn 0.5s ease' }}>
      <h1 className="page-title">Side Effects Checker</h1>
      <p className="page-subtitle" style={{ maxWidth: '800px', marginBottom: '2rem' }}>
        Select a medication to view categorized side effects by body system. Learn which symptoms are common, uncommon, or rare — and which are emergency red flags.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2.5fr', gap: '2rem' }}>
        
        {/* Drug Selection */}
        <div className="glass-card" style={{ alignSelf: 'start' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={20} color="var(--accent-primary)" /> Select Medication
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.keys(sideEffectsDB).map(drug => (
              <button
                key={drug}
                onClick={() => { setSelectedDrug(drug); setActiveSystem('gi'); }}
                style={{
                  padding: '0.875rem 1rem',
                  textAlign: 'left',
                  background: selectedDrug === drug ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${selectedDrug === drug ? 'var(--accent-primary)' : 'transparent'}`,
                  borderRadius: '0.5rem',
                  color: 'var(--text-primary)',
                  fontWeight: selectedDrug === drug ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {drug}
              </button>
            ))}
          </div>
        </div>

        {/* Detail Pane */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Body System Tabs */}
          <div className="tab-nav">
            {Object.entries(bodySystemIcons).map(([key, sys]) => (
              <button
                key={key}
                className={`tab-btn ${activeSystem === key ? 'active' : ''}`}
                onClick={() => setActiveSystem(key)}
                style={activeSystem === key ? { borderBottomColor: sys.color, color: sys.color } : {}}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {sys.icon} {sys.label}
                </span>
              </button>
            ))}
          </div>

          {/* Side Effects by Severity */}
          <div className="glass-card" style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 style={{ fontSize: '1.5rem', color: sysInfo.color, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {sysInfo.icon} {sysInfo.label} Effects — {selectedDrug}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              {/* Common */}
              <div style={{ padding: '1.25rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span className="badge badge-green">Common</span>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {systemData.common.map((effect, i) => (
                    <li key={i} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <span style={{ color: '#34d399' }}>●</span> {effect}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Uncommon */}
              <div style={{ padding: '1.25rem', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '0.75rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span className="badge badge-yellow">Uncommon</span>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {systemData.uncommon.map((effect, i) => (
                    <li key={i} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <span style={{ color: '#fbbf24' }}>●</span> {effect}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rare */}
              <div style={{ padding: '1.25rem', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span className="badge badge-red">Rare but Serious</span>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {systemData.rare.map((effect, i) => (
                    <li key={i} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <span style={{ color: '#f87171' }}>●</span> {effect}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Red Flag Emergency */}
          <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-danger)', background: 'rgba(239, 68, 68, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <AlertTriangle size={28} color="var(--accent-danger)" />
              <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-danger)' }}>🚨 Red Flag — Seek Immediate Medical Attention</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {data.redFlags.map((flag, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '0.5rem' }}>
                  <span style={{ color: 'var(--accent-danger)', flexShrink: 0 }}>⚠</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{flag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideEffectsChecker;
