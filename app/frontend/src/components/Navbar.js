import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span role="img" aria-label="face icon" style={{ fontSize: '1.5rem' }}>👤</span>
        Face Attendance
      </Link>
      
      <button className="navbar-toggle" onClick={toggleMenu} aria-label="Toggle menu">
        {isMenuOpen ? '✕' : '☰'}
      </button>
      
      <ul className={`navbar-nav ${isMenuOpen ? 'active' : ''}`}>
        <li className="nav-item">
          <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            <span role="img" aria-label="home" style={{ marginRight: '5px' }}>🏠</span>
            Beranda
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/register" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            <span role="img" aria-label="register" style={{ marginRight: '5px' }}>📝</span>
            Daftar
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/manual-upload" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            <span role="img" aria-label="upload" style={{ marginRight: '5px' }}>📤</span>
            Upload Foto
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/attendance" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            <span role="img" aria-label="attendance" style={{ marginRight: '5px' }}>📅</span>
            Absensi
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/history" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            <span role="img" aria-label="history" style={{ marginRight: '5px' }}>📊</span>
            Riwayat
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/admin" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            <span role="img" aria-label="admin" style={{ marginRight: '5px' }}>👨‍💼</span>
            Admin
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar; 