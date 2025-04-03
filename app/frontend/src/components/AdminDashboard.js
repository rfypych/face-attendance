import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Webcam from 'react-webcam';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserEmbeddings, setSelectedUserEmbeddings] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [photosPreviews, setPhotosPreviews] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  
  const fileInputRef = useRef(null);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  // Konfigurasi webcam
  const videoConstraints = {
    width: 480,
    height: 480,
    facingMode: "user"
  };

  useEffect(() => {
    // Cek token admin
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin');
      return;
    }

    // Load data
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Mengambil daftar user
      const response = await axios.get('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.data.status === 'success') {
        setUsers(response.data.data);
      } else {
        setMessage({ text: response.data.message || 'Gagal memuat data', type: 'danger' });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      
      if (error.response?.status === 401) {
        setMessage({ text: 'Sesi tidak valid. Silakan login kembali.', type: 'danger' });
        localStorage.removeItem('adminToken');
        setTimeout(() => {
          navigate('/admin');
        }, 2000);
      } else {
        setMessage({ 
          text: error.response?.data?.detail || 'Gagal memuat data pengguna', 
          type: 'danger' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEmbeddings = async (userId) => {
    try {
      setLoading(true);
      
      // Mengambil daftar embedding untuk user tertentu
      const response = await axios.get(`/api/admin/users/${userId}/embeddings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.data.status === 'success') {
        setSelectedUserEmbeddings(response.data.data);
      } else {
        setMessage({ text: response.data.message || 'Gagal memuat data foto', type: 'danger' });
      }
    } catch (error) {
      console.error('Error fetching embeddings:', error);
      setMessage({ 
        text: error.response?.data?.detail || 'Gagal memuat data foto', 
        type: 'danger' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    await fetchUserEmbeddings(user.id);
  };

  const handleDeleteEmbedding = (embeddingId) => {
    setItemToDelete({ type: 'embedding', id: embeddingId });
    setShowConfirmation(true);
  };

  const handleDeleteUser = (userId) => {
    setItemToDelete({ type: 'user', id: userId });
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      
      if (itemToDelete.type === 'embedding') {
        // Hapus embedding
        const response = await axios.delete(`/api/admin/embeddings/${itemToDelete.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (response.data.status === 'success') {
          setMessage({ text: 'Foto berhasil dihapus', type: 'success' });
          // Refresh embedding data
          fetchUserEmbeddings(selectedUser.id);
        } else {
          setMessage({ text: response.data.message || 'Gagal menghapus foto', type: 'danger' });
        }
      } else if (itemToDelete.type === 'user') {
        // Hapus user
        const response = await axios.delete(`/api/admin/users/${itemToDelete.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (response.data.status === 'success') {
          setMessage({ text: 'Pengguna berhasil dihapus', type: 'success' });
          // Refresh user data dan reset selected user
          fetchUsers();
          setSelectedUser(null);
          setSelectedUserEmbeddings([]);
        } else {
          setMessage({ text: response.data.message || 'Gagal menghapus pengguna', type: 'danger' });
        }
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      setMessage({ 
        text: error.response?.data?.detail || 'Gagal menghapus item', 
        type: 'danger' 
      });
    } finally {
      setLoading(false);
      setShowConfirmation(false);
      setItemToDelete(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  // Fungsi untuk menangani pemilihan file foto
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (selectedFiles.length > 5) {
      setMessage({ text: 'Maksimal 5 foto yang diperbolehkan', type: 'danger' });
      return;
    }
    
    setUploadedPhotos(selectedFiles);
    
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

  // Fungsi untuk mengambil gambar dari kamera webcam
  const captureImage = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        // Menambahkan gambar ke daftar capture
        setCapturedImages(prev => [...prev, imageSrc]);
      }
    }
  }, []);

  // Fungsi untuk menghapus gambar dari daftar yang diambil
  const removeImage = (index) => {
    setCapturedImages(capturedImages.filter((_, i) => i !== index));
  };

  // Fungsi untuk menampilkan dialog upload foto
  const showUploadDialog = () => {
    setUploadedPhotos([]);
    setPhotosPreviews([]);
    setCapturedImages([]);
    setUseCamera(false);
    setShowUploadModal(true);
  };

  // Fungsi untuk menutup dialog upload foto
  const closeUploadDialog = () => {
    setShowUploadModal(false);
    setUploadedPhotos([]);
    setPhotosPreviews([]);
    setCapturedImages([]);
    setUseCamera(false);
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

  // Fungsi untuk mengunggah foto
  const handleUploadPhotos = async () => {
    if (!selectedUser) {
      setMessage({ text: 'Tidak ada pengguna yang dipilih', type: 'danger' });
      return;
    }
    
    const hasPhotos = useCamera ? capturedImages.length > 0 : uploadedPhotos.length > 0;
    
    if (!hasPhotos) {
      setMessage({ text: 'Silakan pilih minimal 1 foto wajah', type: 'danger' });
      return;
    }
    
    try {
      setUploadLoading(true);
      setMessage({ text: 'Mengunggah foto...', type: 'info' });
      
      // Buat FormData untuk upload
      const formData = new FormData();
      formData.append('user_id', selectedUser.id);
      
      // Tambahkan semua foto ke formData
      if (useCamera) {
        // Mengunggah gambar dari kamera
        capturedImages.forEach((image, index) => {
          const blob = dataURItoBlob(image);
          formData.append('photos', blob, `webcam-${index}.jpg`);
        });
      } else {
        // Mengunggah file yang dipilih
        uploadedPhotos.forEach(photo => {
          formData.append('photos', photo);
        });
      }
      
      const response = await axios.post('/api/admin/users/upload-photos', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.data.status === 'success') {
        setMessage({ text: response.data.message, type: 'success' });
        closeUploadDialog();
        // Refresh data embeddings
        await fetchUserEmbeddings(selectedUser.id);
        // Refresh user list untuk memperbarui jumlah foto
        await fetchUsers();
      } else {
        setMessage({ text: response.data.message || 'Terjadi kesalahan', type: 'danger' });
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         'Gagal mengunggah foto. Silakan coba lagi.';
      setMessage({ text: errorMessage, type: 'danger' });
    } finally {
      setUploadLoading(false);
    }
  };

  // Fungsi untuk mengubah mode upload
  const toggleUploadMode = () => {
    setUseCamera(!useCamera);
    // Reset data dari mode sebelumnya
    if (useCamera) {
      setCapturedImages([]);
    } else {
      setUploadedPhotos([]);
      setPhotosPreviews([]);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h2 className="card-title">Dashboard Admin</h2>
          <button 
            className="btn btn-danger"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
        
        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}
        
        {loading ? (
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-2">Memuat data...</p>
          </div>
        ) : (
          <div className="row">
            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  <h4>Daftar Pengguna</h4>
                </div>
                <div className="card-body">
                  {users.length === 0 ? (
                    <p>Tidak ada pengguna terdaftar</p>
                  ) : (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Nama</th>
                          <th>Kelas</th>
                          <th>Jumlah Foto</th>
                          <th>Tanggal Daftar</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr 
                            key={user.id} 
                            className={`${selectedUser?.id === user.id ? 'active' : ''}`}
                            onClick={() => handleUserClick(user)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.class}</td>
                            <td>{user.embeddings ? user.embeddings.length : 0}</td>
                            <td>{new Date(user.created_at).toLocaleString()}</td>
                            <td>
                              <button 
                                className="btn btn-sm btn-danger"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteUser(user.id);
                                }}
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
            
            <div className="col-md-8">
              {selectedUser ? (
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h4>Data Foto {selectedUser.name}</h4>
                    <button 
                      className="btn btn-primary"
                      onClick={showUploadDialog}
                    >
                      Tambah Foto
                    </button>
                  </div>
                  <div className="card-body">
                    {selectedUserEmbeddings.length === 0 ? (
                      <p>Tidak ada foto tersimpan</p>
                    ) : (
                      <div className="row">
                        {selectedUserEmbeddings.map((embedding, index) => (
                          <div key={embedding.id} className="col-md-4 mb-3">
                            <div className="card">
                              <div className="card-header">
                                <h6>Foto {index + 1}</h6>
                              </div>
                              <div className="card-body">
                                <p>ID: {embedding.id}</p>
                                <p>Tanggal: {new Date(embedding.created_at).toLocaleString()}</p>
                              </div>
                              <div className="card-footer">
                                <button 
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleDeleteEmbedding(embedding.id)}
                                >
                                  Hapus Foto
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="card">
                  <div className="card-body text-center">
                    <p>Pilih pengguna untuk melihat detail foto</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Konfirmasi Hapus</h5>
                  <button type="button" className="close" onClick={() => setShowConfirmation(false)}>
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <p>
                    {itemToDelete?.type === 'user' 
                      ? 'Apakah Anda yakin ingin menghapus pengguna ini? Semua data foto juga akan dihapus.' 
                      : 'Apakah Anda yakin ingin menghapus foto ini?'}
                  </p>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowConfirmation(false)}
                  >
                    Batal
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={confirmDelete}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Photos Modal */}
        {showUploadModal && (
          <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Upload Foto untuk {selectedUser?.name}</h5>
                  <button type="button" className="close" onClick={closeUploadDialog}>
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="d-flex justify-content-center mb-3">
                    <div className="btn-group" role="group">
                      <button 
                        type="button" 
                        className={`btn ${!useCamera ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setUseCamera(false)}
                      >
                        Upload File
                      </button>
                      <button 
                        type="button" 
                        className={`btn ${useCamera ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setUseCamera(true)}
                      >
                        Gunakan Kamera
                      </button>
                    </div>
                  </div>
                  
                  {useCamera ? (
                    /* Mode Kamera */
                    <div className="webcam-container">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="d-flex flex-column align-items-center">
                            <Webcam
                              audio={false}
                              ref={webcamRef}
                              screenshotFormat="image/jpeg"
                              videoConstraints={videoConstraints}
                              style={{ width: '100%', maxWidth: '400px', borderRadius: '8px' }}
                            />
                            <button
                              className="btn btn-primary mt-2"
                              onClick={captureImage}
                              disabled={capturedImages.length >= 5}
                            >
                              Ambil Foto
                            </button>
                            {capturedImages.length >= 5 && (
                              <small className="text-danger mt-1">Maksimal 5 foto</small>
                            )}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <h6>Foto yang diambil: {capturedImages.length}</h6>
                          <div className="captured-images">
                            {capturedImages.length > 0 ? (
                              <div className="row">
                                {capturedImages.map((image, index) => (
                                  <div key={index} className="col-6 mb-2 position-relative">
                                    <img 
                                      src={image} 
                                      alt={`Captured ${index}`} 
                                      style={{ width: '100%', borderRadius: '4px' }} 
                                    />
                                    <button 
                                      className="btn btn-sm btn-danger position-absolute"
                                      style={{ top: 0, right: 10 }}
                                      onClick={() => removeImage(index)}
                                    >
                                      &times;
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-center">Belum ada foto yang diambil</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Mode Upload File */
                    <div className="form-group">
                      <label htmlFor="photos">Pilih Foto Wajah (Maksimal 5 foto)</label>
                      <input
                        type="file"
                        className="form-control-file"
                        id="photos"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileChange}
                        multiple
                      />
                      
                      {photosPreviews.length > 0 && (
                        <div className="mt-3">
                          <p>Preview ({photosPreviews.length} foto):</p>
                          <div className="row">
                            {photosPreviews.map((preview, index) => (
                              <div key={index} className="col-md-4 mb-2">
                                <img 
                                  src={preview} 
                                  alt={`Preview ${index+1}`} 
                                  style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '4px' }} 
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={closeUploadDialog}
                  >
                    Batal
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleUploadPhotos}
                    disabled={
                      uploadLoading || 
                      (useCamera ? capturedImages.length === 0 : uploadedPhotos.length === 0)
                    }
                  >
                    {uploadLoading ? 'Mengunggah...' : 'Upload'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 