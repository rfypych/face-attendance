import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Webcam from 'react-webcam';
import { lazy, Suspense } from 'react';

// Lazy load face detection utils
const FaceDetectionUtils = lazy(() => {
  console.log('Mulai lazy loading FaceDetectionUtils');
  return import('./faceDetectionUtils').catch(err => {
    console.error('Error saat lazy loading:', err);
    return { default: { initFaceDetection: async () => false, detectFaces: async () => [] } };
  });
});

const Login = () => {
  const [name, setName] = useState('');
  const [tingkat, setTingkat] = useState('');
  const [jurusan, setJurusan] = useState('');
  const [rombel, setRombel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loginMethod, setLoginMethod] = useState('credentials'); // 'credentials' atau 'face'
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [faceDetectionUtils, setFaceDetectionUtils] = useState(null);
  
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Data untuk cascading dropdown
  const kelasData = {
    "X": {
      "TKJ": ["A", "B", "C", "D", "E"],
      "TITL": ["A", "B", "C", "D", "E"],
      "PH": ["A", "B", "C", "D", "E"],
      "TPM": ["A", "B", "C", "D", "E"],
      "TSM": ["A", "B", "C", "D", "E"],
      "TKR": ["A", "B", "C", "D", "E"],
      "DKV": ["A", "B", "C", "D", "E"],
      "DPIB": ["A", "B", "C", "D", "E"]
    },
    "XI": {
      "TKJ": ["A", "B", "C", "D", "E"],
      "TITL": ["A", "B", "C", "D", "E"],
      "PH": ["A", "B", "C", "D", "E"],
      "TPM": ["A", "B", "C", "D", "E"],
      "TSM": ["A", "B", "C", "D", "E"],
      "TKR": ["A", "B", "C", "D", "E"],
      "DKV": ["A", "B", "C", "D", "E"],
      "DPIB": ["A", "B", "C", "D", "E"]
    },
    "XII": {
      "TKJ": ["A", "B", "C", "D", "E"],
      "TITL": ["A", "B", "C", "D", "E"],
      "PH": ["A", "B", "C", "D", "E"],
      "TPM": ["A", "B", "C", "D", "E"],
      "TSM": ["A", "B", "C", "D", "E"],
      "TKR": ["A", "B", "C", "D", "E"],
      "DKV": ["A", "B", "C", "D", "E"],
      "DPIB": ["A", "B", "C", "D", "E"]
    }
  };

  // Reset dropdown yang lebih rendah saat dropdown yang lebih tinggi berubah
  useEffect(() => {
    setJurusan('');
    setRombel('');
  }, [tingkat]);

  useEffect(() => {
    setRombel('');
  }, [jurusan]);

  // Cek jika ada data registrasi sebelumnya di localStorage
  useEffect(() => {
    const lastRegisteredName = localStorage.getItem('lastRegisteredName');
    const lastRegisteredTingkat = localStorage.getItem('lastRegisteredTingkat');
    const lastRegisteredJurusan = localStorage.getItem('lastRegisteredJurusan');
    const lastRegisteredRombel = localStorage.getItem('lastRegisteredRombel');
    
    // Jika semua data tersedia, pre-fill form login
    if (lastRegisteredName && lastRegisteredTingkat && lastRegisteredJurusan && lastRegisteredRombel) {
      console.log('Data registrasi sebelumnya ditemukan, mengisi form login');
      setName(lastRegisteredName);
      setTingkat(lastRegisteredTingkat);
      setJurusan(lastRegisteredJurusan);
      setRombel(lastRegisteredRombel);
      
      // Hapus data setelah digunakan untuk menghindari pengisian otomatis yang tidak diinginkan di masa depan
      setTimeout(() => {
        localStorage.removeItem('lastRegisteredName');
        localStorage.removeItem('lastRegisteredKelas');
        localStorage.removeItem('lastRegisteredTingkat');
        localStorage.removeItem('lastRegisteredJurusan');
        localStorage.removeItem('lastRegisteredRombel');
      }, 5000); // Beri waktu 5 detik sebelum dihapus untuk berjaga-jaga jika user me-refresh halaman
    }
  }, []);

  // Mendapatkan nilai kelas lengkap untuk dikirim ke server
  const getFullKelas = () => {
    if (tingkat && jurusan && rombel) {
      // Pastikan tidak ada spasi tambahan dan konsistensi format
      return `${tingkat.trim()} ${jurusan.trim()} ${rombel.trim()}`;
    }
    return '';
  };

  // Batasi webcam ke resolusi rendah untuk performa
  const videoConstraints = {
    width: 320,
    height: 240,
    facingMode: "user"
  };

  // Load model pendeteksi wajah
  const loadModels = useCallback(async () => {
    if (isModelLoaded || isModelLoading) return;
    
    setIsModelLoading(true);
    setMessage({ text: 'Memuat model pengenalan wajah...', type: 'info' });
    
    try {
      const faceDetection = await import('./faceDetectionUtils');
      setFaceDetectionUtils(faceDetection.default);
      
      const modelLoaded = await faceDetection.default.initFaceDetection();
      
      if (modelLoaded) {
        setIsModelLoaded(true);
        setMessage({ text: 'Model deteksi wajah siap. Silakan hadapkan wajah Anda ke kamera.', type: 'success' });
      } else {
        throw new Error('Gagal memuat model');
      }
    } catch (error) {
      console.error('Error saat memuat model:', error);
      setMessage({ 
        text: 'Gagal memuat model pengenalan wajah. Coba refresh browser Anda.', 
        type: 'danger' 
      });
    } finally {
      setIsModelLoading(false);
    }
  }, [isModelLoaded, isModelLoading]);

  // Fungsi untuk melakukan deteksi wajah
  const detectFace = useCallback(async () => {
    if (!isModelLoaded || !faceDetectionUtils || !webcamRef.current || !canvasRef.current) {
      console.log('Deteksi wajah tidak dapat dijalankan');
      return false;
    }

    try {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      
      const detections = await faceDetectionUtils.detectFaces(video, canvas);
      return detections.length > 0;
    } catch (error) {
      console.error("Error saat deteksi wajah:", error);
      return false;
    }
  }, [isModelLoaded, faceDetectionUtils]);

  // Login dengan kredensial (nama dan kelas)
  const handleCredentialLogin = async (e) => {
    e.preventDefault();

    if (!name) {
      setMessage({ text: 'Silakan masukkan nama Anda', type: 'danger' });
      return;
    }

    const fullKelas = getFullKelas();
    if (!fullKelas) {
      setMessage({ text: 'Silakan pilih tingkat, jurusan, dan kelas dengan lengkap', type: 'danger' });
      return;
    }

    try {
      setIsLoading(true);
      setMessage({ text: 'Sedang login...', type: 'info' });

      // Normalisasi nama - hapus spasi di awal dan akhir
      const normalizedName = name.trim();
      
      console.log('Proses login dimulai dengan data:');
      console.log('- Nama:', normalizedName);
      console.log('- Kelas:', fullKelas);
      console.log('- Tingkat:', tingkat);
      console.log('- Jurusan:', jurusan); 
      console.log('- Rombel:', rombel);

      const response = await axios.post('/api/login', { 
        name: normalizedName,
        kelas: fullKelas 
      });

      console.log('Respons dari server:', response.data);

      if (response.data.status === 'success') {
        // Simpan token dan informasi user di localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userType', response.data.userType || 'user');
        localStorage.setItem('userId', response.data.userId);
        
        setMessage({ text: 'Login berhasil, mengalihkan...', type: 'success' });
        
        // Redirect berdasarkan tipe user
        setTimeout(() => {
          if (response.data.userType === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/attendance'); // Mengarah ke halaman absensi untuk user biasa
          }
        }, 1000);
      } else {
        setMessage({ text: response.data.message || 'Terjadi kesalahan', type: 'danger' });
      }
    } catch (error) {
      console.error('Error login:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Nama atau kelas salah. Silakan coba lagi.';
      setMessage({ text: errorMessage, type: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  // Login dengan wajah
  const handleFaceLogin = async () => {
    if (!isModelLoaded) {
      setMessage({ text: 'Model belum siap, mohon klik "Muat Model" terlebih dahulu', type: 'warning' });
      return;
    }
    
    if (!webcamRef.current) {
      setMessage({ text: 'Kamera belum siap', type: 'warning' });
      return;
    }

    try {
      setIsProcessing(true);
      setMessage({ text: 'Mendeteksi wajah...', type: 'info' });

      // Deteksi wajah
      const hasFace = await detectFace();
      if (!hasFace) {
        setMessage({ text: 'Tidak dapat mendeteksi wajah. Pastikan wajah terlihat jelas.', type: 'warning' });
        setIsProcessing(false);
        return;
      }

      // Ambil screenshot dari webcam
      const screenshot = webcamRef.current.getScreenshot();
      if (!screenshot) {
        setMessage({ text: 'Gagal mengambil gambar dari kamera', type: 'danger' });
        setIsProcessing(false);
        return;
      }

      // Konversi base64 ke blob
      const base64Data = screenshot.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      // Buat FormData
      const formData = new FormData();
      formData.append('file', blob, 'face.jpg');

      // Kirim ke API untuk pengenalan wajah
      const response = await axios.post('/api/face-login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status === 'success') {
        // Simpan token dan informasi user di localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userType', response.data.userType || 'user');
        localStorage.setItem('userId', response.data.userId);
        
        setMessage({ text: `Halo, ${response.data.name}! Login berhasil, mengalihkan...`, type: 'success' });
        
        // Redirect berdasarkan tipe user
        setTimeout(() => {
          if (response.data.userType === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/attendance');
          }
        }, 1000);
      } else {
        setMessage({ text: response.data.message || 'Wajah tidak dikenali', type: 'danger' });
      }
    } catch (error) {
      console.error('Error face login:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Gagal melakukan pengenalan wajah. Silakan coba login dengan nama dan kelas.';
      setMessage({ text: errorMessage, type: 'danger' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="login-container">
      <div className="card">
        <h2 className="card-title">Login</h2>
        
        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}
        
        <div className="login-tabs">
          <button 
            className={`tab-button ${loginMethod === 'credentials' ? 'active' : ''}`}
            onClick={() => setLoginMethod('credentials')}
          >
            Login dengan Nama & Kelas
          </button>
          <button 
            className={`tab-button ${loginMethod === 'face' ? 'active' : ''}`}
            onClick={() => {
              setLoginMethod('face');
              if (!isModelLoaded && !isModelLoading) {
                loadModels();
              }
            }}
          >
            Login dengan Wajah
          </button>
        </div>
        
        {loginMethod === 'credentials' ? (
          <form onSubmit={handleCredentialLogin}>
            <div className="form-group">
              <label htmlFor="name">Nama</label>
              <input
                type="text"
                className="form-control"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama Anda"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="tingkat">Tingkat</label>
              <select
                className="form-control"
                id="tingkat"
                value={tingkat}
                onChange={(e) => setTingkat(e.target.value)}
                required
              >
                <option value="">Pilih Tingkat</option>
                {Object.keys(kelasData).map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="jurusan">Jurusan</label>
              <select
                className="form-control"
                id="jurusan"
                value={jurusan}
                onChange={(e) => setJurusan(e.target.value)}
                disabled={!tingkat}
                required
              >
                <option value="">Pilih Jurusan</option>
                {tingkat && Object.keys(kelasData[tingkat]).map((j) => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="rombel">Kelas</label>
              <select
                className="form-control"
                id="rombel"
                value={rombel}
                onChange={(e) => setRombel(e.target.value)}
                disabled={!jurusan || !tingkat}
                required
              >
                <option value="">Pilih Kelas</option>
                {tingkat && jurusan && kelasData[tingkat][jurusan].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Memproses...' : 'Login'}
            </button>
          </form>
        ) : (
          <div className="face-login-container">
            <div className="webcam-container" style={{ marginBottom: '1rem', position: 'relative' }}>
              <Suspense fallback={
                <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee', borderRadius: 'var(--border-radius)' }}>
                  <div>Memuat kamera...</div>
                </div>
              }>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  width={320}
                  height={240}
                  style={{ borderRadius: 'var(--border-radius)' }}
                  mirrored={false}
                  onUserMediaError={(err) => {
                    console.error('Error kamera:', err);
                    setMessage({ text: `Error kamera: ${err.name}. ${err.message}`, type: 'danger' });
                  }}
                />
                <canvas
                  ref={canvasRef}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                  }}
                />
              </Suspense>
            </div>
            
            <button
              type="button"
              onClick={isModelLoaded ? handleFaceLogin : loadModels}
              className="btn btn-primary"
              disabled={isProcessing || isModelLoading}
            >
              {isProcessing ? 'Memproses...' : 
               isModelLoading ? 'Memuat Model...' : 
               !isModelLoaded ? 'Muat Model & Siapkan Kamera' : 
               'Login dengan Wajah'}
            </button>
          </div>
        )}
        
        <div className="form-footer">
          <p>Belum punya akun? <Link to="/register" className="link-primary">Daftar disini</Link></p>
          {loginMethod === 'face' && (
            <p className="mt-2">
              <small>Catatan: Login dengan wajah hanya tersedia jika Anda sudah menambahkan foto wajah sebelumnya.</small>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login; 