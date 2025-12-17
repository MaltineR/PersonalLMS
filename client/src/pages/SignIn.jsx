import React, { useState, useContext } from 'react';
import '../index.css';
import { BASE_URL } from '../utils/vars';
import axios from 'axios';
import { AuthContext } from '../hooks/AuthHOC';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate(); 
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.password) errors.password = 'Password is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });

      if (response.data?.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user); 

       
        if (response.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(response.data?.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        const statusCode = err.response.status;
        const errorMessage = err.response.data?.message;
        if (statusCode === 400) {
          if (errorMessage?.includes('email')) setFieldErrors(prev => ({ ...prev, email: errorMessage }));
          else if (errorMessage?.includes('password')) setFieldErrors(prev => ({ ...prev, password: errorMessage }));
          else setError(errorMessage || 'Invalid input');
        } else if (statusCode === 401) setError('Invalid email or password. Please try again.');
        else if (statusCode === 404) setError('No account found with this email. Please sign up first.');
        else setError(errorMessage || 'Login failed. Please try again.');
      } else if (err.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOauth = () => {
    window.location.href = `${BASE_URL}/api/v1/auth/google`;
  };

  const handleSignupClick = () => {
    navigate('/signup'); 
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--primary-background)', padding: '20px', textAlign:'center' }}>
      <div style={{ border: '1px solid #000', borderRadius: '10px', padding: '30px', width: '100%', maxWidth: '520px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ color: 'var(--primary)', fontSize: '2.5rem', marginBottom: '0' }}>Sign In</h1>
        <p style={{ color: '#666', marginBottom: '5px' }}>Welcome Back!</p>

        {error && (
          <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem', backgroundColor: '#ffebee', padding: '10px', borderRadius: '5px', width: '100%', maxWidth: '300px' }}>
            {error}
          </div>
        )}

        <button onClick={handleOauth} disabled={isLoading} style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '25px', cursor: isLoading ? 'not-allowed' : 'pointer', width: '100%', maxWidth: '300px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isLoading ? 0.7 : 1 }}>
          <img src="https://www.google.com/favicon.ico" alt="Google" width="20" height="20" style={{ marginRight: '10px' }} />
          Sign In with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', width: '100%', maxWidth: '300px', justifyContent: 'center' }}>
          <hr style={{ flexGrow: 1, borderColor: '#ccc' }} />
          <span style={{ margin: '0 1rem', color: '#666' }}>OR</span>
          <hr style={{ flexGrow: 1, borderColor: '#ccc' }} />
        </div>

        <div style={{ width: '100%', maxWidth: '300px', marginBottom: '1rem' }}>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            autoComplete="email"
            style={{ width: '100%', padding: '10px', border: fieldErrors.email ? '1px solid red' : '1px solid #ccc', borderRadius: '25px', fontFamily: 'var(--manrope)' }}
          />
          {fieldErrors.email && <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '5px', marginLeft: '10px' }}>{fieldErrors.email}</div>}
        </div>

        <div style={{ width: '100%', maxWidth: '300px', marginBottom: '1rem' }}>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Password"
            autoComplete="current-password"
            style={{ width: '100%', padding: '10px', border: fieldErrors.password ? '1px solid red' : '1px solid #ccc', borderRadius: '25px', fontFamily: 'var(--manrope)' }}
          />
          {fieldErrors.password && <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '5px', marginLeft: '10px' }}>{fieldErrors.password}</div>}
        </div>

        <div style={{ width: '100%', maxWidth: '300px', textAlign: 'right', marginBottom: '1rem' }}>
          <span style={{ color: 'var(--primary)', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => alert('Forgot password feature coming soon!')}>
            Forgot Password?
          </span>
        </div>

        <button onClick={handleSubmit} disabled={isLoading} style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '25px', cursor: isLoading ? 'not-allowed' : 'pointer', width: '100%', maxWidth: '300px', textAlign: 'center', opacity: isLoading ? 0.7 : 1 }}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>

        <p style={{ marginTop: '1rem', color: '#666', textAlign: 'center' }}>
          Not a user?{' '}
          <span style={{ color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer' }} onClick={handleSignupClick}>
            Signup
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
