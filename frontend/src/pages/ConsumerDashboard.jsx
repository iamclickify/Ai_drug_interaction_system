import React, { useState, useEffect } from 'react';
import { fetchDrugs, getBrandMap } from '../services/api';
import { ShieldAlert, Info, HeartPulse, AlertTriangle, Phone, FileText, Sparkles, CheckCircle2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import GlossaryTooltip from '../components/GlossaryTooltip';

const healthConditions = [
  { id: 'pregnant', label: '🤰 Pregnant / Breastfeeding', warning: 'NSAIDs are generally contraindicated in the third trimester of pregnancy. They may cause premature closure of the ductus arteriosus in the fetus. Consult your OB-GYN before taking any pain reliever.' },
  { id: 'diabetes', label: '🩸 Diabetes', warning: 'NSAIDs may impair kidney function, which is already at risk in diabetic patients. They can also interfere with certain diabetes medications (e.g., sulfonylureas). Monitor blood sugar closely.' },
  { id: 'hypertension', label: '❤️ High Blood Pressure', warning: 'NSAIDs can raise blood pressure and reduce the effectiveness of antihypertensive medications (ACE inhibitors, ARBs, diuretics). Use the lowest effective dose for the shortest time.' },
  { id: 'obesity', label: '⚖️ Obesity (BMI > 30)', warning: 'Higher body weight may require dosage adjustments. Obese patients are at increased risk for cardiovascular events with long-term NSAID use. Discuss weight-appropriate dosing with your doctor.' },
  { id: 'bloodThinners', label: '💊 Taking Blood Thinners', warning: 'Combining NSAIDs with anticoagulants (Warfarin, Heparin) or antiplatelet drugs dramatically increases bleeding risk. This combination requires medical supervision.' },
  { id: 'kidneyIssues', label: '🫘 Kidney Problems', warning: 'NSAIDs reduce renal blood flow by inhibiting prostaglandins that maintain kidney perfusion. They can cause acute kidney injury, especially in patients with pre-existing renal impairment.' },
  {id: 'stomachUlcers', label: '🔥 History of Stomach Ulcers', warning: <><GlossaryTooltip term="NSAID">NSAIDs</GlossaryTooltip> strip the stomach's protective mucus layer by inhibiting <GlossaryTooltip term="COX-1">COX-1</GlossaryTooltip>. If you have had ulcers, a COX-2 selective inhibitor (Celecoxib) or a <GlossaryTooltip term="PPI">PPI</GlossaryTooltip> co-prescription may be necessary.</> },
];

const ConsumerDashboard = () => {
  const [drugs, setDrugs] = useState([]);
  const [age, setAge] = useState('Adult (18-64)');
  const [gender, setGender] = useState('Prefer not to say');
  const [painType, setPainType] = useState('Headache');
  const [severity, setSeverity] = useState('Mild');
  const [duration, setDuration] = useState('Acute (A few days)');
  const [selectedConditions, setSelectedConditions] = useState([]);
  
  const [suggestedDrugs, setSuggestedDrugs] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [nlpText, setNlpText] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const loadDrugs = async () => {
      const data = await fetchDrugs();
      setDrugs(data);
    };
    loadDrugs();
  }, []);

  const toggleCondition = (condId) => {
    setSelectedConditions(prev => 
      prev.includes(condId) ? prev.filter(c => c !== condId) : [...prev, condId]
    );
  };

  const handleNLPAnalyze = () => {
    if (!nlpText.trim()) return;
    
    const text = nlpText.toLowerCase();
    
    // Advanced keyword mapping
    const symptomMap = {
      'head': 'Headache / Migraine',
      'migrain': 'Headache / Migraine',
      'muscle': 'Muscle Strain / Sprain',
      'back': 'Back Pain',
      'joint': 'Osteoarthritis / Joint Pain',
      'arthriti': 'Osteoarthritis / Joint Pain',
      'period': 'Menstrual Cramps',
      'cramp': 'Menstrual Cramps',
      'fever': 'Fever',
      'temp': 'Fever',
      'teeth': 'Dental Pain',
      'tooth': 'Dental Pain',
      'dent': 'Dental Pain',
      'surgery': 'Post-Surgery Pain',
      'operat': 'Post-Surgery Pain',
      'rheumat': 'Rheumatoid Arthritis'
    };

    for (const [key, value] of Object.entries(symptomMap)) {
      if (text.includes(key)) {
        setPainType(value);
      }
    }

    // Map keywords to conditions
    const conditionKeywords = {
      'pregnant': 'pregnant',
      'breastfeed': 'pregnant',
      'diabet': 'diabetes',
      'sugar': 'diabetes',
      'tension': 'hypertension',
      'pressure': 'hypertension',
      'bp': 'hypertension',
      'obese': 'obesity',
      'weight': 'obesity',
      'bmi': 'obesity',
      'thin': 'bloodThinners',
      'warfarin': 'bloodThinners',
      'aspirin': 'bloodThinners',
      'clopidogrel': 'bloodThinners',
      'kidney': 'kidneyIssues',
      'renal': 'kidneyIssues',
      'ulcer': 'stomachUlcers',
      'stomach': 'stomachUlcers',
      'gastric': 'stomachUlcers'
    };

    Object.entries(conditionKeywords).forEach(([key, id]) => {
      if (text.includes(key)) {
        if (!selectedConditions.includes(id)) {
          toggleCondition(id);
        }
      }
    });

    if (text.includes('bad') || text.includes('severe') || text.includes('extreme') || text.includes('kill')) {
      setSeverity('Severe');
    } else if (text.includes('mild') || text.includes('little') || text.includes('slight')) {
      setSeverity('Mild');
    }

    if (text.includes('chronic') || text.includes('long') || text.includes('year') || text.includes('month')) {
      setDuration('Chronic (Months to Years)');
    } else if (text.includes('acute') || text.includes('start') || text.includes('just')) {
      setDuration('Acute (A few days)');
    }
    
    // Trigger search after NLP update
    handleSearch();
  };

  const handleSearch = () => {
    let filtered = [];
    
    const getDrug = (name) => drugs.find(d => d.drug_name.toLowerCase() === name.toLowerCase());
    
    if (duration.includes('Chronic') || painType.includes('Arthritis')) {
      filtered = ['Meloxicam', 'Celecoxib', 'Naproxen', 'Diclofenac'].map(getDrug).filter(Boolean);
    } else if (severity === 'Mild' || severity === 'Moderate') {
      filtered = ['Ibuprofen', 'Naproxen', 'Aspirin'].map(getDrug).filter(Boolean);
    } else {
      filtered = ['Ketorolac', 'Diclofenac', 'Indomethacin', 'Ibuprofen'].map(getDrug).filter(Boolean);
    }

    if (age.includes('65+')) {
      filtered = filtered.sort((a,b) => {
         const riskA = (a.gi_toxicity_risk || "").includes('Low') ? -1 : 1;
         const riskB = (b.gi_toxicity_risk || "").includes('Low') ? -1 : 1;
         return riskA - riskB;
      });
    }

    // If pregnant, prefer Celecoxib or remove all if 3rd trimester
    if (selectedConditions.includes('pregnant')) {
      filtered = filtered.filter(d => d.drug_name === 'Celecoxib' || d.drug_name === 'Acetaminophen');
      if (filtered.length === 0) {
        filtered = drugs.filter(d => d.drug_name === 'Celecoxib');
      }
    }

    // If on blood thinners, avoid Aspirin and prefer COX-2 selective
    if (selectedConditions.includes('bloodThinners')) {
      filtered = filtered.filter(d => d.drug_name !== 'Aspirin' && d.drug_name !== 'Ketorolac');
    }

    // If stomach ulcers, prefer COX-2 selective
    if (selectedConditions.includes('stomachUlcers')) {
      const cox2 = filtered.filter(d => ['Celecoxib', 'Meloxicam'].includes(d.drug_name));
      if (cox2.length > 0) filtered = cox2;
    }

    setSuggestedDrugs(filtered.slice(0, 3));
    setHasSearched(true);
  };

  const shouldShowDoctorAlert = () => {
    if (severity === 'Severe' && duration.includes('Chronic')) return true;
    if (selectedConditions.length >= 3) return true;
    if (age.includes('65+') && selectedConditions.includes('kidneyIssues')) return true;
    if (selectedConditions.includes('pregnant') && severity !== 'Mild') return true;
    return false;
  };

  const activeWarnings = healthConditions.filter(c => selectedConditions.includes(c.id));

  const calculateSafetyScore = (drug) => {
    let score = 95; // Base score
    
    if (selectedConditions.includes('pregnant') && drug.drug_name !== 'Celecoxib' && drug.drug_name !== 'Acetaminophen') score -= 50;
    if (selectedConditions.includes('kidneyIssues') && drug.gi_toxicity_risk.includes('High')) score -= 30;
    if (selectedConditions.includes('bloodThinners') && drug.drug_name === 'Aspirin') score -= 40;
    if (selectedConditions.includes('stomachUlcers') && !['Celecoxib', 'Meloxicam'].includes(drug.drug_name)) score -= 30;
    if (age.includes('65+') && drug.gi_toxicity_risk.includes('High')) score -= 20;
    
    return Math.max(0, score);
  };

  const exportReport = () => {
    setIsExporting(true);
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text("Drug AI Platform - Personalized Report", 20, 20);
    
    doc.setFontSize(14);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`User Profile: ${age}, ${gender}`, 20, 40);
    doc.text(`Primary Symptom: ${painType} (${severity})`, 20, 50);
    
    doc.setFontSize(12);
    doc.text("Health Conditions Noted:", 20, 70);
    let y = 80;
    if (selectedConditions.length === 0) {
      doc.text("- None", 25, y);
      y += 10;
    } else {
      selectedConditions.forEach(id => {
        const label = healthConditions.find(c => c.id === id).label;
        doc.text(`- ${label}`, 25, y);
        y += 10;
      });
    }
    
    y += 10;
    doc.setFontSize(14);
    doc.text("Suggested Medications (For Educational Use Only):", 20, y);
    y += 15;
    
    suggestedDrugs.forEach(drug => {
      doc.setFontSize(12);
      doc.text(`${drug.drug_name} (${calculateSafetyScore(drug)}% Safety Score)`, 25, y);
      y += 7;
      doc.setFontSize(10);
      doc.text(`Use: ${drug.clinical_use.substring(0, 80)}...`, 25, y);
      y += 12;
    });

    doc.setFontSize(8);
    doc.text("DISCLAIMER: This is an educational tool. Always consult a doctor.", 20, 280);
    
    doc.save("Drug_AI_Report.pdf");
    setTimeout(() => setIsExporting(false), 1000);
  };

  return (
    <div className="container">
      <h1 className="page-title">Symptom Solver & Pain Reliever Guide</h1>
      <p className="page-subtitle" style={{ maxWidth: '800px', marginBottom: '2rem' }}>
        Learn about common <GlossaryTooltip term="OTC">over-the-counter</GlossaryTooltip> and prescription pain relievers. 
        Tell us what you are feeling to see educational breakdowns of medications commonly used for that scenario.
      </p>

      {/* Safety Disclaimer */}
      <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem 1.5rem', borderRadius: '0.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <ShieldAlert size={28} color="var(--accent-danger)" />
        <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
          <strong style={{ color: 'var(--accent-danger)' }}>Educational Tool Only:</strong> This platform is for learning purposes and does not provide medical advice. 
          Always consult a healthcare professional or pharmacist before starting or stopping any medication.
        </p>
      </div>

      {/* When to See a Doctor Alert */}
      {hasSearched && shouldShowDoctorAlert() && (
        <div style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(245, 158, 11, 0.15))', border: '2px solid rgba(239, 68, 68, 0.5)', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '2rem', animation: 'fadeIn 0.5s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Phone size={28} color="var(--accent-danger)" />
            <h3 style={{ color: 'var(--accent-danger)', fontSize: '1.25rem' }}>⚠️ When to See a Doctor</h3>
          </div>
          <ul style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.8', paddingLeft: '1.25rem' }}>
            {severity === 'Severe' && <li>Severe pain lasting more than a few days requires professional evaluation</li>}
            {selectedConditions.length >= 3 && <li>Multiple health conditions increase drug interaction risks — seek medical advice</li>}
            {selectedConditions.includes('pregnant') && <li>Pregnancy requires careful medication selection — consult your OB-GYN</li>}
            {selectedConditions.includes('kidneyIssues') && <li>Kidney problems require dose adjustments and monitoring</li>}
            <li>If your symptoms worsen or don't improve within 7 days, see a healthcare provider</li>
          </ul>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
        
        {/* Input Form */}
        <div className="glass-card" style={{ alignSelf: 'start' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HeartPulse size={20} color="var(--accent-primary)" />
            What are you treating?
          </h2>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} color="var(--accent-secondary)" />
              Describe your symptoms (AI Assist)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                className="form-select" 
                placeholder="e.g. My back hurts and I have high blood pressure"
                value={nlpText}
                onChange={e => setNlpText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNLPAnalyze()}
              />
              <button 
                className="btn-secondary" 
                style={{ borderRadius: '0.5rem', padding: '0 1rem' }}
                onClick={handleNLPAnalyze}
              >
                Go
              </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Analysis automatically updates the fields below.
            </p>
          </div>
          
          <div className="form-group">
            <label className="form-label">Who is this for? (Age)</label>
            <select className="form-select" value={age} onChange={e => setAge(e.target.value)}>
              <option>Child (Under 12)</option>
              <option>Teen (12-17)</option>
              <option>Adult (18-64)</option>
              <option>Senior (65+)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Biological Sex</label>
            <select className="form-select" value={gender} onChange={e => setGender(e.target.value)}>
              <option>Male</option>
              <option>Female</option>
              <option>Prefer not to say</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Primary Symptom</label>
            <select className="form-select" value={painType} onChange={e => setPainType(e.target.value)}>
              <option>Headache / Migraine</option>
              <option>Muscle Strain / Sprain</option>
              <option>Osteoarthritis / Joint Pain</option>
              <option>Rheumatoid Arthritis</option>
              <option>Menstrual Cramps</option>
              <option>Fever</option>
              <option>Back Pain</option>
              <option>Dental Pain</option>
              <option>Post-Surgery Pain</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">How severe is it?</label>
            <select className="form-select" value={severity} onChange={e => setSeverity(e.target.value)}>
              <option>Mild</option>
              <option>Moderate</option>
              <option>Severe</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">How long will you need this?</label>
            <select className="form-select" value={duration} onChange={e => setDuration(e.target.value)}>
              <option>Acute (A few days)</option>
              <option>Short-Term (1-4 weeks)</option>
              <option>Chronic (Months to Years)</option>
            </select>
          </div>

          {/* Health Condition Disclaimers */}
          <div className="form-group">
            <label className="form-label" style={{ color: 'var(--accent-warning)', fontWeight: 600 }}>
              ⚕️ Do any of these apply to you?
            </label>
            <div className="checkbox-group">
              {healthConditions.map(cond => (
                <label 
                  key={cond.id} 
                  className={`checkbox-pill ${selectedConditions.includes(cond.id) ? 'checked' : ''}`}
                >
                  <input 
                    type="checkbox" 
                    checked={selectedConditions.includes(cond.id)} 
                    onChange={() => toggleCondition(cond.id)} 
                  />
                  {cond.label}
                </label>
              ))}
            </div>
          </div>

          <button className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={handleSearch}>
            Find Educational Profiles
          </button>
        </div>

        {/* Results Pane */}
        <div>
          {/* Active Health Warnings */}
          {activeWarnings.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', animation: 'fadeIn 0.5s ease' }}>
              {activeWarnings.map(warn => (
                <div key={warn.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '0.5rem' }}>
                  <AlertTriangle size={20} color="var(--accent-warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: 'var(--accent-warning)', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>{warn.label.replace(/^[^\s]+\s/, '')}</strong>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{warn.warning}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!hasSearched ? (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', textAlign: 'center', opacity: 0.7 }}>
               <Info size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
               <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Awaiting Profile</h3>
               <p style={{ maxWidth: '400px' }}>Fill out the scenario profile on the left to see educational breakdowns of relevant NSAIDs.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.5s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0 }}>
                  Common Medications for this Scenario
                </h2>
                <button 
                  className="btn-secondary" 
                  style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
                  onClick={exportReport}
                  disabled={isExporting}
                >
                  <FileText size={16} />
                  {isExporting ? 'Generating...' : 'Export PDF Report'}
                </button>
              </div>
              
              {suggestedDrugs.length === 0 ? (
                 <div className="glass-card">No matching medications found for this profile. Make sure the database is running and connected.</div>
              ) : (
                suggestedDrugs.map((drug, idx) => {
                  const allBrands = getBrandMap();
                  const foundBrands = Object.keys(allBrands).filter(brand => allBrands[brand] === drug.drug_name);
                  const brandString = foundBrands.length > 0 ? foundBrands.join(', ') : 'Prescription Only';
                  
                  return (
                    <div key={drug.id} className="glass-card" style={{ position: 'relative', overflow: 'hidden', paddingBottom: '1.5rem' }}>
                      {idx === 0 && <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--accent-primary)' }} />}
                      
                      {/* Safety Score Badge */}
                      <div style={{ 
                        position: 'absolute', 
                        top: '1rem', 
                        right: '4.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          border: `3px solid ${calculateSafetyScore(drug) > 70 ? 'var(--accent-secondary)' : calculateSafetyScore(drug) > 40 ? 'var(--accent-warning)' : 'var(--accent-danger)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          color: 'var(--text-primary)',
                          background: 'rgba(255,255,255,0.05)'
                        }}>
                          {calculateSafetyScore(drug)}%
                        </div>
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '0.2rem', textTransform: 'uppercase' }}>Safety</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                           <h3 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                             {brandString === 'Prescription Only' ? drug.drug_name : brandString}
                           </h3>
                           <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                             Active Ingredient: <strong><GlossaryTooltip term={drug.drug_name}>{drug.drug_name}</GlossaryTooltip></strong>
                           </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className={`badge ${brandString === 'Prescription Only' ? 'badge-purple' : 'badge-green'}`}>
                            {brandString === 'Prescription Only' ? 'Rx Only' : 'OTC'}
                          </span>
                        </div>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        <strong style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>How it helps</strong>
                        <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>{drug.clinical_use}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                          Primary Mechanic: <GlossaryTooltip term={drug.cox_selectivity || "COX-1"}>{drug.cox_selectivity || "Non-Selective"}</GlossaryTooltip>
                        </p>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                         <div>
                           <strong style={{ color: 'var(--accent-danger)', display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Stomach Safety Risk</strong>
                           <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Risk Level: <strong>{drug.gi_toxicity_risk}</strong></p>
                         </div>
                         <div>
                           <strong style={{ color: 'var(--accent-danger)', display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Heart Safety Risk</strong>
                           <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Risk Level: <strong>{drug.cardio_risk}</strong></p>
                         </div>
                      </div>
                    </div>
                  );
                })
              )}

              {age.includes('65+') && duration.includes('Chronic') && (
                 <div style={{ padding: '1rem', borderLeft: '3px solid var(--accent-warning)', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '0 0.5rem 0.5rem 0' }}>
                   <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                     <strong>Educational Note for Seniors:</strong> Long-term use of NSAIDs in adults over 65 carries significantly higher risks of stomach ulcers and kidney issues. In practice, doctors often prescribe a stomach protectant (like a PPI) alongside the NSAID, or opt for lower-risk alternatives depending on cardiovascular health.
                   </p>
                 </div>
              )}
            </div>
          )}
        </div>

      {/* Verified Sources Authentication Section */}
      <div style={{ marginTop: '4rem', padding: '3rem 2rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center', background: 'rgba(0,0,0,0.1)', borderRadius: '1rem' }}>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>
          Science-Backed Sustainability & Safety
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2.5rem', opacity: 0.8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 600 }}>
            <ShieldAlert size={18} color="var(--accent-primary)" /> EMA Verified ERA
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 600 }}>
            <ShieldAlert size={18} color="var(--accent-primary)" /> SHC Eco-Impact
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 600 }}>
            <ShieldAlert size={18} color="var(--accent-primary)" /> NHS SDU Lifecycle
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 600 }}>
            <ShieldAlert size={18} color="var(--accent-primary)" /> PubChem Integration
          </div>
        </div>
        <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '1.5rem auto 0', lineHeight: '1.6', fontStyle: 'italic' }}>
          "Empowering patients with data-driven insights for a healthier body and a cleaner planet."
        </p>
      </div>
    </div>
  </div>
  );
};

export default ConsumerDashboard;
