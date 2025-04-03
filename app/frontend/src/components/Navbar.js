import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Face Attendance</Link>
      <ul className="navbar-nav">
        <li className="nav-item">
          <Link to="/" className="nav-link">Beranda</Link>
        </li>
        <li className="nav-item">
          <Link to="/register" className="nav-link">Daftar</Link>
        </li>
        <li className="nav-item">
          <Link to="/attendance" className="nav-link">Absensi</Link>
        </li>
        <li className="nav-item">
          <Link to="/history" className="nav-link">Riwayat</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar; 