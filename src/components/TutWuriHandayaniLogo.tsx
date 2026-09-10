import React from 'react';

interface TutWuriHandayaniLogoProps {
  className?: string;
}

export const TutWuriHandayaniLogo: React.FC<TutWuriHandayaniLogoProps> = ({ className = "w-10 h-10" }) => {
  return (
    <img 
      src="/kemdikbud_logo.svg?v=2" 
      alt="Logo SIMAK Merdeka" 
      className={`object-contain drop-shadow-md ${className}`}
      referrerPolicy="no-referrer"
    />
  );
};



