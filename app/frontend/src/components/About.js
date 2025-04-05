import React, { useState } from 'react';

const About = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'features':
        return (
          <div className="tab-content">
            <h3 className="feature-section-title">Fitur Unggulan</h3>
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">👤</div>
                <h4>Pengenalan Wajah Akurat</h4>
                <p>Teknologi pengenalan wajah yang dapat mendeteksi dan memverifikasi identitas pengguna dengan akurat.</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">🚀</div>
                <h4>Kinerja Optimal di CPU</h4>
                <p>Dioptimalkan untuk berjalan dengan lancar pada perangkat standar tanpa memerlukan GPU khusus.</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">📊</div>
                <h4>Rekam Jejak Lengkap</h4>
                <p>Pencatatan dan pelaporan kehadiran secara detail dengan waktu nyata.</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">📱</div>
                <h4>Responsif di Semua Perangkat</h4>
                <p>Antarmuka yang responsif dan dapat diakses dari berbagai perangkat.</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">🔒</div>
                <h4>Keamanan Terjamin</h4>
                <p>Sistem verifikasi yang aman dan perlindungan data pengguna.</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">⚡</div>
                <h4>Proses Cepat</h4>
                <p>Absensi instan dengan pemrosesan yang cepat dan efisien.</p>
              </div>
            </div>
          </div>
        );
      
      case 'usage':
        return (
          <div className="tab-content">
            <h3 className="feature-section-title">Cara Penggunaan</h3>
            
            <div className="usage-steps">
              <div className="usage-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Pendaftaran</h4>
                  <p>Daftar dengan mengambil beberapa foto wajah melalui menu "Daftar". Pastikan wajah terlihat jelas dengan pencahayaan yang baik.</p>
                </div>
              </div>
              
              <div className="usage-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Melakukan Absensi</h4>
                  <p>Kunjungi halaman "Absensi" dan posisikan wajah di depan kamera. Sistem akan otomatis mengenali dan mencatat kehadiran Anda.</p>
                </div>
              </div>
              
              <div className="usage-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Melihat Riwayat</h4>
                  <p>Lihat dan telusuri riwayat kehadiran Anda melalui halaman "Riwayat".</p>
                </div>
              </div>
              
              <div className="usage-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Upload Manual (Opsional)</h4>
                  <p>Jika diperlukan, Anda dapat mengunggah foto secara manual melalui menu "Upload Foto".</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'tech':
        return (
          <div className="tab-content">
            <h3 className="feature-section-title">Teknologi yang Digunakan</h3>
            
            <div className="tech-stack">
              <div className="tech-category">
                <h4><span role="img" aria-label="interface">🖥️</span> Frontend</h4>
                <ul>
                  <li><strong>React.js</strong> - Library JavaScript untuk membangun antarmuka pengguna</li>
                  <li><strong>React Router</strong> - Navigasi dan routing di React</li>
                  <li><strong>face-api.js</strong> - Library JavaScript untuk deteksi dan pengenalan wajah</li>
                  <li><strong>TensorFlow.js</strong> - Machine learning di browser</li>
                </ul>
              </div>
              
              <div className="tech-category">
                <h4><span role="img" aria-label="backend">⚙️</span> Backend</h4>
                <ul>
                  <li><strong>FastAPI</strong> - Framework Python modern untuk API</li>
                  <li><strong>OpenCV</strong> - Library komputer vision untuk pemrosesan gambar</li>
                  <li><strong>SQLite/PostgreSQL</strong> - Penyimpanan data dan manajemen absensi</li>
                </ul>
              </div>
              
              <div className="tech-category">
                <h4><span role="img" aria-label="deployment">🚀</span> Deployment</h4>
                <ul>
                  <li><strong>Docker</strong> - Containerization untuk deployment yang konsisten</li>
                  <li><strong>Vercel/Netlify</strong> - Hosting frontend</li>
                </ul>
              </div>
            </div>
          </div>
        );
        
      case 'faq':
        return (
          <div className="tab-content">
            <h3 className="feature-section-title">Pertanyaan Umum (FAQ)</h3>
            
            <div className="faq-container">
              <div className="faq-item">
                <h4>Apakah data wajah saya aman?</h4>
                <p>Ya, kami menggunakan enkripsi tingkat tinggi untuk menyimpan data pengenalan wajah. Data hanya digunakan untuk keperluan absensi dan tidak dibagikan kepada pihak ketiga.</p>
              </div>
              
              <div className="faq-item">
                <h4>Bagaimana jika sistem tidak mengenali wajah saya?</h4>
                <p>Pastikan Anda berada di area dengan pencahayaan yang baik. Jika masalah berlanjut, Anda dapat mencoba mendaftar ulang atau menggunakan fitur upload manual.</p>
              </div>
              
              <div className="faq-item">
                <h4>Apakah saya perlu perangkat khusus?</h4>
                <p>Tidak, aplikasi dioptimalkan untuk berjalan di perangkat standar. Anda hanya memerlukan kamera dan koneksi internet yang stabil.</p>
              </div>
              
              <div className="faq-item">
                <h4>Berapa banyak foto yang diperlukan saat pendaftaran?</h4>
                <p>Minimal 3 foto untuk hasil terbaik. Sistem akan menggunakan foto-foto ini untuk mempelajari karakteristik wajah Anda.</p>
              </div>
              
              <div className="faq-item">
                <h4>Bagaimana jika saya perlu mengganti data pribadi?</h4>
                <p>Silakan hubungi administrator sistem melalui menu Admin untuk perubahan data.</p>
              </div>
            </div>
          </div>
        );
        
      default: // overview
        return (
          <div className="tab-content">
            <div className="about-hero">
              <div className="about-icon">👤</div>
              <h3>Sistem Absensi Wajah Modern</h3>
              <p>Solusi inovatif untuk pencatatan kehadiran menggunakan teknologi pengenalan wajah</p>
            </div>
            
            <p className="about-description">
              Selamat datang di <strong>Sistem Absensi Wajah</strong>, aplikasi yang dirancang untuk memudahkan dan mengotomatisasi proses pencatatan kehadiran. Dengan teknologi pengenalan wajah yang canggih namun hemat sumber daya, aplikasi ini menawarkan solusi absensi yang cepat, akurat, dan aman.
            </p>
            
            <div className="about-highlights">
              <div className="highlight-item">
                <span role="img" aria-label="fast" className="highlight-icon">⚡</span>
                <div>
                  <h4>Cepat & Efisien</h4>
                  <p>Mengurangi waktu absensi dari menit menjadi detik</p>
                </div>
              </div>
              
              <div className="highlight-item">
                <span role="img" aria-label="accurate" className="highlight-icon">🎯</span>
                <div>
                  <h4>Akurasi Tinggi</h4>
                  <p>Verifikasi identitas yang tepat dan dapat diandalkan</p>
                </div>
              </div>
              
              <div className="highlight-item">
                <span role="img" aria-label="accessible" className="highlight-icon">💻</span>
                <div>
                  <h4>Ringan & Aksesibel</h4>
                  <p>Berjalan optimal bahkan pada perangkat dengan spesifikasi standar</p>
                </div>
              </div>
            </div>
            
            <p className="about-mission">
              Misi kami adalah menyediakan sistem absensi yang menggabungkan kemudahan penggunaan dengan teknologi canggih, memungkinkan organisasi fokus pada aktivitas inti mereka tanpa dibebani proses administratif yang rumit.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="about-page">
      <div className="card">
        <h2 className="card-title">
          <span role="img" aria-label="info" style={{ marginRight: '10px' }}>ℹ️</span>
          Tentang Aplikasi Absensi Wajah
        </h2>
        
        <div className="about-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span role="img" aria-label="overview" className="tab-icon">🏠</span>
            Ringkasan
          </button>
          <button 
            className={`tab-button ${activeTab === 'features' ? 'active' : ''}`}
            onClick={() => setActiveTab('features')}
          >
            <span role="img" aria-label="features" className="tab-icon">✨</span>
            Fitur
          </button>
          <button 
            className={`tab-button ${activeTab === 'usage' ? 'active' : ''}`}
            onClick={() => setActiveTab('usage')}
          >
            <span role="img" aria-label="usage" className="tab-icon">📋</span>
            Cara Pakai
          </button>
          <button 
            className={`tab-button ${activeTab === 'tech' ? 'active' : ''}`}
            onClick={() => setActiveTab('tech')}
          >
            <span role="img" aria-label="tech" className="tab-icon">⚙️</span>
            Teknologi
          </button>
          <button 
            className={`tab-button ${activeTab === 'faq' ? 'active' : ''}`}
            onClick={() => setActiveTab('faq')}
          >
            <span role="img" aria-label="faq" className="tab-icon">❓</span>
            FAQ
          </button>
        </div>
        
        <div className="about-content">
          {renderTabContent()}
        </div>
        
        <div className="about-footer">
          <p>
            <strong>Versi:</strong> 1.0.0 &nbsp;|&nbsp; 
            <strong>Kontak:</strong> <a href="https://instagram.com/rfikl_" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '4px', verticalAlign: 'text-bottom' }}>
                <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
              </svg>
              @rfikl_
            </a> &nbsp;|&nbsp;
            <strong>© {new Date(new Date().toLocaleString('en-US', {timeZone: 'Asia/Jakarta'})).getFullYear()}</strong> Sistem Absensi Wajah
          </p>
        </div>
      </div>
    </div>
  );
};

export default About; 