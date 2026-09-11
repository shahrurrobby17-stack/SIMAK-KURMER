import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface RestrictedAccessModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  message?: string;
  autoCloseDelay?: number;
}

export const RestrictedAccessModal: React.FC<RestrictedAccessModalProps> = ({
  isOpen,
  onClose,
  title = "Akses Dibatasi",
  message = "Akun Anda saat ini BELUM AKTIF. Silakan hubungi Administrator untuk aktivasi akun.",
  autoCloseDelay = 3500
}) => {
  const [phase, setPhase] = useState<'saving' | 'failed'>('saving');
  const timer2Ref = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPhase('saving');
      // Transition from spinning circle to crossmark after 700ms
      const timer1 = setTimeout(() => {
        setPhase('failed');
      }, 700);

      // No auto close, wait for user click

      return () => {
        clearTimeout(timer1);
        if (timer2Ref.current) clearTimeout(timer2Ref.current);
      };
    }
  }, [isOpen, autoCloseDelay, onClose]);

  const handleManualClose = () => {
    if (timer2Ref.current) clearTimeout(timer2Ref.current);
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="bg-white border border-slate-200 rounded-none shadow-2xl p-6 sm:p-8 max-w-sm w-full flex flex-col items-center text-center space-y-4 relative overflow-hidden"
          >
            {/* Top Accent Line */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 transition-colors duration-300 ${phase === 'saving' ? 'bg-cyan-500' : 'bg-rose-500'}`} />
            
            {/* Animation Icon Container */}
            <div className="relative w-20 h-20 flex items-center justify-center my-2">
              <AnimatePresence mode="wait">
                {phase === 'saving' ? (
                  <motion.div
                    key="saving-spinner"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="relative flex items-center justify-center w-full h-full"
                  >
                    {/* Spinning Outer Ring */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.85, ease: "linear" }}
                      className="w-16 h-16 border-4 border-slate-200 border-t-[#164e63] border-r-[#164e63] rounded-full"
                    />
                    {/* Inner Pulse Circle */}
                    <motion.div
                      animate={{ scale: [0.85, 1.05, 0.85] }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                      className="absolute w-8 h-8 bg-cyan-100 rounded-full"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="failed-crossmark"
                    initial={{ scale: 0, rotate: 45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    className="w-16 h-16 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30"
                  >
                    <svg className="w-10 h-10 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Message Area */}
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-1.5 w-full flex flex-col items-center"
            >
              <h3 className="text-base font-bold text-slate-800">
                {phase === 'saving' ? 'Memverifikasi Akses...' : title}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                {phase === 'saving' ? 'Mohon tunggu sejenak, sedang memeriksa status akun Anda.' : message}
              </p>
              
              {/* Mengerti Button when failed */}
              {phase === 'failed' && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={handleManualClose}
                  className="mt-6 px-8 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold rounded-none shadow-sm transition-colors cursor-pointer w-full"
                >
                  MENGERTI
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
