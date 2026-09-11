import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  Zap, 
  BookOpen, 
  Calendar, 
  Award, 
  Bot, 
  Cloud, 
  ShieldCheck, 
  ArrowRight,
  Star,
  Layers,
  ChevronRight
} from 'lucide-react';

interface NewFeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNeverShowAgain?: (neverShow: boolean) => void;
}

export interface FeatureItem {
  id: string;
  title: string;
  category: 'Akademik' | 'AI & Cloud' | 'Penilaian' | 'Sistem';
  badge: string;
  icon: React.ElementType;
  description: string;
  highlights: string[];
  isHot?: boolean;
}

const FEATURE_LIST: FeatureItem[] = [
  {
    id: 'ai-assistant',
    title: 'Asisten AI Gemini SIMAK Guru',
    category: 'AI & Cloud',
    badge: 'AI Cerdas',
    icon: Bot,
    isHot: true,
    description: 'Integrasi AI Generatif untuk membantu bapak/ibu guru menyusun administrasi pembelajaran lebih cepat dan efisien.',
    highlights: [
      'Pembuatan Modul Ajar & RPP Kurikulum Merdeka otomatis',
      'Generator Soal Ujian (Pilihan Ganda & Uraian) beserta Kunci Jawaban',
      'Penyusun Rubrik Penilaian Praktik & Analisis Deskripsi Capaian'
    ]
  },
  {
    id: 'realtime-sync',
    title: 'Sinkronisasi Cloud & Firestore Realtime',
    category: 'AI & Cloud',
    badge: 'Realtime Cloud',
    icon: Cloud,
    isHot: true,
    description: 'Seluruh data absensi, jurnal mengajar, dan nilai siswa langsung tersimpan ke Vercel secara otomatis tanpa takut kehilangan data.',
    highlights: [
      'Otomatis terhubung ke Cloud Database terenkripsi',
      'Multi-perangkat: dapat diakses dari Laptop, Tablet, maupun HP',
      'Sistem backup dan pemulihan data lokal saat offline'
    ]
  },
  {
    id: 'journal-attendance',
    title: 'Jurnal KBM & Presensi Siswa Terintegrasi',
    category: 'Akademik',
    badge: 'Presensi KBM',
    icon: BookOpen,
    description: 'Modul pencatatan KBM harian lengkap dengan ringkasan materi, catatan perilaku, dan presensi Hadir/Izin/Sakit/Alpha.',
    highlights: [
      'Rekap otomatis persentase kehadiran per kelas',
      'Modul Presensi Ekstrakurikuler terpisah',
      'Statistik grafik tingkat kehadiran bulanan'
    ]
  },
  {
    id: 'grade-management',
    title: 'E-Rapor & Pengolahan Nilai Otomatis',
    category: 'Penilaian',
    badge: 'Cetak Rapor',
    icon: Award,
    description: 'Pengolahan nilai formatif (TP/LM), sumatif tengah semester (STS), dan akhir semester (SAS) dengan pembobotan fleksibel.',
    highlights: [
      'Perhitungan otomatis Nilai Akhir (NA) dan Predikat',
      'Generator Deskripsi Capaian Kompetensi otomatis',
      'Cetak / Ekspor Rapor Kenaikan Kelas siap cetak PDF'
    ]
  },
  {
    id: 'teaching-schedule',
    title: 'Jadwal Mengajar & Beban Jam Kerja',
    category: 'Akademik',
    badge: 'Jadwal KBM',
    icon: Calendar,
    description: 'Manajemen jadwal mengajar mingguan per kelas dan per mata pelajaran dengan tampilan kartu waktu yang interaktif.',
    highlights: [
      'Penataan jadwal per jam pelajaran (JP)',
      'Notifikasi kelas mengajar aktif harian',
      'Ringkasan total beban jam mengajar per minggu'
    ]
  },
  {
    id: 'user-security',
    title: 'Keamanan Akun Email & Profil Pengajar',
    category: 'Sistem',
    badge: 'Proteksi',
    icon: ShieldCheck,
    description: 'Peningkatan proteksi akses dengan autentikasi email terverifikasi dan pengelolaan data diri guru pengampu.',
    highlights: [
      'Sistem Login Email & Sesi Aman',
      'Opsi Verifikasi Lengkap Data NIP/NPSN Sekolah',
      'Penyimpanan profil fleksibel dan responsif'
    ]
  }
];

