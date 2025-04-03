# 🚀 Sistem Absensi Wajah (CPU Optimized) 🚀

[![Python Version](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://www.python.org/)
[![Node.js Version](https://img.shields.io/badge/Node.js-14%2B-green.svg)](https://nodejs.org/)
<!-- Tambahkan badge lain jika relevan, contoh: License -->
<!-- [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) -->

Sistem absensi modern menggunakan deteksi dan pengenalan wajah, dirancang khusus untuk **berjalan efisien pada perangkat tanpa GPU (CPU-Optimized)**.

![Placeholder Screenshot/GIF Aplikasi](https://github.com/rfypych/face-attendance/blob/main/diagram2.png)

## ✨ Fitur Utama

*   **Deteksi Wajah Cepat:** Menggunakan Haar Cascade dari OpenCV untuk deteksi wajah secara *real-time*.
*   **Pengenalan Wajah Akurat:** Ditenagai oleh model deep learning **MobileFaceNet** yang ringan untuk ekstraksi fitur wajah (embedding).
*   **Optimasi CPU:** Model dijalankan menggunakan **ONNX Runtime**, memastikan performa optimal di CPU tanpa ketergantungan pada GPU.
*   **Manajemen Data:** Penyimpanan data pengguna dan embedding wajah menggunakan database **SQLite** lokal.
*   **Antarmuka Web Intuitif:** Dibangun dengan **React** untuk pengalaman pengguna yang responsif.
*   **API Backend:** Menggunakan **FastAPI** untuk backend yang cepat dan efisien.

## 🛠️ Teknologi yang Digunakan

*   **Backend:** Python, FastAPI, Uvicorn
*   **Frontend:** Node.js, React, npm
*   **Deteksi Wajah:** OpenCV (Haar Cascade)
*   **Pengenalan Wajah:** MobileFaceNet (via ONNX Runtime)
*   **Database:** SQLite
*   **Optimasi Model:** ONNX Runtime

## 🏗️ Struktur Proyek

```
face-attendance/
├── app/
│   ├── api/              # Modul API (FastAPI routes)
│   │   └── routes.py
│   ├── database/         # Modul database (SQLite)
│   │   ├── db.py
│   │   └── face_attendance.db
│   ├── frontend/         # Kode sumber Frontend (React)
│   │   ├── public/
│   │   ├── src/
│   │   └── package.json
│   ├── models/           # Modul pengenalan wajah
│   │   └── face_recognition.py
│   ├── __init__.py
│   └── main.py           # Entry point aplikasi FastAPI
├── .gitignore
├── README.md             # Anda sedang membacanya!
├── requirements.txt      # Dependensi Python (backend)
└── package.json          # Dependensi Node.js (frontend - di root untuk kemudahan?)
# Mungkin ada node_modules/ dan venv/ juga
```

## ⚙️ Instalasi & Menjalankan

**Prasyarat:**
*   Python 3.8+ & Pip
*   Node.js 14+ & Npm
*   Git
*   Webcam

**Langkah-langkah:**

1.  **Clone Repository:**
    ```bash
    git clone https://github.com/rfypych/face-attendance.git
    cd face-attendance
    ```
   
2.  **Setup Backend (Python):**
    ```bash
    # (Opsional tapi direkomendasikan) Buat & aktifkan virtual environment
    python -m venv venv
    # Windows:
    venv\Scripts\activate
    # Linux/macOS:
    # source venv/bin/activate

    # Instal dependensi Python
    pip install -r requirements.txt
    ```

3.  **Setup Frontend (Node.js):**
    ```bash
    # Asumsi package.json frontend ada di app/frontend/
    cd app/frontend
    npm install
    cd ../.. # Kembali ke direktori root proyek
    ```
    *(Jika `package.json` frontend ada di root, jalankan `npm install` di root)*

4.  **Jalankan Aplikasi:**
    *   **Jalankan Backend Server:** Buka terminal *pertama* di direktori root (`face-attendance/`) dan jalankan:
        ```bash
        uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
        ```
        *(Server API akan berjalan di http://localhost:8000)*
    *   **Jalankan Frontend Dev Server:** Buka terminal *kedua*, masuk ke direktori frontend (`app/frontend/`), dan jalankan:
        ```bash
        # Pindah ke direktori frontend
        cd app/frontend
        npm start
        ```
        *(Aplikasi web akan terbuka otomatis atau bisa diakses di http://localhost:3000)*

## 🚀 Penggunaan

1.  Buka aplikasi web di browser Anda (biasanya http://localhost:3000).
2.  **Daftarkan Pengguna Baru:** Navigasi ke halaman pendaftaran. Masukkan nama dan ambil beberapa foto wajah Anda dari berbagai sudut untuk akurasi yang lebih baik.
3.  **Lakukan Absensi:** Gunakan fitur absensi. Sistem akan mendeteksi wajah Anda melalui webcam dan mencocokkannya dengan data yang tersimpan.

## ⚠️ Limitasi & Saran

*   **Skalabilitas Pengguna:** Sistem ini dioptimalkan untuk jumlah pengguna yang relatif kecil (direkomendasikan 10-15 pengguna aktif secara bersamaan) karena keterbatasan pemrosesan CPU.
*   **Akurasi vs Performa:** Akurasi pengenalan wajah berkisar 90-95%. Ini adalah *trade-off* untuk mencapai performa yang baik di CPU. Faktor seperti pencahayaan dan sudut wajah dapat mempengaruhi akurasi.
*   **Resolusi Webcam:** Untuk performa terbaik, disarankan menggunakan resolusi webcam 480p atau 720p. Resolusi yang lebih tinggi dapat memperlambat proses deteksi.

## 🤝 Berkontribusi

Kontribusi sangat diterima! Jika Anda ingin berkontribusi, silakan:
1.  Fork repository ini.
2.  Buat branch fitur baru (`git checkout -b fitur/NamaFitur`).
3.  Commit perubahan Anda (`git commit -am 'Menambahkan fitur X'`).
4.  Push ke branch (`git push origin fitur/NamaFitur`).
5.  Buat Pull Request baru.

---

*Dibuat dengan 🧠 oleh rfypych!* 
