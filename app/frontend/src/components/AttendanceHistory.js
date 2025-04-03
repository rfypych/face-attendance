import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AttendanceHistory = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/attendance/history');
        if (response.data.status === 'success') {
          setHistory(response.data.data);
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

  // Format tanggal untuk tampilan
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="card">
      <h2 className="card-title">Riwayat Absensi</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {isLoading ? (
        <p>Memuat data riwayat...</p>
      ) : (
        <>
          {history.length === 0 ? (
            <p>Belum ada riwayat absensi</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Nama</th>
                    <th>Kelas</th>
                    <th>Waktu Absensi</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.name}</td>
                      <td>{item.class}</td>
                      <td>{formatDate(item.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AttendanceHistory; 