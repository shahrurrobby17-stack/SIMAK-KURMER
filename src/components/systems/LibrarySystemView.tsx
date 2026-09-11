import React, { useState, useMemo } from 'react';
import { 
  Library, 
  BookOpen, 
  Search, 
  Plus, 
  Filter, 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Users, 
  Calendar, 
  Tag, 
  FileText, 
  X, 
  Save, 
  Edit2, 
  Trash2, 
  Eye, 
  Barcode, 
  Bookmark, 
  RotateCcw, 
  ArrowRightLeft, 
  Sparkles, 
  Check, 
  UserCheck, 
  HelpCircle,
  ExternalLink,
  BookMarked
} from 'lucide-react';
import { UserAccount, TeacherProfile } from '../../types';

export interface BookItem {
  id: string;
  kodeBuku: string;
  isbn: string;
  judul: string;
  pengarang: string;
  penerbit: string;
  tahunTerbit: string;
  kategori: 'Buku Teks Kurikulum Merdeka' | 'Buku Referensi & Ensiklopedia' | 'Fiksi & Sastra' | 'Non-Fiksi Populer' | 'Karya Ilmiah & Jurnal' | 'Buku Keagamaan';
  rakLokasi: string;
  klasifikasiDDC: string;
  jumlahTotal: number;
  jumlahTersedia: number;
  kondisi: 'Sangat Baik' | 'Baik' | 'Perlu Perbaikan';
  deskripsi?: string;
  coverColor?: string;
}

export interface PeminjamanBuku {
  id: string;
  kodeTransaksi: string;
  kodeBuku: string;
  judulBuku: string;
  namaPeminjam: string;
  nomorIdentitas: string; // NIS atau NIP
  tipePeminjam: 'Siswa' | 'Guru' | 'Staf';
  kelasAtauUnit: string;
  tanggalPinjam: string;
  jatuhTempo: string;
  tanggalKembali?: string;
  status: 'Dipinjam' | 'Dikembalikan' | 'Terlambat';
  denda: number;
  catatan?: string;
}

export interface KunjunganPerpus {
  id: string;
  tanggal: string;
  waktu: string;
  nama: string;
  tipe: 'Siswa' | 'Guru' | 'Tamu Umum';
  kelasAtauInstansi: string;
  keperluan: 'Membaca di Tempat' | 'Meminjam / Mengembalikan' | 'Tugas Kelompok' | 'Akses E-Book / Komputer';
}

interface LibrarySystemViewProps {
  registeredUsers?: UserAccount[];
  teacher?: TeacherProfile;
  onNavigateTab?: (tab: any) => void;
}

const INITIAL_BOOKS: BookItem[] = [
  {
    id: 'BK-001',
    kodeBuku: 'BKM-MAT-10',
    isbn: '978-602-244-547-0',
    judul: 'Matematika Tingkat Lanjut SMA/MA Kelas X',
    pengarang: 'Dicky Susanto, dkk.',
    penerbit: 'Pusat Kurikulum dan Perbukuan Kemendikbudristek',
    tahunTerbit: '2023',
    kategori: 'Buku Teks Kurikulum Merdeka',
    rakLokasi: 'Rak A-01 (Matematika & Sains)',
    klasifikasiDDC: '510',
    jumlahTotal: 65,
    jumlahTersedia: 48,
    kondisi: 'Sangat Baik',
    deskripsi: 'Buku teks utama Kurikulum Merdeka Fase E kelas X matematika terintegrasi berpikir komputasional.',
    coverColor: 'bg-cyan-700'
  },
  {
    id: 'BK-002',
    kodeBuku: 'BKM-BIN-10',
    isbn: '978-602-244-325-4',
    judul: 'Cerdas Cergas Berbahasa dan Bersastra Indonesia Kelas X',
    pengarang: 'Fadilah Tri Aulia & Sefi Indra Gumilar',
    penerbit: 'Kemendikbudristek RI',
    tahunTerbit: '2023',
    kategori: 'Buku Teks Kurikulum Merdeka',
    rakLokasi: 'Rak A-02 (Bahasa & Sastra)',
    klasifikasiDDC: '410',
    jumlahTotal: 70,
    jumlahTersedia: 52,
    kondisi: 'Baik',
    deskripsi: 'Buku paket kurikulum merdeka penguasaan literasi teks observasi, negosiasi, dan biografi.',
    coverColor: 'bg-emerald-700'
  },
  {
    id: 'BK-003',
    kodeBuku: 'BKM-BIO-11',
    isbn: '978-602-244-678-1',
    judul: 'Biologi untuk SMA/MA Kelas XI Fase F',
    pengarang: 'Rini Solihat, dkk.',
    penerbit: 'Pusat Perbukuan Balitbangdiklat',
    tahunTerbit: '2023',
    kategori: 'Buku Teks Kurikulum Merdeka',
    rakLokasi: 'Rak A-03 (Biologi & Kimia)',
    klasifikasiDDC: '570',
    jumlahTotal: 50,
    jumlahTersedia: 36,
    kondisi: 'Sangat Baik',
    deskripsi: 'Materi sel, sistem organ tubuh manusia, genetika, dan ekosistem terpadu laboratorium.',
    coverColor: 'bg-teal-800'
  },
  {
    id: 'BK-004',
    kodeBuku: 'BKM-SEJ-10',
    isbn: '978-602-244-314-8',
    judul: 'Sejarah Indonesia: Menelusuri Jejak Peradaban Bangsa',
    pengarang: 'Sari Oktafiana',
    penerbit: 'Kemendikbudristek',
    tahunTerbit: '2022',
    kategori: 'Buku Teks Kurikulum Merdeka',
    rakLokasi: 'Rak B-01 (Sejarah & Sosial)',
    klasifikasiDDC: '959.8',
    jumlahTotal: 60,
    jumlahTersedia: 45,
    kondisi: 'Baik',
    deskripsi: 'Eksplorasi asal-usul nenek moyang, kerajaan maritim Nusantara hingga kemerdekaan.',
    coverColor: 'bg-amber-700'
  },
  {
    id: 'BK-005',
    kodeBuku: 'FIK-LP-01',
    isbn: '978-979-3062-79-2',
    judul: 'Laskar Pelangi',
    pengarang: 'Andrea Hirata',
    penerbit: 'Bentang Pustaka',
    tahunTerbit: '2020',
    kategori: 'Fiksi & Sastra',
    rakLokasi: 'Rak C-01 (Sastra & Novel)',
    klasifikasiDDC: '813',
    jumlahTotal: 15,
    jumlahTersedia: 4,
    kondisi: 'Baik',
    deskripsi: 'Novel inspiratif perjuangan sepuluh anak di Belitung dalam meraih cita-cita pendidikan.',
    coverColor: 'bg-indigo-700'
  },
  {
    id: 'BK-006',
    kodeBuku: 'REF-ENS-SAINS',
    isbn: '978-979-011-229-0',
    judul: 'Ensiklopedia Sains dan Teknologi Populer Jilid 1-4',
    pengarang: 'Tim Redaksi DK Publishing & Sains Edukasi',
    penerbit: 'Erlangga Mahameru',
    tahunTerbit: '2021',
    kategori: 'Buku Referensi & Ensiklopedia',
    rakLokasi: 'Rak D-01 (Referensi Meja Baca)',
    klasifikasiDDC: '503',
    jumlahTotal: 8,
    jumlahTersedia: 8,
    kondisi: 'Sangat Baik',
    deskripsi: 'Referensi komprehensif sains fisika, antariksa, robotika dan kecerdasan buatan.',
    coverColor: 'bg-blue-900'
  },
  {
    id: 'BK-007',
    kodeBuku: 'AGM-ISL-01',
    isbn: '978-602-244-688-0',
    judul: 'Pendidikan Agama Islam dan Budi Pekerti SMA Kelas X',
    pengarang: 'Ahmad Taufik & Nurwastuti Setyowati',
    penerbit: 'Kementerian Agama RI & Kemendikbud',
    tahunTerbit: '2023',
    kategori: 'Buku Keagamaan',
    rakLokasi: 'Rak E-01 (Koleksi Agama)',
    klasifikasiDDC: '297',
    jumlahTotal: 60,
    jumlahTersedia: 55,
    kondisi: 'Sangat Baik',
    deskripsi: 'Penanaman akhlak mulia, moderasi beragama, fikih ibadah dan sejarah peradaban Islam.',
    coverColor: 'bg-emerald-800'
  },
  {
    id: 'BK-008',
    kodeBuku: 'NF-ATOMIC',
    isbn: '978-602-06-3317-6',
    judul: 'Atomic Habits: Perubahan Kecil yang Memberikan Hasil Luar Biasa',
    pengarang: 'James Clear',
    penerbit: 'Gramedia Pustaka Utama',
    tahunTerbit: '2022',
    kategori: 'Non-Fiksi Populer',
    rakLokasi: 'Rak C-02 (Pengembangan Diri)',
    klasifikasiDDC: '158.1',
    jumlahTotal: 12,
    jumlahTersedia: 2,
    kondisi: 'Sangat Baik',
    deskripsi: 'Panduan membangun kebiasaan baik dan menghentikan kebiasaan buruk secara sistematis.',
    coverColor: 'bg-slate-800'
  }
];

