import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AttendanceHistory = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/attendance/history');
        if (response.data.status === 'success') {
          setHistory(response.data.data);
          setFilteredHistory(response.data.data);
        } else {
          setError('Gagal memuat data riwayat absensi');
        }
      } catch (error) {
        console.error('Error fetching attendance history:', error);
        setError(error.response?.data?.detail || 'Terjadi kesalahan saat memuat data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Efek untuk filter data
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredHistory(history);
    } else {
      const filtered = history.filter(
        item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.class.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredHistory(filtered);
    }
  }, [searchTerm, history]);

  // Format tanggal untuk tampilan
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="card">
      <h2 className="card-title">
        <span role="img" aria-label="history" style={{ marginRight: '10px' }}>📊</span>
        Riwayat Absensi
      </h2>
      
      {error && (
        <div className="alert alert-danger">
          <span role="img" aria-label="error" style={{ marginRight: '10px' }}>⚠️</span>
          {error}
        </div>
      )}
      
      {!isLoading && (
        <div className="form-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <span role="img" aria-label="search" style={{ fontSize: '1.2rem' }}>🔍</span>
            <input
              type="text"
              className="form-control"
              placeholder="Cari berdasarkan nama atau kelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '30px 0' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
          <p>Memuat data riwayat...</p>
        </div>
      ) : (
        <>
          {filteredHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📭</div>
              <p>{searchTerm ? 'Tidak ada hasil yang cocok dengan pencarian Anda' : 'Belum ada riwayat absensi'}</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                <p>Total: <strong>{filteredHistory.length}</strong> kehadiran</p>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '50px', textAlign: 'center' }}>No.</th>
                      <th>Nama</th>
                      <th>Kelas</th>
                      <th>Waktu Absensi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((item, index) => (
                      <tr key={item.id}>
                        <td style={{ textAlign: 'center' }}>{index + 1}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span role="img" aria-label="person" style={{ fontSize: '1.2rem' }}>👤</span>
                            {item.name}
                          </div>
                        </td>
                        <td>{item.class}</td>
                        <td>{formatDate(item.timestamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AttendanceHistory; 