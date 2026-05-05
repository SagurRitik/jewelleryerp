import React, { useState, useEffect } from 'react';
import './AuthScreen.css';

// Reusable animated dots component
const LoadingDots = () => (
  <div className="loading-dots">
    <div className="dot"></div>
    <div className="dot"></div>
    <div className="dot"></div>
  </div>
);

export default function AuthScreen() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Automatically reset the view 4 seconds after "logout" is triggered
  useEffect(() => {
    let timer;
    if (isLoggingOut) {
      timer = setTimeout(() => {
        setIsLoggingOut(false);
      }, 4000);
    }
    return () => clearTimeout(timer); // Cleanup on unmount
  }, [isLoggingOut]);

  const handleLogoutClick = () => {
    setIsLoggingOut(true);
  };

  return (
    <div className="auth-container">
      
      {/* Welcome Screen */}
      <div 
        className={`screen clickable ${isLoggingOut ? 'hidden' : ''}`} 
        onClick={handleLogoutClick}
      >
        <div className="logo-container">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
          </svg>
        </div>
        
        <h1 className="welcome-title">WELCOME</h1>
        
        <div className="subtitle">
          <span>to</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
          </svg>
        </div>
        
        <h2 className="brand-title">NAZARA</h2>
        <div className="brand-sub">DIAMONDS</div>
        
        <LoadingDots />
        
        <p style={{ fontSize: '0.7rem', color: '#a98ca9', marginTop: '40px' }}>
          (Click anywhere to simulate logout)
        </p>
      </div>

      {/* Logout Screen */}
      <div className={`screen ${!isLoggingOut ? 'hidden' : ''}`}>
        <div className="logout-icon">
          <svg viewBox="0 0 24 24">
            <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 012 2v2h-2V4H5v16h9v-2h2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2h9z"/>
          </svg>
        </div>
        
        <h1 className="logout-text">Logging Out</h1>
        <div className="wait-text">Please wait...</div>
        
        <LoadingDots />
      </div>

    </div>
  );
}