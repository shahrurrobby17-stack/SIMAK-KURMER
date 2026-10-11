import React from 'react';

interface MobileDeviceRestrictedProps {
  currentWidth?: number;
  currentHeight?: number;
  onRefresh?: () => void;
}

export const MobileDeviceRestricted: React.FC<MobileDeviceRestrictedProps> = () => {
  return (
    <div className="fixed inset-0 z-[999999] min-h-screen w-full bg-white flex items-center justify-center p-6 sm:p-8 text-center select-none">
      <div className="max-w-md mx-auto flex flex-col items-center justify-center space-y-3">
        <div className="text-xs sm:text-sm font-bold text-slate-700 tracking-widest uppercase">
          PEMBERITAHUAN AKSES PERANGKAT
        </div>
        <div className="text-base sm:text-lg font-black text-slate-900 uppercase leading-relaxed tracking-tight">
          SISTEM INI TIDAK BISA DIAKSES MELALUI HP/SMARTPHONE, DAN HANYA BISA DIAKSES MELALUI LABTOP/PC
        </div>
      </div>
    </div>
  );
};
