import React, { useState } from 'react';
import axios from 'axios';

const ManualUpload = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Menangani perubahan saat file dipilih
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      setPhoto(selectedFile);
      
      // Membuat URL preview untuk gambar
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!photo) {
      setMessage({ text: 'Silakan pilih foto wajah', type: 'danger' });
      return;
    }
    
    try {
      setIsLoading(true);
      setMessage({ text: 'Mendaftarkan pengguna...', type: 'info' });
      
      // Buat FormData untuk upload
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('photo', photo);
      
      const response = await axios.post('/api/register/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.status === 'success') {
        setMessage({ text: response.data.message, type: 'success' });
        setName('');
        setEmail('');
        setPhoto(null);
        setPhotoPreview(null);
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
            <label htmlFor="photo">Upload Foto Wajah</label>
            <input
              type="file"
              className="form-control-file"
              id="photo"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
            
            {photoPreview && (
              <div className="mt-3">
                <p>Preview:</p>
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} 
                />
              </div>
            )}
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !photo}
          >
            {isLoading ? 'Mendaftarkan...' : 'Daftar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManualUpload; 