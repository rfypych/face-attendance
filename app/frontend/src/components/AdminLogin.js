import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password) {
      setMessage({ text: 'Silakan masukkan password', type: 'danger' });
      return;
    }

    try {
      setIsLoading(true);
      setMessage({ text: 'Memeriksa autentikasi...', type: 'info' });

      const response = await axios.post('/api/admin/login', { password });

      if (response.data.status === 'success') {
        // Simpan token di localStorage
        localStorage.setItem('adminToken', response.data.token);
        setMessage({ text: 'Login berhasil, mengalihkan...', type: 'success' });
        
        // Redirect ke dashboard admin
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1000);
      } else {
        setMessage({ text: response.data.message || 'Terjadi kesalahan', type: 'danger' });
      }
    } catch (error) {
      console.error('Error login admin:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Password salah. Silakan coba lagi.';
      setMessage({ text: errorMessage, type: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h2 className="card-title">Admin Login</h2>
        
        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">Password Admin</label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Memproses...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin; 