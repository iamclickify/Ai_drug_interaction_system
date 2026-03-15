import React, { useState, useMemo } from 'react';
import { RotateCcw, ChevronLeft, ChevronRight, Shuffle, BookOpen, Brain } from 'lucide-react';

const flashcardData = [
  { drug: 'Ibuprofen', category: 'Propionic Acid', moa: 'Non-selective COX-1/COX-2 inhibitor. Reversibly blocks arachidonic acid conversion to prostaglandins.', sideEffects: 'GI upset, ulcers, renal impairment, CV risk with chronic use', contraindications: 'Active GI bleeding, 3rd trimester pregnancy, severe renal impairment, aspirin-exacerbated respiratory disease', halfLife: '2-4 hours', keyFact: 'Only the S-enantiomer is pharmacologically active. The R-enantiomer undergoes in vivo inversion to the active S-form.' },
  { drug: 'Naproxen', category: 'Propionic Acid', moa: 'Non-selective COX inhibitor with longer half-life. Provides sustained anti-inflammatory and mild antiplatelet effect.', sideEffects: 'GI toxicity, fluid retention, headache, dizziness', contraindications: 'Active peptic ulcer, severe heart failure, late pregnancy', halfLife: '12-17 hours', keyFact: 'Has the lowest cardiovascular risk among all NSAIDs — often preferred in patients with cardiac history.' },
  { drug: 'Aspirin', category: 'Salicylate', moa: 'Irreversibly acetylates Serine-530 on COX-1, permanently disabling the enzyme. Low doses preferentially inhibit platelet thromboxane A2.', sideEffects: 'GI bleeding, tinnitus at high doses (salicylism), Reye\'s syndrome in children', contraindications: 'Children with viral infections, hemophilia, active bleeding, late pregnancy', halfLife: '15-20 minutes (acetylsalicylic acid); effect lasts platelet lifetime (7-10 days)', keyFact: 'The only NSAID that irreversibly inhibits COX. Low-dose (81 mg) is used for cardiovascular prophylaxis.' },
  { drug: 'Celecoxib', category: 'COX-2 Selective (Coxib)', moa: 'Selective COX-2 inhibitor. Spares COX-1 (stomach protection) while blocking COX-2 (inflammation). Exploits a hydrophilic side-pocket unique to COX-2.', sideEffects: 'Cardiovascular thrombotic events, edema, hypertension, headache', contraindications: 'Sulfonamide allergy (cross-reactivity), established cardiovascular disease, post-CABG surgery', halfLife: '11 hours', keyFact: 'Sulfonamide group fits into the Val523→Ile523 side-pocket of COX-2. COX-1 has isoleucine blocking this pocket.' },
  { drug: 'Diclofenac', category: 'Acetic Acid Derivative', moa: 'Potent non-selective COX inhibitor. The dichloro-phenyl ring creates a non-planar geometry ideal for tight COX channel binding.', sideEffects: 'GI toxicity, hepatotoxicity (monitor LFTs), CV risk similar to coxibs', contraindications: 'Hepatic porphyria, active liver disease, heart failure', halfLife: '1-2 hours', keyFact: 'Available as oral, topical gel (Voltaren), and suppository. Topical form has 5-17x lower systemic exposure.' },
  { drug: 'Indomethacin', category: 'Acetic Acid Derivative', moa: 'Very potent non-selective COX inhibitor. Crosses BBB readily — causes high CNS side effects.', sideEffects: 'Severe frontal headache (most common), GI ulceration, renal impairment, CNS effects', contraindications: 'History of proctitis (for suppository), neonates with proven or suspected infection', halfLife: '4-5 hours', keyFact: 'Used to close Patent Ductus Arteriosus (PDA) in premature neonates — exploits prostaglandin-dependent duct patency.' },
  { drug: 'Ketorolac', category: 'Acetic Acid Derivative', moa: 'Highly potent non-selective COX inhibitor. Primarily analgesic with minimal anti-inflammatory properties.', sideEffects: 'Severe GI bleeding, renal failure, wound bleeding', contraindications: 'Use > 5 days, pre-operative setting, renal impairment, active bleeding', halfLife: '5-6 hours', keyFact: 'Max 5 days of use. Its potency approaches opioid analgesics. Often used post-operatively as an opioid-sparing agent.' },
  { drug: 'Piroxicam', category: 'Oxicam (Enolic Acid)', moa: 'Non-selective COX inhibitor with extremely long half-life enabling once-daily dosing.', sideEffects: 'Highest GI toxicity risk among NSAIDs, photosensitivity, skin reactions', contraindications: 'History of GI bleeding, concurrent anticoagulant therapy, elderly patients', halfLife: '50 hours', keyFact: '50-hour half-life means it takes ~10 days to reach steady state. Terrible for acute pain but useful for chronic conditions requiring stable plasma levels.' },
  { drug: 'Meloxicam', category: 'Oxicam (Enolic Acid)', moa: 'Preferentially inhibits COX-2 at low doses. At higher doses becomes non-selective.', sideEffects: 'GI upset (lower than non-selective), edema, dizziness', contraindications: 'Severe hepatic impairment, active GI ulceration, late pregnancy', halfLife: '15-20 hours', keyFact: 'A "preferential" COX-2 inhibitor (not selective like Celecoxib). COX-2 selectivity decreases as dose increases.' }
];

