

// import React, { useState, useEffect } from 'react';
// import { BrowserRouter } from 'react-router-dom';
// import Dashboard from './components/Dashboard';
// import './App.css';
// import LoginPage from './Login/LoginPage';
// import { ProfileProvider } from './context/ProfileContext';
// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   // Check if user is logged in from localStorage
//   useEffect(() => {
//     const agent = localStorage.getItem("agent");
//     if (agent) {
//       setIsLoggedIn(true);
//     } else {
//       setIsLoggedIn(false);
//     }
//   }, []);

//   // Logout function to be passed to Dashboard
//   const handleLogout = () => {
//     localStorage.removeItem("agent");
//     setIsLoggedIn(false);
//   };

//   return (
//     <ProfileProvider>
//     <BrowserRouter>
//       {isLoggedIn ? (
//         <Dashboard handleLogout={handleLogout} />
//       ) : (
//         <LoginPage setIsLoggedIn={setIsLoggedIn} />
//       )}
//     </BrowserRouter>
//     </ProfileProvider>
//   );
// }

// export default App;



import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import './App.css';
import LoginPage from './Login/LoginPage';
import PasswordChange from './PasswordChange/passodchange';
import { ProfileProvider } from './context/ProfileContext';

// Protected Route Component
function ProtectedRoute({ children, isLoggedIn }) {
  const location = useLocation();
  
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in from localStorage
  useEffect(() => {
    const agent = localStorage.getItem("agent");
    if (agent) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
    setLoading(false);
  }, []);

  // Logout function to be passed to Dashboard
  const handleLogout = () => {
    localStorage.removeItem("agent");
    setIsLoggedIn(false);
  };

  // Show nothing while checking login status
  if (loading) {
    return null;
  }

  return (
    <ProfileProvider>
      <BrowserRouter>
        <Routes>
          {/* Login Route */}
          <Route 
            path="/login" 
            element={
              isLoggedIn ? (
                <Navigate to="/" replace />
              ) : (
                <LoginPage setIsLoggedIn={setIsLoggedIn} />
              )
            } 
          />
          
          {/* Change Password Route - accessible without full login */}
          <Route 
            path="/change-password" 
            element={<PasswordChange setIsLoggedIn={setIsLoggedIn} />} 
          />
          
          {/* Protected Dashboard Routes - Dashboard has its own nested routes */}
          <Route 
            path="/*" 
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Dashboard handleLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </ProfileProvider>
  );
}

export default App;

