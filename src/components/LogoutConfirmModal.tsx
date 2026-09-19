import React from 'react';
import { LogOut, AlertTriangle, X } from 'lucide-react';

interface LogoutConfirmModalProps {
  userName?: string;
  userEmail?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  userName,
  userEmail,
  onConfirm,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#164e63]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-hidden animate-fadeIn select-none">
      <div className="bg-white rounded-none max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-auto select-text">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-none border border-rose-100 shadow-xs">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Konfirmasi Keluar Akun</h3>
              <p className="text-xs text-slate-500 mt-0.5">Sistem Informasi Manajemen Akademia (SIMAK)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-none cursor-pointer transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-none text-amber-900 flex items-start gap-2.5 font-medium">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Apakah Anda yakin ingin keluar dari sistem?</p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Sesi login Anda akan diakhiri. Anda perlu memasukkan kembali akun email untuk masuk ke SIMAK Guru.
              </p>
            </div>
          </div>

          {userName && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-none flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Akun Aktif Saat Ini</span>
                <span className="font-bold text-slate-800 text-xs block truncate">{userName}</span>
                {userEmail && <span className="text-[11px] text-slate-500 block truncate">{userEmail}</span>}
              </div>
              <span className="px-2 py-1 bg-cyan-100 text-[#164e63] text-[10px] font-bold rounded-none border border-cyan-200 shrink-0">
                Aktif
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 font-bold hover:bg-slate-100 rounded-none cursor-pointer transition-colors text-xs"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold rounded-none shadow-md text-xs flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
          >
            <LogOut className="w-4 h-4 text-white" />
            <span className="text-white font-bold">Ya, Keluar Akun</span>
          </button>
        </div>
      </div>
    </div>
  );
};
