import React, { useEffect, useState, useContext } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FaSun, FaMoon, FaCamera, FaBars, FaTimes, FaHome } from 'react-icons/fa';
import ThemeContext from '../contexts/ThemeContext';
import Logo from './Logo';

const Navbar = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      // Check if user is admin
      const userType = localStorage.getItem('userType');
      if (userType === 'admin') {
        setIsAdmin(true);
      }
    }
  }, [location]);

  // Toggle mobile menu
  const toggleMenu = () => {
    const newMenuState = !menuOpen;
    setMenuOpen(newMenuState);
    
    // Toggle body class untuk menu
    if (newMenuState) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  };

  // Handle overlay click to close menu
  const handleOverlayClick = () => {
    setMenuOpen(false);
    document.body.classList.remove('menu-open');
  };

  // Close menu when navigating
  useEffect(() => {
    setMenuOpen(false);
    document.body.classList.remove('menu-open');
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <NavLink to="/" className="navbar-brand">
            <Logo 
              width={30} 
              height={30} 
              className="navbar-logo" 
            />
            Face Attendance
          </NavLink>
          
          <button 
            className="navbar-toggle" 
            onClick={toggleMenu}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
          
          <div className={`nav-content ${menuOpen ? 'show' : ''}`}>
            <ul className={`navbar-nav ${menuOpen ? 'visible' : ''}`}>
              {/* Link Beranda selalu ditampilkan untuk semua pengguna */}
              <li className="nav-item">
                <NavLink to="/" className={({ isActive }) => 
                  isActive ? "nav-link active" : "nav-link"
                }>
                  <FaHome style={{ marginRight: '5px' }} />
                  Beranda
                </NavLink>
              </li>
              
              {isLoggedIn ? (
                <>
                  {isAdmin && (
                    <li className="nav-item">
                      <NavLink to="/admin" className={({ isActive }) => 
                        isActive ? "nav-link active" : "nav-link"
                      }>
                        Dashboard Admin
                      </NavLink>
                    </li>
                  )}
                  <li className="nav-item">
                    <NavLink to="/attendance" className={({ isActive }) => 
                      isActive ? "nav-link active" : "nav-link"
                    }>
                      Absensi
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/history" className={({ isActive }) => 
                      isActive ? "nav-link active" : "nav-link"
                    }>
                      Riwayat
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/face-register" className={({ isActive }) => 
                      isActive ? "nav-link active" : "nav-link"
                    }>
                      <FaCamera style={{ marginRight: '5px' }} />
                      Tambah Foto Wajah
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <button onClick={handleLogout} className="nav-link btn-link">
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <NavLink to="/login" className={({ isActive }) => 
                      isActive ? "nav-link active" : "nav-link"
                    }>
                      Login
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/register" className={({ isActive }) => 
                      isActive ? "nav-link active" : "nav-link"
                    }>
                      Registrasi
                    </NavLink>
                  </li>
                </>
              )}
              <li className="nav-item theme-toggle">
                <button 
                  className="theme-toggle-btn"
                  onClick={toggleTheme}
                  aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                >
                  {theme === 'light' ? <FaMoon /> : <FaSun />}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      
      {/* Tambahkan overlay untuk mobile */}
      {menuOpen && <div className="menu-overlay active" onClick={handleOverlayClick}></div>}
    </>
  );
};

export default Navbar; 