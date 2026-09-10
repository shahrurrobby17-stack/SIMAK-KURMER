import React, { useState, useMemo } from 'react';
import { 
  Wallet, 
  CreditCard, 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  ArrowUpRight, 
  ArrowDownRight, 
  PieChart, 
  Download, 
  X, 
  Save, 
  Building2,
  Calendar
} from 'lucide-react';
import { UserAccount, TeacherProfile, Student } from '../../types';

interface FinanceSystemViewProps {
  registeredUsers?: UserAccount[];
  teacher?: TeacherProfile | null;
  students?: Student[];
  onNavigateTab?: (tab: any) => void;
  onOpenEditUserModal?: (user: UserAccount) => void;
  onOpenDeleteUserModal?: (user: UserAccount) => void;
  onOpenModuleModal?: (user: UserAccount, tab: any) => void;
  onSelectCategory?: (category: any) => void;
}

interface SppRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  month: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'Tunai' | 'Transfer Bank' | 'E-Wallet';
  status: 'Lunas' | 'Belum Lunas';
  receiptNo: string;
}

interface ExpenseRecord {
  id: string;
  date: string;
  title: string;
  category: 'Gaji & Honor' | 'Sarana & Prasarana' | 'Operasional & Listrik' | 'Kegiatan Siswa' | 'Modul & Kurikulum';
  source: 'Dana BOS' | 'Komite / SPP' | 'Bantuan Pemerintah';
  amount: number;
  recordedBy: string;
  notes: string;
}

