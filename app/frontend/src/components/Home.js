import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// Mengimpor ikon satu per satu untuk menghindari masalah dengan versi react-icons
import { FaUserPlus } from 'react-icons/fa';
import { FaCalendarCheck } from 'react-icons/fa';
import { FaLaptop } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa';
import { FaRocket } from 'react-icons/fa';
import { FaChartBar } from 'react-icons/fa';
import { FaCamera } from 'react-icons/fa';
import { FaSignInAlt } from 'react-icons/fa';

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Periksa apakah user sudah login
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="home-container">
      <div className="hero">
        <h1>Sistem Absensi Wajah</h1>
        <p>
          Hadirkan kemudahan dan keamanan dalam absensi dengan teknologi pengenalan wajah yang dioptimalkan untuk laptop tanpa GPU.
        </p>
        <div className="hero-buttons">
          {!isLoggedIn ? (
            <>
              <Link to="/register" className="btn" style={{ marginRight: 'var(--space-md)' }}>
                <FaUserPlus style={{ marginRight: 'var(--space-xs)' }} />
                Daftar Pengguna Baru
              </Link>
              <Link to="/login" className="btn btn-success" style={{ marginRight: 'var(--space-md)' }}>
                <FaSignInAlt style={{ marginRight: 'var(--space-xs)' }} />
                Login
              </Link>
            </>
          ) : (
            <>
              <Link to="/face-register" className="btn" style={{ marginRight: 'var(--space-md)' }}>
                <FaCamera style={{ marginRight: 'var(--space-xs)' }} />
                Tambah Foto Wajah
              </Link>
              <Link to="/attendance" className="btn btn-success">
                <FaCalendarCheck style={{ marginRight: 'var(--space-xs)' }} />
                Mulai Absensi
              </Link>
            </>
          )}
        </div>
      </div>
      
      <div className="card new-system-info">
        <h3 className="card-title">Sistem Baru! Pendaftaran Lebih Mudah</h3>
        <div className="info-content">
          <p>
            <strong>Sekarang pendaftaran pengguna lebih sederhana!</strong> Anda dapat mendaftar hanya dengan mengisi data diri tanpa perlu menambahkan foto wajah saat pendaftaran.
          </p>
          <p>
            Setelah mendaftar dan login, Anda dapat menambahkan foto wajah melalui fitur <strong>"Tambah Foto Wajah"</strong> untuk mengaktifkan kemampuan login dan absensi dengan wajah.
          </p>
        </div>
        <div className="info-steps">
          <div className="info-step">
            <div className="step-number">1</div>
            <div>Daftar tanpa foto</div>
          </div>
          <div className="info-step">
            <div className="step-number">2</div>
            <div>Login dengan nama & kelas</div>
          </div>
          <div className="info-step">
            <div className="step-number">3</div>
            <div>Tambahkan foto wajah</div>
          </div>
          <div className="info-step">
            <div className="step-number">4</div>
            <div>Gunakan login wajah & absensi</div>
          </div>
        </div>
      </div>
      
      <div className="features">
        <div className="feature-card">
          <div className="feature-icon"><FaLaptop /></div>
          <h3 className="feature-title">Optimal untuk CPU</h3>
          <p className="feature-description">Pengenalan wajah ringan yang dioptimalkan untuk komputer tanpa GPU khusus.</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon"><FaUser /></div>
          <h3 className="feature-title">Deteksi Akurat</h3>
          <p className="feature-description">Deteksi wajah menggunakan teknologi canggih untuk akurasi dan kecepatan.</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon"><FaRocket /></div>
          <h3 className="feature-title">Absensi Cepat</h3>
          <p className="feature-description">Absensi instan dengan antarmuka sederhana dan proses otomatis.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon"><FaChartBar /></div>
          <h3 className="feature-title">Riwayat Lengkap</h3>
          <p className="feature-description">Akses lengkap ke riwayat kehadiran untuk pemantauan dan analisis.</p>
        </div>
      </div>
      
      {/* About Section dengan Golden Ratio */}
      <section className="about-section">
        <div className="about-image">
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 600 400" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Latar belakang */}
            <rect x="0" y="0" width="600" height="400" fill="#f5f8ff" rx="10" ry="10" />
            
            {/* Grid/pola latar */}
            <pattern id="grid" patternUnits="userSpaceOnUse" width="30" height="30" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="30" stroke="rgba(0,100,255,0.05)" strokeWidth="1" />
              <line x1="0" y1="0" x2="30" y2="0" stroke="rgba(0,100,255,0.05)" strokeWidth="1" />
            </pattern>
            <rect x="0" y="0" width="600" height="400" fill="url(#grid)" />
            
            {/* Bentuk wajah */}
            <ellipse cx="300" cy="200" rx="140" ry="170" fill="none" stroke="#3f51b5" strokeWidth="2" />
            
            {/* Titik-titik pengenalan wajah */}
            {/* Mata */}
            <ellipse cx="250" cy="160" rx="25" ry="15" fill="none" stroke="#3f51b5" strokeWidth="2" />
            <ellipse cx="350" cy="160" rx="25" ry="15" fill="none" stroke="#3f51b5" strokeWidth="2" />
            <circle cx="250" cy="160" r="5" fill="#3f51b5" />
            <circle cx="350" cy="160" r="5" fill="#3f51b5" />
            
            {/* Hidung */}
            <line x1="300" y1="160" x2="300" y2="220" stroke="#3f51b5" strokeWidth="2" />
            <ellipse cx="300" cy="220" rx="15" ry="10" fill="none" stroke="#3f51b5" strokeWidth="2" />
            
            {/* Mulut */}
            <path d="M250,260 Q300,290 350,260" fill="none" stroke="#3f51b5" strokeWidth="2" />
            
            {/* Garis pengenalan wajah */}
            <line x1="200" y1="100" x2="400" y2="100" stroke="#ff4081" strokeWidth="1" strokeDasharray="5,5" />
            <line x1="200" y1="300" x2="400" y2="300" stroke="#ff4081" strokeWidth="1" strokeDasharray="5,5" />
            <line x1="200" y1="100" x2="200" y2="300" stroke="#ff4081" strokeWidth="1" strokeDasharray="5,5" />
            <line x1="400" y1="100" x2="400" y2="300" stroke="#ff4081" strokeWidth="1" strokeDasharray="5,5" />
            
            {/* Marker titik pengenalan */}
            <circle cx="250" cy="160" r="3" fill="#ff4081" />
            <circle cx="350" cy="160" r="3" fill="#ff4081" />
            <circle cx="300" cy="220" r="3" fill="#ff4081" />
            <circle cx="250" cy="260" r="3" fill="#ff4081" />
            <circle cx="300" cy="275" r="3" fill="#ff4081" />
            <circle cx="350" cy="260" r="3" fill="#ff4081" />
            
            {/* Garis penghubung titik-titik */}
            <path d="M250,160 L350,160 L300,220 L250,260 Q300,290 350,260 Z" fill="none" stroke="#ff4081" strokeWidth="1" strokeDasharray="3,3" />
            
            {/* Scanner effect */}
            <rect x="200" y="120" width="200" height="5" fill="rgba(0,255,200,0.3)">
              <animate attributeName="y" from="120" to="280" dur="2s" repeatCount="indefinite" />
            </rect>
            
            {/* Data points visualization */}
            <g>
              <circle cx="450" cy="130" r="5" fill="#ff4081" />
              <text x="460" y="135" fontSize="12" fill="#333">Titik data wajah</text>
              
              <line x1="450" y1="160" x2="470" y2="160" stroke="#3f51b5" strokeWidth="2" />
              <text x="475" y="165" fontSize="12" fill="#333">Fitur wajah</text>
              
              <line x1="450" y1="190" x2="470" y2="190" stroke="#ff4081" strokeWidth="1" strokeDasharray="5,5" />
              <text x="475" y="195" fontSize="12" fill="#333">Area deteksi</text>
            </g>
          </svg>
        </div>
        <div className="about-content">
          <h2>Tentang Sistem Absensi Wajah</h2>
          <p>
            Sistem Absensi Wajah adalah solusi modern untuk pencatatan kehadiran yang menggantikan metode konvensional seperti kartu absensi atau sidik jari.
          </p>
          <p>
            Dengan sistem baru, pengguna dapat mendaftar terlebih dahulu tanpa perlu mengambil foto wajah, lalu menambahkan data wajah setelah login kapan saja mereka siap.
          </p>
          <p>
            Teknologi kami dioptimalkan untuk berjalan pada perangkat standar tanpa memerlukan hardware khusus, membuatnya mudah diimplementasikan di mana saja.
          </p>
          <Link to="/about" className="btn btn-outline">Pelajari Lebih Lanjut</Link>
        </div>
      </section>
      
      <div className="card how-to-use">
        <h3 className="card-title">Cara Penggunaan</h3>
        <div className="steps-container">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Pendaftaran</h4>
              <p>Daftar sebagai pengguna baru hanya dengan mengisi nama dan kelas</p>
            </div>
          </div>
          
          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Login</h4>
              <p>Login dengan nama dan kelas, atau dengan wajah (jika sudah didaftarkan)</p>
            </div>
          </div>
          
          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Tambahkan Foto Wajah</h4>
              <p>Tambahkan foto wajah Anda untuk mengaktifkan fitur login dan absensi dengan wajah</p>
            </div>
          </div>
          
          <div className="step-item">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>Absensi & Riwayat</h4>
              <p>Gunakan fitur absensi wajah dan lihat riwayat kehadiran Anda</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 