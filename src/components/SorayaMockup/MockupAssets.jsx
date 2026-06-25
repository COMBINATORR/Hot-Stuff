import React from 'react';

export const SorayaWaveSvg = ({ color }) => (
  <svg viewBox="0 0 200 320" className="w-full h-full max-h-[300px] drop-shadow-lg">
    <circle cx="100" cy="160" r="100" fill={color} opacity="0.04" />
    {/* Main shaft curve */}
    <path
      d="M100 270 C130 270, 135 220, 132 170 C128 110, 120 70, 118 45 C116 35, 122 30, 122 25 C122 20, 114 20, 108 35 C100 50, 96 90, 96 150 C96 170, 92 180, 88 185 C80 192, 68 185, 62 195 C56 205, 65 215, 76 210 C83 207, 90 215, 90 230 C90 255, 85 270, 100 270 Z"
      fill={color}
    />
    {/* Metallic inner ring */}
    <ellipse cx="108" cy="225" rx="14" ry="24" fill="none" stroke="#D4AF37" strokeWidth="5" />
    <ellipse cx="108" cy="225" rx="11" ry="21" fill="none" stroke="#F3E5AB" strokeWidth="1" />

    {/* Soft highlights for 3D depth */}
    <path d="M125 100 C128 130, 126 160, 122 190" fill="none" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.4" strokeLinecap="round" />
    <path d="M72 201 C74 203, 76 201, 78 198" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
    <circle cx="108" cy="225" r="4" fill="#D4AF37" />
  </svg>
);

export const OperationAllgasmSvg = () => (
  <svg viewBox="0 0 160 160" className="w-full h-full object-cover">
    <rect width="100%" height="100%" fill="#784B3E" />
    <circle cx="80" cy="80" r="50" fill="#000000" opacity="0.2" />
    <path d="M50 110 C65 110, 68 90, 66 70 C64 40, 60 20, 50 25 C40 30, 42 50, 42 70 C42 90, 38 110, 50 110 Z" fill="#2E1B18" opacity="0.9" />
    <rect x="75" y="75" width="22" height="35" rx="2" fill="#EAE0D5" />
    <path d="M86 65 Q89 71, 86 75 Q83 71, 86 65" fill="#D4AF37" />
    <rect x="105" y="85" width="16" height="25" rx="1" fill="#1A0F0D" />
    <rect x="110" y="80" width="6" height="5" fill="#C5A880" />
    <path d="M108 110 L118 110 L115 85 L108 85 Z" fill="#1A0F0D" opacity="0.9" />
  </svg>
);

export const SorayaExperienceSvg = () => (
  <svg viewBox="0 0 160 160" className="w-full h-full object-cover">
    <rect width="100%" height="100%" fill="#2A4B7C" />
    <circle cx="80" cy="80" r="50" fill="#000000" opacity="0.2" />
    <path d="M50 110 C65 110, 68 90, 66 70 C64 40, 60 20, 50 25 C40 30, 42 50, 42 70 C42 90, 38 110, 50 110 Z" fill="#0E1E38" opacity="0.9" />
    <path d="M75 110 Q95 105, 105 80 Q115 55, 130 50" fill="none" stroke="#8EA4D2" strokeWidth="8" strokeLinecap="round" strokeDasharray="1 15" />
    <ellipse cx="115" cy="105" rx="14" ry="10" fill="#0E1E38" />
    <ellipse cx="115" cy="98" rx="12" ry="4" fill="#8EA4D2" />
  </svg>
);
