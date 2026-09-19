import React, { useState, useMemo } from 'react';
import {
  Megaphone,
  Edit3,
  Sparkles,
  X,
  Save,
  Check,
  AlertCircle,
  Bell,
  Radio,
  Eye,
  EyeOff,
  Clock,
  ShieldCheck,
  RotateCcw,
  Plus,
  Trash2
} from 'lucide-react';
import { InfoAnnouncement, InfoAnnouncementItem, UserAccount, getAnnouncementItems } from '../types';
import { SaveSuccessModal } from './SaveSuccessModal';

interface InfoBannerCardProps {
  announcement: InfoAnnouncement;
  onUpdateAnnouncement: (updated: InfoAnnouncement) => void;
  isMasterUser: boolean;
  currentUser?: UserAccount | null;
  variant?: 'standalone' | 'compact';
}

export const InfoBannerCard: React.FC<InfoBannerCardProps> = ({
  announcement,
  onUpdateAnnouncement,
  isMasterUser,
  currentUser,
  variant = 'standalone'
}) => {
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [formItems, setFormItems] = useState<InfoAnnouncementItem[]>([]);
  const [formIsActive, setFormIsActive] = useState<boolean>(announcement.isActive ?? true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [saveSuccessModal, setSaveSuccessModal] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('Info Terkini berhasil diperbarui!');

  // Master auth state for login page editing
  const [masterVerified, setMasterVerified] = useState<boolean>(isMasterUser);
  const [masterEmailInput, setMasterEmailInput] = useState<string>('shahrurrobby17@gmail.com');
  const [masterPasswordInput, setMasterPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenEditModal = () => {
    const currentItems = getAnnouncementItems(announcement);
    if (currentItems.length > 0) {
      setFormItems(currentItems.map(i => ({ ...i })));
    } else {
      setFormItems([
        {
          id: 'ann-' + Date.now(),
          text: announcement.text || '',
          category: announcement.category || 'Informasi',
          isActive: true
        }
      ]);
    }
    setFormIsActive(announcement.isActive ?? true);
    setMasterVerified(isMasterUser);
    setMasterPasswordInput('');
    setAuthError(null);
    setShowEditModal(true);
  };

  const handleVerifyMaster = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanEmail = masterEmailInput.trim().toLowerCase();
    const cleanPass = masterPasswordInput.trim();

    if (
      (cleanEmail === 'shahrurrobby17@gmail.com' || cleanEmail.includes('master') || cleanEmail.includes('shahrur')) &&
      cleanPass === '12345678'
    ) {
      setMasterVerified(true);
      showToast('Otorisasi Akun Master Berhasil!');
    } else {
      setAuthError('Email atau Kata Sandi Akun Master tidak valid!');
    }
  };

  const handleAddItem = () => {
    setFormItems(prev => [
      ...prev,
      {
        id: 'ann-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        text: '',
        category: 'Informasi',
        isActive: true
      }
    ]);
  };

  const handleUpdateItem = (index: number, field: keyof InfoAnnouncementItem, val: any) => {
    setFormItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleDeleteItem = (index: number) => {
    setFormItems(prev => {
      if (prev.length <= 1) {
        return [{ id: 'ann-' + Date.now(), text: '', category: 'Informasi', isActive: true }];
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = formItems.filter(i => i.text.trim().length > 0);
    if (validItems.length === 0) {
      showToast('Teks pengumuman tidak boleh kosong! Isi minimal 1 pengumuman.');
      return;
    }

    const firstValid = validItems.find(i => i.isActive) || validItems[0];

    const updated: InfoAnnouncement = {
      text: firstValid?.text || '',
      category: firstValid?.category || 'Informasi',
      isActive: formIsActive,
      items: validItems,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser?.name || 'Master Data Account (Shahrur Robby)'
    };

    onUpdateAnnouncement(updated);
    setShowEditModal(false);
    setSaveSuccessMsg('Daftar tulisan berjalan Info Terkini berhasil diperbarui dan tersinkronisasi!');
    setSaveSuccessModal(true);
  };

  // Preset templates for quick selection by Master (appends to list)
  const applyTemplate = (templateText: string, cat: 'Informasi' | 'Penting' | 'Pengumuman' | 'Fitur Baru') => {
    setFormItems(prev => {
      const emptyIdx = prev.findIndex(item => !item.text.trim());
      if (emptyIdx !== -1) {
        const next = [...prev];
        next[emptyIdx] = { ...next[emptyIdx], text: templateText, category: cat, isActive: true };
        return next;
      }
      return [
        ...prev,
        {
          id: 'ann-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          text: templateText,
          category: cat,
          isActive: true
        }
      ];
    });
  };

  const allItems = getAnnouncementItems(announcement);
  const activeItems = allItems.filter(i => i.isActive && i.text && i.text.trim().length > 0);

  // Seamless duplication so that 50% translation produces a mathematically identical loop
  const seamlessItems = useMemo(() => {
    if (activeItems.length === 0) return [];
    let base = [...activeItems];
    while (base.length < 3) {
      base = [...base, ...activeItems];
    }
    return [...base, ...base];
  }, [activeItems]);

  const animationDurationSeconds = useMemo(() => {
    if (seamlessItems.length === 0) return 28;
    const totalChars = seamlessItems.reduce((acc, curr) => acc + (curr.text?.length || 0), 0);
    // Balanced, comfortable reading speed for running text:
    return Math.max(22, Math.min(100, Math.round(totalChars * 0.17)));
  }, [seamlessItems]);

  // If hidden and not master user, render nothing
  if (!announcement.isActive && !isMasterUser) {
    return null;
  }

  return (
    <div className="w-full py-1">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-white border border-emerald-200 shadow-2xl rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 animate-in fade-in zoom-in-90 slide-in-from-top-6 duration-300">
          <div className="w-11 h-11 rounded-full bg-emerald-500 ring-4 ring-emerald-100 text-white flex items-center justify-center shrink-0 shadow-md">
            <Check className="w-6 h-6 stroke-[3] animate-[spin_0.7s_ease-out_1] transition-transform" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span>Data Berhasil Disimpan!</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <p className="text-[11px] text-slate-600 font-semibold">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* COMPACT MODE FOR INSIDE METRIC/PERCENTAGE CARD */}
      {variant === 'compact' ? (
        !announcement.isActive || activeItems.length === 0 ? (
          isMasterUser ? (
            <div className="w-full bg-amber-500/20 border border-amber-300/40 rounded-lg px-2 py-1 text-amber-200 text-[10px] font-bold flex items-center justify-between gap-1.5">
              <span>Info disembunyikan (Master)</span>
              <button
                type="button"
                onClick={handleOpenEditModal}
                className="px-1.5 py-0.5 bg-amber-400 text-slate-900 rounded font-black text-[9px] cursor-pointer"
              >
                Kelola
              </button>
            </div>
          ) : null
        ) : (
          <div className="w-full bg-black/25 hover:bg-black/35 border border-white/20 rounded-xl px-2.5 py-1.5 text-white flex items-center gap-2 overflow-hidden relative transition-colors shadow-inner">
            {/* Badge Label: INFO */}
            <div className="flex items-center gap-1 shrink-0 border-r border-white/20 pr-1.5">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-white text-[#164e63] shadow-xs">
                <Radio className="w-2.5 h-2.5 shrink-0 text-cyan-600" />
                <span>INFO</span>
              </span>
            </div>

            {/* Running Marquee Text Area with edge fade mask */}
            <div 
              className="flex-1 overflow-hidden relative py-0.5 cursor-default group" 
              style={{
                maskImage: 'linear-gradient(to right, transparent 0%, black 10px, black calc(100% - 10px), transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10px, black calc(100% - 10px), transparent 100%)'
              }}
              title="Arahkan kursor untuk menghentikan sementara tulisan berjalan"
            >
              <div
                className="animate-marquee font-bold text-[11px] text-cyan-50 tracking-wide flex items-center whitespace-nowrap select-none"
                style={{
                  animationDuration: `${animationDurationSeconds}s`
                }}
              >
                {seamlessItems.map((item, idx) => (
                  <span key={`${item.id || 'ann'}-${idx}`} className="inline-flex items-center gap-1.5 shrink-0 pr-6">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider shrink-0 ${
                      item.category === 'Penting' ? 'bg-rose-500 text-white' :
                      item.category === 'Pengumuman' ? 'bg-amber-400 text-slate-950 font-black' :
                      item.category === 'Fitur Baru' ? 'bg-indigo-500 text-white' :
                      'bg-cyan-500/40 text-cyan-100'
                    }`}>
                      [{item.category || 'INFO'}]
                    </span>
                    <span className="text-white font-semibold whitespace-nowrap drop-shadow-xs">{item.text}</span>
                    <span className="ml-1.5 text-cyan-300 font-bold text-[10px] shrink-0">✦</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Edit Button for Master User */}
            {isMasterUser && (
              <button
                type="button"
                onClick={handleOpenEditModal}
                className="shrink-0 p-1 bg-white/15 hover:bg-white/30 text-white hover:text-amber-300 rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-0.5 border border-white/20 shadow-2xs"
                title="Kelola Pengumuman (Akun Master)"
              >
                <Edit3 className="w-3 h-3 text-amber-300" />
              </button>
            )}
          </div>
        )
      ) : (
        /* STANDALONE MODE */
        !announcement.isActive || activeItems.length === 0 ? (
          isMasterUser && (
            <div className="bg-amber-500/10 border border-amber-300/40 rounded-xl px-3 py-2 text-amber-900 text-xs font-bold flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Info Terkini sedang disembunyikan dari pengguna. (Master View)</span>
              </div>
              <button
                type="button"
                onClick={handleOpenEditModal}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg text-xs font-black shrink-0 transition-colors cursor-pointer shadow-xs"
              >
                Aktifkan &amp; Kelola
              </button>
            </div>
          )
        ) : (
          /* Active Running Text Banner Card with Rich Blue Theme */
          <div className="bg-gradient-to-r from-[#164e63] via-[#0f5370] to-[#155e75] border border-cyan-600/40 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-md text-white flex items-center gap-2.5 sm:gap-3.5 overflow-hidden relative">
            {/* Subtle background overlay effect */}
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-cyan-300/10 rounded-full blur-xl pointer-events-none" />

            {/* Badge Label: INFO TERKINI */}
            <div className="flex items-center gap-2 shrink-0 border-r border-white/20 pr-2.5 sm:pr-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider bg-white text-[#164e63] border border-white/80 shadow-xs">
                <Radio className="w-3.5 h-3.5 shrink-0 text-cyan-600" />
                <span>INFO TERKINI</span>
              </span>
            </div>

            {/* Running Marquee Text Area with subtle edge fade mask */}
            <div 
              className="flex-1 overflow-hidden relative py-0.5 cursor-default group" 
              style={{
                maskImage: 'linear-gradient(to right, transparent 0%, black 14px, black calc(100% - 14px), transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 14px, black calc(100% - 14px), transparent 100%)'
              }}
              title="Arahkan kursor untuk menghentikan sementara tulisan berjalan"
            >
              <div
                className="animate-marquee font-bold text-xs sm:text-sm text-cyan-50 tracking-wide flex items-center whitespace-nowrap select-none"
                style={{
                  animationDuration: `${animationDurationSeconds}s`
                }}
              >
                {seamlessItems.map((item, idx) => (
                  <span key={`${item.id || 'ann'}-${idx}`} className="inline-flex items-center gap-2.5 shrink-0 pr-8">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shrink-0 ${
                      item.category === 'Penting' ? 'bg-rose-500 text-white border border-rose-400/50 shadow-2xs' :
                      item.category === 'Pengumuman' ? 'bg-amber-400 text-slate-950 font-black border border-amber-300 shadow-2xs' :
                      item.category === 'Fitur Baru' ? 'bg-indigo-500 text-white border border-indigo-400/50 shadow-2xs' :
                      'bg-cyan-500/30 text-cyan-100 border border-cyan-300/30'
                    }`}>
                      [{item.category || 'INFORMASI'}]
                    </span>
                    <span className="text-white font-bold whitespace-nowrap drop-shadow-xs">{item.text}</span>
                    <span className="ml-2.5 text-cyan-300 font-black text-xs shrink-0">✦</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Edit Button for Master User */}
            {isMasterUser && (
              <button
                type="button"
                onClick={handleOpenEditModal}
                className="shrink-0 p-1.5 bg-white/15 hover:bg-white/25 text-white hover:text-amber-300 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 border border-white/25 shadow-xs"
                title="Kelola Pengumuman (Akun Master)"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline text-[10px] font-black uppercase">Edit</span>
              </button>
            )}
          </div>
        )
      )}

      {/* EDIT MODAL FOR MASTER ACCOUNT */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-amber-700 uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    <span>Otoritas Akun Master</span>
                  </div>
                  <h3 className="text-base font-black text-slate-800">Kelola Pengumuman Info Terkini</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!masterVerified ? (
              /* Master Verification Step */
              <form onSubmit={handleVerifyMaster} className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
                  <div className="font-bold mb-1 flex items-center gap-1.5 text-amber-800">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    Verifikasi Otoritas Akun Master
                  </div>
                  Kartu Info Terkini hanya dapat diubah oleh Akun Master Data. Harap masukkan kredensial Master Anda untuk melanjutkan.
                </div>

                {authError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold">
                    {authError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Akun Master *</label>
                  <input
                    type="email"
                    required
                    value={masterEmailInput}
                    onChange={(e) => setMasterEmailInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi Master *</label>
                  <input
                    type="password"
                    required
                    placeholder="Masukkan kata sandi master..."
                    value={masterPasswordInput}
                    onChange={(e) => setMasterPasswordInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-black text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
                  >
                    Verifikasi Akun Master
                  </button>
                </div>
              </form>
            ) : (
              /* Edit Announcements Form */
              <form onSubmit={handleSaveAnnouncement} className="space-y-4 flex-1 overflow-y-auto pr-1">
                {/* Global Status Banner Switch */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      Status Tampilan Running Text
                    </label>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Aktifkan atau sembunyikan seluruh kartu running text dari aplikasi.
                    </p>
                  </div>
                  <select
                    value={formIsActive ? 'aktif' : 'sembunyi'}
                    onChange={(e) => setFormIsActive(e.target.value === 'aktif')}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-600 cursor-pointer shrink-0"
                  >
                    <option value="aktif">Tampilkan (Aktif)</option>
                    <option value="sembunyi">Sembunyikan (Nonaktif)</option>
                  </select>
                </div>

                {/* Multiple Announcements List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-[#164e63]" />
                      <span>Daftar Pengumuman Running Text ({formItems.length})</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-[#164e63] rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Tambah Pengumuman Lagi</span>
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                    {formItems.map((item, index) => (
                      <div key={item.id || index} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 relative group">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-[#164e63] text-white rounded-full flex items-center justify-center text-[10px] font-black">
                              {index + 1}
                            </span>
                            <span className="text-xs font-extrabold text-slate-800">Pengumuman #{index + 1}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={item.isActive}
                                onChange={(e) => handleUpdateItem(index, 'isActive', e.target.checked)}
                                className="rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer w-4 h-4"
                              />
                              <span>Tampilkan</span>
                            </label>

                            {formItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(index)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Hapus pengumuman ini"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <textarea
                            rows={2}
                            required
                            value={item.text}
                            onChange={(e) => handleUpdateItem(index, 'text', e.target.value)}
                            placeholder={`Tulis isi pengumuman #${index + 1} di sini...`}
                            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 text-slate-800"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-600 shrink-0">Kategori:</span>
                          <select
                            value={item.category || 'Informasi'}
                            onChange={(e) => handleUpdateItem(index, 'category', e.target.value as any)}
                            className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-600 cursor-pointer"
                          >
                            <option value="Informasi">Informasi Umum (Biru)</option>
                            <option value="Penting">Penting (Merah)</option>
                            <option value="Pengumuman">Pengumuman (Kuning)</option>
                            <option value="Fitur Baru">Fitur Baru (Ungu)</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Preset Templates */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <label className="block text-[11px] font-bold text-slate-500">
                    Template Cepat (Klik untuk menambah pengumuman baru):
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyTemplate('Selamat Datang di SIMAK MERDEKA! Harap lengkapi jurnal harian dan presensi siswa tepat waktu setiap hari.', 'Informasi')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      + Selamat Datang
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTemplate('PERHATIAN: Pengisian nilai Rapor Semester Genap akan ditutup pada akhir minggu ini. Mohon periksa kelengkapan nilai.', 'Penting')}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      + Batas Pengisian Rapor
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTemplate('PENGUMUMAN: Pemeliharaan berkala sistem akan dilaksanakan malam ini pukul 23.00 WIB. Layanan tetap berjalan normal.', 'Pengumuman')}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      + Pemeliharaan Sistem
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTemplate('FITUR BARU: Modul Master Data Akun & Asisten AI Gemini kini telah diperbarui dengan kecepatan ekstra!', 'Fitur Baru')}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      + Fitur Baru Update
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#164e63] hover:bg-cyan-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Pengumuman ({formItems.length})</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Save Success Animated Modal */}
      <SaveSuccessModal
        isOpen={saveSuccessModal}
        onClose={() => setSaveSuccessModal(false)}
        title="Data Berhasil Disimpan"
        message={saveSuccessMsg || "Data telah berhasil disimpan dan tersinkronisasi."}
      />
    </div>
  );
};