const FlashcardMode = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [viewedCards, setViewedCards] = useState(new Set([0]));

  const cards = useMemo(() => {
    if (isShuffled) {
      const shuffled = [...flashcardData];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }
    return flashcardData;
  }, [isShuffled]);

  const card = cards[currentIdx];

  const goNext = () => {
    setIsFlipped(false);
    const next = (currentIdx + 1) % cards.length;
    setCurrentIdx(next);
    setViewedCards(prev => new Set([...prev, next]));
  };

  const goPrev = () => {
    setIsFlipped(false);
    const prev = currentIdx === 0 ? cards.length - 1 : currentIdx - 1;
    setCurrentIdx(prev);
    setViewedCards(p => new Set([...p, prev]));
  };

  const handleShuffle = () => {
    setIsShuffled(!isShuffled);
    setCurrentIdx(0);
    setIsFlipped(false);
    setViewedCards(new Set([0]));
  };

  const handleReset = () => {
    setIsShuffled(false);
    setCurrentIdx(0);
    setIsFlipped(false);
    setViewedCards(new Set([0]));
  };

  const progress = (viewedCards.size / cards.length) * 100;

  return (
    <div className="container" style={{ animation: 'fadeIn 0.5s ease' }}>
      <h1 className="page-title">Pharmacology Flashcards</h1>
      <p className="page-subtitle" style={{ maxWidth: '800px', marginBottom: '1.5rem' }}>
        Click each card to flip and reveal key pharmacological facts. Navigate through all {cards.length} NSAID flashcards to test your knowledge.
      </p>

      {/* Progress Bar */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Card {currentIdx + 1} of {cards.length}</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{viewedCards.size}/{cards.length} viewed</span>
        </div>
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%`, backgroundColor: 'var(--accent-primary)' }} />
        </div>
      </div>

      {/* Flashcard */}
      <div className="flashcard-container" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
          {/* Front */}
          <div className="flashcard-front">
            <span className="badge badge-blue" style={{ marginBottom: '1.5rem' }}>{card.category}</span>
            <h2 style={{ fontSize: '3rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>{card.drug}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Click to reveal pharmacology →</p>
            <Brain size={32} color="var(--accent-primary)" style={{ marginTop: '1.5rem', opacity: 0.5 }} />
          </div>

          {/* Back */}
          <div className="flashcard-back">
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>{card.drug}</h3>
            <div style={{ textAlign: 'left', width: '100%', maxWidth: '550px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <strong style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Mechanism of Action</strong>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{card.moa}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <strong style={{ color: 'var(--accent-warning)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Side Effects</strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{card.sideEffects}</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--accent-danger)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Contraindications</strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{card.contraindications}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div><strong style={{ color: '#a78bfa', fontSize: '0.8rem' }}>HALF-LIFE:</strong> <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{card.halfLife}</span></div>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem', borderLeft: '3px solid var(--accent-secondary)' }}>
                <strong style={{ color: 'var(--accent-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>💡 Key Fact</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.4', marginTop: '0.25rem' }}>{card.keyFact}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
        <button className="btn-secondary" onClick={goPrev} style={{ padding: '0.75rem 1.25rem' }}>
          <ChevronLeft size={20} /> Previous
        </button>

        <button className="btn-secondary" onClick={handleShuffle} style={{ padding: '0.75rem 1.25rem', color: isShuffled ? 'var(--accent-warning)' : 'var(--text-primary)' }}>
          <Shuffle size={20} /> {isShuffled ? 'Shuffled' : 'Shuffle'}
        </button>

        <button className="btn-secondary" onClick={handleReset} style={{ padding: '0.75rem 1.25rem' }}>
          <RotateCcw size={20} /> Reset
        </button>

        <button className="btn-primary" onClick={goNext} style={{ padding: '0.75rem 1.25rem' }}>
          Next <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default FlashcardMode;
