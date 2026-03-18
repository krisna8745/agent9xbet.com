import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';

const BACKEND_URL = "https://api.9xbet24.com"; // ⚠️ Replace with your actual backend URL

const LoginPage = ({ setIsLoggedIn }) => {
  const [agentNo, setAgentNo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${BACKEND_URL}/api/agent/login`, {
        AgentNo: agentNo,
        password: password,
        role:"agent"
      });

      // Save full agent data in localStorage
      localStorage.setItem("agent", JSON.stringify(response.data.agent));
      
      // Check if it's first-time login
      if (response.data.isFirstLogin) {
        // Redirect to change password page
        navigate('/change-password');
      } else {
        // Normal login flow
        setIsLoggedIn(true);
        navigate('/'); // Navigate to dashboard or home
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <h2>9XBET</h2>
      </div>
      <div className="login-form">
      <h3>Agent Login</h3> 
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <div className="input-wrapper">
              <div className="input-icon">
                <span className="icon-text">A</span>
              </div>
              <input
                type="text"
                placeholder="Agent ID"
                value={agentNo}
                onChange={(e) => setAgentNo(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <div className="input-wrapper">
              <div className="input-icon">
                <span className="icon-lock">🔒</span>
              </div>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="eye-icon-button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="eye-icon">
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </span>
                </button>
              </div>
            </div>
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
