import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import * as faceapi from 'face-api.js';
import * as tf from '@tensorflow/tfjs';

const Register = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [capturedImages, setCapturedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [detectionInterval, setDetectionInterval] = useState(null);

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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (capturedImages.length < 3) {
      setMessage({ text: 'Silakan ambil setidaknya 3 gambar wajah', type: 'danger' });
      return;
    }
    
    try {
      setIsLoading(true);
      setMessage({ text: 'Mendaftarkan pengguna...', type: 'info' });
      
      // Konversi base64 images ke Blob untuk upload
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      
      capturedImages.forEach((image, index) => {
        const blob = dataURItoBlob(image);
        formData.append('photos', blob, `face-${index}.jpg`);
      });
      
      const response = await axios.post('/api/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.status === 'success') {
        setMessage({ text: response.data.message, type: 'success' });
        setName('');
        setEmail('');
        setCapturedImages([]);
      } else {
        setMessage({ text: response.data.message || 'Terjadi kesalahan', type: 'danger' });
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

  // Konversi data URI ke Blob
  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], { type: mimeString });
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
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
            disabled={isLoading || !isModelLoaded || capturedImages.length < 3}
          >
            {isLoading ? 'Mendaftarkan...' : 'Daftar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register; 