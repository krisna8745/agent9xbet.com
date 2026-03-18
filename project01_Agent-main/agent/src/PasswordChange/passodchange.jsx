import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './passwordChange.css';

const BACKEND_URL = "https://api.9xbet24.com"; // ⚠️ Replace with your actual backend URL

const PasswordChange = ({ setIsLoggedIn }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear messages when user starts typing
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password');
      return;
    }

    try {
      setLoading(true);
      const agent = JSON.parse(localStorage.getItem('agent'));
      
      if (!agent || !agent.id) {
        setError('Agent not found. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const response = await axios.post(
        `${BACKEND_URL}/api/agent/change-password`,
        {
          agentId: agent.id,
          oldPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }
      );

      if (response.status === 200) {
        setSuccess('Password changed successfully! Redirecting...');
        
        // Update agent in localStorage with new isLogin status
        const updatedAgent = { ...agent, isLogin: true };
        localStorage.setItem('agent', JSON.stringify(updatedAgent));

        // Clear form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          if (setIsLoggedIn) {
            setIsLoggedIn(true);
          }
          navigate('/');
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      console.error('Change password error:', err);
      setError(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/login');
  };

  return (
    <div className="password-change">
      <div className="header">
        <div className="title">Change Password</div>
        <button className="back-button" onClick={handleBack}>Back</button>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Enter current password"
              disabled={loading}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password (min 6 characters)"
              disabled={loading}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              disabled={loading}
              required
            />
          </div>
          
          <div className="button-group">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={handleBack}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordChange;
