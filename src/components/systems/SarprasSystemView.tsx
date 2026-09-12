import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Building2, 
  Clock, 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  Download, 
  X, 
  Save, 
  Calendar,
  Layers,
  Sparkles,
  ArrowRightLeft,
  Check,
  Tag,
  MapPin,
  ClipboardList,
  Edit2,
  Trash2,
  Eye,
  ShieldCheck,
  Barcode
} from 'lucide-react';
import { UserAccount, TeacherProfile } from '../../types';

export interface SarprasItem {
  id: string;
  kodeBarang: string;
  namaBarang: string;
  kategori: 'Elektronik & IT' | 'Mebel & Perabot' | 'Alat Laboratorium' | 'Sarana Olahraga' | 'Media & Buku' | 'Kebersihan & Umum';
  merkModel: string;
  jumlah: number;
  satuan: string;
  lokasi: string;
  kondisi: 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
  tahunPerolehan: string;
  sumberDana: 'Dana BOS' | 'Bantuan Pemerintah' | 'Komite Sekolah' | 'Hibah / Yayasan';
  hargaSatuan: number;
  penanggungJawab: string;
  catatan?: string;
}

export interface SarprasRuang {
  id: string;
  kodeRuang: string;
  namaRuang: string;
  kategoriRuang: 'Ruang Kelas' | 'Laboratorium' | 'Perpustakaan' | 'Kantor & Guru' | 'Fasilitas Umum';
  luasM2: number;
  kapasitasSiswa: number;
  lokasiGedung: string;
  kondisiRuang: 'Sangat Baik' | 'Baik' | 'Perlu Renovasi';
  fasilitasUtama: string[];
  penanggungJawab: string;
  statusPemakaian: 'Tersedia' | 'Sedang Digunakan' | 'Dalam Perawatan';
}

export interface PeminjamanBarang {
  id: string;
  noTransaksi: string;
  namaPeminjam: string;
  peranPeminjam: 'Guru' | 'Siswa' | 'Staf TU / Karyawan';
  namaBarang: string;
  jumlah: number;
  tglPinjam: string;
  tglHarusKembali: string;
  tglPengembalian?: string;
  keperluan: string;
  lokasiPenggunaan: string;
  status: 'Dipinjam' | 'Selesai Dikembalikan' | 'Terlambat';
  kondisiSaatKembali?: 'Baik' | 'Rusak' | 'Ada Kendala';
  petugas: string;
}

export interface PemeliharaanTiket {
  id: string;
  noTiket: string;
  tglLapor: string;
  fasilitasBarang: string;
  lokasi: string;
  pelapor: string;
  deskripsiMasalah: string;
  prioritas: 'Tinggi (Mendesak)' | 'Sedang' | 'Rendah';
  status: 'Menunggu Antrean' | 'Sedang Diperbaiki' | 'Selesai Perbaikan';
  estimasiBiaya: number;
  teknisi: string;
  tglSelesai?: string;
}

interface SarprasSystemViewProps {
  registeredUsers?: UserAccount[];
  teacher?: TeacherProfile | null;
  onNavigateTab?: (tab: any) => void;
}

