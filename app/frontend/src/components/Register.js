import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy load face detection utils
const FaceDetectionUtils = lazy(() => {
  console.log('Mulai lazy loading FaceDetectionUtils');
  return import('./faceDetectionUtils').catch(err => {
    console.error('Error saat lazy loading:', err);
    return { default: { initFaceDetection: async () => false, detectFaces: async () => [] } };
  });
});

const Register = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [name, setName] = useState('');
  const [tingkat, setTingkat] = useState('');
  const [jurusan, setJurusan] = useState('');
  const [rombel, setRombel] = useState('');
  const [capturedImages, setCapturedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false); 
  const [isCapturing, setIsCapturing] = useState(false);
  const [faceDetectionUtils, setFaceDetectionUtils] = useState(null);
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

  // Mendapatkan nilai kelas lengkap untuk dikirim ke server
  const getFullKelas = () => {
    if (tingkat && jurusan && rombel) {
      return `${tingkat} ${jurusan} ${rombel}`;
    }
    return '';
  };

  // Batasi webcam ke resolusi rendah untuk performa
  const videoConstraints = {
    width: 320,
    height: 240,
    facingMode: "user"
  };

  // Fungsi deteksi wajah dengan error handling yang lebih baik
  const detectFaces = useCallback(async () => {
    if (!isModelLoaded || !faceDetectionUtils || !webcamRef.current || !canvasRef.current) {
      console.log('Deteksi wajah tidak dapat dijalankan:', { 
        isModelLoaded, 
        hasFaceUtils: !!faceDetectionUtils,
        hasWebcam: !!webcamRef.current,
        hasCanvas: !!canvasRef.current
      });
      return false;
    }

    if (webcamRef.current.video.readyState !== 4) {
      console.log('Video belum siap, state:', webcamRef.current.video.readyState);
      return false;
    }

    try {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      
      console.log('Menjalankan deteksi wajah');
      const detections = await faceDetectionUtils.detectFaces(video, canvas);
      console.log('Hasil deteksi:', detections.length > 0 ? 'Wajah terdeteksi' : 'Tidak ada wajah');
      return detections.length > 0;
    } catch (error) {
      console.error("Error saat deteksi wajah:", error);
      setMessage({ text: 'Terjadi error saat deteksi wajah. Coba refresh browser.', type: 'warning' });
      return false;
    }
  }, [isModelLoaded, faceDetectionUtils, setMessage]);

  // Load model pendeteksi wajah dengan error handling yang lebih baik
  const loadModels = useCallback(async () => {
    if (isModelLoaded || isModelLoading) return;
    
    setIsModelLoading(true);
    setMessage({ text: 'Memuat model pengenalan wajah...', type: 'info' });
    
    try {
      console.log('Mulai memuat faceDetectionUtils');
      
      // Lazy load FaceDetectionUtils dengan timeout
      const loadWithTimeout = async () => {
        return new Promise(async (resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout saat memuat model'));
          }, 15000);
          
          try {
            const faceDetection = await import('./faceDetectionUtils');
            clearTimeout(timeout);
            resolve(faceDetection.default);
          } catch (err) {
            clearTimeout(timeout);
            reject(err);
          }
        });
      };
      
      // Coba load dengan timeout
      const faceDetection = await loadWithTimeout();
      setFaceDetectionUtils(faceDetection);
      
      console.log('FaceDetectionUtils dimuat, inisialisasi deteksi wajah');
      
      // Tambahkan retries untuk memuat model
      let retries = 0;
      const maxRetries = 3;
      let modelLoaded = false;
      
      while (retries < maxRetries && !modelLoaded) {
        try {
          setMessage({ 
            text: `Memuat model wajah... ${retries > 0 ? `(Percobaan ke-${retries+1})` : ''}`, 
            type: 'info' 
          });
          
          // Reset TF state sebelum mencoba memuat model
          if (retries > 0) {
            await faceDetection.resetState();
          }
          
          modelLoaded = await faceDetection.initFaceDetection();
          
          if (modelLoaded) {
            console.log('Model berhasil dimuat setelah percobaan ke-', retries+1);
            break;
          }
        } catch (modelError) {
          console.error(`Gagal memuat model (percobaan ke-${retries+1}):`, modelError);
          retries++;
          
          // Jeda sebentar sebelum mencoba lagi
          if (retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      if (!modelLoaded) {
        throw new Error(`Gagal memuat model setelah ${maxRetries} percobaan`);
      }
      
      // Verifikasi status model
      const modelStatus = faceDetection.getModelStatus();
      console.log('Status model:', modelStatus);
      
      if (modelStatus.tinyFaceDetectorLoaded) {
        setIsModelLoaded(true);
        setMessage({ text: 'Model deteksi wajah dimuat. Siap untuk pendaftaran.', type: 'success' });
      } else {
        throw new Error('Model belum termuat dengan benar');
      }
    } catch (error) {
      console.error('Error saat memuat model:', error);
      setMessage({ 
        text: 'Gagal memuat model pengenalan wajah. Pastikan browser mendukung WebGL. Coba refresh halaman.', 
        type: 'danger' 
      });
    } finally {
      setIsModelLoading(false);
    }
  }, [isModelLoaded, isModelLoading, setMessage]);

  // Tangkap gambar dari webcam dengan error handling yang lebih baik
  const captureImage = useCallback(async () => {
    if (!isModelLoaded) {
      setMessage({ text: 'Model belum siap, mohon klik "Muat Model" terlebih dahulu.', type: 'warning' });
      return;
    }
    
    if (!webcamRef.current) {
      setMessage({ text: 'Webcam belum siap atau tidak terdeteksi.', type: 'warning' });
      return;
    }

    setIsCapturing(true); // Mulai status capturing
    setMessage({ text: 'Mendeteksi wajah...', type: 'info' });

    try {
      // Verifikasi model terlebih dahulu
      if (!faceDetectionUtils) {
        throw new Error('Utilitas deteksi wajah belum dimuat');
      }
      
      // Melakukan deteksi wajah on-demand sebelum mengambil foto
      const hasFace = await detectFaces();
      
      if (!hasFace) {
        setMessage({ text: 'Tidak dapat mendeteksi wajah. Pastikan wajah terlihat jelas dan pencahayaan cukup.', type: 'warning' });
        setIsCapturing(false);
        return;
      }

      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImages((prev) => [...prev, imageSrc]);
        setMessage({ text: `Gambar ${capturedImages.length + 1} berhasil diambil`, type: 'success' });
      } else {
        setMessage({ text: 'Gagal mengambil gambar.', type: 'danger' });
      }
    } catch (error) {
      console.error('Error saat mengambil gambar:', error);
      setMessage({ text: `Error: ${error.message}. Coba muat ulang model.`, type: 'danger' });
    } finally {
      setIsCapturing(false); // Selesai capturing
    }
  }, [webcamRef, isModelLoaded, capturedImages.length, detectFaces, faceDetectionUtils]);

  // Reset gambar yang diambil
  const resetImages = () => {
    setCapturedImages([]);
    setMessage({ text: 'Gambar direset', type: 'info' });
  };

  // Cleanup ketika komponen unmount
  useEffect(() => {
    return () => {
      // Bersihkan canvas jika perlu
      if (canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        if (canvasRef.current.width > 0) {
           context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      
      // Reset TensorFlow state jika ada
      if (faceDetectionUtils && faceDetectionUtils.resetState) {
        faceDetectionUtils.resetState().catch(e => {
          console.warn('Error saat membersihkan resource:', e);
        });
      }
      
      // Kosongkan data gambar untuk membebaskan memori
      setCapturedImages([]);
    };
  }, [faceDetectionUtils]);

  // Mengirimkan data ke server
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Periksa capturedImages.length bukan capturedImage
    if (capturedImages.length < 3) { // Minimal 3 foto untuk kualitas lebih baik
      setMessage({ text: 'Silakan ambil setidaknya 3 foto untuk hasil terbaik', type: 'warning' });
      return;
    }

    const fullKelas = getFullKelas();
    if (!fullKelas) {
      setMessage({ text: 'Silakan pilih tingkat, jurusan, dan kelas dengan lengkap', type: 'danger' });
      return;
    }

    try {
      setIsLoading(true);
      setMessage({ text: 'Sedang mendaftarkan pengguna...', type: 'info' });

      // Buat FormData untuk upload
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', fullKelas); // Tetap gunakan field 'email' di backend untuk kompatibilitas

      // Debugging - menampilkan jumlah dan info foto yang diambil
      console.log(`Mengupload ${capturedImages.length} foto, nama: ${name}, kelas: ${fullKelas}`);

      // Optimasi: Konversi gambar dalam batch untuk mengurangi beban rendering
      const batchSize = 2; // Proses 2 gambar sekaligus
      for (let i = 0; i < capturedImages.length; i += batchSize) {
        const batch = capturedImages.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (imageSrc, batchIndex) => {
          const index = i + batchIndex;
          try {
            // Memastikan format base64 benar
            const base64Data = imageSrc.split(',')[1];
            if (!base64Data) {
              throw new Error(`Format gambar ke-${index+1} tidak valid`);
            }
            
            // Konversi base64 ke blob langsung dengan ukuran chunk yang lebih besar
            const byteCharacters = atob(base64Data);
            const byteArrays = [];
            
            // Gunakan chunk lebih besar untuk mengurangi iterasi
            const chunkSize = 16384; // 16KB chunks
            for (let j = 0; j < byteCharacters.length; j += chunkSize) {
              const slice = byteCharacters.slice(j, j + chunkSize);
              const byteNumbers = new Array(slice.length);
              for (let k = 0; k < slice.length; k++) {
                byteNumbers[k] = slice.charCodeAt(k);
              }
              const byteArray = new Uint8Array(byteNumbers);
              byteArrays.push(byteArray);
            }
            
            const blob = new Blob(byteArrays, { type: 'image/jpeg' });
            formData.append('photos', blob, `captured_image_${index + 1}.jpg`);
          } catch (photoError) {
            console.error(`Error processing photo ${index+1}:`, photoError);
            throw photoError;
          }
        })).catch(error => {
          setMessage({ text: `Gagal memproses foto. Coba ambil ulang.`, type: 'danger' });
          setIsLoading(false);
          throw error;
        });
        
        // Beri waktu browser untuk render UI setelah setiap batch
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      // Kirim data ke API
      try {
        const result = await axios.post('/api/register', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (result.data && result.data.status === 'success') {
          setMessage({ text: result.data.message, type: 'success' });
          
          // Reset form setelah berhasil
          setName('');
          setTingkat('');
          setJurusan('');
          setRombel('');
          setCapturedImages([]);
          
          // Navigasi ke halaman lain setelah beberapa saat
          setTimeout(() => {
            navigate('/'); // Arahkan ke beranda atau halaman sukses
          }, 2000);
        } else {
          // Handle case when server might return 200 but with an error status
          setMessage({ 
            text: result.data?.message || result.data?.detail || 'Terjadi kesalahan saat pendaftaran', 
            type: 'danger' 
          });
        }
      } catch (axiosError) {
        console.error('Axios Error:', axiosError);
        
        if (axiosError.response) {
          const errorMessage = axiosError.response.data?.detail || 
                              axiosError.response.data?.message || 
                              `Error ${axiosError.response.status}: ${axiosError.message}`;
          
          setMessage({ text: errorMessage, type: 'danger' });
        } else if (axiosError.request) {
          setMessage({ text: 'Tidak ada respons dari server. Periksa koneksi internet Anda.', type: 'danger' });
        } else {
          setMessage({ text: `Error: ${axiosError.message}`, type: 'danger' });
        }
      }
    } catch (error) {
      console.error('Error submitting registration:', error);
      setMessage({ text: `Terjadi kesalahan: ${error.message}`, type: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">
        <span role="img" aria-label="register" style={{ marginRight: '10px' }}>📝</span>
        Daftar Pengguna Baru
      </h2>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nama Lengkap</label>
          <input
            type="text"
            id="name"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        {/* Dropdown Kelas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="tingkat">Tingkat</label>
            <select
              id="tingkat"
              className="form-control"
              value={tingkat}
              onChange={(e) => setTingkat(e.target.value)}
              required
              disabled={isLoading}
            >
              <option value="" disabled>Pilih Tingkat</option>
              {Object.keys(kelasData).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="jurusan">Jurusan</label>
            <select
              id="jurusan"
              className="form-control"
              value={jurusan}
              onChange={(e) => setJurusan(e.target.value)}
              required
              disabled={isLoading || !tingkat}
            >
              <option value="" disabled>Pilih Jurusan</option>
              {tingkat && kelasData[tingkat] && Object.keys(kelasData[tingkat]).map(j => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="rombel">Kelas</label>
            <select
              id="rombel"
              className="form-control"
              value={rombel}
              onChange={(e) => setRombel(e.target.value)}
              required
              disabled={isLoading || !jurusan}
            >
              <option value="" disabled>Pilih Kelas</option>
              {tingkat && jurusan && kelasData[tingkat][jurusan] && kelasData[tingkat][jurusan].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Ambil Foto Wajah (Minimal 3)</label>
          <div className="webcam-container" style={{ marginBottom: '1rem', position: 'relative' }}>
            <Suspense fallback={
              <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee', borderRadius: 'var(--border-radius)' }}>
                <div>Memuat kamera... <span style={{ display: 'inline-block', animation: 'pulse 1.5s infinite ease-in-out' }}>⏳</span></div>
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
          <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={isModelLoaded ? captureImage : loadModels}
              className="btn btn-secondary"
              disabled={isLoading || isCapturing || capturedImages.length >= 5} // Batasi maksimal 5 gambar
            >
              <span role="img" aria-label="camera" style={{ marginRight: '5px' }}>📸</span>
              {isCapturing ? 'Mengambil...' : 
               isModelLoading ? 'Memuat Model...' : 
               !isModelLoaded ? 'Muat Model & Siapkan Kamera' : 
               `Ambil Foto (${capturedImages.length}/5)`}
            </button>
            <button
              type="button"
              onClick={resetImages}
              className="btn btn-warning"
              disabled={isLoading || capturedImages.length === 0}
            >
              <span role="img" aria-label="reset" style={{ marginRight: '5px' }}>🔄</span>
              Reset Foto
            </button>
          </div>
        </div>

        {capturedImages.length > 0 && (
          <div className="form-group">
            <label>Preview Foto ({capturedImages.length}):</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {/* Hanya render preview untuk 3 foto pertama untuk menjaga performa */}
              {capturedImages.slice(0, 3).map((imgSrc, index) => (
                <img
                  key={index}
                  src={imgSrc}
                  alt={`Captured ${index + 1}`}
                  style={{ width: '80px', height: '60px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              ))}
              {capturedImages.length > 3 && (
                <div style={{ 
                  width: '80px', 
                  height: '60px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  backgroundColor: '#f0f0f0', 
                  borderRadius: '4px', 
                  border: '1px solid #ccc' 
                }}>
                  +{capturedImages.length - 3}
                </div>
              )}
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-success" disabled={isLoading || capturedImages.length < 3}>
          {isLoading ? 'Mendaftar...' : 'Daftarkan Pengguna'}
        </button>
      </form>
    </div>
  );
};

export default Register; 