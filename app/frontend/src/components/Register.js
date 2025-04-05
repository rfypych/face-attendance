import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [tingkat, setTingkat] = useState('');
  const [jurusan, setJurusan] = useState('');
  const [rombel, setRombel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
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
      // Pastikan tidak ada spasi berlebih dengan trim dan format konsisten
      return `${tingkat.trim()} ${jurusan.trim()} ${rombel.trim()}`;
    }
    return '';
  };

  // Mengirimkan data ke server
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
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
      setMessage({ text: 'Sedang mendaftarkan pengguna...', type: 'info' });

      // Gunakan API endpoint register-without-face yang baru
      const response = await axios.post('/api/register-without-face', {
        name: name.trim(),
        kelas: fullKelas
      });

      if (response.data && response.data.status === 'success') {
        // Simpan data registrasi ke localStorage untuk memudahkan login
        localStorage.setItem('lastRegisteredName', name.trim());
        localStorage.setItem('lastRegisteredKelas', fullKelas);
        localStorage.setItem('lastRegisteredTingkat', tingkat);
        localStorage.setItem('lastRegisteredJurusan', jurusan);
        localStorage.setItem('lastRegisteredRombel', rombel);
        
        setMessage({ 
          text: 'Pendaftaran berhasil! Anda akan diarahkan ke halaman login.', 
          type: 'success' 
        });
        
        // Reset form setelah berhasil
        setName('');
        setTingkat('');
        setJurusan('');
        setRombel('');
        
        // Navigasi ke halaman login setelah beberapa saat
        setTimeout(() => {
          navigate('/login'); 
        }, 2000);
      } else {
        setMessage({ 
          text: response.data?.message || 'Terjadi kesalahan saat pendaftaran', 
          type: 'danger' 
        });
      }
    } catch (error) {
      console.error('Error saat pendaftaran:', error);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Terjadi kesalahan saat pendaftaran';
      
      setMessage({ text: errorMessage, type: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="card">
        <h2 className="card-title">Pendaftaran Siswa</h2>
        
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
              placeholder="Masukkan nama lengkap Anda"
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
            {isLoading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>
        
        <div className="form-footer">
          <p>Sudah punya akun? <Link to="/login" className="link-primary">Login disini</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register; 