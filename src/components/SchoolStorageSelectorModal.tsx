import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Database, 
  Search, 
  Plus, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  School,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { RegisteredSchool, Student } from '../types';

interface SchoolStorageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSchoolName: string;
  onSelectSchool: (school: RegisteredSchool) => void;
  schools: RegisteredSchool[];
  onRegisterSchool: (newSchool: Partial<RegisteredSchool> & { name: string }) => Promise<void> | void;
  currentStudents?: Student[];
}

export const SchoolStorageSelectorModal: React.FC<SchoolStorageSelectorModalProps> = ({
  isOpen,
  onClose,
  activeSchoolName,
  onSelectSchool,
  schools,
  onRegisterSchool,
  currentStudents = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newNpsn, setNewNpsn] = useState('');
  const [newPrincipal, setNewPrincipal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.npsn && s.npsn.includes(searchTerm)) ||
    (s.id && s.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateNewSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim()) return;

    setIsSubmitting(true);
    try {
      await onRegisterSchool({
        name: newSchoolName.trim(),
        npsn: newNpsn.trim() || undefined,
        principalName: newPrincipal.trim() || undefined
      });
      setSuccessToast(`Penyimpanan untuk "${newSchoolName.trim()}" berhasil dibuat & aktif!`);
      setTimeout(() => {
        setSuccessToast(null);
        setIsRegistering(false);
        setNewSchoolName('');
        setNewNpsn('');
        setNewPrincipal('');
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white border border-slate-200 shadow-2xl rounded-none overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#164e63] to-[#0e7490] px-5 py-4 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/10 border border-white/20 flex items-center justify-center rounded-none shadow-inner">
                <Database className="w-5 h-5 text-cyan-200" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-black tracking-tight text-white">
                    Penyimpanan Terpisah Masing-Masing Sekolah
                  </h3>
                  <span className="bg-cyan-500/30 text-cyan-100 text-[10px] font-bold px-2 py-0.5 border border-cyan-300/30">
                    Multi-Tenant Cloud
                  </span>
                </div>
                <p className="text-xs text-cyan-100/80">
                  Data setiap sekolah tersimpan aman pada partisi database terpisah di Firebase.
                </p>
              </div>
            </div>
            <button 
              type="button"
              onClick={onClose}
              className="text-white/70 hover:text-white p-1 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active School Banner */}
          <div className="bg-cyan-50/80 border-b border-cyan-100 px-5 py-3 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 min-w-0">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] shrink-0">
                Penyimpanan Aktif:
              </span>
              <span className="font-extrabold text-[#164e63] truncate">
                {activeSchoolName}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Tersambung ({currentStudents.length} Siswa)
            </span>
          </div>

          {/* Toast Notification */}
          {successToast && (
            <div className="bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
                <span>{successToast}</span>
              </div>
            </div>
          )}

          {/* Body Content */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            {!isRegistering ? (
              <>
                {/* Search & Action bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Cari nama sekolah, NPSN, atau ID..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 focus:bg-white focus:border-[#164e63] focus:outline-none transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRegistering(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#164e63] hover:bg-[#155e75] active:bg-[#0e7490] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Daftarkan Sekolah Baru</span>
                  </button>
                </div>

                {/* School List */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase px-1">
                    <span>Daftar Satuan Pendidikan ({filteredSchools.length} Sekolah)</span>
                    <span>Lokasi Partisi Storage</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {filteredSchools.map((s) => {
                      const isActive = s.name.toLowerCase() === activeSchoolName.toLowerCase();
                      return (
                        <div 
                          key={s.id}
                          className={`p-3 border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                            isActive 
                              ? 'bg-cyan-50/70 border-[#164e63] shadow-xs ring-1 ring-[#164e63]' 
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-start space-x-3 min-w-0">
                            <div className={`w-9 h-9 flex items-center justify-center shrink-0 border ${
                              isActive ? 'bg-[#164e63] text-white border-[#164e63]' : 'bg-slate-100 text-slate-600 border-slate-300'
                            }`}>
                              <School className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xs font-extrabold text-slate-800 tracking-tight">
                                  {s.name}
                                </h4>
                                {isActive && (
                                  <span className="bg-[#164e63] text-white text-[9px] font-bold px-1.5 py-0.2">
                                    SEDANG DIGUNAKAN
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                NPSN: <span className="font-semibold text-slate-700">{s.npsn || '20500000'}</span> • Kepsek: <span className="text-slate-700">{s.principalName || 'Kepala Sekolah'}</span>
                              </p>
                              <p className="text-[10px] font-mono text-cyan-800 mt-0.5 flex items-center gap-1">
                                <Database className="w-2.5 h-2.5 text-cyan-700" />
                                Path: /schools/{s.id}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            {isActive ? (
                              <div className="text-right">
                                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  Penyimpanan Aktif
                                </span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectSchool(s);
                                  onClose();
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-cyan-50 border border-cyan-800 text-[#164e63] hover:text-[#0e7490] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                              >
                                <span>Buka Penyimpanan</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {filteredSchools.length === 0 && (
                      <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 p-4">
                        <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-600">Tidak ada sekolah yang cocok</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Anda dapat mendaftarkan sekolah baru dengan mengklik tombol di bawah.
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsRegistering(true)}
                          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#164e63] text-white text-xs font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Daftarkan Sekarang</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* Registration Form for New School */
              <form onSubmit={handleCreateNewSchool} className="space-y-4">
                <div className="bg-sky-50 border border-sky-200 p-3.5 text-xs text-sky-900 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Partisi Database Otomatis:</span> Saat sekolah baru didaftarkan, sistem akan secara otomatis membuat ruang penyimpanan terisolasi di Cloud Firestore (<code className="font-mono text-cyan-900 bg-white/70 px-1">/schools/[id]</code>). Data siswa, nilai, presensi, dan jadwal sekolah ini tidak akan bercampur dengan sekolah lain.
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Satuan Pendidikan / Sekolah <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text"
                      required
                      value={newSchoolName}
                      onChange={(e) => setNewSchoolName(e.target.value)}
                      placeholder="Contoh: Sekolah A / SMA Negeri 5 Bandung / SMK Taruna"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 focus:border-[#164e63] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nomor Pokok Sekolah Nasional (NPSN)
                      </label>
                      <input 
                        type="text"
                        value={newNpsn}
                        onChange={(e) => setNewNpsn(e.target.value)}
                        placeholder="Contoh: 20519876 (Opsional)"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 focus:border-[#164e63] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Kepala Sekolah
                      </label>
                      <input 
                        type="text"
                        value={newPrincipal}
                        onChange={(e) => setNewPrincipal(e.target.value)}
                        placeholder="Contoh: Drs. H. Suryadi, M.Pd."
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 focus:border-[#164e63] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-300 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !newSchoolName.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#164e63] hover:bg-[#155e75] active:bg-[#0e7490] text-white text-xs font-bold disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Membuat Partisi...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Buat & Buka Penyimpanan Sekolah</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer Info */}
          <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Privasi & Keamanan: Masing-masing sekolah memiliki isolasi data 100%.</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-600 hover:text-slate-900 font-bold px-2 py-0.5"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