export const FinanceSystemView: React.FC<FinanceSystemViewProps> = ({
  registeredUsers = [],
  teacher,
  students = [],
  onNavigateTab,
  onOpenEditUserModal,
  onOpenDeleteUserModal,
  onOpenModuleModal,
  onSelectCategory
}) => {
  const [activeTab, setActiveTab] = useState<'spp' | 'bos' | 'laporan'>('spp');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('Semua');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('Agustus 2026');

  // Initial SPP Data state
  const [sppRecords, setSppRecords] = useState<SppRecord[]>(() => {
    const months = ['Agustus 2026', 'Juli 2026', 'Juni 2026'];
    const sample: SppRecord[] = [];
    
    students.slice(0, 20).forEach((st, idx) => {
      sample.push({
        id: `SPP-${1000 + idx}`,
        studentId: st.id,
        studentName: st.name,
        className: st.className,
        month: 'Agustus 2026',
        amount: 350000,
        paymentDate: idx % 3 === 0 ? '2026-08-10' : idx % 2 === 0 ? '2026-08-15' : '-',
        paymentMethod: idx % 3 === 0 ? 'Transfer Bank' : 'Tunai',
        status: idx % 4 === 0 ? 'Belum Lunas' : 'Lunas',
        receiptNo: idx % 4 === 0 ? '-' : `KW-202608-${100 + idx}`
      });
    });

    if (sample.length === 0) {
      sample.push(
        { id: 'SPP-1001', studentId: 'STD-1', studentName: 'Ahmad Rizky Pratama', className: 'X-IPA 1', month: 'Agustus 2026', amount: 350000, paymentDate: '2026-08-10', paymentMethod: 'Transfer Bank', status: 'Lunas', receiptNo: 'KW-202608-101' },
        { id: 'SPP-1002', studentId: 'STD-2', studentName: 'Siti Nurhaliza', className: 'X-IPA 1', month: 'Agustus 2026', amount: 350000, paymentDate: '2026-08-12', paymentMethod: 'Tunai', status: 'Lunas', receiptNo: 'KW-202608-102' },
        { id: 'SPP-1003', studentId: 'STD-3', studentName: 'Budi Santoso', className: 'X-IPA 2', month: 'Agustus 2026', amount: 350000, paymentDate: '-', paymentMethod: 'Tunai', status: 'Belum Lunas', receiptNo: '-' }
      );
    }
    return sample;
  });

  // Initial Expenses Data state (Dana BOS & Operasional)
  const [expenseRecords, setExpenseRecords] = useState<ExpenseRecord[]>([
    { id: 'EXP-101', date: '2026-08-05', title: 'Honorarium Guru GTT & PTT Bulan Juli', category: 'Gaji & Honor', source: 'Dana BOS', amount: 18500000, recordedBy: 'Bendahara Sekolah', notes: 'Gaji 12 Pegawai Honorer' },
    { id: 'EXP-102', date: '2026-08-08', title: 'Pembelian Modul Ajar & Buku Kurikulum Merdeka', category: 'Modul & Kurikulum', source: 'Dana BOS', amount: 7200000, recordedBy: 'Operator Keuangan', notes: 'Buku Siswa Kelas X & XI' },
    { id: 'EXP-103', date: '2026-08-12', title: 'Pembayaran Tagihan Listrik & Internet Fiber 100Mbps', category: 'Operasional & Listrik', source: 'Komite / SPP', amount: 3400000, recordedBy: 'Bendahara Sekolah', notes: 'Tagihan Rutin Bulan Agustus' },
    { id: 'EXP-104', date: '2026-08-18', title: 'Pemeliharaan AC Laboratorium Komputer & WiFi', category: 'Sarana & Prasarana', source: 'Dana BOS', amount: 2800000, recordedBy: 'Pengelola Sarpras', notes: 'Service 4 Unit AC' },
    { id: 'EXP-105', date: '2026-08-20', title: 'Dukungan Dana Lomba Paskibra & Pramuka Siswa', category: 'Kegiatan Siswa', source: 'Komite / SPP', amount: 4500000, recordedBy: 'Pembina OSIS', notes: 'Akomodasi & Transportasi' }
  ]);

  // Modal States
  const [showPayModal, setShowPayModal] = useState<boolean>(false);
  const [selectedPaySpp, setSelectedPaySpp] = useState<SppRecord | null>(null);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New Expense Form State
  const [newExpense, setNewExpense] = useState({
    title: '',
    category: 'Gaji & Honor' as ExpenseRecord['category'],
    source: 'Dana BOS' as ExpenseRecord['source'],
    amount: '',
    notes: ''
  });

  // Pay Form State
  const [payForm, setPayForm] = useState({
    method: 'Tunai' as 'Tunai' | 'Transfer Bank' | 'E-Wallet',
    date: new Date().toISOString().split('T')[0]
  });

  // Notification timer
  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Class List
  const availableClasses = useMemo(() => {
    const list = Array.from(new Set(sppRecords.map(s => s.className))).filter(Boolean);
    return ['Semua', ...list];
  }, [sppRecords]);

  // Filtered SPP
  const filteredSppRecords = useMemo(() => {
    return sppRecords.filter(r => {
      const matchSearch = r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.receiptNo.toLowerCase().includes(searchQuery.toLowerCase());
      const matchClass = selectedClassFilter === 'Semua' || r.className === selectedClassFilter;
      const matchMonth = selectedMonthFilter === 'Semua' || r.month === selectedMonthFilter;
      return matchSearch && matchClass && matchMonth;
    });
  }, [sppRecords, searchQuery, selectedClassFilter, selectedMonthFilter]);

  // Financial Calculations
  const totalSppTarget = sppRecords.reduce((acc, r) => acc + r.amount, 0);
  const totalSppLunas = sppRecords.filter(r => r.status === 'Lunas').reduce((acc, r) => acc + r.amount, 0);
  const totalSppTunggakan = totalSppTarget - totalSppLunas;

  const totalExpense = expenseRecords.reduce((acc, r) => acc + r.amount, 0);
  const totalBosExpense = expenseRecords.filter(r => r.source === 'Dana BOS').reduce((acc, r) => acc + r.amount, 0);
  const totalKomiteExpense = expenseRecords.filter(r => r.source === 'Komite / SPP').reduce((acc, r) => acc + r.amount, 0);

  const saldoKasEst = totalSppLunas + 120000000 - totalExpense;

  // Handlers
  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaySpp) return;

    const receipt = `KW-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`;

    setSppRecords(prev => prev.map(item => {
      if (item.id === selectedPaySpp.id) {
        return {
          ...item,
          status: 'Lunas',
          paymentDate: payForm.date,
          paymentMethod: payForm.method,
          receiptNo: receipt
        };
      }
      return item;
    }));

    setNotification(`Pembayaran SPP untuk ${selectedPaySpp.studentName} berhasil dicatat! No. Kuintansi: ${receipt}`);
    setShowPayModal(false);
    setSelectedPaySpp(null);
  };

  const handleSaveAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.title.trim() || !newExpense.amount) return;

    const record: ExpenseRecord = {
      id: `EXP-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title: newExpense.title.trim(),
      category: newExpense.category,
      source: newExpense.source,
      amount: Number(newExpense.amount),
      recordedBy: teacher?.name || 'Bendahara Sekolah',
      notes: newExpense.notes.trim() || 'Pengeluaran operasional resmi'
    };

    setExpenseRecords(prev => [record, ...prev]);
    setNotification(`Pengeluaran "${record.title}" sebesar Rp ${record.amount.toLocaleString('id-ID')} berhasil disimpan!`);
    setShowAddExpenseModal(false);
    setNewExpense({
      title: '',
      category: 'Gaji & Honor',
      source: 'Dana BOS',
      amount: '',
      notes: ''
    });
  };

  const formatRupiah = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-none border border-slate-200 shadow-xs flex items-center gap-3.5 border-l-4 border-l-emerald-600">
          <div className="p-3 bg-emerald-50 text-emerald-700 shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Penerimaan SPP (Lunas)</div>
            <div className="text-lg font-black text-emerald-700">{formatRupiah(totalSppLunas)}</div>
            <div className="text-[10px] text-slate-500 font-medium">Tunggakan: <span className="text-rose-600 font-bold">{formatRupiah(totalSppTunggakan)}</span></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-none border border-slate-200 shadow-xs flex items-center gap-3.5 border-l-4 border-l-blue-600">
          <div className="p-3 bg-blue-50 text-blue-700 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Penerimaan Dana BOS</div>
            <div className="text-lg font-black text-blue-800">Rp 120.000.000</div>
            <div className="text-[10px] text-emerald-600 font-bold">Pencairan Tahap II (100%)</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-none border border-slate-200 shadow-xs flex items-center gap-3.5 border-l-4 border-l-rose-600">
          <div className="p-3 bg-rose-50 text-rose-700 shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Pengeluaran / RKAS</div>
            <div className="text-lg font-black text-rose-700">{formatRupiah(totalExpense)}</div>
            <div className="text-[10px] text-slate-500 font-medium">BOS: {formatRupiah(totalBosExpense)}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-none border border-slate-200 shadow-xs flex items-center gap-3.5 border-l-4 border-l-amber-500">
          <div className="p-3 bg-amber-50 text-amber-700 shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estimasi Saldo Kas Sekolah</div>
            <div className="text-lg font-black text-slate-800">{formatRupiah(saldoKasEst)}</div>
            <div className="text-[10px] text-emerald-700 font-bold">Kas Sehat & Terverifikasi</div>
          </div>
        </div>
      </div>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
          <button type="button" onClick={() => setNotification(null)} className="cursor-pointer text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TABS NAVIGATION */}
      <div className="bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center border-b border-slate-200 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('spp')}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'spp'
                ? 'border-[#004b87] text-[#004b87] bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Pembayaran SPP / Komite Siswa</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-extrabold rounded-none">
              {sppRecords.length} Siswa
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bos')}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'bos'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Pengeluaran Operasional & Dana BOS</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-none">
              {expenseRecords.length} Transaksi
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('laporan')}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'laporan'
                ? 'border-amber-600 text-amber-800 bg-amber-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Laporan & Arus Kas (Cashflow)</span>
          </button>

          <div className="ml-auto pr-3 py-1 flex items-center">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-none flex items-center gap-1.5 transition-all cursor-pointer border border-slate-300"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Cetak Ringkasan</span>
            </button>
          </div>
        </div>

        {/* TAB 1: PEMBAYARAN SPP */}
        {activeTab === 'spp' && (
          <div className="p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Daftar Tagihan & Pembayaran SPP Bulanan Siswa</h3>
                <p className="text-xs text-slate-500">Pencatatan pembayaran, status tunggakan, dan pencetakan kuitansi resmi.</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama siswa / kuitansi..."
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 text-xs w-48 sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 cursor-pointer"
                >
                  {availableClasses.map(c => (
                    <option key={c} value={c}>{c === 'Semua' ? 'Semua Kelas' : `Kelas ${c}`}</option>
                  ))}
                </select>

                <select
                  value={selectedMonthFilter}
                  onChange={(e) => setSelectedMonthFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <option value="Agustus 2026">Agustus 2026</option>
                  <option value="Juli 2026">Juli 2026</option>
                  <option value="Juni 2026">Juni 2026</option>
                </select>
              </div>
            </div>

            {/* SPP Table */}
            <div className="overflow-x-auto border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">No. Kuitansi</th>
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3">Bulan</th>
                    <th className="p-3">Nominal SPP</th>
                    <th className="p-3">Tgl Bayar</th>
                    <th className="p-3">Metode</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Aksi Transaksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSppRecords.length > 0 ? (
                    filteredSppRecords.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-[#004b87]">{r.receiptNo}</td>
                        <td className="p-3 font-bold text-slate-800">{r.studentName}</td>
                        <td className="p-3 font-semibold text-slate-700">{r.className}</td>
                        <td className="p-3 text-slate-600">{r.month}</td>
                        <td className="p-3 font-mono font-bold text-slate-800">{formatRupiah(r.amount)}</td>
                        <td className="p-3 font-mono text-slate-600">{r.paymentDate}</td>
                        <td className="p-3 text-slate-700">{r.paymentMethod}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 font-bold text-[10px] ${
                            r.status === 'Lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {r.status === 'Belum Lunas' ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPaySpp(r);
                                setShowPayModal(true);
                              }}
                              className="px-3 py-1 bg-[#004b87] hover:bg-blue-800 text-white font-bold text-[11px] cursor-pointer shadow-2xs transition-all flex items-center justify-center gap-1 mx-auto"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Bayar SPP</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setNotification(`Mencetak kuitansi resmi ${r.receiptNo} untuk ${r.studentName}...`);
                                window.print();
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] border border-slate-300 cursor-pointer flex items-center justify-center gap-1 mx-auto"
                            >
                              <Printer className="w-3 h-3 text-slate-600" />
                              <span>Cetak Kuitansi</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-slate-500">
                        Tidak ada data pembayaran SPP sesuai pencarian / filter saat ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PENGELUARAN DANA BOS & OPERASIONAL */}
        {activeTab === 'bos' && (
          <div className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Catatan Pengeluaran Operasional & Dana BOS (RKAS)</h3>
                <p className="text-xs text-slate-500">Pencatatan realisasi belanja sekolah untuk sarpras, honorarium, modul, dan operasional.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddExpenseModal(true)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Catatan Pengeluaran</span>
              </button>
            </div>

            {/* Expenses Table */}
            <div className="overflow-x-auto border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">ID Transaksi</th>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Uraian / Deskripsi Pengeluaran</th>
                    <th className="p-3">Kategori RKAS</th>
                    <th className="p-3">Sumber Dana</th>
                    <th className="p-3">Jumlah (Rp)</th>
                    <th className="p-3">Pencatat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenseRecords.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-700">{exp.id}</td>
                      <td className="p-3 font-mono text-slate-600">{exp.date}</td>
                      <td className="p-3 font-bold text-slate-800">
                        <div>{exp.title}</div>
                        <div className="text-[10px] text-slate-500 font-normal">{exp.notes}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-bold text-[10px]">
                          {exp.category}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 font-bold text-[10px] ${
                          exp.source === 'Dana BOS' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {exp.source}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-rose-700">{formatRupiah(exp.amount)}</td>
                      <td className="p-3 text-slate-600">{exp.recordedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: LAPORAN & CASHFLOW */}
        {activeTab === 'laporan' && (
          <div className="p-5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Rekapitulasi Arus Kas & Laporan Keuangan</h3>
                <p className="text-xs text-slate-500">Laporan realisasi anggaran sekolah untuk pelaporan kepala sekolah dan dinas pendidikan.</p>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-[#004b87] hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Laporan Keuangan PDF</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                  <span>Rincian Total Penerimaan Sekolah</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 bg-white border border-slate-200 font-medium">
                    <span>1. Penerimaan Dana BOS Tahap II</span>
                    <span className="font-bold font-mono text-emerald-700">Rp 120.000.000</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white border border-slate-200 font-medium">
                    <span>2. Penerimaan SPP & Komite Terbayar</span>
                    <span className="font-bold font-mono text-emerald-700">{formatRupiah(totalSppLunas)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-emerald-100 text-emerald-900 font-bold border border-emerald-300">
                    <span>TOTAL PENERIMAAN KAS</span>
                    <span className="font-mono">{formatRupiah(120000000 + totalSppLunas)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                  <ArrowDownRight className="w-4 h-4 text-rose-600" />
                  <span>Rincian Total Pengeluaran Sekolah</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 bg-white border border-slate-200 font-medium">
                    <span>1. Realisasi Dana BOS</span>
                    <span className="font-bold font-mono text-rose-700">{formatRupiah(totalBosExpense)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white border border-slate-200 font-medium">
                    <span>2. Realisasi Komite / SPP</span>
                    <span className="font-bold font-mono text-rose-700">{formatRupiah(totalKomiteExpense)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-rose-100 text-rose-900 font-bold border border-rose-300">
                    <span>TOTAL PENGELUARAN KAS</span>
                    <span className="font-mono">{formatRupiah(totalExpense)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: BAYAR SPP */}
      {showPayModal && selectedPaySpp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-300 w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#004b87] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm">Catat Pembayaran SPP Siswa</h3>
              </div>
              <button type="button" onClick={() => setShowPayModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 space-y-1 font-medium text-slate-800">
                <div><strong>Nama Siswa:</strong> {selectedPaySpp.studentName}</div>
                <div><strong>Kelas:</strong> {selectedPaySpp.className}</div>
                <div><strong>Bulan Tagihan:</strong> {selectedPaySpp.month}</div>
                <div><strong>Nominal Tagihan:</strong> <span className="font-mono font-bold text-blue-900">{formatRupiah(selectedPaySpp.amount)}</span></div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal Pembayaran</label>
                <input
                  type="date"
                  required
                  value={payForm.date}
                  onChange={(e) => setPayForm({ ...payForm, date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Metode Pembayaran</label>
                <select
                  value={payForm.method}
                  onChange={(e) => setPayForm({ ...payForm, method: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-bold cursor-pointer"
                >
                  <option value="Tunai">Tunai (Kasir Sekolah)</option>
                  <option value="Transfer Bank">Transfer Bank / VA</option>
                  <option value="E-Wallet">E-Wallet / QRIS</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#004b87] hover:bg-blue-800 text-white font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan & Terbitkan Kuitansi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH PENGELUARAN */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-300 w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-200" />
                <h3 className="font-bold text-sm">Catat Pengeluaran Operasional / BOS Baru</h3>
              </div>
              <button type="button" onClick={() => setShowAddExpenseModal(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddExpense} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Uraian / Nama Pengeluaran *</label>
                <input
                  type="text"
                  required
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  placeholder="Contoh: Pembelian Kertas HVS & Tinta Printer US"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori RKAS</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-bold cursor-pointer"
                  >
                    <option value="Gaji & Honor">Gaji & Honor</option>
                    <option value="Sarana & Prasarana">Sarana & Prasarana</option>
                    <option value="Operasional & Listrik">Operasional & Listrik</option>
                    <option value="Kegiatan Siswa">Kegiatan Siswa</option>
                    <option value="Modul & Kurikulum">Modul & Kurikulum</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sumber Dana</label>
                  <select
                    value={newExpense.source}
                    onChange={(e) => setNewExpense({ ...newExpense, source: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-bold cursor-pointer"
                  >
                    <option value="Dana BOS">Dana BOS</option>
                    <option value="Komite / SPP">Komite / SPP</option>
                    <option value="Bantuan Pemerintah">Bantuan Pemerintah</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nominal / Jumlah Pengeluaran (Rp) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  placeholder="Contoh: 1500000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan / Catatan Tambahan</label>
                <input
                  type="text"
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                  placeholder="Contoh: Pembelian untuk Ujian Semester"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Transaksi Pengeluaran</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
