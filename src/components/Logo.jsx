import React from 'react';

// Inline SVG FeedForward Logo
export default function Logo({ size = 32, className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon Mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="FeedForward logo icon"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
        </defs>
        {/* Circle background */}
        <circle cx="20" cy="20" r="20" fill="url(#logoGrad)" />
        {/* Fork / leaf path */}
        <path
          d="M14 10 C14 10 12 14 12 17 C12 20 14 21 16 21 L16 30"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M14 10 L14 17 M18 10 L18 17"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Leaf / forward arrow */}
        <path
          d="M22 20 C22 20 24 16 28 16 C28 16 28 22 24 24 L22 20Z"
          fill="white"
          opacity="0.9"
        />
        <path
          d="M22 20 L25 28"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Word mark */}
      <div className="leading-none">
        <span className="font-bold text-lg tracking-tight gradient-text">
          Feed
        </span>
        <span className="font-bold text-lg tracking-tight text-slate-700">
          Forward
        </span>
      </div>
    </div>
  );
}
