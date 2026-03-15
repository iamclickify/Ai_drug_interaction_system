import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldAlert, Zap, ArrowRight, Play, RotateCcw } from 'lucide-react';
import Tooltip from '../components/Tooltip';

const MechanismAnimation = () => {
  const [step, setStep] = useState(0);

  const steps = [
    { title: "Tissue Injury", desc: "Damage to cell membranes triggers the release of phospholipids." },
    { title: "Arachidonic Acid Release", desc: "Enzymes convert phospholipids into free Arachidonic Acid." },
    { title: "Cyclooxygenase (COX) Activity", desc: "The COX enzyme binds to Arachidonic Acid and oxidizes it." },
    { title: "Prostaglandin Synthesis", desc: "Prostaglandins are produced, signaling pain, fever, and inflammation." },
    { title: "NSAID Inhibition", desc: "An NSAID molecule enters the active site of the COX enzyme, competitively blocking Arachidonic Acid." },
    { title: "Inflammation Reduced", desc: "Prostaglandin synthesis halts. Pain and inflammation subside." }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
  };

  const handleReset = () => {
    setStep(0);
  };

  return (
    <div className="container">
      <h1 className="page-title">Biochemical Mechanism Explorer</h1>
      <p className="page-subtitle" style={{ maxWidth: '800px', marginBottom: '2rem' }}>
        Interactive animation of the cyclooxygenase pathway and how NSAIDs exert their pharmacological effect.
      </p>

      <div className="glass-card" style={{ padding: '2rem' }}>
        
        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative' }}>
           {/* Background track */}
           <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'var(--glass-border)', zIndex: 0 }}></div>
           {/* Active track */}
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${(step / (steps.length - 1)) * 100}%` }}
             style={{ position: 'absolute', top: '50%', left: 0, height: '2px', background: 'var(--accent-primary)', zIndex: 1 }}
             transition={{ duration: 0.5 }}
           />

           {steps.map((s, idx) => (
             <div key={idx} style={{ 
               width: '24px', height: '24px', borderRadius: '50%', 
               background: idx <= step ? 'var(--accent-primary)' : 'var(--bg-primary)',
               border: `2px solid ${idx <= step ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
               zIndex: 2, transition: 'all 0.3s ease'
             }} />
           ))}
        </div>

        {/* Animation Canvas */}
        <div style={{ height: '400px', background: 'rgba(0,0,0,0.3)', borderRadius: '1rem', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)', marginBottom: '2rem' }}>
          
          <AnimatePresence mode="wait">
            
            {/* Step 0: Tissue */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -50 }} className="flex flex-col items-center">
                 <Zap size={64} color="var(--accent-danger)" style={{ marginBottom: '1rem' }} />
                 <h2 style={{ color: 'var(--text-primary)' }}>Trauma / Injury</h2>
                 <p style={{ color: 'var(--text-secondary)' }}>Cell wall disruption occurs</p>
              </motion.div>
            )}

            {/* Step 1: Arachidonic Acid */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }} className="flex flex-col items-center">
                 <div style={{ display: 'flex', gap: '1rem' }}>
                   {[1,2,3].map(i => (
                     <motion.div key={i} animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>AA</motion.div>
                   ))}
                 </div>
                 <h2 style={{ color: 'var(--text-primary)', marginTop: '1.5rem' }}>
                   <Tooltip term="Arachidonic acid" definition="A polyunsaturated omega-6 fatty acid present in the phospholipids of membranes of the body's cells." width="300px">
                     Arachidonic Acid
                   </Tooltip>
                 </h2>
              </motion.div>
            )}

            {/* Step 2: COX Enzyme */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.5 }} style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                 {/* Arachidonic acid moving into COX */}
                 <motion.div animate={{ x: 100, opacity: 0 }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>AA</motion.div>
                 
                 <div style={{ width: '150px', height: '150px', background: 'rgba(167, 139, 250, 0.2)', border: '2px dashed #a78bfa', borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <h2 style={{ color: '#a78bfa', textAlign: 'center' }}>
                     <Tooltip term="Cyclooxygenase (COX)" definition="An enzyme that is responsible for formation of prostanoids, including thromboxane and prostaglandins." width="300px">
                       COX Enzyme
                     </Tooltip>
                     <br/><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>(Active Site)</span>
                   </h2>
                 </div>
              </motion.div>
            )}

            {/* Step 3: Prostaglandins */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                 <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                   {[1,2,3].map(i => (
                     <motion.div key={i} animate={{ scale: [1, 1.2, 1], filter: ['hue-rotate(0deg)', 'hue-rotate(90deg)', 'hue-rotate(0deg)'] }} transition={{ repeat: Infinity, duration: i }} style={{ width: '50px', height: '50px', background: 'var(--accent-danger)', clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>PG</motion.div>
                   ))}
                 </div>
                 <h2 style={{ color: 'var(--accent-danger)' }}>
                   <Tooltip term="Prostaglandins" definition="Lipid autacoids derived from arachidonic acid. They sustain homeostatic functions and mediate pathogenic mechanisms, including the inflammatory response." width="300px">
                     Prostaglandins Created
                   </Tooltip>
                 </h2>
                 <p style={{ color: 'var(--text-secondary)' }}>Fever, Swelling, Pain Receptor Activation</p>
              </motion.div>
            )}

            {/* Step 4: NSAID Inhibition */}
            {step === 4 && (
               <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 
                 {/* NSAID swooping in */}
                 <motion.div initial={{ x: -300, y: -200, rotate: -45 }} animate={{ x: -20, y: 0, rotate: 0 }} transition={{ type: 'spring', damping: 12 }} style={{ position: 'absolute', zIndex: 10, background: 'var(--accent-warning)', color: '#000', padding: '0.5rem 1rem', borderRadius: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldAlert size={20} /> NSAID Molecule
                 </motion.div>

                 <div style={{ width: '150px', height: '150px', background: 'rgba(167, 139, 250, 0.2)', border: '2px solid #a78bfa', borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                   <h2 style={{ color: '#a78bfa' }}>COX Enzyme</h2>
                 </div>

                 <motion.div animate={{ x: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 0.5 }} style={{ position: 'absolute', left: '20%', color: '#60a5fa', fontWeight: 'bold' }}>
                    AA blocked!
                 </motion.div>
               </motion.div>
            )}

            {/* Step 5: Resolution */}
            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                 <Activity size={64} color="var(--accent-secondary)" style={{ marginBottom: '1rem' }} />
                 <h2 style={{ color: 'var(--accent-secondary)' }}>Inflammation Halted</h2>
                 <p style={{ color: 'var(--text-secondary)' }}>Prostaglandin synthesis is suppressed.</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Narrative Box */}
        <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '1.5rem', borderRadius: '0.75rem', minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Phase {step + 1}: {steps[step].title}</h3>
          <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem', lineHeight: '1.6' }}>{steps[step].desc}</p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
           {step < steps.length - 1 ? (
             <button className="btn-primary" onClick={handleNext} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}>
               Next Step <ArrowRight size={20} />
             </button>
           ) : (
             <button className="btn-secondary" onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}>
               Restart Animation <RotateCcw size={20} />
             </button>
           )}
        </div>

      </div>
    </div>
  );
};

export default MechanismAnimation;
