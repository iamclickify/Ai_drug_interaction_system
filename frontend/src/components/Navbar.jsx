import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Search, ShieldAlert, SplitSquareHorizontal, User, FlaskConical, GraduationCap, Pill, AlertTriangle, BookOpen, Layers, Brain, Zap, Calculator, Grid3x3 } from 'lucide-react';
import { useRole } from '../context/RoleContext';

const Navbar = () => {
  const location = useLocation();
  const { role } = useRole();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Return minimal navbar on the landing page
  if (!role || location.pathname === '/') {
    return (
      <nav className="navbar">
        <div className="container nav-container">
           <Link to="/" className="nav-logo">
             <Activity className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
             NSAID Analysis Platform
           </Link>
        </div>
      </nav>
    );
  }

  let navLinks = [];

  if (role === 'consumer') {
    navLinks = [
      { name: 'Symptom Solver', path: '/consumer', icon: <User className="w-4 h-4" /> },
      { name: 'Medicine Cabinet', path: '/consumer/cabinet', icon: <ShieldAlert className="w-4 h-4" /> },
      { name: 'Dosage Guide', path: '/consumer/dosage', icon: <Pill className="w-4 h-4" /> },
      { name: 'Side Effects', path: '/consumer/side-effects', icon: <AlertTriangle className="w-4 h-4" /> }
    ];
  } else if (role === 'student') {
    navLinks = [
      { name: 'SAR Visualizer', path: '/student/sar', icon: <Search className="w-4 h-4" /> },
      { name: 'Case Simulator', path: '/student/cases', icon: <User className="w-4 h-4" /> },
      { name: 'Mechanism', path: '/student/mechanism', icon: <Activity className="w-4 h-4" /> },
      { name: 'Flashcards', path: '/student/flashcards', icon: <Brain className="w-4 h-4" /> },
      { name: 'Classification', path: '/student/classification', icon: <Layers className="w-4 h-4" /> },
      { name: 'Quiz', path: '/student/quiz', icon: <Zap className="w-4 h-4" /> }
    ];
  } else if (role === 'researcher') {
    navLinks = [
      { name: 'Data Explorer', path: '/researcher/explorer', icon: <Search className="w-4 h-4" /> },
      { name: 'Compare', path: '/researcher/compare', icon: <SplitSquareHorizontal className="w-4 h-4" /> },
      { name: 'Interactions', path: '/researcher/interaction', icon: <ShieldAlert className="w-4 h-4" /> },
      { name: 'PK Calculator', path: '/researcher/pk-calculator', icon: <Calculator className="w-4 h-4" /> },
      { name: 'Contraindications', path: '/researcher/contraindications', icon: <Grid3x3 className="w-4 h-4" /> },
      { name: 'Research Hub', path: '/researcher/research-hub', icon: <BookOpen className="w-4 h-4" /> }
    ];
  }

  return (
    <nav className="navbar">
      <div className="container nav-container">
        
        <Link to="/" className="nav-logo">
          <Activity className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
          NSAID Database
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', background: role === 'consumer' ? 'rgba(59, 130, 246, 0.15)' : role === 'student' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(167, 139, 250, 0.15)', padding: '0.2rem 0.5rem', borderRadius: '4px', marginLeft: '0.5rem', color: role === 'consumer' ? '#60a5fa' : role === 'student' ? '#10b981' : '#a78bfa' }}>
            {role}
          </span>
        </Link>

        <div className="nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              style={{ fontSize: navLinks.length > 5 ? '0.85rem' : '0.9rem', gap: '0.35rem' }}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
          
          <Link to="/" className="nav-link" style={{ marginLeft: '0.75rem', borderLeft: '1px solid var(--glass-border)', paddingLeft: '0.75rem', color: 'var(--accent-warning)', fontSize: '0.85rem' }}>
             ↩ Role
          </Link>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
