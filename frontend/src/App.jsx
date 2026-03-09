import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DrugExplorer from './pages/DrugExplorer';
import InteractionChecker from './pages/InteractionChecker';
import ComparisonDashboard from './pages/ComparisonDashboard';

function App() {
  return (
    <Router>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explorer" element={<DrugExplorer />} />
          <Route path="/interaction" element={<InteractionChecker />} />
          <Route path="/compare" element={<ComparisonDashboard />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
