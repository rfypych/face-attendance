import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-wasm';
import * as faceapi from '@vladmandic/face-api';

const Attendance = () => {
  const webcamRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLiveChecking, setIsLiveChecking] = useState(false);
  const intervalRef = useRef(null);

  // Batasi resolusi webcam untuk kinerja lebih baik
  const videoConstraints = {
    width: 320,
    height: 240,
    facingMode: "user"
  };

  useEffect(() => {
    const loadModels = async () => {
      try {
        // Set backend ke 'wasm' untuk kinerja CPU
        await tf.setBackend('wasm');
        await tf.ready();
        
        // Lanjutkan dengan load model
        const MODEL_URL = '/models';
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        // ...
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };
    
    loadModels();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Deteksi wajah dan ambil absensi
  const detectFace = async () => {
    if (!webcamRef.current || isProcessing) {
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Ambil gambar dari webcam
      const screenshot = webcamRef.current.getScreenshot();
      if (!screenshot) {
        setMessage({ text: 'Tidak dapat mengakses kamera', type: 'danger' });
        return;
      }
      
      // Konversi ke blob untuk pengiriman ke server
      const blob = dataURItoBlob(screenshot);
      const formData = new FormData();
      formData.append('file', blob, 'face.jpg');
      
      // Kirim ke server untuk pengenalan
      const response = await axios.post('/api/recognize', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.status === 'success') {
        setRecognitionResult(response.data);
        setMessage({ 
          text: `Halo, ${response.data.name}! Kehadiran anda berhasil dicatat.`, 
          type: 'success' 
        });
        
        // Jika dalam mode live checking, hentikan setelah mengenali
        if (isLiveChecking) {
          stopLiveChecking();
        }
      } else {
        setMessage({ text: response.data.message, type: 'danger' });
      }
    } catch (error) {
      console.error('Face recognition error:', error);
      setMessage({ 
        text: error.response?.data?.detail || 'Gagal mengenali wajah', 
        type: 'danger' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Mulai pengecekan wajah otomatis dengan interval
  const startLiveChecking = () => {
    setIsLiveChecking(true);
    setMessage({ text: 'Memulai pengenalan wajah otomatis...', type: 'info' });
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Batasi ke 5 FPS untuk menghemat CPU
    intervalRef.current = setInterval(detectFace, 200);
  };

  // Hentikan pengecekan otomatis
  const stopLiveChecking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsLiveChecking(false);
  };

  // Reset hasil pengenalan
  const resetRecognition = () => {
    setRecognitionResult(null);
    setMessage({ text: 'Siap untuk pengenalan wajah baru', type: 'info' });
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
        <h2 className="card-title">Absensi dengan Pengenalan Wajah</h2>
        
        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}
        
        {recognitionResult && (
          <div className="card" style={{ marginBottom: '20px', backgroundColor: '#f9fcf5' }}>
            <h3>Hasil Pengenalan</h3>
            <p><strong>Nama:</strong> {recognitionResult.name}</p>
            <p><strong>ID:</strong> {recognitionResult.user_id}</p>
            <p><strong>Akurasi:</strong> {(recognitionResult.confidence * 100).toFixed(2)}%</p>
          </div>
        )}
        
        <div className="webcam-container">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn"
            onClick={detectFace}
            disabled={isProcessing || isLiveChecking}
          >
            {isProcessing ? 'Mengenali...' : 'Ambil Absensi'}
          </button>
          
          {!isLiveChecking ? (
            <button
              className="btn btn-success"
              onClick={startLiveChecking}
              disabled={isProcessing}
            >
              Mulai Pengenalan Otomatis
            </button>
          ) : (
            <button
              className="btn btn-danger"
              onClick={stopLiveChecking}
            >
              Hentikan Pengenalan Otomatis
            </button>
          )}
          
          {recognitionResult && (
            <button
              className="btn btn-secondary"
              onClick={resetRecognition}
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance; 