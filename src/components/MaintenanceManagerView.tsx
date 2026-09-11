import React, { useState } from 'react';
import { 
  Wrench, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Search, 
  UserCheck, 
  UserX, 
  Power, 
  School, 
  User, 
  Sparkles,
  AlertCircle,
  RefreshCw,
  Building2,
  Sliders
} from 'lucide-react';
import { UserAccount, TeacherProfile } from '../types';

interface MaintenanceManagerViewProps {
  registeredUsers: UserAccount[];
  onUpdateRegisteredUsers: (updatedUsers: UserAccount[]) => void;
  teacherProfiles: TeacherProfile[];
  onUpdateTeacherProfiles: (updatedProfiles: TeacherProfile[]) => void;
  currentUser?: UserAccount | null;
}

export const MaintenanceManagerView: React.FC<MaintenanceManagerViewProps> = ({
  registeredUsers,
  onUpdateRegisteredUsers,
  teacherProfiles,
  onUpdateTeacherProfiles,
  currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Filter accounts
  const filteredUsers = registeredUsers.filter(u => {
    const term = searchTerm.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.schoolName && u.schoolName.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.nip && u.nip.includes(term))
    );
  });

  const totalUsersCount = registeredUsers.length;
  const maintenanceCount = registeredUsers.filter(u => u.isMaintenance || u.status === 'Nonaktif').length;
  const activeCount = totalUsersCount - maintenanceCount;

  const isExemptAccount = (name: string = '', email: string = '') => {
    const lowerName = name.toLowerCase();
    const lowerEmail = email.toLowerCase();
    return lowerName.includes('shahrur robby') || lowerName.includes('shahrur') || lowerEmail.includes('shahrurrobby17@gmail.com');
  };

  // Toggle single user maintenance status
  const handleToggleUserMaintenance = (uid: string, email: string) => {
    const targetUser = registeredUsers.find(u => u.uid === uid || u.email.toLowerCase() === email.toLowerCase());
    if (!targetUser) return;

    if (isExemptAccount(targetUser.name, targetUser.email)) {
      showToast(`Akun milik ${targetUser.name} adalah Akun Utama Admin dan selalu aktif (dikecualikan dari Maintenance).`);
      return;
    }

    const currentlyDisabled = targetUser.isMaintenance || targetUser.status === 'Nonaktif';
    const newMaintenanceState = !currentlyDisabled;
    const newStatus: 'Aktif' | 'Nonaktif' | 'Maintenance' = newMaintenanceState ? 'Nonaktif' : 'Aktif';

    // Update registeredUsers array
    const updatedUsers = registeredUsers.map(u => {
      if (u.uid === uid || u.email.toLowerCase() === email.toLowerCase()) {
        return {
          ...u,
          isMaintenance: newMaintenanceState,
          status: newStatus
        };
      }
      return u;
    });

    onUpdateRegisteredUsers(updatedUsers);

    // Also sync teacherProfiles if matching
    const updatedProfiles = teacherProfiles.map(p => {
      const isNameMatch = p.name && targetUser.name && p.name.toLowerCase() === targetUser.name.toLowerCase();
      const isSchoolMatch = p.schoolName && targetUser.schoolName && p.schoolName.toLowerCase() === targetUser.schoolName.toLowerCase();
      if (isNameMatch || isSchoolMatch) {
        return {
          ...p,
          isMaintenance: newMaintenanceState,
          status: newStatus
        };
      }
      return p;
    });
    onUpdateTeacherProfiles(updatedProfiles);

    showToast(
      newMaintenanceState
        ? `Sistem milik guru ${targetUser.name} diset ke tahap MAINTENANCE (Nonaktif)`
        : `Akun milik guru ${targetUser.name} telah DIAKTIFKAN kembali`
    );
  };

  // Master Toggle: Set all to Active
  const handleActivateAll = () => {
    const updatedUsers = registeredUsers.map(u => ({
      ...u,
      isMaintenance: false,
      status: 'Aktif' as const
    }));
    onUpdateRegisteredUsers(updatedUsers);

    const updatedProfiles = teacherProfiles.map(p => ({
      ...p,
      isMaintenance: false,
      status: 'Aktif' as const
    }));
    onUpdateTeacherProfiles(updatedProfiles);

    showToast('Semua akun guru telah DIAKTIFKAN kembali.');
  };

  // Master Toggle: Set all to Maintenance (Excluding Shahrur Robby, S.Pd.)
  const handleMaintenanceAll = () => {
    const updatedUsers = registeredUsers.map(u => {
      if (isExemptAccount(u.name, u.email)) {
        return {
          ...u,
          isMaintenance: false,
          status: 'Aktif' as const
        };
      }
      return {
        ...u,
        isMaintenance: true,
        status: 'Nonaktif' as const
      };
    });
    onUpdateRegisteredUsers(updatedUsers);

    const updatedProfiles = teacherProfiles.map(p => {
      if (isExemptAccount(p.name, '')) {
        return {
          ...p,
          isMaintenance: false,
          status: 'Aktif' as const
        };
      }
      return {
        ...p,
        isMaintenance: true,
        status: 'Nonaktif' as const
      };
    });
    onUpdateTeacherProfiles(updatedProfiles);

    showToast('Seluruh sistem akun guru diset ke tahap MAINTENANCE (Kecuali akun Shahrur Robby, S.Pd.).');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#164e63] text-white px-4 py-3 rounded-none shadow-xl border border-amber-400 flex items-center space-x-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#164e63] text-white rounded-none p-5 md:p-6 shadow-md border border-slate-700/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2 border border-amber-400/30">
              <Wrench className="w-3.5 h-3.5" />
              <span>Kontrol Pemeliharaan Sistem</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Maintenance Sistem & Status Akun Guru
            </h1>
            <p className="text-xs md:text-sm text-cyan-100/90 mt-1 max-w-2xl">
              Aktifkan atau nonaktifkan sistem untuk akun guru tertentu. Ketika akun dinonaktifkan, tampilan aplikasi di perangkat HP maupun Laptop guru tersebut akan langsung berubah ke <strong className="text-amber-300">Tahap Maintenance</strong> secara realtime.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handleActivateAll}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-none text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
              title="Aktifkan Semua Akun Guru"
            >
              <UserCheck className="w-4 h-4" />
              <span>Aktifkan Semua</span>
            </button>
            <button
              type="button"
              onClick={handleMaintenanceAll}
              className="px-3.5 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-none text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
              title="Nonaktifkan Semua Akun (Set Maintenance)"
            >
              <UserX className="w-4 h-4" />
              <span>Maintenance Semua</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-none border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Total Akun Terdaftar</div>
            <div className="text-2xl font-black text-slate-800 mt-0.5">{totalUsersCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Seluruh akun terhubung</div>
          </div>
          <div className="w-12 h-12 bg-cyan-50 text-[#164e63] rounded-none flex items-center justify-center font-bold">
            <User className="w-6 h-6 text-[#164e63]" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-none border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 uppercase">Akun Aktif (Normal)</div>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">{activeCount}</div>
            <div className="text-[10px] text-emerald-600 mt-0.5">Bisa akses penuh</div>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-none flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-none border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-600 uppercase">Dalam Maintenance</div>
            <div className="text-2xl font-black text-amber-700 mt-0.5">{maintenanceCount}</div>
            <div className="text-[10px] text-amber-600 mt-0.5">Tampilan terkunci</div>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-none flex items-center justify-center font-bold">
            <ShieldAlert className="w-6 h-6 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Main Account Management Card */}
      <div className="bg-white rounded-none border border-slate-200 shadow-xs p-5 space-y-4">
        {/* Search & Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#164e63]" />
              <span>Daftar Guru & Status Akses Realtime</span>
            </h2>
            <p className="text-xs text-slate-500">
              Klik tombol switch di samping nama guru untuk langsung mengubah status aktif/maintenance.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari guru, sekolah, NIP..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-none focus:outline-none focus:border-cyan-500 font-medium"
            />
          </div>
        </div>

        {/* User Accounts List */}
        {filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
            <div className="text-xs font-semibold">Tidak ada akun guru yang cocok dengan pencarian.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredUsers.map((user) => {
              const isAdminExempt = isExemptAccount(user.name, user.email);
              const isDisabled = !isAdminExempt && (user.isMaintenance || user.status === 'Nonaktif');
              const isCurrentActiveUser = currentUser?.email.toLowerCase() === user.email.toLowerCase();

              return (
                <div
                  key={user.uid || user.email}
                  className={`p-4 rounded-none border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isAdminExempt
                      ? 'bg-cyan-50/80 border-cyan-300/80 shadow-xs'
                      : isDisabled
                      ? 'bg-amber-50/50 border-amber-200/90'
                      : 'bg-slate-50/60 border-slate-200 hover:border-cyan-300'
                  }`}
                >
                  {/* Left Info: Avatar + Details */}
                  <div className="flex items-start space-x-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-none flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                        isAdminExempt
                          ? 'bg-[#164e63] text-amber-300 border-2 border-amber-400/80'
                          : isDisabled
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-[#164e63] text-amber-300'
                      }`}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-1">
                        <span className="text-sm font-bold text-slate-800 truncate">{user.name}</span>
                        {isAdminExempt && (
                          <span className="text-[10px] bg-amber-400 text-slate-950 font-extrabold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 shadow-xs">
                            <Sparkles className="w-3 h-3 text-[#164e63]" />
                            <span>Admin Utama (Dikecualikan)</span>
                          </span>
                        )}
                        {isCurrentActiveUser && !isAdminExempt && (
                          <span className="text-[10px] bg-cyan-100 text-[#164e63] font-bold px-2 py-0.5 rounded-full shrink-0">
                            Akun Saya
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-[#003366] text-xs text-slate-500 mt-0.5 gap-x-3 gap-y-1">
                        <span className="flex items-center gap-1 text-slate-600 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{user.schoolName}</span>
                        </span>
                        {user.nip && (
                          <span className="text-[11px] font-mono text-slate-500">
                            NIP: {user.nip}
                          </span>
                        )}
                        <span className="text-[11px] text-cyan-600 font-medium truncate">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action: Status Badge + Toggle Button */}
                  <div className="flex items-center justify-between md:justify-end space-x-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/60">
                    {/* Status Badge */}
                    <div className="flex items-center">
                      {isAdminExempt ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-[#164e63] border border-cyan-300 text-xs font-extrabold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#164e63]" />
                          <span>Selalu Aktif (Admin)</span>
                        </span>
                      ) : isDisabled ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-xs font-extrabold">
                          <Wrench className="w-3.5 h-3.5 text-rose-600" />
                          <span>BELUM AKTIF</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-extrabold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Aktif (Akses Normal)</span>
                        </span>
                      )}
                    </div>

                    {/* Interactive Toggle Switch Button */}
                    {!isAdminExempt ? (
                      <button
                        type="button"
                        onClick={() => handleToggleUserMaintenance(user.uid, user.email)}
                        className={`px-3.5 py-1.5 rounded-none text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs ${
                          isDisabled
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{isDisabled ? 'Aktifkan Akun' : 'Set Maintenance'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="px-3.5 py-1.5 rounded-none text-xs font-bold bg-slate-200 text-slate-500 flex items-center space-x-1.5 cursor-not-allowed opacity-80"
                        title="Akun Admin Utama tidak dapat dinonaktifkan"
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>Admin Utama</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
