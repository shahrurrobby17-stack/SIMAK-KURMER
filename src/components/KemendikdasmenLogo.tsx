import React from 'react';
import { TutWuriHandayaniLogo } from './TutWuriHandayaniLogo';

interface KemendikdasmenLogoProps {
  className?: string;
  showText?: boolean;
  textColorTheme?: 'light' | 'dark'; // light background or dark background
}

export const KemendikdasmenLogo: React.FC<KemendikdasmenLogoProps> = ({ 
  className = "h-12", 
  showText = true,
  textColorTheme = 'dark' // dark theme means text on dark background or light text
}) => {
  return (
    <div className={`inline-flex items-center space-x-3 select-none ${className}`}>
      {/* Tut Wuri Handayani Emblem */}
      <div className="shrink-0 flex items-center justify-center">
        <TutWuriHandayaniLogo className="w-10 h-10 md:w-11 md:h-11 drop-shadow-sm" />
      </div>

      {/* Kemendikdasmen Stylized Text */}
      {showText && (
        <div className="flex items-center font-sans tracking-tight text-2xl md:text-3xl font-black leading-none">
          <span className="text-[#0083ca] font-extrabold">Kemen</span>
          <span className="text-[#f59e0b] font-extrabold">dikdasmen</span>
        </div>
      )}
    </div>
  );
};