const INITIAL_LOANS: PeminjamanBuku[] = [
  {
    id: 'LN-001',
    kodeTransaksi: 'TRX-PERPUS-20260901',
    kodeBuku: 'FIK-LP-01',
    judulBuku: 'Laskar Pelangi',
    namaPeminjam: 'Achmad Dani Syaifullah',
    nomorIdentitas: '10291',
    tipePeminjam: 'Siswa',
    kelasAtauUnit: 'X-MIPA-1',
    tanggalPinjam: '2026-09-02',
    jatuhTempo: '2026-09-09',
    status: 'Terlambat',
    denda: 3000,
    catatan: 'Terlambat 3 hari (denda Rp 1.000/hari)'
  },
  {
    id: 'LN-002',
    kodeTransaksi: 'TRX-PERPUS-20260902',
    kodeBuku: 'BKM-MAT-10',
    judulBuku: 'Matematika Tingkat Lanjut SMA/MA Kelas X',
    namaPeminjam: 'Aisyah Putri Azzahra',
    nomorIdentitas: '10295',
    tipePeminjam: 'Siswa',
    kelasAtauUnit: 'X-MIPA-2',
    tanggalPinjam: '2026-09-05',
    jatuhTempo: '2026-09-12',
    status: 'Dipinjam',
    denda: 0,
    catatan: 'Peminjaman rutin belajar mandiri'
  },
  {
    id: 'LN-003',
    kodeTransaksi: 'TRX-PERPUS-20260903',
    kodeBuku: 'NF-ATOMIC',
    judulBuku: 'Atomic Habits: Perubahan Kecil yang Memberikan Hasil Luar Biasa',
    namaPeminjam: 'Nur Azizah, S.Pd.',
    nomorIdentitas: '198804122019032008',
    tipePeminjam: 'Guru',
    kelasAtauUnit: 'Guru Bimbingan Konseling',
    tanggalPinjam: '2026-09-06',
    jatuhTempo: '2026-09-20',
    status: 'Dipinjam',
    denda: 0,
    catatan: 'Peminjaman tenaga pendidik (tempo 14 hari)'
  },
  {
    id: 'LN-004',
    kodeTransaksi: 'TRX-PERPUS-20260904',
    kodeBuku: 'BKM-BIO-11',
    judulBuku: 'Biologi untuk SMA/MA Kelas XI Fase F',
    namaPeminjam: 'Bagus Pratama Putra',
    nomorIdentitas: '10188',
    tipePeminjam: 'Siswa',
    kelasAtauUnit: 'XI-IPA-1',
    tanggalPinjam: '2026-08-28',
    jatuhTempo: '2026-09-04',
    tanggalKembali: '2026-09-04',
    status: 'Dikembalikan',
    denda: 0,
    catatan: 'Buku dikembalikan tepat waktu dalam kondisi baik.'
  }
];

const INITIAL_VISITS: KunjunganPerpus[] = [
  {
    id: 'VST-001',
    tanggal: '2026-09-10',
    waktu: '08:15',
    nama: 'Muhammad Raihan',
    tipe: 'Siswa',
    kelasAtauInstansi: 'X-MIPA-1',
    keperluan: 'Membaca di Tempat'
  },
  {
    id: 'VST-002',
    tanggal: '2026-09-10',
    waktu: '09:30',
    nama: 'Dewi Sartika',
    tipe: 'Siswa',
    kelasAtauInstansi: 'X-IPS-2',
    keperluan: 'Meminjam / Mengembalikan'
  },
  {
    id: 'VST-003',
    tanggal: '2026-09-10',
    waktu: '10:45',
    nama: 'Drs. Supardi, M.Pd.',
    tipe: 'Guru',
    kelasAtauInstansi: 'Guru Bahasa Indonesia',
    keperluan: 'Akses E-Book / Komputer'
  },
  {
    id: 'VST-004',
    tanggal: '2026-09-10',
    waktu: '11:20',
    nama: 'Kelompok 3 Fisika Kelas XI',
    tipe: 'Siswa',
    kelasAtauInstansi: 'XI-IPA-2',
    keperluan: 'Tugas Kelompok'
  }
];

