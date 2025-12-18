import React, { useState } from 'react';
import '../index.css'
import  {BASE_URL}  from '../utils/vars';
import axios from 'axios';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    location: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  
  const validatePassword = (password) => {
    return password.length >= 8;
  };

  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      errors.password = 'Password must be at least 8 characters long';
    }
    
    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/api/v1/auth/register`, {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        location: formData.location.trim()
      });

      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        window.location.href = '/signin';
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      if (err.response) {
        
        const statusCode = err.response.status;
        const errorMessage = err.response.data?.message || err.response.data?.error;
        
        if (statusCode === 400) {
          
          if (errorMessage?.includes('email')) {
            setFieldErrors(prev => ({ ...prev, email: errorMessage }));
          } else if (errorMessage?.includes('password')) {
            setFieldErrors(prev => ({ ...prev, password: errorMessage }));
          } else {
            setError(errorMessage || 'Invalid input. Please check your information.');
          }
        } else if (statusCode === 409 || statusCode === 404) {
          
          setError('An account with this email already exists. Please try signing in instead.');
        } else if (statusCode === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(errorMessage || 'Registration failed. Please try again.');
        }
      } else if (err.request) {
        
        setError('Network error. Please check your connection and try again.');
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
  
  const handleLoginClick = () => {
    window.location.href = '/signin';
  };

  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',  
        backgroundColor: 'var(--primary-background)', 
        padding: '60px 20px' 
      }}
    >
      <div 
        style={{ 
          border: '1px solid #000000', 
          borderRadius: '10px', 
          padding: '30px', 
          width: '100%', 
          maxWidth: '520px', 
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          margin: '5px 0'  
        }}
      >
        <h1 
          style={{ 
            color: 'var(--primary)', 
            fontSize: '2.5rem', 
            marginBottom: '0', 
          }}
        >
          Sign Up
        </h1>

        
        <p 
          style={{ 
            color: '#666', 
            marginBottom: '5px',  
          }}
        >
          BookWorm Discover your next great read
        </p>

        
        {error && (
          <div 
            style={{ 
              color: 'red', 
              marginBottom: '1rem', 
              textAlign: 'center',
              fontSize: '0.9rem',
              backgroundColor: '#ffebee',
              padding: '10px',
              borderRadius: '5px',
              width: '100%',
              maxWidth: '300px'
            }}
          >
            {error}
          </div>
        )}

        {/* Google Sign-Up button */}
        <button 
          onClick={handleOauth}
          disabled={isLoading}
          style={{ 
            backgroundColor: 'var(--primary)', 
            color: 'white', 
            padding: '10px 20px', 
            border: 'none', 
            borderRadius: '25px', 
            cursor: isLoading ? 'not-allowed' : 'pointer', 
            width: '100%', 
            maxWidth: '300px', 
            marginBottom: '1rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          <img 
            src="https://www.google.com/favicon.ico" 
            alt="Google" 
            width="20" 
            height="20" 
            style={{ marginRight: '10px' }} 
          />
          Sign Up with google
        </button>

       
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            margin: '1rem 0', 
            width: '100%', 
            maxWidth: '300px', 
            justifyContent: 'center' 
          }}
        >
          <hr style={{ flexGrow: 1, borderColor: '#ccc' }} />
          <span style={{ margin: '0 1rem', color: '#666' }}>OR</span>
          <hr style={{ flexGrow: 1, borderColor: '#ccc' }} />
        </div>

        {/* Name input field */}
        <div style={{ width: '100%', maxWidth: '300px', marginBottom: '1rem' }}>
          <input 
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: fieldErrors.name ? '1px solid red' : '1px solid #ccc', 
              borderRadius: '25px', 
              fontFamily: 'var(--manrope)', 
              textAlign: 'left' 
            }}
            type="text" 
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your name"
          />
          {fieldErrors.name && (
            <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '5px', marginLeft: '10px' }}>
              {fieldErrors.name}
            </div>
          )}
        </div>

        {/* Email input field */}
        <div style={{ width: '100%', maxWidth: '300px', marginBottom: '1rem' }}>
          <input 
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: fieldErrors.email ? '1px solid red' : '1px solid #ccc', 
              borderRadius: '25px', 
              fontFamily: 'var(--manrope)', 
              textAlign: 'left' 
            }}
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
          />
          {fieldErrors.email && (
            <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '5px', marginLeft: '10px' }}>
              {fieldErrors.email}
            </div>
          )}
        </div>

        {/* Password input field */}
        <div style={{ width: '100%', maxWidth: '300px', marginBottom: '1rem' }}>
          <input 
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: fieldErrors.password ? '1px solid red' : '1px solid #ccc', 
              borderRadius: '25px', 
              fontFamily: 'var(--manrope)', 
              textAlign: 'left' 
            }}
            type="password" 
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Password (min 8 characters)"
          />
          {fieldErrors.password && (
            <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '5px', marginLeft: '10px' }}>
              {fieldErrors.password}
            </div>
          )}
        </div>

        {/* Location input field */}
        <div style={{ width: '100%', maxWidth: '300px', marginBottom: '1rem' }}>
          <input 
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: fieldErrors.location ? '1px solid red' : '1px solid #ccc', 
              borderRadius: '25px', 
              fontFamily: 'var(--manrope)', 
              textAlign: 'left' 
            }}
            type="text" 
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Location"
          />
          {fieldErrors.location && (
            <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '5px', marginLeft: '10px' }}>
              {fieldErrors.location}
            </div>
          )}
        </div>

        {/* Continue with email button */}
        <button 
          onClick={handleSubmit}
          disabled={isLoading}
          style={{ 
            backgroundColor: 'var(--primary)', 
            color: 'white', 
            padding: '10px 20px', 
            border: 'none', 
            borderRadius: '25px', 
            cursor: isLoading ? 'not-allowed' : 'pointer', 
            width: '100%', 
            maxWidth: '300px', 
            textAlign: 'center',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Signing up...' : 'Sign Up'}
        </button>
        
        {/* Login link */}
        <p 
          style={{ 
            marginTop: '1rem', 
            color: '#666', 
            textAlign: 'center' 
          }}
        >
          Already a user?{' '}
          <span 
            style={{ 
              color: 'var(--primary)', 
              textDecoration: 'underline', 
              cursor: 'pointer' 
            }}
            onClick={handleLoginClick}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;