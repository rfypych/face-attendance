// faceDetectionUtils.js
import * as faceapi from '@vladmandic/face-api';
import * as tf from '@tensorflow/tfjs';

let isInitialized = false;

// Membersihkan state sebelumnya
export const resetState = async () => {
  try {
    console.log('Mereset state TensorFlow...');
    
    // Bersihkan variabel TensorFlow
    tf.engine().endScope();
    tf.engine().startScope();
    
    // Bersihkan cache jika ada
    if (tf.getBackend()) {
      tf.disposeVariables();
    }
    
    return true;
  } catch (e) {
    console.warn('Error saat reset state:', e);
    return false;
  }
};

// Inisialisasi TensorFlow.js dan face-api.js
export const initFaceDetection = async () => {
  if (isInitialized && faceapi.nets.tinyFaceDetector.isLoaded) {
    console.log('Model sudah dimuat sebelumnya, tidak perlu memuat ulang');
    return true;
  }
  
  try {
    console.log('Inisialisasi deteksi wajah...');
    
    // Reset state sebelum memulai
    await resetState();
    
    // Coba backend WebGL dulu, fallback ke CPU
    try {
      await tf.setBackend('webgl');
      console.log('Menggunakan backend WebGL');
    } catch (e) {
      console.warn("WebGL backend gagal:", e);
      try {
        await tf.setBackend('cpu');
        console.log('Menggunakan backend CPU');
      } catch (e2) {
        console.warn("CPU backend gagal:", e2);
      }
    }
    
    // Tunggu TF siap
    await tf.ready();
    const backend = tf.getBackend();
    console.log('TensorFlow.js siap dengan backend:', backend);
    
    if (!backend) {
      throw new Error('Tidak bisa menginisialisasi TensorFlow backend');
    }

    // Muat model face detection dengan path absolut
    const MODEL_URL = `${window.location.origin}/models`;
    console.log('Memuat model dari:', MODEL_URL);
    
    // Langsung pakai TinyFaceDetector yang sudah terbukti ada
    try {
      console.log('Memuat model TinyFaceDetector...');
      
      if (faceapi.nets.tinyFaceDetector.isLoaded) {
        console.log('Model TinyFaceDetector sudah dimuat sebelumnya');
      } else {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        console.log('Model TinyFaceDetector berhasil dimuat dari', MODEL_URL);
      }
      
      // Periksa apakah model sudah benar-benar dimuat
      if (faceapi.nets.tinyFaceDetector.isLoaded) {
        console.log('Model TinyFaceDetector terverifikasi sebagai LOADED');
        isInitialized = true;
        return true;
      } else {
        console.error('Model TinyFaceDetector gagal memuat sepenuhnya');
        throw new Error('Model tidak termuat sepenuhnya');
      }
    } catch (modelError) {
      console.error('Gagal memuat model TinyFaceDetector:', modelError);
      throw new Error('Gagal memuat model deteksi wajah');
    }
  } catch (error) {
    console.error('Error initializing face detection:', error);
    throw error;
  }
};

// Fungsi untuk mendeteksi wajah dan menggambar kotak
export const detectFaces = async (video, canvas) => {
  try {
    // Pastikan video dan canvas valid
    if (!video || !canvas) {
      console.warn('Video atau canvas tidak valid');
      return [];
    }
    
    if (video.readyState !== 4) {
      console.warn('Video tidak dalam keadaan ready. readyState =', video.readyState);
      return [];
    }
    
    // Verifikasi model terlebih dahulu
    if (!isInitialized || !faceapi.nets.tinyFaceDetector.isLoaded) {
      console.error('Model TinyFaceDetector belum dimuat');
      throw new Error('Model belum dimuat');
    }
    
    // Siapkan canvas
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    console.log('Mulai deteksi wajah dengan TinyFaceDetector');
    
    // Deteksi dengan TinyFaceDetector
    let detections = [];
    try {
      detections = await faceapi.detectAllFaces(
        video,
        new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 })
      );
      
      console.log(`Deteksi wajah selesai: ${detections.length} wajah ditemukan`);
    } catch (error) {
      console.error("Error saat deteksi wajah:", error);
      throw error;
    }
    
    // Bersihkan canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Gambar kotak untuk wajah yang terdeteksi
    if (detections.length > 0) {
      detections.forEach(detection => {
        const box = detection.box;
        context.strokeStyle = '#00ff00'; // Kotak hijau
        context.lineWidth = 2;
        context.strokeRect(box.x, box.y, box.width, box.height);
      });
    }
    
    return detections;
  } catch (error) {
    console.error("Error detecting faces:", error);
    throw error;
  }
};

// Periksa status model
export const getModelStatus = () => {
  return {
    isInitialized,
    tinyFaceDetectorLoaded: faceapi.nets ? faceapi.nets.tinyFaceDetector.isLoaded : false,
    tensorflowBackend: tf.getBackend()
  };
};

export default {
  initFaceDetection,
  detectFaces,
  resetState,
  getModelStatus
}; 