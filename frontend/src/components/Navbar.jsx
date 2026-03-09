import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Search, ShieldAlert, SplitSquareHorizontal } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/', icon: <Activity className="w-4 h-4" /> },
    { name: 'Explorer', path: '/explorer', icon: <Search className="w-4 h-4" /> },
    { name: 'Interaction', path: '/interaction', icon: <ShieldAlert className="w-4 h-4" /> },
    { name: 'Compare', path: '/compare', icon: <SplitSquareHorizontal className="w-4 h-4" /> },
  ];

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <div className="nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
