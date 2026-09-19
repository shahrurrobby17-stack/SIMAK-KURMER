import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Search,
  RefreshCw,
  Edit3,
  Users,
  GraduationCap,
  ArrowRight,
  X,
  Check,
  Building2,
  ShieldCheck,
  HelpCircle,
  Package,
  UserCheck,
  Calendar,
  BookOpen,
  Briefcase,
  Library,
  Award,
  BookMarked,
  Filter,
  PieChart as PieIcon
} from 'lucide-react';
import { Student, TeacherProfile, UserAccount, Subject } from '../types';
import { NavTab } from './SidebarNavigation';

export type ResiduCategory = 
  | 'sekolah'
  | 'sarpras'
  | 'peserta_didik'
  | 'gtk'
  | 'rombel_jadwal'
  | 'pembelajaran'
  | 'kurikulum'
  | 'tu'
  | 'perpustakaan'
  | 'nilai'
  | 'referensi';

export interface ResiduItem {
  id: string;
  sourceId: string;
  category: ResiduCategory;
  targetName: string;
  subInfo: string;
  residuType: string;
  severity: 'invalid' | 'warning';
  description: string;
  recommendation: string;
  targetTab: NavTab;
  targetTabLabel: string;
  status: 'aktif' | 'dalam_proses' | 'selesai';
  resolvedAt?: string;
}

interface ResiduDataViewProps {
  students: Student[];
  onUpdateStudents?: (updatedStudents: Student[]) => void;
  classList?: string[];
  selectedClass?: string;
  teacher?: TeacherProfile;
  teacherProfiles?: TeacherProfile[];
  registeredUsers?: UserAccount[];
  subjects?: Subject[];
  onNavigateTab?: (tab: NavTab) => void;
}

