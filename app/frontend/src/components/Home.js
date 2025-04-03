import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <div className="card">
        <h2 className="card-title">Selamat Datang di Sistem Absensi Wajah</h2>
        <p>
          Sistem ini memungkinkan pengguna untuk melakukan absensi menggunakan pengenalan wajah 
          yang dioptimalkan untuk laptop tanpa GPU.
        </p>
        <div style={{ marginTop: '20px' }}>
          <Link to="/register" className="btn" style={{ marginRight: '10px' }}>
            Daftar Pengguna Baru
          </Link>
          <Link to="/attendance" className="btn btn-success">
            Mulai Absensi
          </Link>
        </div>
      </div>
      
      <div className="card">
        <h3 className="card-title">Fitur Utama</h3>
        <ul style={{ listStylePosition: 'inside', paddingLeft: '20px' }}>
          <li>Pengenalan wajah ringan yang dioptimalkan untuk CPU</li>
          <li>Deteksi wajah menggunakan Haar Cascade dari OpenCV</li>
          <li>Absensi cepat dengan antarmuka web sederhana</li>
          <li>Riwayat kehadiran lengkap</li>
          <li>Dioptimalkan untuk kinerja di perangkat rendah</li>
        </ul>
      </div>
      
      <div className="card">
        <h3 className="card-title">Cara Penggunaan</h3>
        <ol style={{ listStylePosition: 'inside', paddingLeft: '20px' }}>
          <li>Daftar sebagai pengguna baru menggunakan beberapa foto wajah Anda</li>
          <li>Kunjungi halaman absensi saat Anda ingin mencatat kehadiran</li>
          <li>Sistem akan otomatis mengenali wajah Anda dan mencatat kehadiran</li>
          <li>Lihat riwayat absensi di halaman riwayat</li>
        </ol>
      </div>
    </div>
  );
};

export default Home; 