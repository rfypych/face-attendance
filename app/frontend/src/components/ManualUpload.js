import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManualUpload = () => {
  const [name, setName] = useState('');
  const [tingkat, setTingkat] = useState('');
  const [jurusan, setJurusan] = useState('');
  const [rombel, setRombel] = useState('');
  const [photos, setPhotos] = useState([]);
  const [photosPreviews, setPhotosPreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

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

  // Menangani perubahan saat file dipilih
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (selectedFiles.length > 5) {
      setMessage({ text: 'Maksimal 5 foto yang diperbolehkan', type: 'danger' });
      return;
    }
    
    setPhotos(selectedFiles);
    
    // Membuat URL preview untuk gambar
    const previews = [];
    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push(e.target.result);
        if (previews.length === selectedFiles.length) {
          setPhotosPreviews([...previews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (photos.length === 0) {
      setMessage({ text: 'Silakan pilih minimal 1 foto wajah', type: 'danger' });
      return;
    }
    
    if (photos.length > 5) {
      setMessage({ text: 'Maksimal 5 foto yang diperbolehkan', type: 'danger' });
      return;
    }

    const fullKelas = getFullKelas();
    if (!fullKelas) {
      setMessage({ text: 'Silakan pilih kelas dengan lengkap', type: 'danger' });
      return;
    }
    
    try {
      setIsLoading(true);
      setMessage({ text: 'Mendaftarkan pengguna...', type: 'info' });
      
      // Buat FormData untuk upload
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', fullKelas); // Tetap gunakan field 'email' di backend untuk kompatibilitas
      
      // Tambahkan semua foto ke formData
      photos.forEach(photo => {
        formData.append('photos', photo);
      });
      
      const response = await axios.post('/api/register/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.status === 'success') {
        setMessage({ text: response.data.message, type: 'success' });
        setName('');
        setTingkat('');
        setJurusan('');
        setRombel('');
        setPhotos([]);
        setPhotosPreviews([]);
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

  return (
    <div>
      <div className="card">
        <h2 className="card-title">Upload Foto Wajah</h2>
        
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
            <label htmlFor="photos">Upload Foto Wajah (Maksimal 5 foto)</label>
            <input
              type="file"
              className="form-control-file"
              id="photos"
              accept="image/*"
              onChange={handleFileChange}
              multiple
              required
            />
            
            {photosPreviews.length > 0 && (
              <div className="mt-3">
                <p>Preview ({photosPreviews.length} foto):</p>
                <div className="photo-previews">
                  {photosPreviews.map((preview, index) => (
                    <img 
                      key={index}
                      src={preview} 
                      alt={`Preview ${index+1}`} 
                      style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover', margin: '5px' }} 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || photos.length === 0 || !tingkat || !jurusan || !rombel}
          >
            {isLoading ? 'Mendaftarkan...' : 'Daftar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManualUpload; 