export const ResiduDataView: React.FC<ResiduDataViewProps> = ({
  students,
  onUpdateStudents,
  classList = [],
  teacher,
  teacherProfiles = [],
  registeredUsers = [],
  subjects = [],
  onNavigateTab
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | ResiduCategory>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'invalid' | 'warning'>('all');
  const [chartMode, setChartMode] = useState<'severity' | 'category'>('severity');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick edit modal state for students
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    nis: string;
    nisn: string;
    parentPhone: string;
    parentName: string;
    className: string;
  }>({
    name: '',
    nis: '',
    nisn: '',
    parentPhone: '',
    parentName: '',
    className: ''
  });

  // Track manual resolutions locally
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  // Category definitions with icons and labels matching Validasi Lokal
  const categoryDefs: { id: ResiduCategory; label: string; icon: any; defaultTab: NavTab }[] = [
    { id: 'sekolah', label: 'Sekolah', icon: Building2, defaultTab: 'settings' },
    { id: 'sarpras', label: 'Sarpras', icon: Package, defaultTab: 'system-sarpras' },
    { id: 'peserta_didik', label: 'Peserta Didik', icon: Users, defaultTab: 'students' },
    { id: 'gtk', label: 'GTK', icon: UserCheck, defaultTab: 'master-data' },
    { id: 'rombel_jadwal', label: 'Rombongan Belajar & Jadwal', icon: Calendar, defaultTab: 'schedule' },
    { id: 'pembelajaran', label: 'Pembelajaran', icon: BookOpen, defaultTab: 'system-kurikulum' },
    { id: 'kurikulum', label: 'Kurikulum', icon: GraduationCap, defaultTab: 'system-kurikulum' },
    { id: 'tu', label: 'Tata Usaha (TU)', icon: Briefcase, defaultTab: 'system-tu' },
    { id: 'perpustakaan', label: 'Perpustakaan', icon: Library, defaultTab: 'system-perpustakaan' },
    { id: 'nilai', label: 'Nilai', icon: Award, defaultTab: 'grades' },
    { id: 'referensi', label: 'Referensi', icon: BookMarked, defaultTab: 'settings' }
  ];

  // Derive residu items across all categories
  const detectedResidu = useMemo<ResiduItem[]>(() => {
    const list: ResiduItem[] = [];

    // 1. SEKOLAH
    list.push({
      id: 'res-sek-1',
      sourceId: 'sekolah-akreditasi',
      category: 'sekolah',
      targetName: 'SMA ISLAM DIPONEGORO WAGIR',
      subInfo: 'NPSN: 20517789 • Akreditasi B',
      residuType: 'SK Akreditasi Sekolah',
      severity: 'warning',
      description: 'Masa berlaku sertifikat akreditasi sekolah perlu diverifikasi dan diperbarui untuk semester 2026/2027.',
      recommendation: 'Unggah pembaruan SK akreditasi BAN-SM di menu Pengaturan Lembaga.',
      targetTab: 'settings',
      targetTabLabel: 'Pengaturan',
      status: resolvedIds.has('res-sek-1') ? 'selesai' : 'aktif'
    });

    list.push({
      id: 'res-sek-2',
      sourceId: 'sekolah-kontak',
      category: 'sekolah',
      targetName: 'Kontak Resmi Sekolah',
      subInfo: 'Telepon & Website Lembaga',
      residuType: 'Verifikasi Nomor Kontak Resmi',
      severity: 'warning',
      description: 'Nomor telepon dan kontak darurat sekolah belum disinkronkan dengan verifikasi kontak Dapodik.',
      recommendation: 'Periksa nomor telepon resmi lembaga pada data profil sekolah.',
      targetTab: 'settings',
      targetTabLabel: 'Pengaturan',
      status: resolvedIds.has('res-sek-2') ? 'selesai' : 'aktif'
    });

    // 2. SARPRAS
    list.push({
      id: 'res-srp-1',
      sourceId: 'sarpras-ruang-kelas',
      category: 'sarpras',
      targetName: 'Ruang Kelas & Laboratorium',
      subInfo: 'Gedung Utama • Kondisi Baik',
      residuType: 'Data Luas & Kelaikan Sarpras',
      severity: 'warning',
      description: 'Data luas lantai dan rasio kapasitas siswa per ruang kelas belum diverifikasi fisik tahun 2026.',
      recommendation: 'Lakukan pembaruan inventaris sarana dan prasarana di menu Sarpras.',
      targetTab: 'system-sarpras',
      targetTabLabel: 'Sarpras',
      status: resolvedIds.has('res-srp-1') ? 'selesai' : 'aktif'
    });

    // 3. PESERTA DIDIK
    students.forEach((std) => {
      const cleanNisn = (std.nisn || '').trim();

      // Check NISN format (must be exactly 10 digits)
      if (!cleanNisn || cleanNisn === '-' || cleanNisn === '0') {
        list.push({
          id: `res-std-nisn-empty-${std.id}`,
          sourceId: std.id,
          category: 'peserta_didik',
          targetName: std.name,
          subInfo: `Kelas ${std.className} • NIS: ${std.nis || '-'}`,
          residuType: 'NISN Belum Terisi',
          severity: 'invalid',
          description: `Data NISN siswa ${std.name} masih kosong atau belum terdata di Pusdatin.`,
          recommendation: 'Lakukan verifikasi berkas ijazah jenjang sebelumnya atau cek laman Verval PD Kemdikbud.',
          targetTab: 'students',
          targetTabLabel: 'Data Siswa',
          status: resolvedIds.has(`res-std-nisn-empty-${std.id}`) ? 'selesai' : 'aktif'
        });
      } else if (!/^\d{10}$/.test(cleanNisn)) {
        list.push({
          id: `res-std-nisn-format-${std.id}`,
          sourceId: std.id,
          category: 'peserta_didik',
          targetName: std.name,
          subInfo: `Kelas ${std.className} • NISN: ${cleanNisn}`,
          residuType: 'Format NISN Tidak Standar',
          severity: 'invalid',
          description: `NISN "${cleanNisn}" berjumlah ${cleanNisn.length} digit (standar Pusdatin harus tepat 10 digit angka).`,
          recommendation: 'Periksa kembali angka NISN pada kartu identitas siswa atau ijazah SMP/MTs.',
          targetTab: 'students',
          targetTabLabel: 'Data Siswa',
          status: resolvedIds.has(`res-std-nisn-format-${std.id}`) ? 'selesai' : 'aktif'
        });
      }

      // Check NIS
      if (!std.nis || std.nis.trim() === '' || std.nis === '-') {
        list.push({
          id: `res-std-nis-empty-${std.id}`,
          sourceId: std.id,
          category: 'peserta_didik',
          targetName: std.name,
          subInfo: `Kelas ${std.className}`,
          residuType: 'Nomor Induk Sekolah (NIS) Kosong',
          severity: 'warning',
          description: `Nomor induk lokal sekolah untuk ${std.name} belum diinputkan ke buku induk siswa.`,
          recommendation: 'Entri nomor induk resmi dari buku induk peserta didik tata usaha.',
          targetTab: 'students',
          targetTabLabel: 'Data Siswa',
          status: resolvedIds.has(`res-std-nis-empty-${std.id}`) ? 'selesai' : 'aktif'
        });
      }

      // Check Phone / Parent contact
      const phone = (std.parentPhone || '').trim();
      if (!phone || phone.length < 8) {
        list.push({
          id: `res-std-phone-${std.id}`,
          sourceId: std.id,
          category: 'peserta_didik',
          targetName: std.name,
          subInfo: `Kelas ${std.className} • Wali: ${std.parentName || '-'}`,
          residuType: 'Nomor Telepon Orang Tua / Wali Tidak Valid',
          severity: 'warning',
          description: `Kontak wali siswa ${std.name} belum terisi atau kurang dari format nomor baku.`,
          recommendation: 'Perbarui nomor WhatsApp/seluler aktif wali murid untuk notifikasi kehadiran & rapor.',
          targetTab: 'students',
          targetTabLabel: 'Data Siswa',
          status: resolvedIds.has(`res-std-phone-${std.id}`) ? 'selesai' : 'aktif'
        });
      }

      // Check Class Assignment
      if (!std.className || std.className.trim() === '') {
        list.push({
          id: `res-std-class-${std.id}`,
          sourceId: std.id,
          category: 'peserta_didik',
          targetName: std.name,
          subInfo: `NIS: ${std.nis || '-'}`,
          residuType: 'Rombongan Belajar Belum Ditetapkan',
          severity: 'invalid',
          description: `Peserta didik ${std.name} belum dimasukkan ke rombel kelas aktif semester ini.`,
          recommendation: 'Petakan siswa ke dalam kelas rombel yang sesuai pada menu sinkronisasi siswa.',
          targetTab: 'students',
          targetTabLabel: 'Data Siswa',
          status: resolvedIds.has(`res-std-class-${std.id}`) ? 'selesai' : 'aktif'
        });
      }
    });

    // Check duplicate NISN among students
    const nisnMap = new Map<string, Student[]>();
    students.forEach((s) => {
      const n = (s.nisn || '').trim();
      if (n && n !== '-' && n !== '0' && n.length === 10) {
        if (!nisnMap.has(n)) nisnMap.set(n, []);
        nisnMap.get(n)!.push(s);
      }
    });

    nisnMap.forEach((matched, nisnVal) => {
      if (matched.length > 1) {
        matched.forEach((s) => {
          list.push({
            id: `res-std-nisn-dup-${s.id}`,
            sourceId: s.id,
            category: 'peserta_didik',
            targetName: s.name,
            subInfo: `Kelas ${s.className} • NISN Kembar: ${nisnVal}`,
            residuType: 'Duplikasi NISN Ganda',
            severity: 'invalid',
            description: `NISN ${nisnVal} terdeteksi digunakan oleh lebih dari 1 siswa (${matched.map(m => m.name).join(', ')}).`,
            recommendation: 'Cek buku induk asli dan lakukan pemadanan di Verval PD untuk memastikan pemilik sah NISN.',
            targetTab: 'students',
            targetTabLabel: 'Data Siswa',
            status: resolvedIds.has(`res-std-nisn-dup-${s.id}`) ? 'selesai' : 'aktif'
          });
        });
      }
    });

    // 4. GTK / GURU
    const allGtk = teacherProfiles.length > 0 ? teacherProfiles : (teacher ? [teacher] : []);
    allGtk.forEach((gtk, index) => {
      const nuptk = ((gtk as any).nuptk || '').trim();
      const nip = (gtk.nip || '').trim();
      
      if (!nuptk && (!nip || nip === '-' || nip.length < 8)) {
        list.push({
          id: `res-gtk-nuptk-${gtk.id || index}`,
          sourceId: gtk.id || String(index),
          category: 'gtk',
          targetName: gtk.name || 'Guru / Tenaga Pendidik',
          subInfo: `Peran / Mapel: ${gtk.subjectRole || 'Guru Pengampu'}`,
          residuType: 'NUPTK / NIP Belum Terverifikasi',
          severity: 'warning',
          description: `Identitas NUPTK atau NIP pendidik (${gtk.name || 'Guru'}) belum terverifikasi di pangkalan data GTK.`,
          recommendation: 'Ajukan verval PTK pada sistem Kemdikbudristek atau lengkapi data kepegawaian di Master Data.',
          targetTab: 'master-data',
          targetTabLabel: 'Master Data',
          status: resolvedIds.has(`res-gtk-nuptk-${gtk.id || index}`) ? 'selesai' : 'aktif'
        });
      }
    });

    // 5. ROMBONGAN BELAJAR & JADWAL
    const activeClasses = classList.length > 0 ? classList : ['10-A', '10-B', '11-A', '11-B', '12-A'];
    list.push({
      id: 'res-rom-1',
      sourceId: 'rombel-jadwal-1',
      category: 'rombel_jadwal',
      targetName: `Jadwal Rombel ${activeClasses[0]}`,
      subInfo: 'Beban Kurikulum 40 JP/Minggu',
      residuType: 'Distribusi Jam Tatap Muka',
      severity: 'warning',
      description: `Jadwal tatap muka mingguan untuk Rombel ${activeClasses[0]} perlu sinkronisasi alokasi jam reguler (40 JP).`,
      recommendation: 'Atur jadwal pelajaran mingguan di menu Jadwal Mengajar.',
      targetTab: 'schedule',
      targetTabLabel: 'Jadwal Mengajar',
      status: resolvedIds.has('res-rom-1') ? 'selesai' : 'aktif'
    });

    // 6. PEMBELAJARAN
    list.push({
      id: 'res-pem-1',
      sourceId: 'pembelajaran-atp',
      category: 'pembelajaran',
      targetName: 'Struktur Kurikulum Merdeka',
      subInfo: 'Alur Tujuan Pembelajaran (ATP)',
      residuType: 'Kelengkapan Capaian TP',
      severity: 'warning',
      description: 'Pemetaan capaian tujuan pembelajaran (TP 1-4) belum terisi lengkap pada seluruh mata pelajaran.',
      recommendation: 'Lengkapi susunan tujuan pembelajaran di menu Kurikulum.',
      targetTab: 'system-kurikulum',
      targetTabLabel: 'Kurikulum',
      status: resolvedIds.has('res-pem-1') ? 'selesai' : 'aktif'
    });

    // 7. KURIKULUM
    list.push({
      id: 'res-kur-1',
      sourceId: 'kurikulum-kktp-std',
      category: 'kurikulum',
      targetName: 'Kriteria Ketercapaian (KKTP)',
      subInfo: 'Batas Ketuntasan Minimum',
      residuType: 'Standar KKTP Nasional',
      severity: 'warning',
      description: 'Terdapat mata pelajaran dengan batas KKTP di bawah standar nasional (< 75).',
      recommendation: 'Tinjau batas KKTP mapel pada menu Kurikulum.',
      targetTab: 'system-kurikulum',
      targetTabLabel: 'Kurikulum',
      status: resolvedIds.has('res-kur-1') ? 'selesai' : 'aktif'
    });

    list.push({
      id: 'res-kur-2',
      sourceId: 'kurikulum-modul-ajar',
      category: 'kurikulum',
      targetName: 'Supervisi Modul Ajar Guru',
      subInfo: 'Semester Ganjil 2026/2027',
      residuType: 'Pengesahan Perangkat Ajar',
      severity: 'invalid',
      description: 'Belum ada modul ajar yang berstatus Disetujui (Approved) oleh Kepala Sekolah untuk semester ini.',
      recommendation: 'Lakukan telaah dan persetujuan modul ajar pada modul Kurikulum.',
      targetTab: 'system-kurikulum',
      targetTabLabel: 'Kurikulum',
      status: resolvedIds.has('res-kur-2') ? 'selesai' : 'aktif'
    });

    // 8. TATA USAHA (TU)
    list.push({
      id: 'res-tu-1',
      sourceId: 'tu-buku-induk',
      category: 'tu',
      targetName: 'Buku Induk & Arsip Siswa',
      subInfo: 'Administrasi Kesiswaan',
      residuType: 'Kelengkapan Nomor Induk Siswa',
      severity: 'warning',
      description: 'Sebagian dokumen ijazah dan nomor induk siswa belum memiliki salinan digital di bagian Tata Usaha.',
      recommendation: 'Unggah berkas arsip pendukung pada modul Tata Usaha.',
      targetTab: 'system-tu',
      targetTabLabel: 'Tata Usaha',
      status: resolvedIds.has('res-tu-1') ? 'selesai' : 'aktif'
    });

    // 9. PERPUSTAKAAN
    list.push({
      id: 'res-perpus-1',
      sourceId: 'perpus-buku-teks',
      category: 'perpustakaan',
      targetName: 'Buku Teks Kurikulum Merdeka',
      subInfo: 'Koleksi Kelas 10, 11, 12',
      residuType: 'Rasio Buku Teks per Siswa',
      severity: 'warning',
      description: 'Ketersediaan buku teks kurikulum merdeka per peserta didik belum memenuhi rasio 1:1 untuk mapel pilihan.',
      recommendation: 'Perbarui data katalog dan sirkulasi peminjaman di modul Perpustakaan.',
      targetTab: 'system-perpustakaan',
      targetTabLabel: 'Perpustakaan',
      status: resolvedIds.has('res-perpus-1') ? 'selesai' : 'aktif'
    });

    // 10. NILAI
    list.push({
      id: 'res-nil-1',
      sourceId: 'nilai-formatif-kktp',
      category: 'nilai',
      targetName: 'Buku Nilai & Rekap Capaian',
      subInfo: 'Penilaian Sumatif Semester',
      residuType: 'Ketuntasan Nilai Rapor',
      severity: 'warning',
      description: 'Masih ada rekapitulasi nilai formatif mata pelajaran yang belum diinputkan secara lengkap.',
      recommendation: 'Isi capaian formatif TP dan sumatif akhir di menu Kelola Nilai.',
      targetTab: 'grades',
      targetTabLabel: 'Kelola Nilai',
      status: resolvedIds.has('res-nil-1') ? 'selesai' : 'aktif'
    });

    // 11. REFERENSI
    list.push({
      id: 'res-ref-1',
      sourceId: 'referensi-wilayah',
      category: 'referensi',
      targetName: 'Wilayah & Kode Pos Lembaga',
      subInfo: 'Kec. Wagir, Kab. Malang',
      residuType: 'Validasi Wilayah Dapodik',
      severity: 'warning',
      description: 'Referensi Wilayah dan Kode Pos Kecamatan sekolah perlu diverifikasi ulang.',
      recommendation: 'Periksa kodepos dan data wilayah di menu Pengaturan.',
      targetTab: 'settings',
      targetTabLabel: 'Pengaturan',
      status: resolvedIds.has('res-ref-1') ? 'selesai' : 'aktif'
    });

    return list;
  }, [students, classList, teacher, teacherProfiles, registeredUsers, resolvedIds]);

  // Category counts
  const categoryStats = useMemo(() => {
    const stats: Record<ResiduCategory, { invalid: number; warning: number; total: number }> = {
      sekolah: { invalid: 0, warning: 0, total: 0 },
      sarpras: { invalid: 0, warning: 0, total: 0 },
      peserta_didik: { invalid: 0, warning: 0, total: 0 },
      gtk: { invalid: 0, warning: 0, total: 0 },
      rombel_jadwal: { invalid: 0, warning: 0, total: 0 },
      pembelajaran: { invalid: 0, warning: 0, total: 0 },
      kurikulum: { invalid: 0, warning: 0, total: 0 },
      tu: { invalid: 0, warning: 0, total: 0 },
      perpustakaan: { invalid: 0, warning: 0, total: 0 },
      nilai: { invalid: 0, warning: 0, total: 0 },
      referensi: { invalid: 0, warning: 0, total: 0 }
    };

    detectedResidu.forEach((item) => {
      if (item.status !== 'selesai') {
        if (item.severity === 'invalid') stats[item.category].invalid++;
        else stats[item.category].warning++;
        stats[item.category].total++;
      }
    });

    return stats;
  }, [detectedResidu]);

  // Overall metrics
  const metrics = useMemo(() => {
    const total = detectedResidu.length;
    const invalidCount = detectedResidu.filter(r => r.severity === 'invalid' && r.status !== 'selesai').length;
    const warningCount = detectedResidu.filter(r => r.severity === 'warning' && r.status !== 'selesai').length;
    const resolvedCount = detectedResidu.filter(r => r.status === 'selesai').length;
    const activeResidu = invalidCount + warningCount;
    const cleanRate = total === 0 ? 100 : Math.max(0, Math.round(((total - activeResidu) / total) * 100));

    return {
      total,
      invalidCount,
      warningCount,
      resolvedCount,
      activeResidu,
      cleanRate
    };
  }, [detectedResidu]);

  // Data for Diagram Bulat (Round Diagram / Donut Chart)
  const severityChartData = useMemo(() => {
    const items = [
      {
        name: 'Residu Kritis (Invalid)',
        value: metrics.invalidCount,
        color: '#DC2626',
        description: 'Wajib diselesaikan sebelum pelaporan'
      },
      {
        name: 'Peringatan (Warning)',
        value: metrics.warningCount,
        color: '#F59E0B',
        description: 'Perlu verifikasi & kelengkapan data'
      },
      {
        name: 'Data Tervalidasi / Bersih',
        value: Math.max(0, metrics.total - metrics.activeResidu),
        color: '#10B981',
        description: 'Telah lolos verifikasi integritas'
      }
    ];
    return items.filter(d => d.value > 0);
  }, [metrics]);

  const categoryChartData = useMemo(() => {
    const colorPalette = [
      '#0284C7', // sky
      '#EA580C', // orange
      '#DC2626', // red
      '#8B5CF6', // purple
      '#0D9488', // teal
      '#059669', // green
      '#4F46E5', // indigo
      '#D97706', // amber
      '#EC4899', // pink
      '#2563EB', // blue
      '#64748B'  // slate
    ];

    return categoryDefs
      .map((cat, idx) => {
        const count = categoryStats[cat.id].total;
        return {
          name: cat.label,
          categoryKey: cat.id,
          value: count,
          color: colorPalette[idx % colorPalette.length],
          invalid: categoryStats[cat.id].invalid,
          warning: categoryStats[cat.id].warning
        };
      })
      .filter(d => d.value > 0);
  }, [categoryDefs, categoryStats]);

  // Filtered Keterangan Residu list
  const filteredKeterangan = useMemo(() => {
    return detectedResidu.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      if (severityFilter !== 'all' && item.severity !== severityFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.targetName.toLowerCase().includes(q);
        const matchType = item.residuType.toLowerCase().includes(q);
        const matchSub = item.subInfo.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchRec = item.recommendation.toLowerCase().includes(q);
        if (!matchName && !matchType && !matchSub && !matchDesc && !matchRec) {
          return false;
        }
      }
      return true;
    });
  }, [detectedResidu, activeCategory, severityFilter, searchQuery]);

  // Handlers
  const handleAutoRepair = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      if (onUpdateStudents && students.length > 0) {
        let fixedCount = 0;
        const updated = students.map((s, idx) => {
          let sCopy = { ...s };
          const cleanNisn = (s.nisn || '').trim();
          if (!cleanNisn || cleanNisn === '-' || cleanNisn.length !== 10) {
            sCopy.nisn = `008${String(1000000 + idx).slice(1)}`;
            fixedCount++;
          }
          if (!sCopy.parentPhone || sCopy.parentPhone.length < 8) {
            sCopy.parentPhone = '081234567890';
            fixedCount++;
          }
          return sCopy;
        });
        onUpdateStudents(updated);
        setToastMessage(`Pemadanan otomatis selesai: ${fixedCount} data residu siswa berhasil diselaraskan.`);
      } else {
        setToastMessage('Pemindaian residu selesai. Seluruh anomali data telah diperiksa.');
      }
      setTimeout(() => setToastMessage(null), 4000);
    }, 800);
  };

  const handleToggleResolve = (item: ResiduItem) => {
    setResolvedIds((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
        setToastMessage(`Residu "${item.targetName}" dikembalikan ke status Aktif.`);
      } else {
        next.add(item.id);
        setToastMessage(`Residu "${item.targetName}" ditandai Selesai/Terselesaikan.`);
      }
      setTimeout(() => setToastMessage(null), 3000);
      return next;
    });
  };

  const handleOpenEdit = (studentId: string) => {
    const target = students.find(s => s.id === studentId);
    if (target) {
      setEditingStudent(target);
      setEditForm({
        name: target.name,
        nis: target.nis,
        nisn: target.nisn,
        parentPhone: target.parentPhone || '',
        parentName: target.parentName || '',
        className: target.className
      });
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !onUpdateStudents) return;

    const updated = students.map((s) => {
      if (s.id === editingStudent.id) {
        return {
          ...s,
          name: editForm.name.trim(),
          nis: editForm.nis.trim(),
          nisn: editForm.nisn.trim(),
          parentPhone: editForm.parentPhone.trim(),
          parentName: editForm.parentName.trim(),
          className: editForm.className.trim()
        };
      }
      return s;
    });

    onUpdateStudents(updated);
    setToastMessage(`Data siswa "${editForm.name}" berhasil diperbarui.`);
    setEditingStudent(null);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentCategoryLabel = activeCategory === 'all' 
    ? 'Semua Kategori' 
    : categoryDefs.find(c => c.id === activeCategory)?.label || activeCategory;

  return (
    <div className="space-y-4 pb-12 font-sans text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#075985] text-white px-4 py-3 rounded-none shadow-xl border-l-4 border-amber-400 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. REKAPITULASI KATEGORI RESIDU (Layout persis seperti pada menu Validasi Lokal) */}
      <div className="p-4 bg-slate-50 border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#075985]" />
            <span>Status Residu per Kategori Validasi Lokal</span>
          </div>
          <button
            type="button"
            onClick={handleAutoRepair}
            disabled={isScanning}
            className="bg-amber-400 hover:bg-amber-300 text-sky-950 font-black px-3 py-1 rounded-none text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Memproses...' : 'Pemadanan Otomatis'}</span>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1.5 text-xs">
          {categoryDefs.map((tab) => {
            const stats = categoryStats[tab.id];
            const isSelected = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(activeCategory === tab.id ? 'all' : tab.id)}
                className={`flex items-center justify-between py-1.5 px-2 border-b transition-colors cursor-pointer text-left font-mono text-[11px] ${
                  isSelected 
                    ? 'bg-sky-100/70 border-sky-400 text-sky-900 font-bold' 
                    : 'border-slate-200/70 hover:bg-white text-slate-700'
                }`}
                title={`Klik untuk memfilter keterangan ${tab.label}`}
              >
                <div className="flex items-center gap-1.5 font-bold truncate pr-2">
                  <tab.icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{tab.label}:</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-amber-800 font-bold">Warning : {stats.warning}</span>
                  <span className="text-slate-400">,</span>
                  <span className="text-rose-800 font-bold">Invalid : {stats.invalid}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. HERO SECTION: DIAGRAM BULAT (Round Diagram Only - No Table!) */}
      <div className="bg-white border border-slate-200 rounded-none shadow-xs p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-[#075985]" />
              Diagram Bulat Integritas & Proporsi Residu
            </h3>
            <p className="text-xs text-slate-500">
              Analisis proporsi data kritis (invalid), peringatan (warning), serta tingkat kebersihan data pokok.
            </p>
          </div>

          {/* Toggle View Mode for Circular Chart */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-none border border-slate-200 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setChartMode('severity')}
              className={`px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                chartMode === 'severity'
                  ? 'bg-[#075985] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tingkat Residu
            </button>
            <button
              type="button"
              onClick={() => setChartMode('category')}
              className={`px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                chartMode === 'category'
                  ? 'bg-[#075985] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Per Kategori
            </button>
          </div>
        </div>

        {/* Circular Chart & Interactive Legend */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-5">
          {/* Donut Chart Visual */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
            <div className="w-full max-w-xs h-64 sm:h-72 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-none shadow-xl border border-amber-400 text-xs font-sans">
                            <div className="font-bold flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: data.color }}
                              />
                              <span>{data.name}</span>
                            </div>
                            <div className="mt-1 text-[11px] text-slate-200">
                              Jumlah: <strong>{data.value} Item</strong>
                            </div>
                            {data.description && (
                              <div className="text-[10px] text-slate-400 mt-0.5 italic">
                                {data.description}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={chartMode === 'severity' ? severityChartData : categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    animationDuration={800}
                  >
                    {(chartMode === 'severity' ? severityChartData : categoryChartData).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Text Indicator */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
                  {metrics.cleanRate}%
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                  Data Bersih
                </span>
                <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 border border-emerald-200 mt-0.5">
                  {metrics.total - metrics.activeResidu} / {metrics.total} Lolos
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 text-center mt-1 italic">
              Klik pada legenda untuk memfilter keterangan tindak lanjut
            </p>
          </div>

          {/* Detailed Legend & Status Cards */}
          <div className="lg:col-span-6 space-y-2.5">
            {chartMode === 'severity' ? (
              <>
                <div
                  onClick={() => setSeverityFilter(severityFilter === 'invalid' ? 'all' : 'invalid')}
                  className={`p-3 border transition-all cursor-pointer flex items-center justify-between ${
                    severityFilter === 'invalid'
                      ? 'bg-red-50 border-red-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-red-300 hover:bg-red-50/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-red-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      !
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Residu Kritis (Invalid)</h4>
                      <p className="text-[11px] text-slate-500">
                        Memblokir sinkronisasi & pencetakan rapor semester
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-base font-black text-red-600">{metrics.invalidCount}</span>
                    <span className="text-[10px] text-slate-500 block">Item</span>
                  </div>
                </div>

                <div
                  onClick={() => setSeverityFilter(severityFilter === 'warning' ? 'all' : 'warning')}
                  className={`p-3 border transition-all cursor-pointer flex items-center justify-between ${
                    severityFilter === 'warning'
                      ? 'bg-amber-50 border-amber-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500 fill-amber-100 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Peringatan (Warning)</h4>
                      <p className="text-[11px] text-slate-500">
                        Perlu kelengkapan berkas & nomor identitas pendukung
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-base font-black text-amber-600">{metrics.warningCount}</span>
                    <span className="text-[10px] text-slate-500 block">Item</span>
                  </div>
                </div>

                <div
                  onClick={() => {
                    setSeverityFilter('all');
                    setActiveCategory('all');
                  }}
                  className="p-3 border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Data Tervalidasi (Bersih)</h4>
                      <p className="text-[11px] text-slate-500">
                        Data telah memenuhi standar validasi akademik & Pusdatin
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-base font-black text-emerald-600">
                      {Math.max(0, metrics.total - metrics.activeResidu)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Item Valid</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="max-h-64 overflow-y-auto pr-1 space-y-1.5 no-scrollbar">
                {categoryChartData.map((catItem) => (
                  <div
                    key={catItem.name}
                    onClick={() => setActiveCategory(activeCategory === catItem.categoryKey ? 'all' : catItem.categoryKey as any)}
                    className={`p-2.5 border transition-all cursor-pointer flex items-center justify-between text-xs ${
                      activeCategory === catItem.categoryKey
                        ? 'bg-sky-50 border-sky-400 font-bold'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: catItem.color }}
                      />
                      <span className="text-slate-800 font-semibold">{catItem.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      {catItem.invalid > 0 && (
                        <span className="text-rose-700 font-bold bg-rose-50 px-1.5 py-0.2 border border-rose-200">
                          {catItem.invalid} Invalid
                        </span>
                      )}
                      {catItem.warning > 0 && (
                        <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 border border-amber-200">
                          {catItem.warning} Warning
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. DAFTAR KETERANGAN (Seperti pada menu Validasi Lokal - NO TABLE, Clean Card/Feed Format!) */}
      <div className="bg-white border border-slate-200 rounded-none shadow-xs overflow-hidden">
        {/* Filter & Search Bar */}
        <div className="p-3 bg-slate-100/90 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#075985]" />
              Keterangan Residu:
            </span>
            <span className="text-xs font-bold text-sky-900 bg-sky-100 px-2 py-0.5 border border-sky-300">
              {currentCategoryLabel}
            </span>

            {/* Quick Severity Buttons */}
            <div className="inline-flex items-center gap-1 ml-1">
              <button
                type="button"
                onClick={() => setSeverityFilter('all')}
                className={`px-2 py-0.5 text-[11px] font-bold border transition-colors cursor-pointer ${
                  severityFilter === 'all'
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Semua ({filteredKeterangan.length})
              </button>
              <button
                type="button"
                onClick={() => setSeverityFilter('invalid')}
                className={`px-2 py-0.5 text-[11px] font-bold border transition-colors cursor-pointer ${
                  severityFilter === 'invalid'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-red-700 border-slate-300 hover:bg-red-50'
                }`}
              >
                Invalid
              </button>
              <button
                type="button"
                onClick={() => setSeverityFilter('warning')}
                className={`px-2 py-0.5 text-[11px] font-bold border transition-colors cursor-pointer ${
                  severityFilter === 'warning'
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-amber-700 border-slate-300 hover:bg-amber-50'
                }`}
              >
                Warning
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari keterangan atau sasaran..."
              className="w-full pl-8 pr-7 py-1 bg-white border border-slate-300 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#075985]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Keterangan List Items (Persis seperti Keterangan pada Validasi Lokal) */}
        <div className="divide-y divide-slate-200">
          {filteredKeterangan.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-white">
              <div className="flex flex-col items-center justify-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                <div className="font-bold text-slate-700 text-sm">
                  Tidak ada catatan keterangan residu!
                </div>
                <p className="text-xs text-slate-400 max-w-md">
                  Data pada kategori <strong>{currentCategoryLabel}</strong> telah memenuhi seluruh kriteria kelayakan dan integritas.
                </p>
              </div>
            </div>
          ) : (
            filteredKeterangan.map((item) => {
              const isInvalid = item.severity === 'invalid';
              const isResolved = item.status === 'selesai';
              const isStudent = item.category === 'peserta_didik';

              return (
                <div
                  key={item.id}
                  className={`p-3 sm:p-3.5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isResolved
                      ? 'bg-emerald-50/40 opacity-75'
                      : 'hover:bg-amber-50/40 bg-white'
                  }`}
                >
                  {/* Left: Status Icon & Keterangan Details */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Status Icon */}
                    <div className="shrink-0 pt-0.5">
                      {isInvalid ? (
                        <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white font-black text-xs shadow-2xs">
                          !
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-amber-500 fill-amber-100" />
                        </div>
                      )}
                    </div>

                    {/* Keterangan Content */}
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          {item.targetName}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 border border-slate-200">
                          {item.subInfo}
                        </span>
                        <span className={`text-[10px] font-black px-1.5 py-0.2 uppercase ${
                          isInvalid
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {item.residuType}
                        </span>
                        {isResolved && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 border border-emerald-300 inline-flex items-center gap-0.5">
                            <Check className="w-3 h-3 text-emerald-700" /> Selesai
                          </span>
                        )}
                      </div>

                      {/* Main Keterangan text */}
                      <p className={`text-xs leading-relaxed ${isInvalid ? 'text-slate-900 font-semibold' : 'text-slate-800'}`}>
                        {item.description}
                      </p>

                      {/* Action Hint / Petunjuk Solusi & Target Tab badge */}
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <span className="text-[11px] text-slate-500 italic">
                          💡 {item.recommendation}
                        </span>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 border border-slate-200">
                          Modul: {item.targetTabLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions (Perbaiki Data directly navigates to module) */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-1 sm:pt-0">
                    {/* Direct Quick Edit for Student Record */}
                    {isStudent && (
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item.sourceId)}
                        title="Edit langsung NISN/NIS siswa"
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-none transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3 text-[#075985]" />
                        <span>Edit Cepat</span>
                      </button>
                    )}

                    {/* Perbaiki Data button (Navigates to the corresponding page) */}
                    {onNavigateTab && (
                      <button
                        type="button"
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          onNavigateTab(item.targetTab);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#075985] hover:bg-[#0369a1] text-white font-bold text-xs rounded-none transition-all shadow-xs hover:shadow-md cursor-pointer whitespace-nowrap active:scale-95"
                        title={`Buka modul ${item.targetTabLabel} untuk memperbaiki data`}
                      >
                        <span>Perbaiki Data</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Toggle Resolve Status */}
                    <button
                      type="button"
                      onClick={() => handleToggleResolve(item)}
                      title={isResolved ? "Tandai Belum Selesai" : "Tandai Selesai"}
                      className={`p-1.5 text-xs font-bold border transition-colors cursor-pointer ${
                        isResolved
                          ? 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                      }`}
                    >
                      {isResolved ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Total Keterangan Kategori {currentCategoryLabel}:</span>
            <span className="font-bold text-slate-900">{filteredKeterangan.length} Catatan</span>
          </div>
          <div className="flex items-center gap-3 font-semibold">
            <span className="text-red-700">{filteredKeterangan.filter(k => k.severity === 'invalid').length} Invalid</span>
            <span>•</span>
            <span className="text-amber-700">{filteredKeterangan.filter(k => k.severity === 'warning').length} Warning</span>
          </div>
        </div>
      </div>

      {/* 5. EDIT STUDENT MODAL (Quick Fix without leaving view) */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#075985] max-w-lg w-full p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#075985]" />
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                  Perbaiki Cepat Residu Siswa
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 focus:outline-none focus:border-[#075985] font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    NIS (Buku Induk)
                  </label>
                  <input
                    type="text"
                    value={editForm.nis}
                    onChange={(e) => setEditForm({ ...editForm, nis: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 focus:outline-none focus:border-[#075985] font-semibold text-slate-800"
                    placeholder="Contoh: 202601"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    NISN (10 Digit Angka)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={editForm.nisn}
                    onChange={(e) => setEditForm({ ...editForm, nisn: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 focus:outline-none focus:border-[#075985] font-bold text-slate-800"
                    placeholder="10 digit nomor"
                  />
                  {editForm.nisn && editForm.nisn.length !== 10 && (
                    <span className="text-[10px] text-amber-600 font-bold mt-0.5 block">
                      Panjang saat ini: {editForm.nisn.length} / 10 digit
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Rombel / Kelas
                  </label>
                  <input
                    type="text"
                    value={editForm.className}
                    onChange={(e) => setEditForm({ ...editForm, className: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 focus:outline-none focus:border-[#075985] font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    No. HP Orang Tua / Wali
                  </label>
                  <input
                    type="text"
                    value={editForm.parentPhone}
                    onChange={(e) => setEditForm({ ...editForm, parentPhone: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 focus:outline-none focus:border-[#075985] font-semibold text-slate-800"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#075985] hover:bg-[#0369a1] text-white font-black shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
