# Sistem Face Attendance (CPU-Optimized)

Sistem absensi wajah yang dioptimalkan untuk berjalan di laptop tanpa GPU.

## Fitur

- Pendeteksian wajah menggunakan Haar Cascade (OpenCV)
- Model ringan MobileFaceNet untuk embedding wajah
- Dioptimalkan untuk CPU dengan ONNX Runtime
- Database SQLite untuk penyimpanan lokal
- Antarmuka web responsif

## Persyaratan Sistem

- Python 3.8+
- Node.js 14+
- Webcam

## Instalasi

### Backend

```bash
# Clone repository
git clone https://github.com/yourusername/face-attendance.git
cd face-attendance

# Buat virtual environment (opsional)
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
# source venv/bin/activate

# Instal dependensi
pip install -r requirements.txt

# Jalankan server
uvicorn app.main:app --reload
```

### Frontend

```bash
cd app/frontend
npm install
npm start
```

## Penggunaan

1. Buka http://localhost:3000 di browser
2. Daftar pengguna baru dengan beberapa foto wajah
3. Gunakan sistem untuk melakukan absensi dengan pengenalan wajah

## Limitasi

- Optimal untuk maksimal 10-15 pengguna aktif
- Akurasi 90-95% (trade-off untuk performa CPU)
- Disarankan menggunakan resolusi webcam 480p atau lebih rendah 