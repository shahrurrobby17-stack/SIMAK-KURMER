import React, { useState } from 'react';
import { 
  UserCheck, 
  X, 
  Sparkles, 
  Settings, 
  CheckCircle2, 
  Info,
  ShieldCheck,
  FileSpreadsheet,
  Award
} from 'lucide-react';
import { TeacherProfile, UserAccount } from '../types';

interface ProfilePromptModalProps {
  teacher?: TeacherProfile;
  currentUser: UserAccount | null;
  onClose: () => void;
  onOpenSettings?: () => void;
}

export const ProfilePromptModal: React.FC<ProfilePromptModalProps> = ({
  teacher,
  currentUser,
  onClose,
}) => {
  const teacherName = teacher?.name || currentUser?.name || 'Bapak/Ibu Guru';
  const schoolName = teacher?.schoolName || currentUser?.schoolName || 'Nama Instansi';

  const [dontShowAgain, setDontShowAgain] = useState<boolean>(() => {
    return localStorage.getItem('simak_dont_show_profile_prompt') === 'true';
  });

  const handleToggleDontShow = (checked: boolean) => {
    setDontShowAgain(checked);
    if (checked) {
      localStorage.setItem('simak_dont_show_profile_prompt', 'true');
    } else {
      localStorage.removeItem('simak_dont_show_profile_prompt');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#164e63]/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-4 overflow-hidden animate-fadeIn select-none">
      <div className="bg-white rounded-none max-w-lg w-full p-5 md:p-6 shadow-2xl border border-slate-200 space-y-4 my-auto select-text">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-50 text-[#164e63] rounded-none border border-cyan-100 shadow-xs">
              <UserCheck className="w-5 h-5 text-cyan-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm md:text-base font-bold text-slate-800">Informasi Kelengkapan Data Diri</h3>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Berhasil Login
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pemberitahuan Sistem SIMAK Guru untuk <span className="font-bold text-slate-700">{teacherName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-none cursor-pointer transition-colors"
            title="Tutup Informasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Banner */}
        <div className="p-3 bg-gradient-to-r from-cyan-50 to-indigo-50/60 border border-cyan-200/80 rounded-none text-xs text-slate-700 space-y-1">
          <div className="flex items-center gap-2 text-cyan-900 font-bold text-xs">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Selamat Datang di SIMAK Guru!</span>
          </div>
          <p className="leading-snug text-slate-600 text-[11px]">
            Sistem telah mendeteksi akun aktif Anda. Sebelum mengelola penilaian dan jurnal mengajar, pastikan data profil Anda sudah sesuai untuk keabsahan laporan resmi.
          </p>
        </div>

        {/* Data Checklist Items */}
        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-600" />
            <span>Data Yang Perlu Diperiksa Dalam Sistem:</span>
          </h4>

          <div className="grid grid-cols-1 gap-1.5">
            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-none flex items-start gap-2.5 hover:bg-white hover:border-cyan-200 transition-all">
              <div className="p-1.5 bg-cyan-100 text-cyan-700 rounded-none shrink-0 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <h5 className="font-bold text-slate-800 text-xs">1. Identitas & NIP Resmi Guru</h5>
                <p className="text-slate-500 text-[10px] mt-0.5 leading-tight">
                  NIP, Gelar, dan Jabatan fungsional untuk pengesahan otomatis pada cetak Rapor & Jurnal Mengajar.
                </p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-none flex items-start gap-2.5 hover:bg-white hover:border-cyan-200 transition-all">
              <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-none shrink-0 mt-0.5">
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </div>
              <div>
                <h5 className="font-bold text-slate-800 text-xs">2. Satuan Pendidikan & Wali Kelas</h5>
                <p className="text-slate-500 text-[10px] mt-0.5 leading-tight">
                  Memastikan nama instansi (<span className="font-semibold text-slate-700">{schoolName}</span>) & NPSN terhubung dengan kelas.
                </p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-none flex items-start gap-2.5 hover:bg-white hover:border-cyan-200 transition-all">
              <div className="p-1.5 bg-amber-100 text-amber-700 rounded-none shrink-0 mt-0.5">
                <Award className="w-3.5 h-3.5" />
              </div>
              <div>
                <h5 className="font-bold text-slate-800 text-xs">3. Pejabat Pengesah (Kepala Sekolah)</h5>
                <p className="text-slate-500 text-[10px] mt-0.5 leading-tight">
                  Nama & NIP Kepala Sekolah untuk lembar pengesahan nilai siswa.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info tip */}
        <div className="p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-none text-[10px] text-amber-900 flex items-center gap-2 font-medium">
          <Settings className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Atur atau perbarui data diri Anda kapan saja melalui menu <b>Pengaturan</b> pada sidebar.</span>
        </div>

        {/* Action Buttons & Checkbox */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 font-medium hover:text-slate-800 transition-colors">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => handleToggleDontShow(e.target.checked)}
              className="w-4 h-4 text-[#164e63] rounded-none border-slate-300 focus:ring-cyan-500 cursor-pointer accent-[#003366]"
            />
            <span className="text-[11px]">Saya telah membaca, jangan tampilkan lagi</span>
          </label>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-[#164e63] hover:bg-[#003d6d] text-white font-bold rounded-none shadow-md text-xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.01]"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>OK</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

