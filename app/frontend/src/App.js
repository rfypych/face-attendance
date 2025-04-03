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

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/manual-upload" element={<ManualUpload />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/history" element={<AttendanceHistory />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App; 