import React from 'react';

interface TutWuriHandayaniLogoProps {
  className?: string;
}

export const TutWuriHandayaniLogo: React.FC<TutWuriHandayaniLogoProps> = ({ className = "w-10 h-10" }) => {
  return (
    <img 
      src="/kemdikbud_logo.png" 
      alt="Logo SIMAK Merdeka" 
      className={`object-contain drop-shadow-sm ${className}`}
      referrerPolicy="no-referrer"
    />
  );
};
