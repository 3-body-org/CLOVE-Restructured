import React from 'react';
import detectiveBg from 'assets/images/noir/illustration-detective-background.svg';

const DetectiveBackground = () => {
  return (
    <img
      src={detectiveBg}
      alt="Detective Noir Background"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        zIndex: -1,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
      draggable={false}
    />
  );
};

export default DetectiveBackground; 