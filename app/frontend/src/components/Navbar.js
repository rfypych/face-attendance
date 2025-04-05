import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span role="img" aria-label="face icon" style={{ fontSize: '1.5rem' }}>👤</span>
          Face Attendance
        </Link>
        
        <button className="navbar-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? '✕' : '☰'}
        </button>
        
        <ul className={`navbar-nav ${isMenuOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} end>
              <span role="img" aria-label="home" style={{ marginRight: '5px' }}>🏠</span>
              Beranda
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/register" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <span role="img" aria-label="register" style={{ marginRight: '5px' }}>📝</span>
              Daftar
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/manual-upload" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <span role="img" aria-label="upload" style={{ marginRight: '5px' }}>📤</span>
              Upload Foto
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/attendance" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <span role="img" aria-label="attendance" style={{ marginRight: '5px' }}>📅</span>
              Absensi
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/history" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <span role="img" aria-label="history" style={{ marginRight: '5px' }}>📊</span>
              Riwayat
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <span role="img" aria-label="admin" style={{ marginRight: '5px' }}>👨‍💼</span>
              Admin
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/about" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <span role="img" aria-label="about" style={{ marginRight: '5px' }}>ℹ️</span>
              Tentang
            </NavLink>
          </li>
          <li className="nav-item" style={{ marginLeft: 'auto' }}>
            <DarkModeToggle />
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar; 