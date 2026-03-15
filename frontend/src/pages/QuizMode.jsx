import React, { useState, useMemo } from 'react';
import { CheckCircle, XCircle, Trophy, RotateCcw, Zap } from 'lucide-react';

const questionBank = [
  { q: 'Which NSAID irreversibly inhibits COX enzymes?', options: ['Ibuprofen', 'Aspirin', 'Celecoxib', 'Naproxen'], correct: 1, explanation: 'Aspirin irreversibly acetylates Serine-530 on COX-1, permanently inactivating the enzyme. All other NSAIDs bind reversibly.' },
  { q: 'Which class of NSAIDs has the LOWEST cardiovascular risk?', options: ['COX-2 selective (Coxibs)', 'Propionic Acids', 'Acetic Acids', 'Oxicams'], correct: 1, explanation: 'Propionic acid derivatives, particularly Naproxen, have the lowest cardiovascular risk among all NSAID classes.' },
  { q: 'Celecoxib achieves COX-2 selectivity because of which structural feature?', options: ['Carboxylic acid group', 'Sulfonamide group', 'Acetyl group', 'Isobutyl group'], correct: 1, explanation: 'The sulfonamide group fits into a hydrophilic side-pocket unique to COX-2 (Val523 vs Ile523 in COX-1).' },
  { q: 'Why is Aspirin contraindicated in children with viral infections?', options: ['Higher GI bleeding risk', 'Risk of Reye\'s Syndrome', 'Enhanced viral replication', 'Hepatic toxicity'], correct: 1, explanation: 'Aspirin use in children with viral infections (especially influenza or varicella) is associated with Reye\'s Syndrome — a potentially fatal condition causing liver failure and encephalopathy.' },
  { q: 'Which NSAID has a half-life of approximately 50 hours?', options: ['Ibuprofen', 'Ketorolac', 'Piroxicam', 'Aspirin'], correct: 2, explanation: 'Piroxicam (an oxicam) has a ~50-hour half-life, making it one of the longest-acting NSAIDs. This enables once-daily dosing but takes ~10 days to reach steady state.' },
  { q: 'Which drug was withdrawn from the market due to increased MI risk?', options: ['Celecoxib', 'Rofecoxib (Vioxx)', 'Meloxicam', 'Diclofenac'], correct: 1, explanation: 'Rofecoxib (Vioxx) was voluntarily withdrawn by Merck in 2004 after the APPROVe trial showed a 2x increased risk of myocardial infarction versus placebo.' },
  { q: 'What is the maximum duration of Ketorolac (Toradol) use?', options: ['3 days', '5 days', '14 days', '30 days'], correct: 1, explanation: 'Ketorolac is strictly limited to a maximum of 5 days due to extremely high GI bleeding risk. It is one of the most potent analgesic NSAIDs.' },
  { q: 'Indomethacin is uniquely used in neonates to close which structure?', options: ['Foramen ovale', 'Patent Ductus Arteriosus', 'Ductus venosus', 'Umbilical vein'], correct: 1, explanation: 'The ductus arteriosus is kept patent by prostaglandin E2. Indomethacin blocks PGE2 synthesis, allowing the duct to close in premature neonates.' },
  { q: 'Which NSAID is available as a topical gel with significantly lower systemic absorption?', options: ['Naproxen', 'Celecoxib', 'Diclofenac', 'Aspirin'], correct: 2, explanation: 'Diclofenac topical gel (Voltaren) achieves local anti-inflammatory effects with 5-17x lower systemic exposure compared to oral formulations.' },
  { q: 'Ibuprofen\'s S-enantiomer is the active form. What happens to the R-enantiomer?', options: ['It is excreted unchanged', 'It is converted to S-form in vivo', 'It blocks COX-1 only', 'It is toxic'], correct: 1, explanation: 'The inactive R-enantiomer of Ibuprofen undergoes unidirectional chiral inversion to the active S-enantiomer via the enzyme alpha-methylacyl-CoA racemase.' },
  { q: 'Which NSAID has the highest GI toxicity risk profile?', options: ['Meloxicam', 'Celecoxib', 'Piroxicam', 'Naproxen'], correct: 2, explanation: 'Piroxicam has the highest GI toxicity risk due to its 50-hour half-life causing prolonged, non-selective COX-1 inhibition in the gastric mucosa.' },
  { q: 'What is the primary binding anchor for most NSAIDs in the COX active site?', options: ['Hydrogen bond to Tyr385', 'Ion-pair with Arg120', 'Covalent bond to Ser530', 'Hydrophobic packing with Trp387'], correct: 1, explanation: 'The carboxylic acid group of most NSAIDs forms an ion-pair (salt bridge) with the positively charged Arg120 residue at the mouth of the COX channel.' },
  { q: 'In a patient with recent MI, which NSAID is generally preferred?', options: ['Diclofenac', 'Celecoxib', 'Naproxen', 'Indomethacin'], correct: 2, explanation: 'Naproxen is preferred in cardiovascular patients because it has the lowest CV risk among NSAIDs, with some antiplatelet activity similar to aspirin.' },
  { q: 'What happens when Ibuprofen is taken with low-dose Aspirin for cardiac protection?', options: ['Synergistic effect', 'Ibuprofen blocks Aspirin\'s antiplatelet effect', 'No interaction', 'Enhanced GI protection'], correct: 1, explanation: 'Ibuprofen competitively blocks access to Ser530, preventing Aspirin\'s irreversible acetylation. This negates Aspirin\'s cardioprotective antiplatelet effect — a clinically critical interaction.' },
  { q: 'COX-2 is primarily induced by which type of stimulus?', options: ['Normal homeostasis', 'Inflammatory cytokines', 'Gastric acid', 'Neural signals'], correct: 1, explanation: 'COX-2 is an inducible enzyme upregulated by inflammatory cytokines (IL-1, TNF-α), endotoxins, and growth factors at sites of inflammation.' }
];

