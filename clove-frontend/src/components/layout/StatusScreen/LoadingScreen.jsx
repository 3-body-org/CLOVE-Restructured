import React from "react";

export default function LoadingScreen({ message = "Loading..." }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#181926', // subtle dark background
      color: '#cbd5e1', // soft neutral text
      fontSize: '18px',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            border: '4px solid #23233a',
            borderTop: '4px solid #a6aafb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto',
            background: 'transparent',
          }}></div>
        </div>
        <div>{message}</div>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 