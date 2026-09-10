import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SaveSuccessModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  message?: string;
  autoCloseDelay?: number;
}

export const SaveSuccessModal: React.FC<SaveSuccessModalProps> = ({
  isOpen,
  onClose,
  title = "Data Berhasil Disimpan",
  message = "Data Anda telah berhasil disimpan dan tersinkronisasi.",
  autoCloseDelay = 2500
}) => {
  const [phase, setPhase] = useState<'saving' | 'success'>('saving');
  const [hasDataLockAlert, setHasDataLockAlert] = useState(false);
  const timer2Ref = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const checkLock = () => {
        const isLocked = Boolean(document.querySelector('.simpan-data-gagal-lock-alert'));
        setHasDataLockAlert(isLocked);
        if (isLocked && isOpen && onClose) {
          onClose();
        }
      };

      checkLock();
      const interval = setInterval(checkLock, 100);
      return () => clearInterval(interval);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && !hasDataLockAlert) {
      setPhase('saving');
      
      // Transition from spinning circle to checkmark after 700ms
      const timer1 = setTimeout(() => {
        setPhase('success');
      }, 700);

      // No auto close, wait for user click

      return () => {
        clearTimeout(timer1);
        if (timer2Ref.current) clearTimeout(timer2Ref.current);
      };
    }
  }, [isOpen, autoCloseDelay, onClose, hasDataLockAlert]);

  if (hasDataLockAlert) return null;

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
            <div className={`absolute top-0 left-0 right-0 h-1.5 transition-colors duration-300 ${phase === 'saving' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
            
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
                      className="w-16 h-16 border-4 border-slate-200 border-t-[#004b87] border-r-[#004b87] rounded-full"
                    />
                    {/* Inner Pulse Circle */}
                    <motion.div
                      animate={{ scale: [0.85, 1.05, 0.85] }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                      className="absolute w-8 h-8 bg-blue-100 rounded-full"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="success-checkmark"
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30"
                  >
                    <svg className="w-10 h-10 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
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
              className="w-full flex flex-col items-center"
            >
              <h3 className="text-base font-bold text-slate-800">
                {phase === 'saving' ? 'Memproses Penyimpanan...' : title}
              </h3>
              
              {/* OKE Button when success */}
              {phase === 'success' && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={handleManualClose}
                  className="mt-6 px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-none shadow-sm transition-colors cursor-pointer w-full"
                >
                  OKE
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