const QuizMode = () => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [quizFinished, setQuizFinished] = useState(false);

  const questions = useMemo(() => {
    const shuffled = [...questionBank].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 15);
  }, [quizStarted]);

  const handleStart = () => {
    setQuizStarted(true);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
    setQuizFinished(false);
  };

  const handleSelect = (idx) => {
    if (showResult) return;
    setSelectedAnswer(idx);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    const isCorrect = selectedAnswer === questions[currentQ].correct;
    if (isCorrect) setScore(prev => prev + 1);
    setAnswers([...answers, { qIdx: currentQ, selected: selectedAnswer, correct: questions[currentQ].correct, isCorrect }]);
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQ + 1 >= questions.length) {
      setQuizFinished(true);
    } else {
      setCurrentQ(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const getGrade = () => {
    if (pct >= 90) return { grade: 'A+', msg: 'Outstanding! Clinical-ready knowledge.', color: '#10b981' };
    if (pct >= 75) return { grade: 'A', msg: 'Excellent understanding of NSAID pharmacology.', color: '#34d399' };
    if (pct >= 60) return { grade: 'B', msg: 'Good foundation, review the missed topics.', color: '#3b82f6' };
    if (pct >= 40) return { grade: 'C', msg: 'Needs improvement. Revisit the flashcards.', color: '#f59e0b' };
    return { grade: 'D', msg: 'Significant gaps. Study the classification and mechanisms.', color: '#ef4444' };
  };

  // Start screen
  if (!quizStarted) {
    return (
      <div className="container" style={{ animation: 'fadeIn 0.5s ease' }}>
        <h1 className="page-title">Pharmacology Quiz</h1>
        <div className="glass-card" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
          <Zap size={64} color="var(--accent-warning)" style={{ marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Test Your NSAID Knowledge</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
            15 randomized questions covering drug classes, mechanisms, contraindications, clinical scenarios, and pharmacokinetics. 
            Each question has a detailed explanation.
          </p>
          <button className="btn-primary" onClick={handleStart} style={{ padding: '1rem 3rem', fontSize: '1.15rem' }}>
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  // Scorecard
  if (quizFinished) {
    const gradeInfo = getGrade();
    return (
      <div className="container" style={{ animation: 'fadeIn 0.5s ease' }}>
        <h1 className="page-title">Quiz Results</h1>
        <div className="glass-card" style={{ maxWidth: '700px', margin: '2rem auto', textAlign: 'center' }}>
          <Trophy size={64} color={gradeInfo.color} style={{ marginBottom: '1rem' }} />
          
          {/* Score Ring */}
          <div className="score-ring" style={{ margin: '0 auto 1.5rem' }}>
            <svg width="140" height="140">
              <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
              <circle cx="70" cy="70" r="60" fill="none" stroke={gradeInfo.color} strokeWidth="8" strokeDasharray={`${pct * 3.77} 377`} strokeLinecap="round" />
            </svg>
            <span className="score-text" style={{ color: gradeInfo.color }}>{pct}%</span>
          </div>

          <h2 style={{ fontSize: '2.5rem', color: gradeInfo.color, marginBottom: '0.5rem' }}>Grade: {gradeInfo.grade}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{score}/{questions.length} correct</p>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{gradeInfo.msg}</p>

          {/* Answer Review */}
          <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Answer Review</h3>
            {answers.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', borderBottom: '1px solid var(--glass-border)' }}>
                {a.isCorrect ? <CheckCircle size={20} color="var(--accent-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} /> : <XCircle size={20} color="var(--accent-danger)" style={{ flexShrink: 0, marginTop: '2px' }} />}
                <div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{questions[a.qIdx].q}</p>
                  {!a.isCorrect && <p style={{ fontSize: '0.8rem', color: 'var(--accent-danger)' }}>Your answer: {questions[a.qIdx].options[a.selected]} → Correct: {questions[a.qIdx].options[a.correct]}</p>}
                </div>
              </div>
            ))}
          </div>

          <button className="btn-primary" onClick={handleStart} style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
            <RotateCcw size={20} /> Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  // Quiz in progress
  const q = questions[currentQ];
  const isCorrect = selectedAnswer === q.correct;

  return (
    <div className="container" style={{ animation: 'fadeIn 0.5s ease' }}>
      <h1 className="page-title">Pharmacology Quiz</h1>

      {/* Progress */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Question {currentQ + 1} of {questions.length}</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--accent-secondary)' }}>Score: {score}/{currentQ + (showResult ? 1 : 0)}</span>
        </div>
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${((currentQ + (showResult ? 1 : 0)) / questions.length) * 100}%`, backgroundColor: 'var(--accent-primary)' }} />
        </div>
      </div>

      <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: '2rem', lineHeight: '1.5' }}>{q.q}</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
          {q.options.map((opt, idx) => {
            let bg = 'rgba(255,255,255,0.05)';
            let border = 'transparent';
            let color = 'var(--text-primary)';

            if (showResult) {
              if (idx === q.correct) { bg = 'rgba(16, 185, 129, 0.2)'; border = 'var(--accent-secondary)'; color = 'var(--accent-secondary)'; }
              else if (idx === selectedAnswer && !isCorrect) { bg = 'rgba(239, 68, 68, 0.2)'; border = 'var(--accent-danger)'; color = 'var(--accent-danger)'; }
              else { bg = 'rgba(255,255,255,0.02)'; color = 'var(--text-secondary)'; }
            } else if (selectedAnswer === idx) {
              bg = 'rgba(59, 130, 246, 0.2)'; border = 'var(--accent-primary)';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={showResult}
                style={{
                  padding: '1rem 1.25rem',
                  background: bg,
                  border: `2px solid ${border}`,
                  borderRadius: '0.5rem',
                  color,
                  cursor: showResult ? 'default' : 'pointer',
                  textAlign: 'left',
                  fontSize: '1.05rem',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <span style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.1)', fontSize: '0.85rem', fontWeight: 600, flexShrink: 0 }}>
                  {String.fromCharCode(65 + idx)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {showResult && (
          <div style={{ padding: '1.25rem', background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem', borderLeft: `3px solid ${isCorrect ? 'var(--accent-secondary)' : 'var(--accent-danger)'}`, marginBottom: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {isCorrect ? <CheckCircle size={20} color="var(--accent-secondary)" /> : <XCircle size={20} color="var(--accent-danger)" />}
              <strong style={{ color: isCorrect ? 'var(--accent-secondary)' : 'var(--accent-danger)' }}>{isCorrect ? 'Correct!' : 'Incorrect'}</strong>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{q.explanation}</p>
          </div>
        )}

        {!showResult ? (
          <button className="btn-primary" style={{ width: '100%', padding: '1rem' }} onClick={handleSubmit} disabled={selectedAnswer === null}>
            Submit Answer
          </button>
        ) : (
          <button className="btn-primary" style={{ width: '100%', padding: '1rem' }} onClick={handleNext}>
            {currentQ + 1 >= questions.length ? 'View Results' : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizMode;
