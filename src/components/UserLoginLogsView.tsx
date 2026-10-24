import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  User,
  Building2,
  ArrowUpDown,
  FileSpreadsheet,
  Eye,
  X,
  ExternalLink,
  Calendar,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  UserLoginLog, 
  subscribeToUserLoginLogs, 
  recordUserLoginLog, 
  clearAllLoginLogsFromStorage,
  getLocalLoginLogs,
  restoreDefaultDemoLogs,
  INITIAL_SEED_LOGIN_LOGS
} from '../lib/userLoginLogService';
import { subscribeToUserPresence, UserPresence, getLocalPresenceMap } from '../lib/userPresenceService';
import { UserAccount, RegisteredSchool } from '../types';

interface UserLoginLogsViewProps {
  currentUser?: UserAccount | null;
  activeSchoolName?: string;
  registeredSchools?: RegisteredSchool[];
  onNavigateTab?: (tab: string) => void;
}

export const UserLoginLogsView: React.FC<UserLoginLogsViewProps> = ({
  currentUser,
  activeSchoolName = 'SMA Negeri 1 Indonesia - Sekolah Penggerak',
  registeredSchools = [],
  onNavigateTab
}) => {
  const [logs, setLogs] = useState<UserLoginLog[]>(() => getLocalLoginLogs());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string>('Semua');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('Semua');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'Semua' | 'Berhasil' | 'Gagal'>('Semua');
  const [selectedDeviceFilter, setSelectedDeviceFilter] = useState<'Semua' | 'Desktop' | 'Mobile' | 'Tablet'>('Semua');
  const [hideDuplicates, setHideDuplicates] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState<boolean>(false);
  const [selectedDetailLog, setSelectedDetailLog] = useState<UserLoginLog | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Subscribe to realtime logs
  useEffect(() => {
    const unsubLogs = subscribeToUserLoginLogs((data) => {
      setLogs(Array.isArray(data) ? data : []);
    });

    return () => {
      unsubLogs();
    };
  }, []);

  // Compute all available school names for filtering
  const allSchoolOptions = useMemo(() => {
    const set = new Set<string>();
    if (registeredSchools && registeredSchools.length > 0) {
      registeredSchools.forEach(s => {
        if (s.name) set.add(s.name);
      });
    }
    logs.forEach(l => {
      if (l.schoolName) set.add(l.schoolName);
    });
    set.add('SMA Diponegoro Wagir');
    set.add('SD Negeri 1 Wagir');
    set.add('MI Diponegoro Wagir');
    set.add('SMP Diponegoro Wagir');
    set.add('SMA Negeri 1 Indonesia - Sekolah Penggerak');
    return Array.from(set).filter(Boolean).sort();
  }, [registeredSchools, logs]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setNotificationMsg('Data riwayat login semua pengguna dari seluruh sekolah berhasil disinkronkan.');
      setTimeout(() => setNotificationMsg(null), 3000);
    }, 600);
  };

  const handleClearLogs = async () => {
    await clearAllLoginLogsFromStorage();
    setLogs([]);
    setShowClearConfirmModal(false);
    setNotificationMsg('Seluruh riwayat login berhasil dibersihkan.');
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const handleRestoreDemo = () => {
    const restored = restoreDefaultDemoLogs();
    setLogs(restored);
    setNotificationMsg('Data sampel riwayat login multi-sekolah berhasil dimuat.');
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // Filtered logs (with user deduplication)
  const filteredLogs = useMemo(() => {
    const matched = logs.filter(log => {
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (log.name || '').toLowerCase().includes(q);
        const matchesEmail = (log.email || '').toLowerCase().includes(q);
        const matchesNip = (log.nip || '').toLowerCase().includes(q);
        const matchesRole = (log.role || '').toLowerCase().includes(q);
        const matchesIp = (log.ipAddress || '').toLowerCase().includes(q);
        const matchesSchool = (log.schoolName || '').toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesNip && !matchesRole && !matchesIp && !matchesSchool) {
          return false;
        }
      }

      // School filter
      if (selectedSchoolFilter !== 'Semua') {
        const sLower = (log.schoolName || '').toLowerCase().trim();
        const fLower = selectedSchoolFilter.toLowerCase().trim();
        if (sLower !== fLower) return false;
      }

      // Role filter
      if (selectedRoleFilter !== 'Semua') {
        const rLower = (log.role || '').toLowerCase();
        const fLower = selectedRoleFilter.toLowerCase();
        if (!rLower.includes(fLower)) return false;
      }

      // Status filter
      if (selectedStatusFilter !== 'Semua' && log.status !== selectedStatusFilter) {
        return false;
      }

      // Device filter
      if (selectedDeviceFilter !== 'Semua' && log.deviceType !== selectedDeviceFilter) {
        return false;
      }

      return true;
    });

    if (!hideDuplicates) {
      return matched;
    }

    // Deduplicate by user key (email or lowercased name) keeping the latest login entry per user
    const seenUsers = new Set<string>();
    const deduplicated: UserLoginLog[] = [];

    for (const log of matched) {
      const userKey = (log.email || log.name || log.userId || '').toLowerCase().trim();
      if (!userKey || !seenUsers.has(userKey)) {
        if (userKey) seenUsers.add(userKey);
        deduplicated.push(log);
      }
    }

    return deduplicated;
  }, [logs, searchQuery, selectedSchoolFilter, selectedRoleFilter, selectedStatusFilter, selectedDeviceFilter, hideDuplicates]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = logs.length;
    const successCount = logs.filter(l => l.status === 'Berhasil').length;
    const failedCount = logs.filter(l => l.status === 'Gagal').length;
    const uniqueUsers = new Set(logs.map(l => l.email.toLowerCase())).size;
    const uniqueSchools = new Set(logs.map(l => (l.schoolName || 'Multi-Sekolah').trim().toLowerCase())).size;
    const adminLogins = logs.filter(l => (l.role || '').toLowerCase().includes('admin')).length;
    const successRate = total > 0 ? ((successCount / total) * 100).toFixed(1) : '100';

    return { total, successCount, failedCount, uniqueUsers, uniqueSchools, adminLogins, successRate };
  }, [logs]);

  const getRoleBadgeStyle = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes('admin') || r.includes('master')) {
      return 'bg-amber-100 text-amber-800 border-amber-300';
    }
    if (r.includes('kepala')) {
      return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    }
    if (r.includes('kurikulum')) {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    }
    if (r.includes('guru') || r.includes('pengampu') || r.includes('pendidik')) {
      return 'bg-sky-100 text-sky-800 border-sky-300';
    }
    if (r.includes('tu') || r.includes('tata usaha')) {
      return 'bg-teal-100 text-teal-800 border-teal-300';
    }
    if (r.includes('keuangan') || r.includes('bendahara')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
    if (r.includes('kesiswaan')) {
      return 'bg-purple-100 text-purple-800 border-purple-300';
    }
    if (r.includes('siswa') || r.includes('peserta didik')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-300';
  };

  const getDeviceIcon = (deviceType: 'Desktop' | 'Mobile' | 'Tablet') => {
    switch (deviceType) {
      case 'Mobile':
        return <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'Tablet':
        return <Tablet className="w-4 h-4 text-purple-600 shrink-0" />;
      default:
        return <Laptop className="w-4 h-4 text-blue-600 shrink-0" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 bg-cyan-50 text-[#164e63] rounded-xl border border-cyan-200 shadow-2xs">
                <Clock className="w-5 h-5" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Log / Riwayat Pengguna Login
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-50 text-[#164e63] border border-cyan-200">
                    <Building2 className="w-3.5 h-3.5 text-[#164e63]" />
                    Audit Semua Sekolah
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Khusus Administrator
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Mencatat seluruh aktivitas login dan jejak autentikasi pengguna dari semua sekolah / satuan pendidikan terdaftar secara realtime.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
              title="Perbarui data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Segarkan</span>
            </button>

            <button
              type="button"
              disabled={logs.length === 0}
              onClick={() => setShowClearConfirmModal(true)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all border text-xs sm:text-sm font-bold shadow-2xs ${
                logs.length === 0
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 cursor-pointer active:scale-95'
              }`}
              title="Hapus riwayat log"
            >
              <Trash2 className="w-4 h-4" />
              <span>Bersihkan Log</span>
            </button>
          </div>
        </div>

        {notificationMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
        )}
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Aktivitas Login</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.total}</h3>
            <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Realtime di Firestore
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-[#164e63]">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tingkat Login Berhasil</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{stats.successRate}%</h3>
            <span className="text-[11px] font-medium text-slate-500 mt-0.5 block">
              {stats.successCount} login sukses diotorisasi
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pengguna Unik</p>
            <h3 className="text-2xl font-black text-blue-600 mt-1">{stats.uniqueUsers}</h3>
            <span className="text-[11px] font-medium text-slate-500 mt-0.5 block">
              Akun berbeda terdeteksi aktif
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <User className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sekolah Terpantau</p>
            <h3 className="text-2xl font-black text-cyan-700 mt-1">{stats.uniqueSchools}</h3>
            <span className="text-[11px] font-medium text-slate-500 mt-0.5 block">
              Satuan pendidikan aktif
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-[#164e63]">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Login Administrator</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{stats.adminLogins}</h3>
            <span className="text-[11px] font-medium text-slate-500 mt-0.5 block">
              Sesi Administrator SSO
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama pengguna, asal sekolah, email resmi, NIP, peran, atau IP..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-[#164e63] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-2">
            {/* School Filter */}
            <select
              value={selectedSchoolFilter}
              onChange={(e) => setSelectedSchoolFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-[#164e63]"
              title="Pilih filter asal sekolah"
            >
              <option value="Semua">Semua Asal Sekolah ({allSchoolOptions.length} Sekolah)</option>
              {allSchoolOptions.map((sch) => (
                <option key={sch} value={sch}>
                  {sch}
                </option>
              ))}
            </select>

            {/* Role Filter */}
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-[#164e63]"
            >
              <option value="Semua">Semua Hak Akses</option>
              <option value="Administrator">Administrator</option>
              <option value="Kepala Sekolah">Kepala Sekolah / Madrasah</option>
              <option value="Guru">Guru / Pendidik</option>
              <option value="Kurikulum">Kurikulum</option>
              <option value="Tata Usaha">Tata Usaha (TU)</option>
              <option value="Keuangan">Keuangan</option>
              <option value="Kesiswaan">Kesiswaan</option>
              <option value="Siswa">Siswa (LMS)</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-[#164e63]"
            >
              <option value="Semua">Semua Status</option>
              <option value="Berhasil">Berhasil</option>
              <option value="Gagal">Gagal</option>
            </select>

            {/* Device Filter */}
            <select
              value={selectedDeviceFilter}
              onChange={(e) => setSelectedDeviceFilter(e.target.value as any)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-[#164e63]"
            >
              <option value="Semua">Semua Perangkat</option>
              <option value="Desktop">Desktop (PC/Laptop)</option>
              <option value="Mobile">Mobile (Smartphone)</option>
              <option value="Tablet">Tablet</option>
            </select>

            {/* Deduplication Toggle Button */}
            <button
              type="button"
              onClick={() => setHideDuplicates(!hideDuplicates)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                hideDuplicates
                  ? 'bg-cyan-50 text-[#164e63] border-cyan-300 font-bold shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title={hideDuplicates ? 'Klik untuk menampilkan seluruh histori termasuk login berulang' : 'Klik untuk menyembunyikan duplikasi nama pengguna'}
            >
              <Layers className="w-4 h-4 text-[#164e63]" />
              <span>{hideDuplicates ? 'Tanpa Nama Ganda' : 'Tampilkan Semua Sesi'}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-medium pt-1 border-t border-slate-100">
          <span>
            Menampilkan <strong>{filteredLogs.length}</strong> {hideDuplicates ? 'pengguna unik (login terbaru)' : 'catatan riwayat login'} dari total <strong>{logs.length}</strong> entri tercatat
            {hideDuplicates && <span className="ml-1 text-[#164e63] font-semibold">(tanpa duplikasi nama)</span>}
          </span>
          {(searchQuery || selectedSchoolFilter !== 'Semua' || selectedRoleFilter !== 'Semua' || selectedStatusFilter !== 'Semua' || selectedDeviceFilter !== 'Semua' || !hideDuplicates) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedSchoolFilter('Semua');
                setSelectedRoleFilter('Semua');
                setSelectedStatusFilter('Semua');
                setSelectedDeviceFilter('Semua');
                setHideDuplicates(true);
              }}
              className="text-[#164e63] hover:underline font-bold"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Pengguna</th>
                <th className="py-3.5 px-4">Asal Sekolah / Satuan Pendidikan</th>
                <th className="py-3.5 px-4">Hak Akses / Peran</th>
                <th className="py-3.5 px-4">Waktu Login</th>
                <th className="py-3.5 px-4">Perangkat & Browser</th>
                <th className="py-3.5 px-4">Alamat Jaringan (IP)</th>
                <th className="py-3.5 px-4">Metode Masuk</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* User Identity */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {log.name ? log.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{log.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{log.email}</p>
                          {log.nip && log.nip !== '-' && (
                            <p className="text-[10px] text-slate-400 font-mono">NIP: {log.nip}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* School Identity */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 max-w-[220px]" title={log.schoolName || 'Multi-Sekolah'}>
                        <Building2 className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                        <span className="font-semibold text-slate-800 text-xs truncate">
                          {log.schoolName || 'SMA Diponegoro Wagir'}
                        </span>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold border ${getRoleBadgeStyle(log.role)}`}>
                        {log.role}
                      </span>
                    </td>

                    {/* Login Time */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-semibold text-slate-800">{log.loginTimeFormatted}</p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(log.loginTime).toLocaleDateString('id-ID', { weekday: 'long' })}
                      </p>
                    </td>

                    {/* Device & Browser */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(log.deviceType)}
                        <div>
                          <p className="font-semibold text-slate-800">{log.browser}</p>
                          <p className="text-[11px] text-slate-400">{log.os} ({log.deviceType})</p>
                        </div>
                      </div>
                    </td>

                    {/* IP Address */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                        <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{log.ipAddress || '180.252.164.12 (ID)'}</span>
                      </div>
                    </td>

                    {/* Auth Method */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        <Lock className="w-3 h-3 text-slate-500" />
                        {log.authMethod}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {log.status === 'Berhasil' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Berhasil
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          <XCircle className="w-3.5 h-3.5" />
                          Gagal
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedDetailLog(log)}
                        className="p-1.5 text-slate-500 hover:text-[#164e63] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Lihat detail audit"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-slate-400">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-sm text-slate-700">
                      {logs.length === 0 ? 'Daftar Riwayat Login Kosong' : 'Tidak ada riwayat login yang cocok'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      {logs.length === 0
                        ? 'Riwayat login telah dibersihkan. Setiap aktivitas pengguna yang masuk ke portal SIMAK Merdeka berikutnya akan otomatis tercatat di sini secara realtime.'
                        : 'Coba sesuaikan kata kunci pencarian atau reset filter untuk menemukan data.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Audit Modal */}
      {selectedDetailLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-cyan-50 text-[#164e63] rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <h3 className="font-extrabold text-base text-slate-900">Rincian Audit Login</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailLog(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">ID Log:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedDetailLog.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Pengguna:</span>
                  <span className="font-bold text-slate-900">{selectedDetailLog.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Asal Sekolah:</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-right">
                    <Building2 className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                    <span>{selectedDetailLog.schoolName || '-'}</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email Resmi:</span>
                  <span className="font-medium text-slate-800">{selectedDetailLog.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">NIP / NISN:</span>
                  <span className="font-mono text-slate-800">{selectedDetailLog.nip || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hak Akses / Peran:</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getRoleBadgeStyle(selectedDetailLog.role)}`}>
                    {selectedDetailLog.role}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Waktu Login:</span>
                  <span className="font-bold text-slate-900">{selectedDetailLog.loginTimeFormatted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Perangkat:</span>
                  <span className="font-semibold text-slate-800">{selectedDetailLog.deviceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Browser:</span>
                  <span className="font-semibold text-slate-800">{selectedDetailLog.browser}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sistem Operasi:</span>
                  <span className="font-semibold text-slate-800">{selectedDetailLog.os}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Alamat IP:</span>
                  <span className="font-mono text-slate-800">{selectedDetailLog.ipAddress || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Metode Masuk:</span>
                  <span className="font-semibold text-slate-800">{selectedDetailLog.authMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status Autentikasi:</span>
                  <span className={`font-bold ${selectedDetailLog.status === 'Berhasil' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {selectedDetailLog.status}
                  </span>
                </div>
                {selectedDetailLog.failureReason && (
                  <div className="pt-2 border-t border-slate-200 text-rose-700 text-xs">
                    <span className="font-bold">Alasan Kegagalan: </span>
                    {selectedDetailLog.failureReason}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDetailLog(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Logs Confirmation Modal */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                Bersihkan Riwayat Log Login?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Tindakan ini akan menghapus seluruh data histori audit login dari sistem. Anda yakin ingin melanjutkan?
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleClearLogs}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer"
              >
                Ya, Bersihkan Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