export const NewFeaturesModal: React.FC<NewFeaturesModalProps> = ({
  isOpen,
  onClose,
  onNeverShowAgain
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);

  if (!isOpen) return null;

  const categories = ['Semua', 'AI & Cloud', 'Akademik', 'Penilaian', 'Sistem'];

  const filteredFeatures = selectedCategory === 'Semua' 
    ? FEATURE_LIST 
    : FEATURE_LIST.filter(f => f.category === selectedCategory);

  const handleClose = () => {
    if (onNeverShowAgain) {
      onNeverShowAgain(dontShowAgain);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#164e63]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn select-none">
      <div className="bg-white rounded-none max-w-3xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden select-text flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-[#002f54] via-[#164e63] to-[#003d6d] text-white p-5 sm:p-6 relative shrink-0">
          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-none transition-all cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-400/20 rounded-none border border-amber-300/30 text-amber-300 shadow-inner">
              <Sparkles className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-none uppercase tracking-wider">
                  Update Terbaru Versi 3.7.0
                </span>
                <span className="text-xs text-cyan-200 font-medium hidden sm:inline">SIMAK Guru System</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                Informasi Fitur & Pembaruan Sistem
              </h2>
              <p className="text-xs text-cyan-100/90 mt-0.5 max-w-xl">
                Nikmati berbagai fitur canggih terbaru yang dirancang untuk mempermudah tugas mengajar dan administrasi guru.
              </p>
            </div>
          </div>

          {/* Filter Tabs inside Header */}
          <div className="flex items-center gap-1.5 mt-5 overflow-x-auto no-scrollbar pb-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-none text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filteredFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={feature.id}
                  className="bg-white rounded-none p-4 border border-slate-200 shadow-2xs hover:shadow-md hover:border-cyan-300 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-cyan-50 text-[#164e63] rounded-none border border-cyan-100 group-hover:bg-[#164e63] group-hover:text-amber-300 transition-colors shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-none border border-cyan-100 inline-block">
                            {feature.badge}
                          </span>
                          <h3 className="text-xs sm:text-sm font-extrabold text-[#164e63] mt-0.5">
                            {feature.title}
                          </h3>
                        </div>
                      </div>
                      {feature.isHot && (
                        <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-none uppercase tracking-wider shrink-0 flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5 fill-current" /> Baru
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      {feature.highlights.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Info Box */}
          <div className="p-3.5 bg-cyan-50/80 border border-cyan-200 rounded-none flex items-start gap-3 text-xs text-cyan-900">
            <Layers className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-cyan-950">Informasi Penggunaan & Bantuan</p>
              <p className="text-[11px] text-cyan-800 leading-relaxed mt-0.5">
                Setiap menu di sidebar SIMAK dilengkapi petunjuk penggunaan langsung. Anda dapat melihat kembali informasi fitur ini kapan saja melalui tombol <span className="font-bold">"Fitur Baru"</span> di header bagian atas.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer hover:text-[#164e63]">
            <input 
              type="checkbox" 
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded-none text-cyan-600 focus:ring-cyan-500 border-slate-300 cursor-pointer"
            />
            <span>Jangan tampilkan pop-up ini lagi secara otomatis</span>
          </label>

          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#164e63] hover:bg-[#003d6d] text-white font-bold text-xs rounded-none shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Pahami & Mulai Gunakan</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>
        </div>

      </div>
    </div>
  );
};
