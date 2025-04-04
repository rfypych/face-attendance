import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <div className="hero">
        <h1>Sistem Absensi Wajah</h1>
        <p>
          Hadirkan kemudahan dan keamanan dalam absensi dengan teknologi pengenalan wajah yang dioptimalkan untuk laptop tanpa GPU.
        </p>
        <div>
          <Link to="/register" className="btn" style={{ marginRight: '10px' }}>
            <span role="img" aria-label="register" style={{ marginRight: '5px' }}>📝</span>
            Daftar Pengguna Baru
          </Link>
          <Link to="/attendance" className="btn btn-success">
            <span role="img" aria-label="attendance" style={{ marginRight: '5px' }}>📅</span>
            Mulai Absensi
          </Link>
        </div>
      </div>
      
      <div className="features">
        <div className="feature-card">
          <div className="feature-icon">📱</div>
          <h3 className="feature-title">Optimal untuk CPU</h3>
          <p>Pengenalan wajah ringan yang dioptimalkan untuk komputer tanpa GPU khusus.</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">👤</div>
          <h3 className="feature-title">Deteksi Akurat</h3>
          <p>Deteksi wajah menggunakan teknologi canggih untuk akurasi dan kecepatan.</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">🚀</div>
          <h3 className="feature-title">Absensi Cepat</h3>
          <p>Absensi instan dengan antarmuka sederhana dan proses otomatis.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3 className="feature-title">Riwayat Lengkap</h3>
          <p>Akses lengkap ke riwayat kehadiran untuk pemantauan dan analisis.</p>
        </div>
      </div>
      
      <div className="card">
        <h3 className="card-title">Cara Penggunaan</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              backgroundColor: 'var(--primary-color)', 
              color: 'white', 
              width: '30px', 
              height: '30px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              borderRadius: '50%', 
              fontWeight: 'bold' 
            }}>1</div>
            <p>Daftar sebagai pengguna baru menggunakan beberapa foto wajah Anda</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              backgroundColor: 'var(--primary-color)', 
              color: 'white', 
              width: '30px', 
              height: '30px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              borderRadius: '50%', 
              fontWeight: 'bold' 
            }}>2</div>
            <p>Kunjungi halaman absensi saat Anda ingin mencatat kehadiran</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              backgroundColor: 'var(--primary-color)', 
              color: 'white', 
              width: '30px', 
              height: '30px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              borderRadius: '50%', 
              fontWeight: 'bold' 
            }}>3</div>
            <p>Sistem akan otomatis mengenali wajah Anda dan mencatat kehadiran</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              backgroundColor: 'var(--primary-color)', 
              color: 'white', 
              width: '30px', 
              height: '30px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              borderRadius: '50%', 
              fontWeight: 'bold' 
            }}>4</div>
            <p>Lihat riwayat absensi di halaman riwayat</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 