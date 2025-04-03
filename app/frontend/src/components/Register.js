import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import * as faceapi from 'face-api.js';
import * as tf from '@tensorflow/tfjs';
import { useNavigate } from 'react-router-dom';

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
  const [detectionInterval, setDetectionInterval] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
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

  // Load model pendeteksi wajah dari face-api.js
  useEffect(() => {
    const loadModels = async () => {
      try {
        // Coba gunakan backend CPU jika WASM gagal
        try {
          await tf.setBackend('wasm');
        } catch (e) {
          console.warn("WASM backend gagal, beralih ke CPU:", e);
          await tf.setBackend('cpu');
        }
        
        await tf.ready();
        
        // Path ke model dari public folder
        const MODEL_URL = '/models';
        
        // Load model kecil untuk penggunaan di browser
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        
        setIsModelLoaded(true);
        setMessage({ text: 'Model dimuat. Siap untuk pendaftaran.', type: 'success' });
        
        // Mulai interval deteksi wajah setelah model dimuat
        const interval = setInterval(async () => {
          if (webcamRef.current && webcamRef.current.video.readyState === 4) {
            const video = webcamRef.current.video;
            
            // Deteksi wajah
            const detections = await faceapi.detectAllFaces(
              video, 
              new faceapi.TinyFaceDetectorOptions()
            );
            
            // Gambar hasil deteksi ke canvas
            if (canvasRef.current && detections.length > 0) {
              const canvas = canvasRef.current;
              const context = canvas.getContext('2d');
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              
              // Clear canvas
              context.clearRect(0, 0, canvas.width, canvas.height);
              
              // Gambar kotak deteksi
              detections.forEach(detection => {
                const box = detection.box;
                context.strokeStyle = '#00ff00';
                context.lineWidth = 3;
                context.strokeRect(box.x, box.y, box.width, box.height);
              });
            }
          }
        }, 100);
        
        setDetectionInterval(interval);
      } catch (error) {
        console.error('Error saat memuat model:', error);
        setMessage({ text: 'Gagal memuat model. Silakan refresh halaman.', type: 'danger' });
      }
    };
    
    loadModels();
    
    // Cleanup pada unmount
    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, [detectionInterval, webcamRef, canvasRef]);

  // Tangkap gambar dari webcam
  const captureImage = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImages((prev) => [...prev, imageSrc]);
        setMessage({ text: `Gambar ${capturedImages.length + 1} berhasil diambil`, type: 'success' });
      }
    }
  }, [capturedImages.length]);

  // Reset gambar yang diambil
  const resetImages = () => {
    setCapturedImages([]);
    setMessage({ text: 'Gambar direset', type: 'info' });
  };

  // Mengirimkan data ke server
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!capturedImage) {
      setMessage({ text: 'Silakan ambil foto terlebih dahulu', type: 'danger' });
      return;
    }

    const fullKelas = getFullKelas();
    if (!fullKelas) {
      setMessage({ text: 'Silakan pilih kelas dengan lengkap', type: 'danger' });
      return;
    }

    try {
      setIsLoading(true);
      setMessage({ text: 'Sedang mendaftarkan...', type: 'info' });
      
      // Konversi base64 ke blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      // Buat FormData untuk upload
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', fullKelas); // Tetap gunakan field 'email' di backend untuk kompatibilitas
      formData.append('photo', blob, 'captured_image.jpg');
      
      const serverResponse = await axios.post('/api/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (serverResponse.data.status === 'success') {
        setMessage({ text: serverResponse.data.message, type: 'success' });
        // Reset form
        setName('');
        setTingkat('');
        setJurusan('');
        setRombel('');
        setCapturedImage(null);
        // Redirect ke home setelah sukses
        setTimeout(() => navigate('/'), 2000);
      } else {
        setMessage({ text: serverResponse.data.message || 'Terjadi kesalahan', type: 'danger' });
      }
    } catch (error) {
      console.error('Error registering user:', error);
      const errorMessage = error.response?.data?.detail || 
                           error.response?.data?.message || 
                           'Gagal mendaftarkan pengguna. Silakan coba lagi.';
      setMessage({ text: errorMessage, type: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h2 className="card-title">Pendaftaran Pengguna Baru</h2>
        
        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nama Lengkap</label>
            <input
              type="text"
              className="form-control"
              id="name"
              placeholder="Masukkan nama lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group col-md-4">
              <label htmlFor="tingkat">Tingkat</label>
              <select
                className="form-control"
                id="tingkat"
                value={tingkat}
                onChange={(e) => setTingkat(e.target.value)}
                required
              >
                <option value="">-- Pilih Tingkat --</option>
                {Object.keys(kelasData).map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group col-md-4">
              <label htmlFor="jurusan">Jurusan</label>
              <select
                className="form-control"
                id="jurusan"
                value={jurusan}
                onChange={(e) => setJurusan(e.target.value)}
                required
                disabled={!tingkat}
              >
                <option value="">-- Pilih Jurusan --</option>
                {tingkat && 
                  Object.keys(kelasData[tingkat]).map((jur) => (
                    <option key={jur} value={jur}>
                      {jur}
                    </option>
                  ))
                }
              </select>
            </div>
            
            <div className="form-group col-md-4">
              <label htmlFor="rombel">Kelas</label>
              <select
                className="form-control"
                id="rombel"
                value={rombel}
                onChange={(e) => setRombel(e.target.value)}
                required
                disabled={!jurusan}
              >
                <option value="">-- Pilih Kelas --</option>
                {tingkat && jurusan && 
                  kelasData[tingkat][jurusan].map((kls) => (
                    <option key={kls} value={kls}>
                      {kls}
                    </option>
                  ))
                }
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Foto Wajah ({capturedImages.length} diambil - min. 3)</label>
            <div className="webcam-container">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                style={{ width: '100%' }}
              />
              <canvas ref={canvasRef} className="webcam-overlay" />
            </div>
            
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn"
                onClick={captureImage}
                disabled={!isModelLoaded || isLoading}
              >
                Ambil Foto
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetImages}
                disabled={isLoading || capturedImages.length === 0}
              >
                Reset Foto
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            className="btn btn-success"
            disabled={isLoading || !isModelLoaded || capturedImages.length < 3 || !tingkat || !jurusan || !rombel}
          >
            {isLoading ? 'Mendaftarkan...' : 'Daftar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register; 