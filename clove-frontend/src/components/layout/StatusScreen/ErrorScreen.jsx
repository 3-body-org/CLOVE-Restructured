import React from "react";

export default function ErrorScreen({ message = "Something went wrong." }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#181926',
      color: '#ef4444',
      fontSize: '18px',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 'bold', fontSize: '22px', marginBottom: '10px' }}>Error</div>
        <div>{message}</div>
      </div>
    </div>
  );
} 