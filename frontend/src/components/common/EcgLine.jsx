import React from 'react';

export default function EcgLine({ width = 220, height = 50, className = '' }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 220 50"
      className={`ecg mx-auto ${className}`}
    >
      <path d="M0 28 H60 L72 28 L82 6 L96 46 L108 18 L116 28 H220" />
    </svg>
  );
}
