import React, { useState } from 'react';
import { Music, AlertCircle } from 'lucide-react';

const AuthModal = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:8000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login Request (requires form data for OAuth2)
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.detail || 'Login failed');
        
        localStorage.setItem('token', data.access_token);
        onLoginSuccess(data.access_token);
        
      } else {
        // Register Request
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.detail || 'Registration failed');
        
        // Auto-login after register
        const loginForm = new URLSearchParams();
        loginForm.append('username', username);
        loginForm.append('password', password);
        
        const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: loginForm
        });
        const loginData = await loginRes.json();
        
        localStorage.setItem('token', loginData.access_token);
        onLoginSuccess(loginData.access_token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: '#1e1e1e',
        padding: '40px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          backgroundColor: '#1ed760', display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <Music size={32} color="black" />
        </div>
        
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>
          {isLogin ? 'Welcome back' : 'Join Resonance'}
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', textAlign: 'center' }}>
          {isLogin ? 'Log in to access your library and playlists.' : 'Create an account to save your favorite music.'}
        </p>

        {error && (
          <div style={{
            backgroundColor: 'rgba(231, 76, 60, 0.1)', border: '1px solid #e74c3c',
            color: '#e74c3c', padding: '12px', borderRadius: '8px', width: '100%',
            marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px'
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              width: '100%', padding: '14px', borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', outline: 'none', fontSize: '15px'
            }}
          />
          
          {!isLogin && (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%', padding: '14px', borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', outline: 'none', fontSize: '15px'
              }}
            />
          )}

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%', padding: '14px', borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', outline: 'none', fontSize: '15px'
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: '30px',
              backgroundColor: '#1ed760', color: '#000', border: 'none',
              fontWeight: '700', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '8px', transition: 'transform 0.1s ease', opacity: loading ? 0.7 : 1
            }}
            onMouseDown={(e) => !loading && (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => !loading && (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'scale(1)')}
          >
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <div style={{ marginTop: '32px', color: 'var(--text-muted)', fontSize: '14px' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ color: '#fff', fontWeight: '600', cursor: 'pointer' }}
          >
            {isLogin ? 'Sign up for free' : 'Log in'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
