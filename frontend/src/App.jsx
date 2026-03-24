import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider, useRole } from './context/RoleContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';

// Consumer Pages
import ConsumerDashboard from './pages/ConsumerDashboard';
import MedicineCabinet from './pages/MedicineCabinet';
import DosageGuide from './pages/DosageGuide';
import SideEffectsChecker from './pages/SideEffectsChecker';

// Researcher Pages
import DrugExplorer from './pages/DrugExplorer';
import ComparisonDashboard from './pages/ComparisonDashboard';
import InteractionChecker from './pages/InteractionChecker';
import ResearchHub from './pages/ResearchHub';

const AppLayout = ({ children }) => {
  const { role } = useRole();
  return (
    <>
      <Navbar />
      <main className="main-content">
        {children}
      </main>
    </>
  );
};

function App() {
  return (
    <RoleProvider>
      <Router>
        <Routes>
          {/* Landing Selection */}
          <Route path="/" element={<AppLayout><LandingPage /></AppLayout>} />

          {/* Consumer Routes */}
          <Route path="/consumer" element={<AppLayout><ConsumerDashboard /></AppLayout>} />
          <Route path="/consumer/cabinet" element={<AppLayout><MedicineCabinet /></AppLayout>} />
          <Route path="/consumer/dosage" element={<AppLayout><DosageGuide /></AppLayout>} />
          <Route path="/consumer/side-effects" element={<AppLayout><SideEffectsChecker /></AppLayout>} />

          {/* Researcher Routes */}
          <Route path="/researcher/explorer" element={<AppLayout><DrugExplorer /></AppLayout>} />
          <Route path="/researcher/compare" element={<AppLayout><ComparisonDashboard /></AppLayout>} />
          <Route path="/researcher/interaction" element={<AppLayout><InteractionChecker /></AppLayout>} />
          <Route path="/researcher/research-hub" element={<AppLayout><ResearchHub /></AppLayout>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </RoleProvider>
  );
}

export default App;
