import React from 'react';

/**
 * Detects whether the current device is a mobile phone / smartphone,
 * including when the user enables "Situs Desktop" (Desktop Site / Request Desktop Website)
 * in Chrome Android, Safari iOS, or other mobile browsers.
 */
export const checkIsMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  // 1. Physical screen dimension check
  // All smartphones (in portrait or landscape, whether in standard or "Situs Desktop" mode)
  // have a physical screen width or height <= 550 CSS pixels (typically 360px - 430px).
  // In Chrome Android / iOS Safari with "Situs Desktop", window.innerWidth expands to 980px+,
  // but window.screen.width and window.screen.height remain the physical dimensions.
  // Laptops and desktop PCs NEVER have a physical screen dimension <= 550px.
  const screenW = window.screen?.width || 0;
  const screenH = window.screen?.height || 0;
  const availW = window.screen?.availWidth || screenW;
  const availH = window.screen?.availHeight || screenH;
  const minScreenDim = Math.min(screenW, screenH);
  const minAvailDim = Math.min(availW, availH);
  
  if (minScreenDim > 0 && minScreenDim <= 550) return true;
  if (minAvailDim > 0 && minAvailDim <= 550) return true;

  // 2. Viewport width check (Standard mobile view < 768px)
  if (window.innerWidth < 768) return true;

  // 3. User agent direct check for smartphones
  const ua = navigator.userAgent || '';
  const isDirectMobileUA = /Android|iPhone|iPod|Windows Phone|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);
  if (isDirectMobileUA && minScreenDim <= 600) return true;
  if (isDirectMobileUA && window.innerWidth < 1024) return true;

  // 4. Smartphone in "Situs Desktop" (Desktop site) mode detection:
  // When a user toggles "Situs Desktop" on Chrome Android or Safari iOS:
  // - Viewport widens (e.g. 980px or 1024px)
  // - UA may pretend to be Linux (Android) or Macintosh (iOS)
  // - However, touch points > 0, pointer is coarse, and screen dimension is phone-sized (<= 600px)
  const hasTouch = (typeof navigator !== 'undefined' && ((navigator.maxTouchPoints || 0) > 0 || (navigator as any).msMaxTouchPoints > 0)) || 'ontouchstart' in window;
  const isCoarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
  const hasWindowOrientation = typeof window.orientation !== 'undefined';

  if (hasTouch && minScreenDim <= 600) return true;
  if (isCoarse && minScreenDim <= 600) return true;
  if (hasWindowOrientation && minScreenDim <= 600) return true;

  // iOS "Request Desktop Website":
  // UA says Macintosh / MacIntel, but hasTouch is true and minScreenDim <= 600
  if ((ua.includes('Macintosh') || navigator.platform === 'MacIntel') && hasTouch && minScreenDim <= 600) {
    return true;
  }

  // Android "Situs Desktop":
  // UA has Android or Linux, hasTouch is true, and minScreenDim <= 600
  if ((ua.includes('Android') || ua.includes('Linux')) && hasTouch && minScreenDim <= 600) {
    return true;
  }

  // Navigator userAgentData mobile flag if present
  if (!!(navigator as any)?.userAgentData?.mobile) {
    return true;
  }

  return false;
};

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
          SISTEM INI TIDAK BISA DIAKSES MELALUI HP/SMARTPHONE, DAN HANYA BISA DIAKSES MELALUI LAPTOP/PC
        </div>
      </div>
    </div>
  );
};