export const SarprasSystemView: React.FC<SarprasSystemViewProps> = ({
  registeredUsers = [],
  teacher,
  onNavigateTab
}) => {
  const [activeTab, setActiveTab] = useState<'inventaris' | 'ruang' | 'peminjaman' | 'pemeliharaan'>('inventaris');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('Semua');
  const [selectedKondisiFilter, setSelectedKondisiFilter] = useState<string>('Semua');
  const [selectedLokasiFilter, setSelectedLokasiFilter] = useState<string>('Semua');

  // Modal states
  const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false);
  const [showAddLoanModal, setShowAddLoanModal] = useState<boolean>(false);
  const [showAddTicketModal, setShowAddTicketModal] = useState<boolean>(false);
  const [showReturnModal, setShowReturnModal] = useState<boolean>(false);
  const [selectedLoanForReturn, setSelectedLoanForReturn] = useState<PeminjamanBarang | null>(null);
  const [returnCondition, setReturnCondition] = useState<'Baik' | 'Rusak' | 'Ada Kendala'>('Baik');

  // Detail / Print preview modal
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<SarprasItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // State 1: Inventaris Barang (with localStorage)
  const [items, setItems] = useState<SarprasItem[]>(() => {
    const saved = ((k: string) => null as any)('simak_sarpras_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse sarpras items', e);
      }
    }
    return [
      {
        id: 'ITM-001',
        kodeBarang: 'INV-ELK-2024-001',
        namaBarang: 'LCD Proyektor Epson EB-X500',
        kategori: 'Elektronik & IT',
        merkModel: 'Epson 3600 Lumens HDMI',
        jumlah: 8,
        satuan: 'Unit',
        lokasi: 'Lab Komputer 1',
        kondisi: 'Baik',
        tahunPerolehan: '2024',
        sumberDana: 'Dana BOS',
        hargaSatuan: 6200000,
        penanggungJawab: 'Ahmad Fauzi, S.Kom.',
        catatan: 'Lengkap dengan kabel HDMI 15m dan remote control'
      },
      {
        id: 'ITM-002',
        kodeBarang: 'INV-ELK-2024-002',
        namaBarang: 'PC All-in-One Lenovo IdeaCentre Core i5',
        kategori: 'Elektronik & IT',
        merkModel: 'Lenovo AIO 24" 16GB RAM 512GB SSD',
        jumlah: 32,
        satuan: 'Unit',
        lokasi: 'Lab Komputer 1',
        kondisi: 'Baik',
        tahunPerolehan: '2024',
        sumberDana: 'Dana BOS',
        hargaSatuan: 9500000,
        penanggungJawab: 'Ahmad Fauzi, S.Kom.',
        catatan: 'Digunakan untuk Asesmen Nasional (ANBK) & KBM Informatika'
      },
      {
        id: 'ITM-003',
        kodeBarang: 'INV-MBL-2023-014',
        namaBarang: 'Meja & Kursi Siswa Kayu Jati Minimalis',
        kategori: 'Mebel & Perabot',
        merkModel: 'Standar Kemendikbud Ristek',
        jumlah: 120,
        satuan: 'Set',
        lokasi: 'Ruang Kelas X-1 s/d X-4',
        kondisi: 'Baik',
        tahunPerolehan: '2023',
        sumberDana: 'Komite Sekolah',
        hargaSatuan: 450000,
        penanggungJawab: 'Drs. Supardi',
        catatan: 'Tersedia stiker nomor inventaris pada tiap laci'
      },
      {
        id: 'ITM-004',
        kodeBarang: 'INV-LAB-2023-008',
        namaBarang: 'Mikroskop Binokuler Olympus CX23',
        kategori: 'Alat Laboratorium',
        merkModel: 'Olympus CX23 LED Halogen',
        jumlah: 12,
        satuan: 'Unit',
        lokasi: 'Laboratorium Biologi / IPA',
        kondisi: 'Baik',
        tahunPerolehan: '2023',
        sumberDana: 'Bantuan Pemerintah',
        hargaSatuan: 14500000,
        penanggungJawab: 'Hj. Siti Mariam, M.Pd.',
        catatan: 'Kalibrasi optik berkala tiap awal semester'
      },
      {
        id: 'ITM-005',
        kodeBarang: 'INV-OLR-2025-003',
        namaBarang: 'Bola Voli Mikasa V200W Original',
        kategori: 'Sarana Olahraga',
        merkModel: 'Mikasa Super Composite FIVB Approved',
        jumlah: 10,
        satuan: 'Buah',
        lokasi: 'Gudang Sarpras Olahraga',
        kondisi: 'Baik',
        tahunPerolehan: '2025',
        sumberDana: 'Dana BOS',
        hargaSatuan: 750000,
        penanggungJawab: 'Bambang Irawan, S.Pd.',
        catatan: 'Digunakan untuk KBM PJOK dan ekstra voli'
      },
      {
        id: 'ITM-006',
        kodeBarang: 'INV-ELK-2022-009',
        namaBarang: 'Printer Epson EcoTank L3210 All-in-One',
        kategori: 'Elektronik & IT',
        merkModel: 'Epson L3210 Print-Scan-Copy',
        jumlah: 3,
        satuan: 'Unit',
        lokasi: 'Ruang Tata Usaha (TU)',
        kondisi: 'Rusak Ringan',
        tahunPerolehan: '2022',
        sumberDana: 'Dana BOS',
        hargaSatuan: 2650000,
        penanggungJawab: 'Endang Wahyuni, S.AP.',
        catatan: 'Roll kertas kadang macet (paper jam), perlu servis berkala'
      },
      {
        id: 'ITM-007',
        kodeBarang: 'INV-MBL-2021-022',
        namaBarang: 'Papan Tulis Whiteboard Magnetik 120x240cm',
        kategori: 'Mebel & Perabot',
        merkModel: 'Sakana Alumunium Frame',
        jumlah: 16,
        satuan: 'Unit',
        lokasi: 'Ruang Kelas XI-1 s/d XI-4',
        kondisi: 'Baik',
        tahunPerolehan: '2021',
        sumberDana: 'Komite Sekolah',
        hargaSatuan: 950000,
        penanggungJawab: 'Drs. Supardi',
        catatan: 'Termasuk tatakan spidol dan penghapus magnetik'
      }
    ];
  });

  // State 2: Ruangan & Gedung
  const [rooms, setRooms] = useState<SarprasRuang[]>(() => {
    const saved = ((k: string) => null as any)('simak_sarpras_rooms');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse sarpras rooms', e);
      }
    }
    return [
      {
        id: 'RNG-01',
        kodeRuang: 'R-LAB-KOMP',
        namaRuang: 'Laboratorium Komputer Terpadu',
        kategoriRuang: 'Laboratorium',
        luasM2: 96,
        kapasitasSiswa: 36,
        lokasiGedung: 'Gedung B - Lantai 2',
        kondisiRuang: 'Sangat Baik',
        fasilitasUtama: ['32 Unit PC AIO', 'AC 2 PK x 2', 'LCD Proyektor', 'Jaringan LAN Gigabyte', 'UPS Sentral'],
        penanggungJawab: 'Ahmad Fauzi, S.Kom.',
        statusPemakaian: 'Tersedia'
      },
      {
        id: 'RNG-02',
        kodeRuang: 'R-LAB-IPA',
        namaRuang: 'Laboratorium Sains & Biologi',
        kategoriRuang: 'Laboratorium',
        luasM2: 120,
        kapasitasSiswa: 36,
        lokasiGedung: 'Gedung C - Lantai 1',
        kondisiRuang: 'Baik',
        fasilitasUtama: ['Mikroskop 12 Unit', 'Meja Praktikum Tahan Asam', 'Wastafel 6 Titik', 'Lemari Asam', 'Kotak P3K'],
        penanggungJawab: 'Hj. Siti Mariam, M.Pd.',
        statusPemakaian: 'Sedang Digunakan'
      },
      {
        id: 'RNG-03',
        kodeRuang: 'R-PERPUS',
        namaRuang: 'Perpustakaan Digital Ki Hajar Dewantara',
        kategoriRuang: 'Perpustakaan',
        luasM2: 140,
        kapasitasSiswa: 60,
        lokasiGedung: 'Gedung Utama - Lantai 1',
        kondisiRuang: 'Sangat Baik',
        fasilitasUtama: ['Rak Buku 24 Unit', 'E-Library Kiosk 4 Unit', 'Sofa Baca Santai', 'Free WiFi High-Speed', 'AC 2 PK x 2'],
        penanggungJawab: 'Nurul Hidayati, S.I.Pust.',
        statusPemakaian: 'Tersedia'
      },
      {
        id: 'RNG-04',
        kodeRuang: 'R-AULA',
        namaRuang: 'Aula Serbaguna Graha Wiyata',
        kategoriRuang: 'Fasilitas Umum',
        luasM2: 350,
        kapasitasSiswa: 400,
        lokasiGedung: 'Gedung Pertemuan Barat',
        kondisiRuang: 'Baik',
        fasilitasUtama: ['Panggung Utama', 'Sound System Line Array 5000W', 'Proyektor Laser 6000 Lumens', 'Kursi Lipat 350 Set'],
        penanggungJawab: 'Subhan Hartono, S.Pd.',
        statusPemakaian: 'Tersedia'
      },
      {
        id: 'RNG-05',
        kodeRuang: 'R-KLAS-X1',
        namaRuang: 'Ruang Kelas X-1 (Rombel Unggulan)',
        kategoriRuang: 'Ruang Kelas',
        luasM2: 64,
        kapasitasSiswa: 32,
        lokasiGedung: 'Gedung A - Lantai 1',
        kondisiRuang: 'Sangat Baik',
        fasilitasUtama: ['32 Set Meja-Kursi Siswa', 'Smart TV 65 Inch', 'Papan Whiteboard 240cm', 'Loker Siswa', 'Kipas Angin Dinding'],
        penanggungJawab: 'Wali Kelas X-1',
        statusPemakaian: 'Sedang Digunakan'
      },
      {
        id: 'RNG-06',
        kodeRuang: 'R-GURU',
        namaRuang: 'Ruang Kerja Dewan Guru & Asesmen',
        kategoriRuang: 'Kantor & Guru',
        luasM2: 180,
        kapasitasSiswa: 50,
        lokasiGedung: 'Gedung Utama - Lantai 2',
        kondisiRuang: 'Baik',
        fasilitasUtama: ['Kubikel Kerja 36 Unit', 'AC Split 2 PK x 3', 'Dispenser Air Minum', 'Printer Jaringan', 'Ruang Tamu'],
        penanggungJawab: 'Drs. H. Bambang Sudirman, M.M.',
        statusPemakaian: 'Sedang Digunakan'
      }
    ];
  });

  // State 3: Peminjaman Barang
  const [loans, setLoans] = useState<PeminjamanBarang[]>(() => {
    const saved = ((k: string) => null as any)('simak_sarpras_loans');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse sarpras loans', e);
      }
    }
    return [
      {
        id: 'PINJ-001',
        noTransaksi: 'TRX-PJ-202609-01',
        namaPeminjam: 'Budi Santoso, M.Pd.',
        peranPeminjam: 'Guru',
        namaBarang: 'LCD Proyektor Epson EB-X500',
        jumlah: 1,
        tglPinjam: '2026-09-10 07:30',
        tglHarusKembali: '2026-09-10 14:00',
        keperluan: 'Presentasi Proyek P5 Kelas XI-2 topik Kewirausahaan',
        lokasiPenggunaan: 'Ruang Kelas XI-2',
        status: 'Dipinjam',
        petugas: 'Staf Sarpras (Rahmat Hidayat)'
      },
      {
        id: 'PINJ-002',
        noTransaksi: 'TRX-PJ-202609-02',
        namaPeminjam: 'Rizky Pratama (Ketua OSIS)',
        peranPeminjam: 'Siswa',
        namaBarang: 'Sound Portable Wireless + 2 Mic Wireless',
        jumlah: 1,
        tglPinjam: '2026-09-09 13:00',
        tglHarusKembali: '2026-09-09 16:30',
        tglPengembalian: '2026-09-09 16:45',
        keperluan: 'Latihan Orasi Pemilihan Ketua OSIS Masa Bakti 2026/2027',
        lokasiPenggunaan: 'Lapangan Upacara',
        status: 'Selesai Dikembalikan',
        kondisiSaatKembali: 'Baik',
        petugas: 'Staf Sarpras (Rahmat Hidayat)'
      },
      {
        id: 'PINJ-003',
        noTransaksi: 'TRX-PJ-202609-03',
        namaPeminjam: 'Nur Azizah, S.Pd.',
        peranPeminjam: 'Guru',
        namaBarang: 'Kabel Converter HDMI to VGA + Pointer Laser',
        jumlah: 1,
        tglPinjam: '2026-09-10 09:00',
        tglHarusKembali: '2026-09-10 11:30',
        keperluan: 'Asesmen Formatif Bahasa Inggris Kelas X-3',
        lokasiPenggunaan: 'Ruang Kelas X-3',
        status: 'Dipinjam',
        petugas: 'Staf Sarpras (Rahmat Hidayat)'
      }
    ];
  });

  // State 4: Tiket Perawatan & Pemeliharaan
  const [tickets, setTickets] = useState<PemeliharaanTiket[]>(() => {
    const saved = ((k: string) => null as any)('simak_sarpras_tickets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse sarpras tickets', e);
      }
    }
    return [
      {
        id: 'TKT-001',
        noTiket: 'TKT-PRW-202609-01',
        tglLapor: '2026-09-08',
        fasilitasBarang: 'AC Ruang Guru Split 2 PK (Daikin Inverter)',
        lokasi: 'Ruang Guru - Sisi Barat',
        pelapor: 'Dra. Sri Mulyani',
        deskripsiMasalah: 'Hembusan angin kurang dingin dan ada tetesan air kondensasi pipa (bocor air)',
        prioritas: 'Tinggi (Mendesak)',
        status: 'Sedang Diperbaiki',
        estimasiBiaya: 350000,
        teknisi: 'CV Sejuk Mandiri Teknik'
      },
      {
        id: 'TKT-002',
        noTiket: 'TKT-PRW-202609-02',
        tglLapor: '2026-09-09',
        fasilitasBarang: 'Lampu LED Tabung 18W T8',
        lokasi: 'Laboratorium Komputer 1',
        pelapor: 'Ahmad Fauzi, S.Kom.',
        deskripsiMasalah: '2 titik lampu plafon berkedip-kedip dan mengganggu pandangan layar monitor siswa',
        prioritas: 'Sedang',
        status: 'Menunggu Antrean',
        estimasiBiaya: 120000,
        teknisi: 'Tim Sarpras Sekolah (Pak Slamet)'
      },
      {
        id: 'TKT-003',
        noTiket: 'TKT-PRW-202608-05',
        tglLapor: '2026-08-25',
        fasilitasBarang: 'Kran Air Wastafel & Pipa Saluran Pembuangan',
        lokasi: 'Toilet Siswa Lantai 1',
        pelapor: 'Petugas Kebersihan',
        deskripsiMasalah: 'Kran air patah dan pipa saluran pembuangan sedikit tersumbat pasir',
        prioritas: 'Tinggi (Mendesak)',
        status: 'Selesai Perbaikan',
        estimasiBiaya: 185000,
        teknisi: 'Tim Sarpras Sekolah (Pak Slamet)',
        tglSelesai: '2026-08-26'
      }
    ];
  });

  // Save to localStorage when state changes
  const saveItems = (newItems: SarprasItem[]) => {
    setItems(newItems);
    ((k: string, v: string) => void 0)('simak_sarpras_items', JSON.stringify(newItems));
  };

  const saveLoans = (newLoans: PeminjamanBarang[]) => {
    setLoans(newLoans);
    ((k: string, v: string) => void 0)('simak_sarpras_loans', JSON.stringify(newLoans));
  };

  const saveTickets = (newTickets: PemeliharaanTiket[]) => {
    setTickets(newTickets);
    ((k: string, v: string) => void 0)('simak_sarpras_tickets', JSON.stringify(newTickets));
  };

  // Form states for adding new asset
  const [formKode, setFormKode] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formKategori, setFormKategori] = useState<SarprasItem['kategori']>('Elektronik & IT');
  const [formMerk, setFormMerk] = useState('');
  const [formJumlah, setFormJumlah] = useState<number>(1);
  const [formSatuan, setFormSatuan] = useState('Unit');
  const [formLokasi, setFormLokasi] = useState('Lab Komputer 1');
  const [formKondisi, setFormKondisi] = useState<SarprasItem['kondisi']>('Baik');
  const [formTahun, setFormTahun] = useState('2026');
  const [formSumber, setFormSumber] = useState<SarprasItem['sumberDana']>('Dana BOS');
  const [formHarga, setFormHarga] = useState<number>(0);
  const [formPJ, setFormPJ] = useState('');
  const [formCatatan, setFormCatatan] = useState('');

  // Form states for new Loan
  const [loanNamaPeminjam, setLoanNamaPeminjam] = useState('');
  const [loanPeran, setLoanPeran] = useState<'Guru' | 'Siswa' | 'Staf TU / Karyawan'>('Guru');
  const [loanBarang, setLoanBarang] = useState('');
  const [loanJumlah, setLoanJumlah] = useState<number>(1);
  const [loanTglKembali, setLoanTglKembali] = useState('2026-09-11 14:00');
  const [loanKeperluan, setLoanKeperluan] = useState('');
  const [loanLokasi, setLoanLokasi] = useState('Ruang Kelas');

  // Form states for new Ticket
  const [ticketFasilitas, setTicketFasilitas] = useState('');
  const [ticketLokasi, setTicketLokasi] = useState('Ruang Kelas X-1');
  const [ticketPelapor, setTicketPelapor] = useState(teacher?.name || 'Guru Pengampu');
  const [ticketDeskripsi, setTicketDeskripsi] = useState('');
  const [ticketPrioritas, setTicketPrioritas] = useState<PemeliharaanTiket['prioritas']>('Sedang');
  const [ticketEstimasi, setTicketEstimasi] = useState<number>(150000);
  const [ticketTeknisi, setTicketTeknisi] = useState('Tim Sarpras Internal');

  // Statistics calculation
  const totalItemCount = useMemo(() => items.reduce((acc, curr) => acc + curr.jumlah, 0), [items]);
  const totalAssetValue = useMemo(() => items.reduce((acc, curr) => acc + (curr.jumlah * (curr.hargaSatuan || 0)), 0), [items]);
  const baikCount = useMemo(() => items.filter(i => i.kondisi === 'Baik').reduce((acc, curr) => acc + curr.jumlah, 0), [items]);
  const rusakCount = useMemo(() => items.filter(i => i.kondisi !== 'Baik').reduce((acc, curr) => acc + curr.jumlah, 0), [items]);
  const activeLoansCount = useMemo(() => loans.filter(l => l.status === 'Dipinjam').length, [loans]);
  const activeTicketsCount = useMemo(() => tickets.filter(t => t.status !== 'Selesai Perbaikan').length, [tickets]);

  // Filtered Inventaris
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSearch = 
        item.namaBarang.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kodeBarang.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.merkModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.penanggungJawab.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = selectedCategoryFilter === 'Semua' || item.kategori === selectedCategoryFilter;
      const matchKondisi = selectedKondisiFilter === 'Semua' || item.kondisi === selectedKondisiFilter;
      const matchLokasi = selectedLokasiFilter === 'Semua' || item.lokasi === selectedLokasiFilter;

      return matchSearch && matchCategory && matchKondisi && matchLokasi;
    });
  }, [items, searchQuery, selectedCategoryFilter, selectedKondisiFilter, selectedLokasiFilter]);

  // Unique locations for filter dropdown
  const uniqueLocations = useMemo(() => {
    const locs = Array.from(new Set(items.map(i => i.lokasi)));
    return ['Semua', ...locs];
  }, [items]);

  // Handlers
  const handleSaveNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) {
      showToast('Nama barang wajib diisi!');
      return;
    }

    const newItem: SarprasItem = {
      id: `ITM-${Date.now().toString().slice(-4)}`,
      kodeBarang: formKode.trim() || `INV-${Date.now().toString().slice(-6)}`,
      namaBarang: formNama.trim(),
      kategori: formKategori,
      merkModel: formMerk.trim() || '-',
      jumlah: Number(formJumlah) || 1,
      satuan: formSatuan.trim() || 'Unit',
      lokasi: formLokasi.trim() || 'Gudang Sarpras',
      kondisi: formKondisi,
      tahunPerolehan: formTahun.trim() || '2026',
      sumberDana: formSumber,
      hargaSatuan: Number(formHarga) || 0,
      penanggungJawab: formPJ.trim() || teacher?.name || 'Staf Sarpras',
      catatan: formCatatan.trim()
    };

    saveItems([newItem, ...items]);
    setShowAddItemModal(false);
    showToast(`Aset baru "${newItem.namaBarang}" berhasil ditambahkan ke inventaris.`);

    // reset form
    setFormKode('');
    setFormNama('');
    setFormMerk('');
    setFormCatatan('');
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data inventaris "${name}"?`)) {
      const updated = items.filter(i => i.id !== id);
      saveItems(updated);
      showToast(`Barang "${name}" berhasil dihapus.`);
    }
  };

  const handleSaveLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanNamaPeminjam.trim() || !loanBarang.trim()) {
      showToast('Nama peminjam dan nama barang wajib diisi!');
      return;
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    const newLoan: PeminjamanBarang = {
      id: `PINJ-${Date.now().toString().slice(-4)}`,
      noTransaksi: `TRX-PJ-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}-${Date.now().toString().slice(-3)}`,
      namaPeminjam: loanNamaPeminjam.trim(),
      peranPeminjam: loanPeran,
      namaBarang: loanBarang.trim(),
      jumlah: Number(loanJumlah) || 1,
      tglPinjam: dateStr,
      tglHarusKembali: loanTglKembali,
      keperluan: loanKeperluan.trim() || 'Kegiatan Pembelajaran',
      lokasiPenggunaan: loanLokasi.trim() || 'Ruang Kelas',
      status: 'Dipinjam',
      petugas: teacher?.name || 'Petugas Sarpras'
    };

    saveLoans([newLoan, ...loans]);
    setShowAddLoanModal(false);
    showToast(`Peminjaman "${newLoan.namaBarang}" atas nama ${newLoan.namaPeminjam} berhasil dicatat.`);

    setLoanNamaPeminjam('');
    setLoanBarang('');
    setLoanKeperluan('');
  };

  const handleOpenReturnModal = (loan: PeminjamanBarang) => {
    setSelectedLoanForReturn(loan);
    setReturnCondition('Baik');
    setShowReturnModal(true);
  };

  const handleConfirmReturn = () => {
    if (!selectedLoanForReturn) return;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    const updated = loans.map(l => {
      if (l.id === selectedLoanForReturn.id) {
        return {
          ...l,
          status: 'Selesai Dikembalikan' as const,
          tglPengembalian: dateStr,
          kondisiSaatKembali: returnCondition
        };
      }
      return l;
    });

    saveLoans(updated);
    setShowReturnModal(false);
    setSelectedLoanForReturn(null);
    showToast('Pengembalian barang berhasil dikonfirmasi.');
  };

  const handleSaveTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketFasilitas.trim()) {
      showToast('Nama fasilitas/barang yang rusak wajib diisi!');
      return;
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

    const newTicket: PemeliharaanTiket = {
      id: `TKT-${Date.now().toString().slice(-4)}`,
      noTiket: `TKT-PRW-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}-${Date.now().toString().slice(-3)}`,
      tglLapor: dateStr,
      fasilitasBarang: ticketFasilitas.trim(),
      lokasi: ticketLokasi.trim(),
      pelapor: ticketPelapor.trim(),
      deskripsiMasalah: ticketDeskripsi.trim() || 'Perlu pengecekan dan perbaikan teknisi.',
      prioritas: ticketPrioritas,
      status: 'Menunggu Antrean',
      estimasiBiaya: Number(ticketEstimasi) || 0,
      teknisi: ticketTeknisi.trim()
    };

    saveTickets([newTicket, ...tickets]);
    setShowAddTicketModal(false);
    showToast(`Tiket laporan kerusakan "${newTicket.fasilitasBarang}" berhasil dibuat.`);

    setTicketFasilitas('');
    setTicketDeskripsi('');
  };

  const handleUpdateTicketStatus = (ticketId: string, newStatus: PemeliharaanTiket['status']) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: newStatus,
          tglSelesai: newStatus === 'Selesai Perbaikan' ? dateStr : t.tglSelesai
        };
      }
      return t;
    });

    saveTickets(updated);
    showToast(`Status tiket perbaikan diperbarui menjadi: ${newStatus}`);
  };

  const handlePrintKIR = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-12 w-full max-w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 bg-cyan-950 text-white px-4 py-2.5 rounded-none shadow-2xl border border-cyan-700 flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Page Header Banner */}
      <div className="bg-gradient-to-r from-cyan-900 via-cyan-800 to-cyan-950 text-white p-4 sm:p-5 border border-cyan-700/80 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-md rounded-none flex items-center justify-center border border-white/20 shrink-0">
              <Package className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-wide text-white">
                  Sistem Sarana & Prasarana (Sarpras)
                </h1>
                <span className="bg-amber-400 text-cyan-950 text-[10px] font-black px-2 py-0.5 rounded-none uppercase tracking-wider">
                  KIR & Aset Sekolah
                </span>
              </div>
              <p className="text-xs sm:text-sm text-cyan-100/90 mt-0.5 font-medium">
                Manajemen inventaris aset, fasilitas gedung/ruangan, peminjaman barang KBM, dan pemeliharaan sarpras.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handlePrintKIR}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/25 px-3 py-1.5 rounded-none text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Cetak Buku Inventaris & Laporan KIR"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-200" />
              <span>Cetak Rekap KIR</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddItemModal(true)}
              className="bg-amber-400 hover:bg-amber-300 text-cyan-950 font-black px-3 py-1.5 rounded-none text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tambah Aset Barang</span>
            </button>
          </div>
        </div>

        {/* Quick Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mt-4 pt-4 border-t border-cyan-700/60 text-xs">
          <div className="bg-cyan-950/60 p-2.5 border border-cyan-700/40">
            <div className="text-[10px] text-cyan-300 font-semibold uppercase tracking-wider">Total Item Fisik</div>
            <div className="text-base sm:text-lg font-black text-white mt-0.5">{totalItemCount} <span className="text-xs font-normal text-cyan-200">Unit</span></div>
          </div>
          <div className="bg-cyan-950/60 p-2.5 border border-cyan-700/40">
            <div className="text-[10px] text-cyan-300 font-semibold uppercase tracking-wider">Nilai Estimasi Aset</div>
            <div className="text-sm sm:text-base font-black text-amber-300 mt-0.5 truncate">
              Rp {totalAssetValue.toLocaleString('id-ID')}
            </div>
          </div>
          <div className="bg-cyan-950/60 p-2.5 border border-cyan-700/40">
            <div className="text-[10px] text-cyan-300 font-semibold uppercase tracking-wider">Kondisi Baik</div>
            <div className="text-base sm:text-lg font-black text-emerald-400 mt-0.5">{baikCount} <span className="text-xs font-normal text-cyan-200">Unit</span></div>
          </div>
          <div className="bg-cyan-950/60 p-2.5 border border-cyan-700/40">
            <div className="text-[10px] text-cyan-300 font-semibold uppercase tracking-wider">Perlu Perbaikan</div>
            <div className="text-base sm:text-lg font-black text-rose-400 mt-0.5">{rusakCount} <span className="text-xs font-normal text-cyan-200">Unit</span></div>
          </div>
          <div className="bg-cyan-950/60 p-2.5 border border-cyan-700/40">
            <div className="text-[10px] text-cyan-300 font-semibold uppercase tracking-wider">Total Ruangan</div>
            <div className="text-base sm:text-lg font-black text-white mt-0.5">{rooms.length} <span className="text-xs font-normal text-cyan-200">Ruang</span></div>
          </div>
          <div className="bg-cyan-950/60 p-2.5 border border-cyan-700/40">
            <div className="text-[10px] text-cyan-300 font-semibold uppercase tracking-wider">Peminjaman Aktif</div>
            <div className="text-base sm:text-lg font-black text-amber-300 mt-0.5">{activeLoansCount} <span className="text-xs font-normal text-cyan-200">Barang</span></div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="bg-white border border-slate-200 flex flex-wrap items-center gap-1 p-1.5 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('inventaris')}
          className={`px-3.5 py-2 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'inventaris'
              ? 'bg-[#164e63] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Daftar Inventaris Barang (KIR)</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-none font-bold ${activeTab === 'inventaris' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {items.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ruang')}
          className={`px-3.5 py-2 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'ruang'
              ? 'bg-[#164e63] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Ruang & Gedung Fasilitas</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-none font-bold ${activeTab === 'ruang' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {rooms.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('peminjaman')}
          className={`px-3.5 py-2 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'peminjaman'
              ? 'bg-[#164e63] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Peminjaman Sarpras KBM</span>
          {activeLoansCount > 0 && (
            <span className="bg-amber-400 text-cyan-950 text-[10px] font-black px-1.5 py-0.2 rounded-none">
              {activeLoansCount} Aktif
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pemeliharaan')}
          className={`px-3.5 py-2 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'pemeliharaan'
              ? 'bg-[#164e63] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Tiket Perbaikan & Pemeliharaan</span>
          {activeTicketsCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-none">
              {activeTicketsCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: INVENTARIS BARANG (KIR) */}
      {activeTab === 'inventaris' && (
        <div className="bg-white border border-slate-200 shadow-xs space-y-4 p-4">
          {/* Filter and Search Toolbar */}
          <div className="flex flex-col lg:flex-row gap-2.5 items-stretch lg:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama barang, kode barcode, merk, lokasi ruangan, penanggung jawab..."
                className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-none focus:outline-none focus:border-[#164e63] bg-slate-50 focus:bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-[11px]">Kategori:</span>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="px-2 py-1.5 text-xs border border-slate-300 rounded-none bg-white focus:outline-none focus:border-[#164e63]"
                >
                  <option value="Semua">Semua Kategori</option>
                  <option value="Elektronik & IT">Elektronik & IT</option>
                  <option value="Mebel & Perabot">Mebel & Perabot</option>
                  <option value="Alat Laboratorium">Alat Laboratorium</option>
                  <option value="Sarana Olahraga">Sarana Olahraga</option>
                  <option value="Media & Buku">Media & Buku</option>
                  <option value="Kebersihan & Umum">Kebersihan & Umum</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="font-semibold text-[11px]">Kondisi:</span>
                <select
                  value={selectedKondisiFilter}
                  onChange={(e) => setSelectedKondisiFilter(e.target.value)}
                  className="px-2 py-1.5 text-xs border border-slate-300 rounded-none bg-white focus:outline-none focus:border-[#164e63]"
                >
                  <option value="Semua">Semua Kondisi</option>
                  <option value="Baik">Baik</option>
                  <option value="Rusak Ringan">Rusak Ringan</option>
                  <option value="Rusak Berat">Rusak Berat</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="font-semibold text-[11px]">Lokasi:</span>
                <select
                  value={selectedLokasiFilter}
                  onChange={(e) => setSelectedLokasiFilter(e.target.value)}
                  className="px-2 py-1.5 text-xs border border-slate-300 rounded-none bg-white focus:outline-none focus:border-[#164e63]"
                >
                  {uniqueLocations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table of Inventaris */}
          <div className="overflow-x-auto border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#164e63] text-white font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">No</th>
                  <th className="py-2.5 px-3">Kode & Nama Barang</th>
                  <th className="py-2.5 px-3">Kategori & Spesifikasi</th>
                  <th className="py-2.5 px-3 text-center">Jumlah</th>
                  <th className="py-2.5 px-3">Lokasi Penempatan</th>
                  <th className="py-2.5 px-3">Kondisi</th>
                  <th className="py-2.5 px-3">Sumber & Thn</th>
                  <th className="py-2.5 px-3">PJ Ruang / Aset</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 text-center font-bold text-slate-500 text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>{item.namaBarang}</span>
                        </div>
                        <div className="text-[10px] text-cyan-800 font-mono mt-0.5 flex items-center gap-1">
                          <Barcode className="w-3 h-3 text-slate-400" />
                          <span>{item.kodeBarang}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded-none border border-slate-200 inline-block mb-0.5">
                          {item.kategori}
                        </span>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                          {item.merkModel}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                        {item.jumlah} <span className="text-[10px] font-normal text-slate-500">{item.satuan}</span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>{item.lokasi}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold border inline-flex items-center gap-1 ${
                          item.kondisi === 'Baik' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : item.kondisi === 'Rusak Ringan'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            item.kondisi === 'Baik' ? 'bg-emerald-500' : item.kondisi === 'Rusak Ringan' ? 'bg-amber-500' : 'bg-rose-500'
                          }`} />
                          {item.kondisi}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px]">
                        <div className="font-semibold text-slate-800">{item.sumberDana}</div>
                        <div className="text-[10px] text-slate-500">Tahun {item.tahunPerolehan}</div>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] font-medium text-slate-700">
                        {item.penanggungJawab}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedItemForDetail(item)}
                            className="p-1.5 text-cyan-700 hover:bg-cyan-50 border border-slate-200 transition-colors"
                            title="Lihat Detail & Cetak Label"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id, item.namaBarang)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                            title="Hapus Barang"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold">Tidak ada barang inventaris yang sesuai kriteria filter.</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Silakan sesuaikan kata kunci pencarian atau tambah barang baru.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Menampilkan {filteredItems.length} dari total {items.length} jenis barang terdata</span>
            <span>SIMAK Sarpras • Kartu Inventaris Ruangan (KIR) Standar Permendikbud</span>
          </div>
        </div>
      )}

      {/* TAB 2: RUANGAN & GEDUNG */}
      {activeTab === 'ruang' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#164e63]" />
                  <span>Daftar Ruang Belajar, Laboratorium & Fasilitas Gedung</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pemetaan kapasitas rombel, kondisi fisik ruang, fasilitas pendukung pembelajaran, dan penanggung jawab.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {rooms.map(room => (
                <div key={room.id} className="border border-slate-200 p-3.5 bg-slate-50/50 hover:bg-white hover:border-[#164e63]/40 transition-all space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[9px] font-mono font-bold bg-cyan-100 text-[#164e63] px-1.5 py-0.2 uppercase border border-cyan-200">
                        {room.kodeRuang}
                      </span>
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm mt-1 leading-snug">
                        {room.namaRuang}
                      </h3>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-bold border shrink-0 ${
                      room.statusPemakaian === 'Tersedia'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : room.statusPemakaian === 'Sedang Digunakan'
                        ? 'bg-cyan-50 text-[#164e63] border-cyan-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {room.statusPemakaian}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-white p-2 border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Luas & Kapasitas</span>
                      <span className="font-bold text-slate-800">{room.luasM2} m² • {room.kapasitasSiswa} Orang</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Gedung / Lantai</span>
                      <span className="font-bold text-slate-800 truncate block">{room.lokasiGedung}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Fasilitas Utama:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {room.fasilitasUtama.map((f, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 border border-slate-200">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                    <span>PJ: <strong className="text-slate-700">{room.penanggungJawab}</strong></span>
                    <span className="text-emerald-700 font-bold">Kondisi: {room.kondisiRuang}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PEMINJAMAN SARPRAS */}
      {activeTab === 'peminjaman' && (
        <div className="bg-white border border-slate-200 shadow-xs space-y-4 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#164e63]" />
                <span>Log & Pelayanan Peminjaman Barang KBM</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitoring peminjaman LCD Proyektor, laptop, kabel presentasi, sound wireless, dan alat laboratorium.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddLoanModal(true)}
              className="bg-[#164e63] hover:bg-[#0e3846] text-white font-bold px-3 py-1.5 rounded-none text-xs flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Tambah Peminjaman</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#164e63] text-white font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">No. Transaksi</th>
                  <th className="py-2.5 px-3">Peminjam & Peran</th>
                  <th className="py-2.5 px-3">Barang & Jumlah</th>
                  <th className="py-2.5 px-3">Waktu Pinjam</th>
                  <th className="py-2.5 px-3">Batas Kembali</th>
                  <th className="py-2.5 px-3">Keperluan & Lokasi</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {loans.map(loan => (
                  <tr key={loan.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-600 text-[11px]">
                      {loan.noTransaksi}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{loan.namaPeminjam}</div>
                      <span className="text-[10px] text-cyan-800 font-medium">{loan.peranPeminjam}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-800">{loan.namaBarang}</div>
                      <div className="text-[10px] text-slate-500">{loan.jumlah} Unit</div>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600">
                      {loan.tglPinjam}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-rose-600 font-semibold">
                      {loan.tglHarusKembali}
                    </td>
                    <td className="py-2.5 px-3 text-[11px]">
                      <div className="font-medium text-slate-800">{loan.keperluan}</div>
                      <div className="text-[10px] text-slate-500">{loan.lokasiPenggunaan}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-bold border inline-block ${
                        loan.status === 'Selesai Dikembalikan'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : loan.status === 'Terlambat'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {loan.status === 'Dipinjam' ? (
                        <button
                          type="button"
                          onClick={() => handleOpenReturnModal(loan)}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-none shadow-xs transition-colors cursor-pointer"
                        >
                          Konfirmasi Kembali
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">
                          Selesai ({loan.kondisiSaatKembali || 'Baik'})
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PEMELIHARAAN & TIKET KERUSAKAN */}
      {activeTab === 'pemeliharaan' && (
        <div className="bg-white border border-slate-200 shadow-xs space-y-4 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-[#164e63]" />
                <span>Tiket Pemeliharaan, Servis & Laporan Kerusakan</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Alur pelaporan kerusakan fasilitas sekolah, penugasan teknisi, estimasi pembiayaan dana BOS/Komite, dan verifikasi perbaikan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddTicketModal(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-none text-xs flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Buat Laporan Kerusakan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tickets.map(ticket => (
              <div key={ticket.id} className="border border-slate-200 p-3.5 bg-slate-50/60 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[9px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.2">
                      {ticket.noTiket}
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm mt-1">
                      {ticket.fasilitasBarang}
                    </h3>
                  </div>
                  <span className={`px-2 py-0.5 text-[9px] font-bold border shrink-0 ${
                    ticket.prioritas === 'Tinggi (Mendesak)'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {ticket.prioritas}
                  </span>
                </div>

                <p className="text-xs text-slate-600 bg-white p-2.5 border border-slate-200 min-h-[48px]">
                  {ticket.deskripsiMasalah}
                </p>

                <div className="text-[11px] text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lokasi:</span>
                    <strong className="text-slate-800">{ticket.lokasi}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pelapor:</span>
                    <span className="text-slate-700">{ticket.pelapor} ({ticket.tglLapor})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Teknisi:</span>
                    <span className="text-slate-700">{ticket.teknisi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimasi Biaya:</span>
                    <strong className="text-emerald-700">Rp {ticket.estimasiBiaya.toLocaleString('id-ID')}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-[10px]">
                    <span className="text-slate-400 block">Status Saat Ini:</span>
                    <span className={`font-bold ${
                      ticket.status === 'Selesai Perbaikan' ? 'text-emerald-700' : ticket.status === 'Sedang Diperbaiki' ? 'text-cyan-800' : 'text-amber-700'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>

                  {ticket.status !== 'Selesai Perbaikan' && (
                    <div className="flex items-center gap-1">
                      {ticket.status === 'Menunggu Antrean' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateTicketStatus(ticket.id, 'Sedang Diperbaiki')}
                          className="px-2 py-1 bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-[10px] rounded-none cursor-pointer"
                        >
                          Mulai Servis
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleUpdateTicketStatus(ticket.id, 'Selesai Perbaikan')}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-none cursor-pointer"
                      >
                        Selesai
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: TAMBAH ASET BARANG */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-300 w-full max-w-2xl shadow-2xl p-5 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#164e63]" />
                <h3 className="font-bold text-sm sm:text-base text-slate-800">
                  Tambah Inventaris Aset Barang Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddItemModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewItem} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode Barang / Barcode (Otomatis jika kosong)</label>
                  <input
                    type="text"
                    value={formKode}
                    onChange={(e) => setFormKode(e.target.value)}
                    placeholder="Contoh: INV-ELK-2026-015"
                    className="w-full p-2 border border-slate-300 rounded-none focus:outline-none focus:border-[#164e63]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Barang <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    placeholder="Contoh: Smart TV 65 Inch Coocaa 4K"
                    className="w-full p-2 border border-slate-300 rounded-none focus:outline-none focus:border-[#164e63]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori Barang</label>
                  <select
                    value={formKategori}
                    onChange={(e) => setFormKategori(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-none bg-white focus:outline-none focus:border-[#164e63]"
                  >
                    <option value="Elektronik & IT">Elektronik & IT</option>
                    <option value="Mebel & Perabot">Mebel & Perabot</option>
                    <option value="Alat Laboratorium">Alat Laboratorium</option>
                    <option value="Sarana Olahraga">Sarana Olahraga</option>
                    <option value="Media & Buku">Media & Buku</option>
                    <option value="Kebersihan & Umum">Kebersihan & Umum</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Merk / Spesifikasi</label>
                  <input
                    type="text"
                    value={formMerk}
                    onChange={(e) => setFormMerk(e.target.value)}
                    placeholder="Contoh: UHD HDR HDMI Bluetooth"
                    className="w-full p-2 border border-slate-300 rounded-none focus:outline-none focus:border-[#164e63]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jumlah & Satuan</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={1}
                      value={formJumlah}
                      onChange={(e) => setFormJumlah(Number(e.target.value))}
                      className="w-20 p-2 border border-slate-300 rounded-none focus:outline-none focus:border-[#164e63]"
                    />
                    <input
                      type="text"
                      value={formSatuan}
                      onChange={(e) => setFormSatuan(e.target.value)}
                      placeholder="Unit/Set/Buah"
                      className="flex-1 p-2 border border-slate-300 rounded-none focus:outline-none focus:border-[#164e63]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lokasi Ruangan Penempatan</label>
                  <input
                    type="text"
                    value={formLokasi}
                    onChange={(e) => setFormLokasi(e.target.value)}
                    placeholder="Contoh: Ruang Kelas X-2"
                    className="w-full p-2 border border-slate-300 rounded-none focus:outline-none focus:border-[#164e63]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kondisi Fisik</label>
                  <select
                    value={formKondisi}
                    onChange={(e) => setFormKondisi(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-none bg-white focus:outline-none focus:border-[#164e63]"
                  >
                    <option value="Baik">Baik (Siap Pakai)</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Rusak Berat">Rusak Berat</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tahun Perolehan</label>
                  <input
                    type="text"
                    value={formTahun}
                    onChange={(e) => setFormTahun(e.target.value)}
                    placeholder="2026"
                    className="w-full p-2 border border-slate-300 rounded-none focus:outline-none focus:border-[#164e63]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sumber Pembiayaan</label>
                  <select
                    value={formSumber}
                    onChange={(e) => setFormSumber(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-none bg-white focus:outline-none focus:border-[#164e63]"
                  >
                    <option value="Dana BOS">Dana BOS</option>
                    <option value="Bantuan Pemerintah">Bantuan Pemerintah (DAK)</option>
                    <option value="Komite Sekolah">Komite Sekolah</option>
                    <option value="Hibah / Yayasan">Hibah / Yayasan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimasi Harga Satuan (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={formHarga}
                    onChange={(e) => setFormHarga(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-none focus:outline-none focus:border-[#164e63]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Penanggung Jawab Aset</label>
                  <input
                    type="text"
                    value={formPJ}
                    onChange={(e) => setFormPJ(e.target.value)}
                    placeholder="Nama Guru / Staf"
                    className="w-full p-2 border border-slate-300 rounded-none focus:outline-none focus:border-[#164e63]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan / Nomor Seri</label>
                <textarea
                  rows={2}
                  value={formCatatan}
                  onChange={(e) => setFormCatatan(e.target.value)}
                  placeholder="Keterangan kelengkapan kabel, adaptor, garansi resmi..."
                  className="w-full p-2 border border-slate-300 rounded-none focus:outline-none focus:border-[#164e63]"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#164e63] hover:bg-[#0e3846] text-white font-bold flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan ke Inventaris</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TAMBAH PEMINJAMAN */}
      {showAddLoanModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-300 w-full max-w-lg shadow-2xl p-5 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#164e63]" />
                <h3 className="font-bold text-sm sm:text-base text-slate-800">
                  Formulir Peminjaman Sarpras KBM
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddLoanModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLoan} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Peminjam <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={loanNamaPeminjam}
                  onChange={(e) => setLoanNamaPeminjam(e.target.value)}
                  placeholder="Contoh: Rina Melati, S.Pd."
                  className="w-full p-2 border border-slate-300 rounded-none focus:outline-none focus:border-[#164e63]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Peran Peminjam</label>
                  <select
                    value={loanPeran}
                    onChange={(e) => setLoanPeran(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-none bg-white focus:outline-none focus:border-[#164e63]"
                  >
                    <option value="Guru">Guru Pengampu</option>
                    <option value="Siswa">Siswa / Pengurus OSIS</option>
                    <option value="Staf TU / Karyawan">Staf TU / Karyawan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jumlah</label>
                  <input
                    type="number"
                    min={1}
                    value={loanJumlah}
                    onChange={(e) => setLoanJumlah(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-none focus:outline-none focus:border-[#164e63]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Barang yang Dipinjam <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={loanBarang}
                  onChange={(e) => setLoanBarang(e.target.value)}
                  placeholder="Contoh: LCD Proyektor Epson + Kabel VGA"
                  className="w-full p-2 border border-slate-300 rounded-none focus:outline-none focus:border-[#164e63]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Batas Waktu Pengembalian</label>
                  <input
                    type="text"
                    value={loanTglKembali}
                    onChange={(e) => setLoanTglKembali(e.target.value)}
                    placeholder="2026-09-11 14:00"
                    className="w-full p-2 border border-slate-300 rounded-none focus:outline-none focus:border-[#164e63]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lokasi Penggunaan</label>
                  <input
                    type="text"
                    value={loanLokasi}
                    onChange={(e) => setLoanLokasi(e.target.value)}
                    placeholder="Ruang Kelas X-2"
                    className="w-full p-2 border border-slate-300 rounded-none focus:outline-none focus:border-[#164e63]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tujuan / Keperluan Peminjaman</label>
                <textarea
                  rows={2}
                  value={loanKeperluan}
                  onChange={(e) => setLoanKeperluan(e.target.value)}
                  placeholder="Contoh: Tayang video materi sejarah Proklamasi kemerdekaan"
                  className="w-full p-2 border border-slate-300 rounded-none focus:outline-none focus:border-[#164e63]"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddLoanModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#164e63] hover:bg-[#0e3846] text-white font-bold"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: LAPOR TIKET KERUSAKAN */}
      {showAddTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-300 w-full max-w-lg shadow-2xl p-5 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-sm sm:text-base text-slate-800">
                  Lapor Kerusakan Sarana & Prasarana
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddTicketModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTicket} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Fasilitas / Barang yang Rusak <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={ticketFasilitas}
                  onChange={(e) => setTicketFasilitas(e.target.value)}
                  placeholder="Contoh: AC Split Lab Komputer / Kran Air Toilet"
                  className="w-full p-2 border border-slate-300 rounded-none focus:outline-none focus:border-[#164e63]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lokasi Ruangan</label>
                  <input
                    type="text"
                    value={ticketLokasi}
                    onChange={(e) => setTicketLokasi(e.target.value)}
                    placeholder="Contoh: Gedung B Lantai 2"
                    className="w-full p-2 border border-slate-300 rounded-none focus:outline-none focus:border-[#164e63]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tingkat Prioritas</label>
                  <select
                    value={ticketPrioritas}
                    onChange={(e) => setTicketPrioritas(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-none bg-white focus:outline-none focus:border-[#164e63]"
                  >
                    <option value="Tinggi (Mendesak)">Tinggi (Mendesak)</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Rendah">Rendah</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Kerusakan / Kendala</label>
                <textarea
                  rows={3}
                  value={ticketDeskripsi}
                  onChange={(e) => setTicketDeskripsi(e.target.value)}
                  placeholder="Jelaskan detail kerusakan fisik, bunyi abnormal, atau kendala operasional..."
                  className="w-full p-2 border border-slate-300 rounded-none focus:outline-none focus:border-[#164e63]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimasi Biaya Servis (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={ticketEstimasi}
                    onChange={(e) => setTicketEstimasi(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-none focus:outline-none focus:border-[#164e63]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Teknisi / Pelaksana</label>
                  <input
                    type="text"
                    value={ticketTeknisi}
                    onChange={(e) => setTicketTeknisi(e.target.value)}
                    placeholder="Tim Sarpras / Rekanan Luar"
                    className="w-full p-2 border border-slate-300 rounded-none focus:outline-none focus:border-[#164e63]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTicketModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Kirim Tiket Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: KONFIRMASI PENGEMBALIAN */}
      {showReturnModal && selectedLoanForReturn && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-slate-300 w-full max-w-md shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm sm:text-base text-slate-800">
                Konfirmasi Pengembalian Barang
              </h3>
              <button
                type="button"
                onClick={() => setShowReturnModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Peminjam:</span>
                <strong className="text-slate-800">{selectedLoanForReturn.namaPeminjam}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Barang:</span>
                <strong className="text-slate-800">{selectedLoanForReturn.namaBarang} ({selectedLoanForReturn.jumlah} Unit)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Waktu Pinjam:</span>
                <span className="text-slate-600">{selectedLoanForReturn.tglPinjam}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-700">Kondisi Barang Saat Dikembalikan:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Baik', 'Rusak', 'Ada Kendala'] as const).map((kond) => (
                  <button
                    key={kond}
                    type="button"
                    onClick={() => setReturnCondition(kond)}
                    className={`py-2 text-xs font-bold border transition-colors cursor-pointer ${
                      returnCondition === kond
                        ? 'bg-[#164e63] text-white border-[#164e63]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {kond}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReturnModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReturn}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Pengembalian</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: DETAIL ASET & CETAK LABEL BARCODE */}
      {selectedItemForDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-slate-300 w-full max-w-lg shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#164e63]" />
                <h3 className="font-bold text-sm sm:text-base text-slate-800">
                  Label Inventaris & Kartu Aset
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemForDetail(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Tag Asset */}
            <div className="border-2 border-dashed border-[#164e63] p-4 bg-cyan-50/30 space-y-2">
              <div className="text-center border-b border-slate-200 pb-2">
                <div className="text-[10px] font-bold text-cyan-900 tracking-wider uppercase">
                  {teacher?.schoolName || 'SMA ISLAM DIPONEGORO WAGIR'}
                </div>
                <div className="text-xs font-black text-slate-900">
                  KARTU INVENTARIS BARANG (KIB / KIR)
                </div>
              </div>

              <div className="text-center py-2 bg-white border border-slate-200">
                <div className="font-mono font-bold text-base tracking-widest text-[#164e63]">
                  {selectedItemForDetail.kodeBarang}
                </div>
                <div className="text-[10px] text-slate-400 tracking-tight font-mono">
                  ||||||| | ||||| |||||| |||| | |||||||| |||||
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">Nama Barang</span>
                  <strong className="text-slate-900">{selectedItemForDetail.namaBarang}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Kategori</span>
                  <span className="font-semibold">{selectedItemForDetail.kategori}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Merk / Tipe</span>
                  <span>{selectedItemForDetail.merkModel}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Lokasi Ruangan</span>
                  <strong className="text-cyan-900">{selectedItemForDetail.lokasi}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Tahun Perolehan</span>
                  <span>{selectedItemForDetail.tahunPerolehan} ({selectedItemForDetail.sumberDana})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Penanggung Jawab</span>
                  <span>{selectedItemForDetail.penanggungJawab}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedItemForDetail(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-[#164e63] hover:bg-[#0e3846] text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Label Barang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
