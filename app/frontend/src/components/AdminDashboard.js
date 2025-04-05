import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Webcam from 'react-webcam';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'users'
  
  const fileInputRef = useRef(null);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  // Konfigurasi webcam yang diperbarui
  const videoConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: { ideal: "environment" }, // Gunakan kamera belakang di mobile
    aspectRatio: 1
  };

  // Fungsi untuk mendeteksi perangkat mobile
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Fungsi untuk menangani error kamera
  const handleCameraError = (error) => {
    console.error('Error accessing camera:', error);
    setMessage({ 
      text: 'Tidak dapat mengakses kamera. Pastikan Anda telah memberikan izin kamera dan menggunakan browser yang mendukung.', 
      type: 'danger' 
    });
  };

  // Fungsi untuk meminta izin kamera
  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      handleCameraError(error);
      return false;
    }
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
    fetchStats();
  }, [navigate]);
  
  // Fetch stats data
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      
      // Mengambil statistik
      const response = await axios.get('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.data.status === 'success') {
        setStats(response.data.data);
      } else {
        setMessage({ text: response.data.message || 'Gagal memuat statistik', type: 'danger' });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setMessage({ 
        text: error.response?.data?.detail || 'Gagal memuat statistik', 
        type: 'danger' 
      });
    } finally {
      setStatsLoading(false);
    }
  };

  // Prepare chart data for attendance
  const prepareAttendanceChartData = () => {
    if (!stats) return null;
    
    const days = Object.keys(stats.attendance_by_day).sort();
    const counts = days.map(day => stats.attendance_by_day[day]);
    
    // Format dates to be more readable (e.g., "01 Jan" format)
    const formattedDays = days.map(day => {
      const date = new Date(day);
      return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    });
    
    return {
      labels: formattedDays,
      datasets: [
        {
          label: 'Jumlah Kehadiran',
          data: counts,
          fill: false,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.4
        }
      ]
    };
  };
  
  // Prepare chart data for user statistics
  const prepareUserChartData = () => {
    if (!stats) return null;
    
    return {
      labels: ['Dengan Foto Wajah', 'Tanpa Foto Wajah'],
      datasets: [
        {
          data: [stats.users_with_face, stats.users_without_face],
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

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
          fetchStats();
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
  };

  // Fungsi untuk mengkonversi Data URL menjadi Blob
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
    try {
      setUploadLoading(true);
      setMessage({ text: 'Mengunggah foto...', type: 'info' });
      
      const formData = new FormData();
      formData.append('user_id', selectedUser.id);
      
      if (useCamera) {
        // Konversi captured images ke File objects
        capturedImages.forEach((imageSrc, index) => {
          const blob = dataURItoBlob(imageSrc);
          formData.append('photos', blob, `webcam-${index}.jpg`);
        });
      } else {
        // Menggunakan file yang dipilih
        uploadedPhotos.forEach(file => {
          formData.append('photos', file);
        });
      }
      
      const response = await axios.post('/api/admin/users/upload-photos', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.status === 'success') {
        setMessage({ 
          text: response.data.message || 'Foto berhasil diunggah', 
          type: 'success' 
        });
        
        // Refresh data foto dan statistik
        await fetchUserEmbeddings(selectedUser.id);
        await fetchStats();
        
        // Tutup modal
        closeUploadDialog();
      } else {
        setMessage({ 
          text: response.data.message || 'Terjadi kesalahan saat mengunggah foto', 
          type: 'danger' 
        });
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      setMessage({ 
        text: error.response?.data?.detail || error.response?.data?.message || 'Gagal mengunggah foto', 
        type: 'danger' 
      });
    } finally {
      setUploadLoading(false);
    }
  };

  // Fungsi untuk beralih antara mode upload file dan kamera
  const toggleUploadMode = async () => {
    if (!useCamera) {
      // Beralih ke mode kamera
      const hasPermission = await requestCameraPermission();
      if (hasPermission) {
        setUseCamera(true);
      }
    }
    
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
        
        {/* Tabs for navigation */}
        <div className="card-body p-0">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                Pengguna
              </button>
            </li>
          </ul>
        </div>
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="card-body">
            {statsLoading ? (
              <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-2">Memuat statistik...</p>
              </div>
            ) : stats ? (
              <div className="dashboard-stats">
                <div className="row mb-4">
                  <div className="col-md-3 col-sm-6 mb-3">
                    <div className="card bg-primary text-white">
                      <div className="card-body">
                        <h5 className="card-title">Total Pengguna</h5>
                        <h2 className="display-4">{stats.total_users}</h2>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 col-sm-6 mb-3">
                    <div className="card bg-success text-white">
                      <div className="card-body">
                        <h5 className="card-title">Dengan Foto</h5>
                        <h2 className="display-4">{stats.users_with_face}</h2>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 col-sm-6 mb-3">
                    <div className="card bg-warning text-white">
                      <div className="card-body">
                        <h5 className="card-title">Tanpa Foto</h5>
                        <h2 className="display-4">{stats.users_without_face}</h2>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 col-sm-6 mb-3">
                    <div className="card bg-info text-white">
                      <div className="card-body">
                        <h5 className="card-title">Total Absensi</h5>
                        <h2 className="display-4">{stats.total_attendance}</h2>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-8 mb-4">
                    <div className="card">
                      <div className="card-header">
                        <h5>Absensi 7 Hari Terakhir</h5>
                      </div>
                      <div className="card-body">
                        <Line data={prepareAttendanceChartData()} options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: 'top',
                            },
                            title: {
                              display: false
                            }
                          }
                        }} />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mb-4">
                    <div className="card">
                      <div className="card-header">
                        <h5>Distribusi Pengguna</h5>
                      </div>
                      <div className="card-body">
                        <Doughnut data={prepareUserChartData()} options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: 'bottom',
                            }
                          }
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right text-muted">
                  <small>Terakhir diperbarui: {new Date(stats.last_updated).toLocaleString()}</small>
                </div>
              </div>
            ) : (
              <div className="text-center p-5">
                <p>Tidak ada data statistik tersedia</p>
              </div>
            )}
          </div>
        )}
        
        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="card-body">
            {loading ? (
              <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-2">Memuat data...</p>
              </div>
            ) : (
              <div className="row">
                <div className={`col-12 ${isMobileDevice() ? 'mb-4' : 'col-md-4'}`}>
                  <div className="card">
                    <div className="card-header">
                      <h4>Daftar Pengguna</h4>
                    </div>
                    <div className="card-body">
                      {users.length === 0 ? (
                        <p>Tidak ada pengguna terdaftar</p>
                      ) : (
                        <div className="table-responsive">
                          <table className="table">
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>Nama</th>
                                <th>Kelas</th>
                                <th>Foto</th>
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
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className={`col-12 ${isMobileDevice() ? '' : 'col-md-8'}`}>
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

        {/* Upload Photos Modal yang diperbarui */}
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
                    <div className="btn-group w-100" role="group">
                      <button 
                        type="button" 
                        className={`btn ${!useCamera ? 'btn-primary' : 'btn-secondary'} flex-grow-1`}
                        onClick={() => setUseCamera(false)}
                      >
                        Upload File
                      </button>
                      <button 
                        type="button" 
                        className={`btn ${useCamera ? 'btn-primary' : 'btn-secondary'} flex-grow-1`}
                        onClick={toggleUploadMode}
                      >
                        Gunakan Kamera
                      </button>
                    </div>
                  </div>
                  
                  {useCamera ? (
                    <div className="webcam-container">
                      <div className="row">
                        <div className="col-12 col-md-6">
                          <div className="d-flex flex-column align-items-center">
                            <div className="webcam-wrapper" style={{ width: '100%', maxWidth: '400px' }}>
                              <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={videoConstraints}
                                style={{ 
                                  width: '100%', 
                                  borderRadius: '8px',
                                  transform: isMobileDevice() ? 'scaleX(-1)' : 'none'
                                }}
                                onUserMediaError={handleCameraError}
                              />
                            </div>
                            <button
                              className="btn btn-primary mt-2 w-100"
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
                        <div className="col-12 col-md-6 mt-3 mt-md-0">
                          <h6>Foto yang diambil: {capturedImages.length}</h6>
                          <div className="captured-images">
                            {capturedImages.length > 0 ? (
                              <div className="row">
                                {capturedImages.map((image, index) => (
                                  <div key={index} className="col-6 mb-2 position-relative">
                                    <img 
                                      src={image} 
                                      alt={`Captured ${index}`} 
                                      style={{ 
                                        width: '100%', 
                                        borderRadius: '4px',
                                        transform: isMobileDevice() ? 'scaleX(-1)' : 'none'
                                      }} 
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
                    <div className="form-group">
                      <label htmlFor="photos" className="d-block">
                        Pilih Foto Wajah (Maksimal 5 foto)
                      </label>
                      <input
                        type="file"
                        className="form-control-file w-100"
                        id="photos"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileChange}
                        multiple
                        capture="environment"
                      />
                      
                      {photosPreviews.length > 0 && (
                        <div className="mt-3">
                          <p>Preview ({photosPreviews.length} foto):</p>
                          <div className="row">
                            {photosPreviews.map((preview, index) => (
                              <div key={index} className="col-6 col-md-4 mb-2">
                                <img 
                                  src={preview} 
                                  alt={`Preview ${index+1}`} 
                                  style={{ 
                                    width: '100%', 
                                    height: '150px', 
                                    objectFit: 'cover', 
                                    borderRadius: '4px' 
                                  }} 
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
                    className="btn btn-secondary flex-grow-1" 
                    onClick={closeUploadDialog}
                  >
                    Batal
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary flex-grow-1"
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