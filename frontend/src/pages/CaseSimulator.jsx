import { User, CheckCircle, XCircle, Stethoscope, AlertTriangle } from 'lucide-react';
import GlossaryTooltip from '../components/GlossaryTooltip';

const mockCases = [
  {
    id: 1,
    patient: "Eleanor, 68 yo Female",
    history: "Severe osteoarthritis in both knees. History of bleeding gastric ulcers 2 years ago. Normal blood pressure and kidney function.",
    goal: "Requires daily NSAID therapy for mobility.",
    options: ["Ibuprofen", "Naproxen", "Celecoxib", "Ketorolac"],
    correct: "Celecoxib",
    explanation: "Celecoxib is a selective COX-2 inhibitor. Because Eleanor has a history of severe GI bleeding (ulcers), non-selective NSAIDs like Ibuprofen or Naproxen carry an unacceptably high risk of re-bleeding. Celecoxib spares COX-1 (which protects the stomach lining) while treating the arthritis pain via COX-2 inhibition.",
    pitfalls: {
      "Ibuprofen": {
        outcome: "Complication: Acute Gastric Bleed",
        details: "Eleanor was admitted 48 hours later with hematemesis. Inhibiting COX-1 in a patient with recent ulcer history triggered immediate erosion of the gastric mucosa."
      },
      "Naproxen": {
        outcome: "Complication: Severe Abdominal Pain",
        details: "Patient reported sharp epigastric pain. Endoscopy revealed new erosions. Naproxen's long half-life extended the period of gastric prostaglandin suppression."
      },
      "Ketorolac": {
        outcome: "Critical Error: Emergency Admission",
        details: "Ketorolac caused a major ulcer perforation. This is a high-potency drug that should NEVER be used in patients with this history for chronic pain."
      }
    },
    successOutcome: "Excellent Mobility Improvement",
    successDetails: "Celecoxib successfully reduced joint inflammation without affecting Eleanor's sensitive gastric lining. She is now walking 30 minutes daily."
  },
  {
    id: 2,
    patient: "Marcus, 55 yo Male",
    history: "Recent myocardial infarction (heart attack) 6 months ago. Currently taking low-dose aspirin and beta-blockers. Needs relief for an acute ankle sprain.",
    goal: "Requires short-term inflammation relief without increasing cardiovascular risk.",
    options: ["Naproxen", "Celecoxib", "Diclofenac", "Meloxicam"],
    correct: "Naproxen",
    explanation: "Naproxen is generally considered the NSAID with the lowest cardiovascular risk profile. In a patient with recent MI, avoiding pro-thrombotic states is critical. Naproxen's long half-life and strong COX-1 inhibition provide sustained anti-platelet effects similar to (though less irreversible than) Aspirin.",
    pitfalls: {
      "Celecoxib": {
        outcome: "Complication: Thrombotic Event",
        details: "Marcus experienced atypical chest pain. Selective COX-2 inhibition without aspirin coverage (Celecoxib can block aspirin binding) increased his pro-thrombotic risk profile."
      },
      "Diclofenac": {
        outcome: "Warning: Elevated Lab Markers",
        details: "Blood work showed increased markers for cardiovascular stress. Diclofenac behaves too much like a COX-2 inhibitor for high-risk cardiac patients."
      },
      "Meloxicam": {
        outcome: "Unstable: Fluctuating Blood Pressure",
        details: "Marcus's blood pressure spiked. Meloxicam provides inconsistent CV safety in post-MI patients."
      }
    },
    successOutcome: "Safe Inflammation Control",
    successDetails: "Naproxen effectively managed the ankle sprain. Its unique CV safety profile made it the only acceptable NSAID for a patient with his cardiac history."
  },
  {
    id: 3,
    patient: "Sarah, 22 yo Female",
    history: "No significant medical history. Presents with acute, severe primary dysmenorrhea (menstrual cramps).",
    goal: "Rapid onset relief for acute pain.",
    options: ["Celecoxib", "Ibuprofen", "Indomethacin", "Piroxicam"],
    correct: "Ibuprofen",
    explanation: "Ibuprofen is highly effective for dysmenorrhea due to its rapid onset of action and strong inhibition of endometrial prostaglandins. Given her lack of GI or CV risk factors, a standard non-selective NSAID is the first-line choice.",
    pitfalls: {
      "Celecoxib": {
        outcome: "Inefficient: Financial Strain",
        details: "While effective, the patient was frustrated by the high cost of the brand-name prescription for a simple acute condition that generic OTCs treat better."
      },
      "Indomethacin": {
        outcome: "Complication: Severe Visual Disturbance",
        details: "Sarah experienced 'splitting' headaches and dizziness. Indomethacin's CNS penetration makes it a poor choice for routine menstrual pain."
      },
      "Piroxicam": {
        outcome: "Delayed: Persistent Pain",
        details: "The patient reported no relief for 12 hours. Piroxicam's slow onset makes it useless for acute spasmodic pain."
      }
    },
    successOutcome: "Rapid Pain Resolution",
    successDetails: "Ibuprofen worked within 45 minutes by targeted suppression of uterine prostaglandins. Sarah returned to normal activities the same day."
  }
];

