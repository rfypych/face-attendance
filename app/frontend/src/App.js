import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import komponen
import Navbar from './components/Navbar';
import Home from './components/Home';
import Register from './components/Register';
import Attendance from './components/Attendance';
import AttendanceHistory from './components/AttendanceHistory';
import ManualUpload from './components/ManualUpload';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import About from './components/About';
import Login from './components/Login';
import FaceRegister from './components/FaceRegister';

// Import ThemeProvider
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="main-content">
            <div className="container">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/face-register" element={<FaceRegister />} />
                <Route path="/manual-upload" element={<ManualUpload />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/history" element={<AttendanceHistory />} />
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App; 