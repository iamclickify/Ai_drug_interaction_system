import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldAlert, SplitSquareHorizontal, Activity } from 'lucide-react';

const Home = () => {
  return (
    <div className="container">
      <div style={{ textAlign: 'center', marginTop: '4rem', marginBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <Activity size={64} style={{ color: 'var(--accent-primary)' }} />
        </div>
        <h1 className="page-title">AI Drug Interaction & Prediction System</h1>
        <p className="page-subtitle" style={{ maxWidth: '800px', margin: '0 auto 2rem auto' }}>
          An advanced machine learning platform for predicting drug effectiveness, identifying potential toxicity, and discovering adverse drug-drug interactions using molecular structure analysis.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/explorer" className="btn-primary">Get Started</Link>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', color: 'var(--accent-primary)' }}>
              <Search size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>Drug Explorer</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Analyze individual pharmaceutical compounds. Instantly predict molecular effectiveness and potential human toxicity based on SMILES structural representations.
          </p>
          <Link to="/explorer" className="btn-primary" style={{ width: '100%' }}>Launch Explorer</Link>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
             <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem', color: 'var(--accent-danger)' }}>
              <ShieldAlert size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>Interaction Checker</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Safeguard polypharmacy. Cross-reference two specific medications to identify severe structural interactions and combined toxicity warnings.
          </p>
          <Link to="/interaction" className="btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg, var(--accent-danger), #b91c1c)' }}>Check Interactions</Link>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
             <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem', color: 'var(--accent-secondary)' }}>
              <SplitSquareHorizontal size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>Compare Drugs</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Perform side-by-side efficacy comparisons. Evaluate alternative treatment options by visualizing predictive model outputs in a comprehensive dashboard.
          </p>
          <Link to="/compare" className="btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg, var(--accent-secondary), #059669)' }}>Compare Drugs</Link>
        </div>
      </div>
      
      {/* Footer */}
      <footer style={{
        marginTop: '4rem',
        padding: '2rem 0',
        textAlign: 'center',
        borderTop: '1px solid var(--glass-border)',
        color: 'var(--text-secondary)'
      }}>
        Made with ❤️ by IIT Karvenagar
      </footer>
    </div>
  );
};

export default Home;
