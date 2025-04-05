import React from 'react';

const Logo = ({ width = 30, height = 30, className = '' }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Lingkaran luar */}
      <circle cx="60" cy="60" r="55" fill="currentColor" fillOpacity="0.2" />
      
      {/* Bentuk wajah */}
      <circle cx="60" cy="60" r="40" stroke="currentColor" strokeWidth="4" fill="none" />
      
      {/* Mata */}
      <circle cx="45" cy="50" r="5" fill="currentColor" />
      <circle cx="75" cy="50" r="5" fill="currentColor" />
      
      {/* Mulut */}
      <path
        d="M45 75 Q60 85 75 75"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
      
      {/* Garis scanning */}
      <line x1="30" y1="60" x2="90" y2="60" stroke="currentColor" strokeWidth="2" strokeDasharray="5,3" />
      
      {/* Tanda centang kecil */}
      <path
        d="M85 35 L95 45 L105 25"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Logo; 