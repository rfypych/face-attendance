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
            <strong>Kontak:</strong> admin@absensi-wajah.id &nbsp;|&nbsp;
            <strong>© 2023</strong> Sistem Absensi Wajah
          </p>
        </div>
      </div>
    </div>
  );
};

export default About; 