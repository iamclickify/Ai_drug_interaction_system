import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { User, GraduationCap, FlaskConical, Pill, ShieldAlert, Heart, BookOpen, Brain, Layers, Zap, Calculator, Grid3x3, Search } from 'lucide-react';

const LandingPage = () => {
  const { setRole } = useRole();
  const navigate = useNavigate();

  const handleRoleSelection = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === 'consumer') {
      navigate('/consumer');
    } else if (selectedRole === 'researcher') {
      navigate('/researcher/explorer');
    }
  };

  return (
    <div className="container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Pharmaguide AI
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>
          Select your portal to begin exploring Nonsteroidal Anti-inflammatory Drugs.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', width: '100%', maxWidth: '1100px' }}>
        
        {/* Consumer Card */}
        <div 
          className="glass-card" 
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'all 0.3s ease', borderTop: '4px solid #3b82f6' }}
          onClick={() => handleRoleSelection('consumer')}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <User size={48} color="#60a5fa" />
          </div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>I am a Consumer</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
            Learn about common pain relievers, check for drug overlaps, and understand dosing in simple language.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' }}>
            <span className="badge badge-blue">Symptom Solver</span>
            <span className="badge badge-blue">Medicine Cabinet</span>
            <span className="badge badge-blue">Dosage Guide</span>
            <span className="badge badge-blue">Side Effects</span>
          </div>
        </div>

        {/* Researcher Card */}
        <div 
          className="glass-card" 
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'all 0.3s ease', borderTop: '4px solid #a78bfa' }}
          onClick={() => handleRoleSelection('researcher')}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ padding: '1.5rem', background: 'rgba(167, 139, 250, 0.1)', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <FlaskConical size={48} color="#a78bfa" />
          </div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>I am a Pharmacist / Researcher</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
            Access cheminformatics, PK calculators, contraindication matrices, and deep drug interaction analytics.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' }}>
            <span className="badge badge-purple">Data Explorer</span>
            <span className="badge badge-purple">Compare</span>
            <span className="badge badge-purple">Interactions</span>
            <span className="badge badge-purple">PK Calculator</span>
            <span className="badge badge-purple">Contraindications</span>
            <span className="badge badge-purple">Research Hub</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;
