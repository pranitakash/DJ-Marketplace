import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import api from '../services/api';
import '../styles/Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join the premium DJ ecosystem</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <div className="input-wrapper">
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>I am a...</label>
            <div className="role-cards">
              <div 
                className={`role-card ${formData.role === 'user' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'user' })}
              >
                <div className="role-icon">🎵</div>
                <span>Music Lover</span>
              </div>
              <div 
                className={`role-card ${formData.role === 'dj' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'dj' })}
              >
                <div className="role-icon">🎧</div>
                <span>DJ Professional</span>
              </div>
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? 
          <Link to="/login" className="auth-link">Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