const CaseSimulator = () => {
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const activeCase = mockCases[activeCaseIdx];

  const handleSelect = (drug) => {
    setSelectedAnswer(drug);
    setShowResult(false);
  };

  const handleSubmit = () => {
    if (selectedAnswer) {
      setShowResult(true);
    }
  };

  const handleNext = () => {
    setActiveCaseIdx((prev) => (prev + 1) % mockCases.length);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const isCorrect = selectedAnswer === activeCase.correct;

  return (
    <div className="container" style={{ animation: 'fadeIn 0.5s ease' }}>
      <h1 className="page-title">Clinical Case Grader</h1>
      <p className="page-subtitle" style={{ maxWidth: '800px', marginBottom: '2rem' }}>
        Test your pharmacological knowledge. Apply <GlossaryTooltip term="NSAID">NSAID</GlossaryTooltip> Structure-Activity and kinetic principles to mock patients based on real-world clinical prescribing guidelines.
      </p>

      {/* Progress */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {mockCases.map((c, idx) => (
          <div 
            key={c.id} 
            style={{ 
              height: '6px', 
              flex: 1, 
              background: idx === activeCaseIdx ? 'var(--accent-primary)' : idx < activeCaseIdx ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255,255,255,0.1)',
              borderRadius: '3px',
              transition: 'background 0.3s'
            }} 
          />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.5fr) 1fr', gap: '2rem' }}>
         
         {/* Patient Profile */}
         <div className="glass-card" style={{ alignSelf: 'start', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--accent-primary)' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
               <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '50%' }}>
                 <User size={32} color="var(--accent-primary)" />
               </div>
               <div>
                  <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{activeCase.patient}</h2>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Case {activeCaseIdx + 1} of {mockCases.length}</span>
               </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
               <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Stethoscope size={18} /> Medical History
               </h3>
               <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--text-primary)', background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--glass-border)' }}>
                 {activeCase.history}
               </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
               <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-warning)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <AlertTriangle size={18} /> Treatment Goal
               </h3>
               <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--text-primary)', fontWeight: 600 }}>
                 {activeCase.goal}
               </p>
            </div>

            {/* Answer Selection */}
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Select the optimal <GlossaryTooltip term="NSAID">NSAID</GlossaryTooltip>:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
               {activeCase.options.map(opt => (
                  <button 
                     key={opt}
                     onClick={() => handleSelect(opt)}
                     disabled={showResult}
                     style={{
                        padding: '1rem',
                        fontSize: '1.1rem',
                        fontWeight: selectedAnswer === opt ? 600 : 400,
                        background: selectedAnswer === opt ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                        border: `2px solid ${selectedAnswer === opt ? 'var(--accent-primary)' : 'transparent'}`,
                        borderRadius: '0.5rem',
                        color: 'var(--text-primary)',
                        cursor: showResult ? 'default' : 'pointer',
                        transition: 'all 0.2s',
                        opacity: showResult && selectedAnswer !== opt ? 0.5 : 1
                     }}
                  >
                     {opt}
                  </button>
               ))}
            </div>

            {!showResult && (
               <button 
                  className="btn-primary" 
                  style={{ width: '100%', marginTop: '2rem', fontSize: '1.1rem', padding: '1rem' }}
                  onClick={handleSubmit}
                  disabled={!selectedAnswer}
               >
                  Submit Diagnosis
               </button>
            )}
         </div>

         {/* Grading Feedback Pane */}
         <div>
            {showResult && (
               <div className="glass-card" style={{ animation: 'slideUp 0.4s ease', borderLeft: `4px solid ${isCorrect ? 'var(--accent-secondary)' : 'var(--accent-danger)'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                     {isCorrect ? <CheckCircle size={32} color="var(--accent-secondary)" /> : <XCircle size={32} color="var(--accent-danger)" />}
                     <h2 style={{ fontSize: '1.5rem', color: isCorrect ? 'var(--accent-secondary)' : 'var(--accent-danger)' }}>
                        {isCorrect ? "Correct Prescription" : "Clinical Error"}
                     </h2>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                     <strong style={{ display: 'block', marginBottom: '0.5rem', color: isCorrect ? 'var(--accent-secondary)' : 'var(--accent-danger)' }}>
                        {isCorrect ? "Outcome:" : "Patient Outcome:"} {isCorrect ? activeCase.successOutcome : activeCase.pitfalls[selectedAnswer].outcome}
                     </strong>
                     <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--text-primary)', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
                        {isCorrect ? activeCase.successDetails : activeCase.pitfalls[selectedAnswer].details}
                     </p>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                     <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Pharmacological Rationale:</strong>
                     <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                        {activeCase.explanation}
                     </p>
                  </div>

                  {!isCorrect && (
                     <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                        <strong style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: '0.25rem' }}>Correct Answer: {activeCase.correct}</strong>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{activeCase.explanation}</p>
                     </div>
                  )}

                  <button className="btn-primary" style={{ width: '100%' }} onClick={handleNext}>
                     {activeCaseIdx === mockCases.length - 1 ? "Start Over" : "Next Clinical Case"}
                  </button>
               </div>
            )}
         </div>

      </div>
    </div>
  );
};

export default CaseSimulator;