export const LibrarySystemView: React.FC<LibrarySystemViewProps> = ({
  registeredUsers = [],
  teacher,
  onNavigateTab
}) => {
  const [activeTab, setActiveTab] = useState<'koleksi' | 'sirkulasi' | 'kunjungan' | 'kartu' | 'digital'>('koleksi');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('Semua');
  const [selectedRakFilter, setSelectedRakFilter] = useState<string>('Semua');
  const [selectedKetersediaanFilter, setSelectedKetersediaanFilter] = useState<string>('Semua');

  // Modals state
  const [showAddBookModal, setShowAddBookModal] = useState<boolean>(false);
  const [showAddLoanModal, setShowAddLoanModal] = useState<boolean>(false);
  const [showAddVisitModal, setShowAddVisitModal] = useState<boolean>(false);
  const [selectedBookForDetail, setSelectedBookForDetail] = useState<BookItem | null>(null);
  const [selectedCardUser, setSelectedCardUser] = useState<string>('Achmad Dani Syaifullah (10291 - X-MIPA-1)');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // State: Buku Koleksi (with localStorage)
  const [books, setBooks] = useState<BookItem[]>(() => {
    const saved = localStorage.getItem('simak_library_books');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse books', e);
      }
    }
    return INITIAL_BOOKS;
  });

  // State: Sirkulasi Peminjaman (with localStorage)
  const [loans, setLoans] = useState<PeminjamanBuku[]>(() => {
    const saved = localStorage.getItem('simak_library_loans');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse loans', e);
      }
    }
    return INITIAL_LOANS;
  });

  // State: Kunjungan Harian (with localStorage)
  const [visits, setVisits] = useState<KunjunganPerpus[]>(() => {
    const saved = localStorage.getItem('simak_library_visits');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse visits', e);
      }
    }
    return INITIAL_VISITS;
  });

  // Save to localStorage
  const saveBooks = (newBooks: BookItem[]) => {
    setBooks(newBooks);
    localStorage.setItem('simak_library_books', JSON.stringify(newBooks));
  };

  const saveLoans = (newLoans: PeminjamanBuku[]) => {
    setLoans(newLoans);
    localStorage.setItem('simak_library_loans', JSON.stringify(newLoans));
  };

  const saveVisits = (newVisits: KunjunganPerpus[]) => {
    setVisits(newVisits);
    localStorage.setItem('simak_library_visits', JSON.stringify(newVisits));
  };

  // Form states: New Book
  const [newBook, setNewBook] = useState<Partial<BookItem>>({
    kodeBuku: '',
    isbn: '',
    judul: '',
    pengarang: '',
    penerbit: '',
    tahunTerbit: '2024',
    kategori: 'Buku Teks Kurikulum Merdeka',
    rakLokasi: 'Rak A-01 (Matematika & Sains)',
    klasifikasiDDC: '500',
    jumlahTotal: 10,
    jumlahTersedia: 10,
    kondisi: 'Sangat Baik',
    deskripsi: ''
  });

  // Form states: New Loan
  const [newLoan, setNewLoan] = useState<Partial<PeminjamanBuku>>({
    kodeBuku: books[0]?.kodeBuku || '',
    judulBuku: books[0]?.judul || '',
    namaPeminjam: '',
    nomorIdentitas: '',
    tipePeminjam: 'Siswa',
    kelasAtauUnit: 'X-MIPA-1',
    tanggalPinjam: new Date().toISOString().slice(0, 10),
    jatuhTempo: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    catatan: ''
  });

  // Form states: New Visit
  const [newVisit, setNewVisit] = useState<Partial<KunjunganPerpus>>({
    tanggal: new Date().toISOString().slice(0, 10),
    waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    nama: '',
    tipe: 'Siswa',
    kelasAtauInstansi: 'X-MIPA-1',
    keperluan: 'Membaca di Tempat'
  });

  // Computed KPIs
  const totalJudul = books.length;
  const totalEksemplar = books.reduce((acc, b) => acc + (Number(b.jumlahTotal) || 0), 0);
  const totalDipinjam = loans.filter(l => l.status === 'Dipinjam' || l.status === 'Terlambat').length;
  const totalTerlambat = loans.filter(l => l.status === 'Terlambat').length;
  const kunjunganHariIni = visits.filter(v => v.tanggal === new Date().toISOString().slice(0, 10)).length;

  // Filtered books
  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        b.judul.toLowerCase().includes(q) ||
        b.pengarang.toLowerCase().includes(q) ||
        b.kodeBuku.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q) ||
        b.penerbit.toLowerCase().includes(q);

      const matchCat = selectedCategoryFilter === 'Semua' || b.kategori === selectedCategoryFilter;
      const matchRak = selectedRakFilter === 'Semua' || b.rakLokasi.includes(selectedRakFilter);
      
      let matchTersedia = true;
      if (selectedKetersediaanFilter === 'Tersedia') {
        matchTersedia = b.jumlahTersedia > 0;
      } else if (selectedKetersediaanFilter === 'Habis') {
        matchTersedia = b.jumlahTersedia === 0;
      }

      return matchSearch && matchCat && matchRak && matchTersedia;
    });
  }, [books, searchQuery, selectedCategoryFilter, selectedRakFilter, selectedKetersediaanFilter]);

  // Unique Raks
  const uniqueRaks = useMemo(() => {
    return Array.from(new Set(books.map(b => b.rakLokasi))).filter(Boolean);
  }, [books]);

  // Action: Add Book
  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.judul || !newBook.kodeBuku) {
      alert('Mohon isi Judul Buku dan Kode Buku!');
      return;
    }
    const created: BookItem = {
      id: `BK-${Date.now()}`,
      kodeBuku: newBook.kodeBuku.trim().toUpperCase(),
      isbn: newBook.isbn || '-',
      judul: newBook.judul.trim(),
      pengarang: newBook.pengarang || 'Anonim',
      penerbit: newBook.penerbit || 'Perpustakaan Sekolah',
      tahunTerbit: newBook.tahunTerbit || '2024',
      kategori: (newBook.kategori as any) || 'Buku Teks Kurikulum Merdeka',
      rakLokasi: newBook.rakLokasi || 'Rak Umum',
      klasifikasiDDC: newBook.klasifikasiDDC || '000',
      jumlahTotal: Number(newBook.jumlahTotal) || 1,
      jumlahTersedia: Number(newBook.jumlahTotal) || 1,
      kondisi: (newBook.kondisi as any) || 'Sangat Baik',
      deskripsi: newBook.deskripsi || '',
      coverColor: 'bg-cyan-800'
    };

    saveBooks([created, ...books]);
    setShowAddBookModal(false);
    setNewBook({
      kodeBuku: '',
      isbn: '',
      judul: '',
      pengarang: '',
      penerbit: '',
      tahunTerbit: '2024',
      kategori: 'Buku Teks Kurikulum Merdeka',
      rakLokasi: 'Rak A-01 (Matematika & Sains)',
      klasifikasiDDC: '500',
      jumlahTotal: 10,
      jumlahTersedia: 10,
      kondisi: 'Sangat Baik',
      deskripsi: ''
    });
    showToast('Buku baru berhasil ditambahkan ke katalog perpustakaan!');
  };

  // Action: Delete Book
  const handleDeleteBook = (id: string, judul: string) => {
    if (window.confirm(`Hapus buku "${judul}" dari katalog perpustakaan?`)) {
      saveBooks(books.filter(b => b.id !== id));
      showToast(`Buku "${judul}" telah dihapus.`);
    }
  };

  // Action: Add Loan
  const handleSaveLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoan.namaPeminjam || !newLoan.kodeBuku) {
      alert('Mohon lengkapi data peminjam dan buku!');
      return;
    }

    const matchedBook = books.find(b => b.kodeBuku === newLoan.kodeBuku);
    if (matchedBook && matchedBook.jumlahTersedia <= 0) {
      alert('Stok buku ini sedang habis dipinjam!');
      return;
    }

    const createdLoan: PeminjamanBuku = {
      id: `LN-${Date.now()}`,
      kodeTransaksi: `TRX-P-${Date.now().toString().slice(-6)}`,
      kodeBuku: newLoan.kodeBuku || '',
      judulBuku: matchedBook ? matchedBook.judul : (newLoan.judulBuku || 'Buku Referensi'),
      namaPeminjam: newLoan.namaPeminjam.trim(),
      nomorIdentitas: newLoan.nomorIdentitas || '-',
      tipePeminjam: (newLoan.tipePeminjam as any) || 'Siswa',
      kelasAtauUnit: newLoan.kelasAtauUnit || 'X-MIPA-1',
      tanggalPinjam: newLoan.tanggalPinjam || new Date().toISOString().slice(0, 10),
      jatuhTempo: newLoan.jatuhTempo || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      status: 'Dipinjam',
      denda: 0,
      catatan: newLoan.catatan || ''
    };

    // Kurangi stok buku tersedia
    if (matchedBook) {
      const updatedBooks = books.map(b => b.id === matchedBook.id ? { ...b, jumlahTersedia: Math.max(0, b.jumlahTersedia - 1) } : b);
      saveBooks(updatedBooks);
    }

    saveLoans([createdLoan, ...loans]);
    setShowAddLoanModal(false);
    showToast('Transaksi peminjaman buku berhasil dicatat!');
  };

  // Action: Return Book
  const handleReturnBook = (loan: PeminjamanBuku) => {
    if (window.confirm(`Proses pengembalian buku "${loan.judulBuku}" oleh ${loan.namaPeminjam}?`)) {
      const today = new Date().toISOString().slice(0, 10);
      const updatedLoans = loans.map(l => {
        if (l.id === loan.id) {
          return {
            ...l,
            status: 'Dikembalikan' as const,
            tanggalKembali: today
          };
        }
        return l;
      });
      saveLoans(updatedLoans);

      // Tambahkan stok buku kembali
      const matchedBook = books.find(b => b.kodeBuku === loan.kodeBuku);
      if (matchedBook) {
        const updatedBooks = books.map(b => b.id === matchedBook.id ? { ...b, jumlahTersedia: Math.min(b.jumlahTotal, b.jumlahTersedia + 1) } : b);
        saveBooks(updatedBooks);
      }

      showToast(`Buku "${loan.judulBuku}" berhasil dikembalikan!`);
    }
  };

  // Action: Add Visit
  const handleSaveVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisit.nama) {
      alert('Mohon isi nama pengunjung!');
      return;
    }
    const createdVisit: KunjunganPerpus = {
      id: `VST-${Date.now()}`,
      tanggal: newVisit.tanggal || new Date().toISOString().slice(0, 10),
      waktu: newVisit.waktu || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      nama: newVisit.nama.trim(),
      tipe: (newVisit.tipe as any) || 'Siswa',
      kelasAtauInstansi: newVisit.kelasAtauInstansi || 'X-MIPA-1',
      keperluan: (newVisit.keperluan as any) || 'Membaca di Tempat'
    };

    saveVisits([createdVisit, ...visits]);
    setShowAddVisitModal(false);
    setNewVisit({
      tanggal: new Date().toISOString().slice(0, 10),
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      nama: '',
      tipe: 'Siswa',
      kelasAtauInstansi: 'X-MIPA-1',
      keperluan: 'Membaca di Tempat'
    });
    showToast('Kunjungan perpustakaan berhasil dicatat ke buku tamu!');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['No', 'Kode Buku', 'ISBN', 'Judul Buku', 'Pengarang', 'Penerbit', 'Tahun', 'Kategori', 'Rak', 'Total', 'Tersedia'];
    const rows = books.map((b, idx) => [
      idx + 1,
      `"${b.kodeBuku}"`,
      `"${b.isbn}"`,
      `"${b.judul.replace(/"/g, '""')}"`,
      `"${b.pengarang.replace(/"/g, '""')}"`,
      `"${b.penerbit.replace(/"/g, '""')}"`,
      b.tahunTerbit,
      `"${b.kategori}"`,
      `"${b.rakLokasi}"`,
      b.jumlahTotal,
      b.jumlahTersedia
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Katalog_Perpustakaan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Katalog buku berhasil diekspor ke file CSV.');
  };

  // Print Catalog
  const handlePrintCatalog = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-white border border-cyan-300 shadow-2xl rounded-none p-3.5 flex items-center gap-3 animate-in fade-in zoom-in duration-200">
          <div className="w-8 h-8 rounded-full bg-cyan-700 text-white flex items-center justify-center shrink-0">
            <Check className="w-5 h-5 stroke-[3]" />
          </div>
          <p className="text-xs font-bold text-slate-800">{toastMessage}</p>
        </div>
      )}

      {/* Hero Header Perpustakaan */}
      <div className="bg-gradient-to-r from-cyan-900 via-cyan-800 to-teal-900 text-white p-4 sm:p-5 rounded-none shadow-sm border border-cyan-700/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-6 pointer-events-none">
          <Library className="w-48 h-48 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-amber-400 text-cyan-950 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              SISTEM PERPUSTAKAAN SEKOLAH MERDEKA
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Library className="w-6 h-6 text-amber-300 shrink-0" />
              Perpustakaan & Literasi Digital Sekolah
            </h1>
            <p className="text-xs text-cyan-100 max-w-2xl font-medium">
              Manajemen sirkulasi peminjaman, katalogisasi buku teks Kurikulum Merdeka, koleksi digital e-book, dan kartu anggota perpustakaan terpadu.
            </p>
          </div>

          {/* Quick Actions Header */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => setShowAddLoanModal(true)}
              className="px-3 py-2 bg-amber-400 hover:bg-amber-500 text-cyan-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Pinjam Buku</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddBookModal(true)}
              className="px-3 py-2 bg-white hover:bg-cyan-50 text-cyan-900 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-cyan-700" />
              <span>Tambah Buku</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddVisitModal(true)}
              className="px-3 py-2 bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs flex items-center gap-1.5 border border-cyan-500/40 shadow-sm transition-all cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-cyan-200" />
              <span>Buku Tamu</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
        <div className="bg-white p-3.5 border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-50 text-cyan-800 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">Total Judul Buku</div>
            <div className="text-lg font-black text-slate-900">{totalJudul} <span className="text-xs font-semibold text-slate-500">Judul</span></div>
          </div>
        </div>

        <div className="bg-white p-3.5 border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">Total Eksemplar</div>
            <div className="text-lg font-black text-emerald-800">{totalEksemplar} <span className="text-xs font-semibold text-emerald-600">Buku</span></div>
          </div>
        </div>

        <div className="bg-white p-3.5 border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">Sedang Dipinjam</div>
            <div className="text-lg font-black text-amber-800">{totalDipinjam} <span className="text-xs font-semibold text-amber-600">Buku</span></div>
          </div>
        </div>

        <div className="bg-white p-3.5 border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">Lewat Jatuh Tempo</div>
            <div className="text-lg font-black text-rose-800">{totalTerlambat} <span className="text-xs font-semibold text-rose-600">Terlambat</span></div>
          </div>
        </div>

        <div className="bg-white p-3.5 border border-slate-200/90 shadow-2xs col-span-2 lg:col-span-1 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">Kunjungan Hari Ini</div>
            <div className="text-lg font-black text-indigo-800">{kunjunganHariIni} <span className="text-xs font-semibold text-indigo-600">Pengunjung</span></div>
          </div>
        </div>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="bg-white border border-slate-200 shadow-2xs flex items-center justify-between overflow-x-auto">
        <div className="flex items-center min-w-max">
          <button
            type="button"
            onClick={() => setActiveTab('koleksi')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'koleksi'
                ? 'border-cyan-800 text-cyan-900 bg-cyan-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Katalog Koleksi Buku</span>
            <span className="bg-cyan-100 text-cyan-800 text-[10px] px-1.5 py-0.2 rounded-none font-black">{books.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sirkulasi')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'sirkulasi'
                ? 'border-cyan-800 text-cyan-900 bg-cyan-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Sirkulasi & Peminjaman</span>
            {totalTerlambat > 0 && (
              <span className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.2 rounded-none font-black">{totalTerlambat}</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kunjungan')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'kunjungan'
                ? 'border-cyan-800 text-cyan-900 bg-cyan-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Buku Tamu Pengunjung</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kartu')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'kartu'
                ? 'border-cyan-800 text-cyan-900 bg-cyan-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Barcode className="w-4 h-4" />
            <span>Cetak Kartu Anggota</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('digital')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'digital'
                ? 'border-cyan-800 text-cyan-900 bg-cyan-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Bookmark className="w-4 h-4 text-amber-600" />
            <span>E-Perpustakaan (Digital)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
            title="Ekspor CSV Data Perpustakaan"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ekspor CSV</span>
          </button>
          <button
            type="button"
            onClick={handlePrintCatalog}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
            title="Cetak Laporan"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cetak</span>
          </button>
        </div>
      </div>

      {/* TAB 1: KATALOG KOLEKSI BUKU */}
      {activeTab === 'koleksi' && (
        <div className="space-y-3">
          {/* Filter Bar */}
          <div className="bg-white p-3 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan judul buku, pengarang, ISBN, atau kode buku..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-none focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-700 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto shrink-0">
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-none font-semibold text-slate-700 focus:outline-none"
              >
                <option value="Semua">Semua Kategori</option>
                <option value="Buku Teks Kurikulum Merdeka">Buku Teks Kurikulum Merdeka</option>
                <option value="Buku Referensi & Ensiklopedia">Buku Referensi & Ensiklopedia</option>
                <option value="Fiksi & Sastra">Fiksi & Sastra</option>
                <option value="Non-Fiksi Populer">Non-Fiksi Populer</option>
                <option value="Karya Ilmiah & Jurnal">Karya Ilmiah & Jurnal</option>
                <option value="Buku Keagamaan">Buku Keagamaan</option>
              </select>

              <select
                value={selectedRakFilter}
                onChange={(e) => setSelectedRakFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-none font-semibold text-slate-700 focus:outline-none max-w-[150px] truncate"
              >
                <option value="Semua">Semua Rak</option>
                {uniqueRaks.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              <select
                value={selectedKetersediaanFilter}
                onChange={(e) => setSelectedKetersediaanFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-none font-semibold text-slate-700 focus:outline-none"
              >
                <option value="Semua">Ketersediaan: Semua</option>
                <option value="Tersedia">Stok Tersedia</option>
                <option value="Habis">Sedang Habis</option>
              </select>
            </div>
          </div>

          {/* Books Table */}
          <div className="bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-3.5 py-2.5 w-12 text-center">No</th>
                    <th className="px-3.5 py-2.5">Buku & Detail Informasi</th>
                    <th className="px-3.5 py-2.5">Kategori & DDC</th>
                    <th className="px-3.5 py-2.5">Lokasi Rak</th>
                    <th className="px-3.5 py-2.5 text-center">Stok / Tersedia</th>
                    <th className="px-3.5 py-2.5 text-center">Status</th>
                    <th className="px-3.5 py-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBooks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">
                        <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-bold text-xs text-slate-500">Tidak ada buku yang cocok dengan pencarian.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredBooks.map((book, idx) => (
                      <tr key={book.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-3.5 py-3 text-center text-slate-500 font-semibold">{idx + 1}</td>
                        <td className="px-3.5 py-3">
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-10 ${book.coverColor || 'bg-cyan-800'} text-white shrink-0 flex items-center justify-center shadow-2xs`}>
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 text-xs leading-snug">{book.judul}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                <span className="font-medium text-slate-700">{book.pengarang}</span> • {book.penerbit} ({book.tahunTerbit})
                              </div>
                              <div className="text-[10px] font-mono text-cyan-800 mt-0.5 font-bold">
                                Kode: {book.kodeBuku} • ISBN: {book.isbn}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3.5 py-3">
                          <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {book.kategori}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-1 font-mono">DDC: {book.klasifikasiDDC}</div>
                        </td>
                        <td className="px-3.5 py-3 font-semibold text-slate-700">
                          {book.rakLokasi}
                        </td>
                        <td className="px-3.5 py-3 text-center">
                          <span className="font-black text-slate-900">{book.jumlahTersedia}</span>
                          <span className="text-slate-400 font-semibold text-[11px]"> / {book.jumlahTotal}</span>
                        </td>
                        <td className="px-3.5 py-3 text-center">
                          {book.jumlahTersedia > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Tersedia
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              Habis Dipinjam
                            </span>
                          )}
                        </td>
                        <td className="px-3.5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedBookForDetail(book)}
                              className="p-1 text-slate-600 hover:text-cyan-800 hover:bg-cyan-50 rounded-none cursor-pointer"
                              title="Lihat Detail & Barcode"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setNewLoan(prev => ({
                                  ...prev,
                                  kodeBuku: book.kodeBuku,
                                  judulBuku: book.judul
                                }));
                                setShowAddLoanModal(true);
                              }}
                              disabled={book.jumlahTersedia <= 0}
                              className="p-1 text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-none disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              title="Pinjamkan Buku Ini"
                            >
                              <ArrowRightLeft className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBook(book.id, book.judul)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-none cursor-pointer"
                              title="Hapus Buku"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SIRKULASI & PEMINJAMAN */}
      {activeTab === 'sirkulasi' && (
        <div className="space-y-3">
          <div className="bg-white p-3.5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-cyan-800" />
                Catatan Peminjaman & Pengembalian Buku
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">Batas peminjaman standar: 7 hari untuk siswa, 14 hari untuk guru. Denda keterlambatan Rp 1.000 / hari.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddLoanModal(true)}
              className="px-3 py-1.5 bg-cyan-800 hover:bg-cyan-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Peminjaman</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-3.5 py-2.5">No. Transaksi</th>
                    <th className="px-3.5 py-2.5">Peminjam</th>
                    <th className="px-3.5 py-2.5">Buku yang Dipinjam</th>
                    <th className="px-3.5 py-2.5">Tgl Pinjam</th>
                    <th className="px-3.5 py-2.5">Jatuh Tempo</th>
                    <th className="px-3.5 py-2.5 text-center">Status</th>
                    <th className="px-3.5 py-2.5 text-center">Denda</th>
                    <th className="px-3.5 py-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loans.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-400">
                        Belum ada data peminjaman buku.
                      </td>
                    </tr>
                  ) : (
                    loans.map((loan) => (
                      <tr key={loan.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-3.5 py-3 font-mono font-bold text-[11px] text-slate-800">
                          {loan.kodeTransaksi}
                        </td>
                        <td className="px-3.5 py-3">
                          <div className="font-bold text-slate-900">{loan.namaPeminjam}</div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            {loan.tipePeminjam} • {loan.kelasAtauUnit} ({loan.nomorIdentitas})
                          </div>
                        </td>
                        <td className="px-3.5 py-3">
                          <div className="font-semibold text-slate-800 line-clamp-1">{loan.judulBuku}</div>
                          <div className="text-[10px] font-mono text-cyan-800">{loan.kodeBuku}</div>
                        </td>
                        <td className="px-3.5 py-3 font-medium text-slate-600">{loan.tanggalPinjam}</td>
                        <td className="px-3.5 py-3">
                          <div className={`font-semibold ${loan.status === 'Terlambat' ? 'text-rose-700' : 'text-slate-700'}`}>
                            {loan.jatuhTempo}
                          </div>
                        </td>
                        <td className="px-3.5 py-3 text-center">
                          {loan.status === 'Dikembalikan' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Kembali
                            </span>
                          ) : loan.status === 'Terlambat' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              Terlambat
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Dipinjam
                            </span>
                          )}
                        </td>
                        <td className="px-3.5 py-3 text-center font-bold text-slate-800">
                          {loan.denda > 0 ? (
                            <span className="text-rose-700 font-black">Rp {loan.denda.toLocaleString('id-ID')}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-3.5 py-3 text-right">
                          {loan.status !== 'Dikembalikan' ? (
                            <button
                              type="button"
                              onClick={() => handleReturnBook(loan)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs ml-auto cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Kembalikan</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Selesai</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BUKU TAMU PENGUNJUNG */}
      {activeTab === 'kunjungan' && (
        <div className="space-y-3">
          <div className="bg-white p-3.5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-800" />
                Buku Tamu Kunjungan Perpustakaan Harian
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">Pencatatan statistik kunjungan literasi siswa dan tenaga pendidik sekolah.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddVisitModal(true)}
              className="px-3 py-1.5 bg-cyan-800 hover:bg-cyan-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Isi Buku Tamu</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-3.5 py-2.5 w-12 text-center">No</th>
                    <th className="px-3.5 py-2.5">Tanggal & Waktu</th>
                    <th className="px-3.5 py-2.5">Nama Pengunjung</th>
                    <th className="px-3.5 py-2.5">Status & Kelas / Unit</th>
                    <th className="px-3.5 py-2.5">Tujuan & Keperluan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visits.map((v, idx) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3.5 py-3 text-center text-slate-500 font-semibold">{idx + 1}</td>
                      <td className="px-3.5 py-3 font-semibold text-slate-700">
                        {v.tanggal} • <span className="text-cyan-800 font-mono">{v.waktu} WIB</span>
                      </td>
                      <td className="px-3.5 py-3 font-bold text-slate-900">{v.nama}</td>
                      <td className="px-3.5 py-3">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-cyan-50 text-cyan-900 border border-cyan-200 mr-1.5">
                          {v.tipe}
                        </span>
                        <span className="text-slate-600 font-medium">{v.kelasAtauInstansi}</span>
                      </td>
                      <td className="px-3.5 py-3 font-semibold text-slate-800">{v.keperluan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CETAK KARTU ANGGOTA */}
      {activeTab === 'kartu' && (
        <div className="space-y-4">
          <div className="bg-white p-4 border border-slate-200/90 shadow-2xs">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-1">
              <Barcode className="w-4 h-4 text-cyan-800" />
              Generator & Preview Kartu Anggota Perpustakaan
            </h2>
            <p className="text-[11px] text-slate-500 font-medium mb-3">
              Cetak kartu anggota perpustakaan resmi yang dilengkapi barcode peminjaman otomatis.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <input
                type="text"
                value={selectedCardUser}
                onChange={(e) => setSelectedCardUser(e.target.value)}
                placeholder="Masukkan Nama, NIS/NIP, dan Kelas..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 font-medium"
              />
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-cyan-800 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Kartu</span>
              </button>
            </div>
          </div>

          {/* Kartu Preview Visual */}
          <div className="flex justify-center p-4">
            <div className="w-full max-w-md bg-gradient-to-br from-cyan-950 via-cyan-900 to-teal-950 text-white p-5 rounded-none shadow-xl border-2 border-amber-400 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-cyan-700/60 pb-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-white text-cyan-950 flex items-center justify-center font-black text-xs p-1">
                    <Library className="w-6 h-6 text-cyan-900" />
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-amber-300 font-bold">KARTU ANGGOTA RESMI</div>
                    <div className="text-xs font-black text-white leading-tight">PERPUSTAKAAN SEKOLAH</div>
                    <div className="text-[9px] text-cyan-200">SMA ISLAM DIPONEGORO WAGIR</div>
                  </div>
                </div>
                <div className="text-right font-mono text-[9px] text-cyan-300">
                  AKTIF: 2026/2027
                </div>
              </div>

              <div className="space-y-2 py-1">
                <div>
                  <div className="text-[9px] text-cyan-300 uppercase font-bold">Nama Anggota</div>
                  <div className="text-sm font-black text-white tracking-wide">{selectedCardUser}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-[9px] text-cyan-300 uppercase font-bold">Hak Akses</div>
                    <div className="font-bold text-emerald-300">Peminjam Aktif (Maks 3 Buku)</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-cyan-300 uppercase font-bold">Masa Berlaku</div>
                    <div className="font-bold text-white">30 Juni 2027</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-cyan-800/80 flex items-center justify-between">
                <div className="bg-white p-1 text-slate-950 font-mono text-[9px] tracking-widest font-black inline-block">
                  ||||| | |||| ||| |||| | |||
                </div>
                <div className="text-[9px] text-cyan-300 italic">
                  Tunjukkan saat meminjam buku
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: E-PERPUSTAKAAN / DIGITAL */}
      {activeTab === 'digital' && (
        <div className="space-y-3">
          <div className="bg-white p-4 border border-slate-200/90 shadow-2xs">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-1">
              <Bookmark className="w-4 h-4 text-amber-600" />
              Koleksi E-Perpustakaan & Bahan Ajar Digital Merdeka
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              Akses cepat buku teks elektronik (Buku Sekolah Elektronik / BSE), modul ajar digital Kemendikbudristek, dan referensi multimedia.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="bg-white p-4 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold bg-cyan-100 text-cyan-800 px-2 py-0.5">E-Book PDF Resmi</span>
                  <span className="text-[10px] text-slate-400 font-mono">14.2 MB</span>
                </div>
                <h3 className="font-bold text-slate-900 text-xs mb-1">Buku Siswa Matematika Kelas X (Fase E)</h3>
                <p className="text-[11px] text-slate-500">Materi aljabar, trigonometri, vektor, dan analisis data statistika lengkap latihan soal.</p>
              </div>
              <a
                href="https://buku.kemdikbud.go.id"
                target="_blank"
                rel="noreferrer"
                className="w-full py-1.5 bg-cyan-800 hover:bg-cyan-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Baca E-Book Daring</span>
              </a>
            </div>

            <div className="bg-white p-4 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5">E-Book PDF Resmi</span>
                  <span className="text-[10px] text-slate-400 font-mono">18.5 MB</span>
                </div>
                <h3 className="font-bold text-slate-900 text-xs mb-1">Buku Siswa Bahasa Indonesia Kelas X</h3>
                <p className="text-[11px] text-slate-500">Penguasaan literasi membaca kritis, teks laporan eksposisi, dan apresiasi karya sastra.</p>
              </div>
              <a
                href="https://buku.kemdikbud.go.id"
                target="_blank"
                rel="noreferrer"
                className="w-full py-1.5 bg-cyan-800 hover:bg-cyan-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Baca E-Book Daring</span>
              </a>
            </div>

            <div className="bg-white p-4 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5">Portal Referensi</span>
                  <span className="text-[10px] text-slate-400 font-mono">Kemdikbudristek</span>
                </div>
                <h3 className="font-bold text-slate-900 text-xs mb-1">Sistem Informasi Perbukuan Indonesia (SIBI)</h3>
                <p className="text-[11px] text-slate-500">Portal katalog lengkap buku teks pendamping, buku non-teks literasi, dan audio book.</p>
              </div>
              <a
                href="https://buku.kemdikbud.go.id/katalog"
                target="_blank"
                rel="noreferrer"
                className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-cyan-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Kunjungi Portal SIBI</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: TAMBAH BUKU BARU */}
      {showAddBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150">
          <div className="bg-white max-w-lg w-full p-5 border border-slate-300 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-800" />
                Katalogisasi Buku Baru
              </h3>
              <button
                type="button"
                onClick={() => setShowAddBookModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Buku *</label>
                <input
                  type="text"
                  required
                  value={newBook.judul}
                  onChange={(e) => setNewBook({ ...newBook, judul: e.target.value })}
                  placeholder="Contoh: Fisika SMA/MA Kelas XI Fase F"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode Buku / Barcode *</label>
                  <input
                    type="text"
                    required
                    value={newBook.kodeBuku}
                    onChange={(e) => setNewBook({ ...newBook, kodeBuku: e.target.value })}
                    placeholder="BKM-FIS-11"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 font-mono uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor ISBN</label>
                  <input
                    type="text"
                    value={newBook.isbn}
                    onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                    placeholder="978-602-xxx-xxx"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Pengarang</label>
                  <input
                    type="text"
                    value={newBook.pengarang}
                    onChange={(e) => setNewBook({ ...newBook, pengarang: e.target.value })}
                    placeholder="Nama penulis / penyusun"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Penerbit</label>
                  <input
                    type="text"
                    value={newBook.penerbit}
                    onChange={(e) => setNewBook({ ...newBook, penerbit: e.target.value })}
                    placeholder="Kemendikbudristek / Penerbit"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tahun Terbit</label>
                  <input
                    type="text"
                    value={newBook.tahunTerbit}
                    onChange={(e) => setNewBook({ ...newBook, tahunTerbit: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Klasifikasi DDC</label>
                  <input
                    type="text"
                    value={newBook.klasifikasiDDC}
                    onChange={(e) => setNewBook({ ...newBook, klasifikasiDDC: e.target.value })}
                    placeholder="530"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jumlah Eksemplar</label>
                  <input
                    type="number"
                    min="1"
                    value={newBook.jumlahTotal}
                    onChange={(e) => setNewBook({ ...newBook, jumlahTotal: Number(e.target.value), jumlahTersedia: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori Buku</label>
                  <select
                    value={newBook.kategori}
                    onChange={(e) => setNewBook({ ...newBook, kategori: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 font-medium"
                  >
                    <option value="Buku Teks Kurikulum Merdeka">Buku Teks Kurikulum Merdeka</option>
                    <option value="Buku Referensi & Ensiklopedia">Buku Referensi & Ensiklopedia</option>
                    <option value="Fiksi & Sastra">Fiksi & Sastra</option>
                    <option value="Non-Fiksi Populer">Non-Fiksi Populer</option>
                    <option value="Karya Ilmiah & Jurnal">Karya Ilmiah & Jurnal</option>
                    <option value="Buku Keagamaan">Buku Keagamaan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lokasi Rak Simpan</label>
                  <input
                    type="text"
                    value={newBook.rakLokasi}
                    onChange={(e) => setNewBook({ ...newBook, rakLokasi: e.target.value })}
                    placeholder="Rak A-01"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddBookModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-800 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Buku</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TRANSAKSI PINJAM BUKU */}
      {showAddLoanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150">
          <div className="bg-white max-w-lg w-full p-5 border border-slate-300 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-cyan-800" />
                Formulir Peminjaman Buku
              </h3>
              <button
                type="button"
                onClick={() => setShowAddLoanModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLoan} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Buku yang Dipinjam *</label>
                <select
                  value={newLoan.kodeBuku}
                  onChange={(e) => {
                    const b = books.find(item => item.kodeBuku === e.target.value);
                    setNewLoan({
                      ...newLoan,
                      kodeBuku: e.target.value,
                      judulBuku: b?.judul || ''
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 font-semibold text-slate-800"
                >
                  {books.map(b => (
                    <option key={b.id} value={b.kodeBuku} disabled={b.jumlahTersedia <= 0}>
                      [{b.kodeBuku}] {b.judul} {b.jumlahTersedia <= 0 ? '(STOK HABIS)' : `(Tersedia: ${b.jumlahTersedia})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Peminjam *</label>
                  <input
                    type="text"
                    required
                    value={newLoan.namaPeminjam}
                    onChange={(e) => setNewLoan({ ...newLoan, namaPeminjam: e.target.value })}
                    placeholder="Nama siswa / guru"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIS / NIP</label>
                  <input
                    type="text"
                    value={newLoan.nomorIdentitas}
                    onChange={(e) => setNewLoan({ ...newLoan, nomorIdentitas: e.target.value })}
                    placeholder="Contoh: 10291"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Peminjam</label>
                  <select
                    value={newLoan.tipePeminjam}
                    onChange={(e) => setNewLoan({ ...newLoan, tipePeminjam: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 font-medium"
                  >
                    <option value="Siswa">Siswa</option>
                    <option value="Guru">Guru / Pendidik</option>
                    <option value="Staf">Staf TU / Karyawan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelas / Unit</label>
                  <input
                    type="text"
                    value={newLoan.kelasAtauUnit}
                    onChange={(e) => setNewLoan({ ...newLoan, kelasAtauUnit: e.target.value })}
                    placeholder="Contoh: X-MIPA-1"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Pinjam</label>
                  <input
                    type="date"
                    value={newLoan.tanggalPinjam}
                    onChange={(e) => setNewLoan({ ...newLoan, tanggalPinjam: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jatuh Tempo (Kembali)</label>
                  <input
                    type="date"
                    value={newLoan.jatuhTempo}
                    onChange={(e) => setNewLoan({ ...newLoan, jatuhTempo: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 font-medium font-bold text-rose-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddLoanModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-800 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Catat Peminjaman</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ISI BUKU TAMU */}
      {showAddVisitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150">
          <div className="bg-white max-w-md w-full p-5 border border-slate-300 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-cyan-800" />
                Catat Kunjungan Perpustakaan
              </h3>
              <button
                type="button"
                onClick={() => setShowAddVisitModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveVisit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Pengunjung *</label>
                <input
                  type="text"
                  required
                  value={newVisit.nama}
                  onChange={(e) => setNewVisit({ ...newVisit, nama: e.target.value })}
                  placeholder="Nama pengunjung"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={newVisit.tipe}
                    onChange={(e) => setNewVisit({ ...newVisit, tipe: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 font-medium"
                  >
                    <option value="Siswa">Siswa</option>
                    <option value="Guru">Guru / Pendidik</option>
                    <option value="Tamu Umum">Tamu Umum</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelas / Asal</label>
                  <input
                    type="text"
                    value={newVisit.kelasAtauInstansi}
                    onChange={(e) => setNewVisit({ ...newVisit, kelasAtauInstansi: e.target.value })}
                    placeholder="X-MIPA-1"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keperluan Kunjungan</label>
                <select
                  value={newVisit.keperluan}
                  onChange={(e) => setNewVisit({ ...newVisit, keperluan: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 font-medium"
                >
                  <option value="Membaca di Tempat">Membaca di Tempat</option>
                  <option value="Meminjam / Mengembalikan">Meminjam / Mengembalikan</option>
                  <option value="Tugas Kelompok">Tugas Kelompok</option>
                  <option value="Akses E-Book / Komputer">Akses E-Book / Komputer</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddVisitModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-800 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Kunjungan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: DETAIL BUKU & LABEL KATALOG */}
      {selectedBookForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150">
          <div className="bg-white max-w-md w-full p-5 border border-slate-300 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Barcode className="w-4 h-4 text-cyan-800" />
                Kartu Katalog & Barcode Buku
              </h3>
              <button
                type="button"
                onClick={() => setSelectedBookForDetail(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 border border-dashed border-slate-300 bg-slate-50 space-y-3">
              <div className="text-center pb-2 border-b border-slate-200">
                <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">PERPUSTAKAAN SEKOLAH</div>
                <div className="text-xs font-black text-slate-900 leading-snug mt-0.5">{selectedBookForDetail.judul}</div>
                <div className="text-[11px] text-slate-600">{selectedBookForDetail.pengarang} ({selectedBookForDetail.tahunTerbit})</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                <div>
                  <span className="text-slate-500">No. Panggil:</span> <strong className="font-mono text-cyan-900">{selectedBookForDetail.klasifikasiDDC}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Kode:</span> <strong className="font-mono">{selectedBookForDetail.kodeBuku}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Lokasi:</span> <strong>{selectedBookForDetail.rakLokasi}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Tersedia:</span> <strong>{selectedBookForDetail.jumlahTersedia} dari {selectedBookForDetail.jumlahTotal}</strong>
                </div>
              </div>

              <div className="text-center pt-2 border-t border-slate-200">
                <div className="font-mono text-sm tracking-widest font-black text-slate-950 bg-white p-1.5 border border-slate-200 inline-block">
                  *{selectedBookForDetail.kodeBuku}*
                </div>
                <div className="text-[9px] text-slate-400 mt-1">Tempelkan label ini pada punggung buku</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-cyan-800 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Label Punggung Buku</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
