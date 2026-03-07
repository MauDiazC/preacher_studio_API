import React from 'react';
import './Navbar.css';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <a href="/" className="navbar-brand">PREACHER STUDIO</a>
      <div className="navbar-links">
        <a href="/sermons" className="navbar-link">Mis Sermones</a>
        <a href="/profile" className="navbar-link">Perfil</a>
      </div>
      <div className="navbar-actions">
        <button className="navbar-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Cerrar Sesión</button>
      </div>
    </nav>
  );
};

export default Navbar;
