import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  BookOpen, 
  FileText, 
  Mail, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  Download, 
  ShieldCheck, 
  Search,
  ChevronRight,
  ExternalLink,
  Info
} from 'lucide-react';

export type HelpModalType = 'guide' | 'terms' | null;

interface FooterHelpModalsProps {
  activeModal: HelpModalType;
  onClose: () => void;
}

export const FooterHelpModals: React.FC<FooterHelpModalsProps> = ({ activeModal, onClose }) => {
  if (!activeModal) return null;

  const [currentTab, setCurrentTab] = useState<'guide' | 'terms'>(activeModal === 'guide' || activeModal === 'terms' ? activeModal : 'guide');
  const [guideSearch, setGuideSearch] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSent, setTicketSent] = useState(false);

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage.trim()) return;
    setTicketSent(true);
    setTimeout(() => {
      setTicketSubject('');
      setTicketMessage('');
      setTicketSent(false);
    }, 4000);
  };

  const guideTopics = [
    {
      id: 'presensi',
      title: 'Cara Mengisi Presensi & Jurnal Harian',
      category: 'Presensi',
      content: 'Buka menu Presensi, pilih Kelas dan Tanggal, lalu klik status kehadiran (Hadir, Izin, Sakit, Alpa) pada tiap siswa. Jangan lupa mengisikan Jurnal Mengajar dan klik "Simpan Presensi".'
    },
    {
      id: 'nilai',
      title: 'Penginputan Nilai TP & Format Penilaian Merdeka',
      category: 'Penilaian',
      content: 'Di menu Input Nilai, pilih Mata Pelajaran dan Tujuan Pembelajaran (TP). Anda dapat memasukkan nilai formatif dan sumatif. Nilai yang di bawah KKM/KKTP akan ditandai warna merah secara otomatis.'
    },
    {
      id: 'rapor',
      title: 'Mencetak Rapor Kurikulum Merdeka (PDF)',
      category: 'Rapor',
      content: 'Pilih menu Rekap & Rapor, klik tombol "Cetak Rapor" pada siswa yang diinginkan. Rapor akan memuat Capaian Pembelajaran, Deskripsi Otomatis, Nilai Ekstrakurikuler, dan Catatan Wali Kelas.'
    },
    {
      id: 'ekstra',
      title: 'Presensi & Nilai Kegiatan Ekstrakurikuler',
      category: 'Ekstrakurikuler',
      content: 'Menu Ekstrakurikuler digunakan untuk mencatat kehadiran latihan rutin pramuka, paskibra, atau ekskul lainnya beserta nilai predikat (A/B/C/D) yang akan masuk ke Rapor.'
    },
    {
      id: 'impor',
      title: 'Impor & Ekspor Data Siswa via Format Excel',
      category: 'Pengaturan',
      content: 'Gunakan fitur Impor Data Excel di menu Pengaturan / Data Siswa untuk mengunggah file .xlsx atau .csv siswa dalam sekali klik tanpa perlu menginput satu per satu.'
    }
  ];

  const filteredTopics = guideTopics.filter(t => 
    t.title.toLowerCase().includes(guideSearch.toLowerCase()) || 
    t.content.toLowerCase().includes(guideSearch.toLowerCase()) ||
    t.category.toLowerCase().includes(guideSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#164e63]/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-none border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header Modal */}
        <div className="bg-[#164e63] text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
            <div className="p-1.5 sm:p-2 bg-white/10 rounded-xl sm:rounded-none shrink-0">
              {currentTab === 'guide' && <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />}
              {currentTab === 'terms' && <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold truncate">Pusat Informasi & Dokumen SIMAK</h2>
              <p className="text-[10px] sm:text-xs text-cyan-200 truncate">Panduan Resmi Penggunaan & Ketentuan</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg sm:rounded-none text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer shrink-0"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="bg-slate-100 border-b border-slate-200 px-3 sm:px-6 py-2 sm:py-2.5 flex items-center gap-1.5 sm:gap-2 shrink-0 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setCurrentTab('guide')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-none text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              currentTab === 'guide' 
                ? 'bg-[#164e63] text-white shadow-xs' 
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Panduan Pengguna</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('terms')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-none text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              currentTab === 'terms' 
                ? 'bg-[#164e63] text-white shadow-xs' 
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Syarat & Ketentuan</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-xs text-slate-700 space-y-5 sm:space-y-6">
          
          {/* TAB: PANDUAN PENGGUNA */}
          {currentTab === 'guide' && (
            <div className="space-y-5">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input 
                  type="text"
                  value={guideSearch}
                  onChange={(e) => setGuideSearch(e.target.value)}
                  placeholder="Cari topik panduan (misal: Rapor, Presensi, KKM, Nilai...)"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-none text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Modul Langkah Utama */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center">
                <div className="p-3 bg-cyan-50 border border-cyan-100 rounded-none">
                  <div className="w-6 h-6 bg-[#164e63] text-white rounded-full font-bold flex items-center justify-center text-xs mx-auto mb-1">1</div>
                  <div className="font-bold text-slate-800 text-[11px]">Pengaturan Kelas</div>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-none">
                  <div className="w-6 h-6 bg-emerald-700 text-white rounded-full font-bold flex items-center justify-center text-xs mx-auto mb-1">2</div>
                  <div className="font-bold text-slate-800 text-[11px]">Presensi Harian</div>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-none">
                  <div className="w-6 h-6 bg-amber-600 text-white rounded-full font-bold flex items-center justify-center text-xs mx-auto mb-1">3</div>
                  <div className="font-bold text-slate-800 text-[11px]">Penilaian TP & KKM</div>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-100 rounded-none">
                  <div className="w-6 h-6 bg-purple-700 text-white rounded-full font-bold flex items-center justify-center text-xs mx-auto mb-1">4</div>
                  <div className="font-bold text-slate-800 text-[11px]">Cetak Rapor</div>
                </div>
              </div>

              {/* Guide Topics Accordion / Cards */}
              <div className="space-y-3">
                {filteredTopics.map((topic) => (
                  <div key={topic.id} className="p-4 bg-slate-50 border border-slate-200 rounded-none space-y-1 hover:border-cyan-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-[#164e63]" />
                        {topic.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-none bg-cyan-100 text-cyan-800 font-bold text-[10px]">
                        {topic.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 pl-6 leading-relaxed">
                      {topic.content}
                    </p>
                  </div>
                ))}

                {filteredTopics.length === 0 && (
                  <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-none">
                    Topik panduan tidak ditemukan. Coba kata kunci lain.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SYARAT & KETENTUAN */}
          {currentTab === 'terms' && (
            <div className="space-y-4 leading-relaxed">
              <div className="p-4 bg-cyan-50 border border-cyan-100 rounded-none flex items-center gap-3">
                <Info className="w-5 h-5 text-[#164e63] shrink-0" />
                <div>
                  <h3 className="font-bold text-slate-800 text-xs">Ketentuan Penggunaan Aplikasi SIMAK Merdeka Versi 3.7.0</h3>
                  <p className="text-[11px] text-slate-600">Terakhir Diperbarui: Juli 2026 • Kurikulum Merdeka KSP</p>
                </div>
              </div>

              <div className="space-y-3 text-[11px] text-slate-700">
                <section className="p-3.5 bg-slate-50 border border-slate-200 rounded-none space-y-1">
                  <h4 className="font-bold text-slate-800 text-xs">1. Hak Cipta & Lisensi</h4>
                  <p>Aplikasi SIMAK Merdeka dikembangkan untuk membantu pendidik dan satuan pendidikan dalam pengelolaan administrasi pembelajaran, presensi, jurnal, dan pencetakan rapor Kurikulum Merdeka secara mandiri dan gratis.</p>
                </section>

                <section className="p-3.5 bg-slate-50 border border-slate-200 rounded-none space-y-1">
                  <h4 className="font-bold text-slate-800 text-xs">2. Keamanan & Privasi Data</h4>
                  <p>Seluruh data guru, daftar siswa, nilai, presensi, dan rekapitulasi disimpan secara lokal pada browser pengguna (Offline-First LocalStorage). Aplikasi ini tidak mengirimkan data identitas siswa ke server pihak ketiga tanpa izin pengguna.</p>
                </section>

                <section className="p-3.5 bg-slate-50 border border-slate-200 rounded-none space-y-1">
                  <h4 className="font-bold text-slate-800 text-xs">3. Integritas Penilaian & Tanggung Jawab Pengajar</h4>
                  <p>Penginputan nilai formatif, sumatif, capaian pembelajaran (TP), dan KKM/KKTP sepenuhnya menjadi tanggung jawab wali kelas dan guru mata pelajaran yang bersangkutan sesuai dengan kaidah Kurikulum Merdeka.</p>
                </section>

                <section className="p-3.5 bg-slate-50 border border-slate-200 rounded-none space-y-1">
                  <h4 className="font-bold text-slate-800 text-xs">4. Pemulihan & Backup Data</h4>
                  <p>Pengguna disarankan secara berkala melakukan ekspor rekapitulasi nilai atau backup data melalui menu ekspor yang tersedia guna mencegah kehilangan data akibat pembersihan cache browser.</p>
                </section>
              </div>
            </div>
          )}

        </div>

        {/* Footer Action */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>SIMAK Merdeka • Sistem Informasi Manajemen Akademik Merdeka</span>
          <button 
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-none transition-colors cursor-pointer"
          >
            Tutup Window
          </button>
        </div>

      </div>
    </div>
  );
};
