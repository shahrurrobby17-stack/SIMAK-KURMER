import React, { useState } from 'react';
import { 
  Wrench, 
  AlertTriangle, 
  RefreshCw, 
  LogOut, 
  ShieldAlert, 
  CheckCircle2, 
  School, 
  User, 
  Clock,
  HelpCircle
} from 'lucide-react';
import { UserAccount, TeacherProfile } from '../types';

interface MaintenanceScreenProps {
  teacher?: TeacherProfile;
  currentUser?: UserAccount | null;
  onRefreshStatus?: () => void;
  onOpenLogin?: () => void;
  onLogout?: () => void;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({
  teacher,
  currentUser,
  onRefreshStatus,
  onOpenLogin,
  onLogout
}) => {
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const handleCheckNow = () => {
    setIsChecking(true);
    if (onRefreshStatus) {
      onRefreshStatus();
    }
    setTimeout(() => {
      setIsChecking(false);
    }, 1000);
  };

  const displayName = currentUser?.name || teacher?.name || 'Pengguna';
  const displaySchool = currentUser?.schoolName || teacher?.schoolName || 'SIMAK';
  const displayEmail = currentUser?.email || 'Akses Akun Terkunci';

  return (
    <div className="min-h-screen bg-[#164e63] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Decorative Lighting */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Maintenance Card */}
      <div className="max-w-xl w-full bg-slate-800/90 backdrop-blur-md rounded-none border border-amber-500/30 p-6 sm:p-8 shadow-2xl relative z-10 text-center space-y-6">
        
        {/* Animated Icon Badge */}
        <div className="relative inline-block">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-none bg-amber-500/20 border-2 border-amber-400/50 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10 animate-pulse">
            <Wrench className="w-10 h-10 sm:w-12 sm:h-12 text-amber-300" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-rose-600 text-white p-1.5 rounded-full border-2 border-slate-800 shadow-md">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        {/* Header Text */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-black uppercase tracking-wider mb-2 border border-rose-500/40">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>STATUS AKUN: BELUM AKTIF</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Akun Anda Belum Aktif
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Mohon maaf, akses dashboard dan data sistem akademik untuk akun <strong className="text-amber-300">{displayName}</strong> saat ini berstatus <strong className="text-rose-400 font-black">BELUM AKTIF</strong>.
          </p>
        </div>

        {/* User Account Info Box */}
        <div className="bg-[#164e63]/80 rounded-none p-4 border border-slate-700/80 text-left space-y-2.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1 flex justify-between items-center">
            <span>Detail Akun Terdampak</span>
            <span className="text-rose-300 bg-rose-500/20 px-2.5 py-0.5 rounded font-black border border-rose-500/30 text-[10px] animate-pulse">
              STATUS: BELUM AKTIF
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <User className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="truncate">
                <div className="text-[10px] text-slate-500">Nama Guru</div>
                <div className="font-semibold text-white truncate">{displayName}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-slate-300">
              <School className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="truncate">
                <div className="text-[10px] text-slate-500">Sekolah / Instansi</div>
                <div className="font-semibold text-white truncate">{displaySchool}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-slate-300 sm:col-span-2">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="truncate">
                <div className="text-[10px] text-slate-500">Email Akun</div>
                <div className="font-mono text-slate-300 truncate">{displayEmail}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Belum Aktif Keterangan Notice Box */}
        <div className="bg-rose-950/80 border-2 border-rose-500/60 rounded-none p-3.5 text-left flex items-start space-x-3 text-xs text-rose-100 shadow-md">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-black text-rose-300 text-xs uppercase tracking-wide">
              KETERANGAN: AKUN BELUM AKTIF
            </div>
            <p className="leading-relaxed text-[11px] text-rose-100/90 font-medium">
              Akun ini belum diaktifkan oleh Administrator Sekolah. Silakan hubungi Administrator untuk mengubah status akun Anda menjadi <strong>Aktif</strong> agar dapat mengakses seluruh fitur pada Halaman Dashboard.
            </p>
          </div>
        </div>

        {/* Automatic Realtime Info Alert */}
        <div className="bg-cyan-950/60 border border-cyan-800/80 rounded-none p-3 text-left flex items-start space-x-2 text-xs text-cyan-200">
          <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="leading-snug text-[11px]">
            <strong>Sinkronisasi Realtime:</strong> Sesaat setelah Administrator mengaktifkan kembali akun Anda, halaman ini akan langsung terbuka otomatis secara realtime.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleCheckNow}
            disabled={isChecking}
            className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-none font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Memeriksa Realtime Data...' : 'Cek Status Sekarang'}</span>
          </button>

          {onOpenLogin ? (
            <button
              type="button"
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-none font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-600"
            >
              <LogOut className="w-4 h-4 text-slate-300" />
              <span>Login Akun Admin / Lain</span>
            </button>
          ) : onLogout ? (
            <button
              type="button"
              onClick={onLogout}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-none font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-600"
            >
              <LogOut className="w-4 h-4 text-slate-300" />
              <span>Ganti Akun</span>
            </button>
          ) : null}
        </div>

      </div>

      {/* Footer Branding */}
      <div className="mt-6 text-center text-slate-500 text-[11px]">
        SIMAK Merdeka System Maintenance Mode • Versi 3.7.0
      </div>
    </div>
  );
};
