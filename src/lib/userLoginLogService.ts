import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface UserLoginLog {
  id: string;
  userId?: string;
  name: string;
  email: string;
  nip?: string;
  role: string;
  schoolName: string;
  loginTime: string; // ISO string
  loginTimeFormatted: string; // e.g. "11 Okt 2026, 06:30 WIB"
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  browser: string;
  os: string;
  ipAddress?: string;
  status: 'Berhasil' | 'Gagal';
  authMethod: string;
  failureReason?: string;
}

export function getClientDeviceInfo(): { deviceType: 'Desktop' | 'Mobile' | 'Tablet'; browser: string; os: string } {
  if (typeof window === 'undefined') {
    return { deviceType: 'Desktop', browser: 'Chrome', os: 'Windows 11' };
  }

  const ua = navigator.userAgent;
  let deviceType: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = 'Tablet';
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i.test(ua)) {
    deviceType = 'Mobile';
  }

  let browser = 'Chrome';
  if (ua.includes('Firefox')) browser = 'Mozilla Firefox';
  else if (ua.includes('Edg')) browser = 'Microsoft Edge';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Apple Safari';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';

  let os = 'Windows 11';
  if (ua.includes('Windows NT 10.0')) os = 'Windows 10/11';
  else if (ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android OS';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';

  return { deviceType, browser, os };
}

export function formatDateTimeIndonesian(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds} WIB`;
}

export const INITIAL_SEED_LOGIN_LOGS: UserLoginLog[] = [
  {
    id: 'LOG-001',
    name: 'Shahrur Robby, S.Pd.',
    email: 'shahrurrobby17@gmail.com',
    nip: '19900101 201501 1 001',
    role: 'Administrator',
    schoolName: 'SMA Diponegoro Wagir',
    loginTime: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    loginTimeFormatted: formatDateTimeIndonesian(new Date(Date.now() - 4 * 60 * 1000)),
    deviceType: 'Desktop',
    browser: 'Google Chrome 128.0',
    os: 'Windows 11 Pro 64-bit',
    ipAddress: '180.252.164.12 (Malang, ID)',
    status: 'Berhasil',
    authMethod: 'SSO Administrator & Enkripsi'
  },
  {
    id: 'LOG-002',
    name: 'Drs. H. Bambang Susanto, M.Pd.',
    email: 'bambang.susanto@sekolah.sch.id',
    nip: '19680512 199303 1 004',
    role: 'Kepala Sekolah',
    schoolName: 'SMA Negeri 1 Indonesia - Sekolah Penggerak',
    loginTime: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    loginTimeFormatted: formatDateTimeIndonesian(new Date(Date.now() - 25 * 60 * 1000)),
    deviceType: 'Desktop',
    browser: 'Microsoft Edge 127.0',
    os: 'Windows 11 Enterprise',
    ipAddress: '103.111.82.45 (Jakarta, ID)',
    status: 'Berhasil',
    authMethod: 'Email Resmi & Kata Sandi'
  },
  {
    id: 'LOG-003',
    name: 'Siti Aminah, S.Pd.SD',
    email: 'siti.aminah@sdn1wagir.sch.id',
    nip: '19760314 200112 2 002',
    role: 'Kepala Sekolah',
    schoolName: 'SD Negeri 1 Wagir',
    loginTime: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    loginTimeFormatted: formatDateTimeIndonesian(new Date(Date.now() - 55 * 60 * 1000)),
    deviceType: 'Desktop',
    browser: 'Google Chrome 128.0',
    os: 'Windows 10 Home',
    ipAddress: '114.122.204.88 (Malang, ID)',
    status: 'Berhasil',
    authMethod: 'Email Resmi & Kata Sandi'
  },
  {
    id: 'LOG-004',
    name: 'M. Ali Fikri, S.Pd.I',
    email: 'ali.fikri@midiponegoro.sch.id',
    nip: '19810620 200701 1 015',
    role: 'Kepala Madrasah / Guru',
    schoolName: 'MI Diponegoro Wagir',
    loginTime: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
    loginTimeFormatted: formatDateTimeIndonesian(new Date(Date.now() - 85 * 60 * 1000)),
    deviceType: 'Desktop',
    browser: 'Google Chrome 127.0',
    os: 'macOS Sonoma 14.5',
    ipAddress: '182.1.88.92 (Malang, ID)',
    status: 'Berhasil',
    authMethod: 'Email Resmi & Kata Sandi'
  },
  {
    id: 'LOG-005',
    name: 'Ahmad Hidayat, S.Kom., M.T.',
    email: 'ahmad.hidayat@smpdiponegoro.sch.id',
    nip: '19820315 200801 1 012',
    role: 'Tim Kurikulum',
    schoolName: 'SMP Diponegoro Wagir',
    loginTime: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    loginTimeFormatted: formatDateTimeIndonesian(new Date(Date.now() - 140 * 60 * 1000)),
    deviceType: 'Desktop',
    browser: 'Microsoft Edge 128.0',
    os: 'Windows 11 Pro',
    ipAddress: '36.78.112.5 (Surabaya, ID)',
    status: 'Berhasil',
    authMethod: 'Email Resmi & Kata Sandi'
  },
  {
    id: 'LOG-006',
    name: 'Siti Rahmah, S.Pd., M.Si.',
    email: 'siti.rahmah@sekolah.sch.id',
    nip: '19750820 200012 2 001',
    role: 'Guru Pengampu (Biologi)',
    schoolName: 'SMA Negeri 1 Indonesia - Sekolah Penggerak',
    loginTime: new Date(Date.now() - 195 * 60 * 1000).toISOString(),
    loginTimeFormatted: formatDateTimeIndonesian(new Date(Date.now() - 195 * 60 * 1000)),
    deviceType: 'Desktop',
    browser: 'Safari 17.5',
    os: 'macOS Sonoma',
    ipAddress: '114.122.204.88 (Bandung, ID)',
    status: 'Berhasil',
    authMethod: 'Email Resmi & Kata Sandi'
  },
  {
    id: 'LOG-007',
    name: 'Nur Aini Khairunnisa',
    email: '0071234567@siswa.simakmerdeka.sch.id',
    nip: 'NISN: 0071234567',
    role: 'Siswa / Peserta Didik',
    schoolName: 'SMA Diponegoro Wagir',
    loginTime: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    loginTimeFormatted: formatDateTimeIndonesian(new Date(Date.now() - 240 * 60 * 1000)),
    deviceType: 'Desktop',
    browser: 'Chrome 128.0',
    os: 'Windows 10',
    ipAddress: '36.78.112.5 (Malang, ID)',
    status: 'Berhasil',
    authMethod: 'NISN Siswa (LMS)'
  },
  {
    id: 'LOG-008',
    name: 'Rahmat Santoso, S.AP.',
    email: 'rahmat.tu@sdn1wagir.sch.id',
    nip: '19871104 201001 1 007',
    role: 'Tata Usaha (TU)',
    schoolName: 'SD Negeri 1 Wagir',
    loginTime: new Date(Date.now() - 360 * 60 * 1000).toISOString(),
    loginTimeFormatted: formatDateTimeIndonesian(new Date(Date.now() - 360 * 60 * 1000)),
    deviceType: 'Desktop',
    browser: 'Mozilla Firefox 129.0',
    os: 'Windows 10 Pro',
    ipAddress: '180.252.164.12 (Malang, ID)',
    status: 'Berhasil',
    authMethod: 'Email Resmi & Kata Sandi'
  },
  {
    id: 'LOG-009',
    name: 'Dewi Lestari, S.E.',
    email: 'dewi.keuangan@midiponegoro.sch.id',
    nip: '19890415 201402 2 003',
    role: 'Bendahara Keuangan',
    schoolName: 'MI Diponegoro Wagir',
    loginTime: new Date(Date.now() - 520 * 60 * 1000).toISOString(),
    loginTimeFormatted: formatDateTimeIndonesian(new Date(Date.now() - 520 * 60 * 1000)),
    deviceType: 'Desktop',
    browser: 'Google Chrome 128.0',
    os: 'Windows 11 Home',
    ipAddress: '110.137.95.14 (Malang, ID)',
    status: 'Berhasil',
    authMethod: 'Email Resmi & Kata Sandi'
  },
  {
    id: 'LOG-010',
    name: 'Akun Tamu / Pengunjung Luar',
    email: 'guest.unknown@gmail.com',
    nip: '-',
    role: 'Pengunjung Luar',
    schoolName: 'SMP Diponegoro Wagir',
    loginTime: new Date(Date.now() - 720 * 60 * 1000).toISOString(),
    loginTimeFormatted: formatDateTimeIndonesian(new Date(Date.now() - 720 * 60 * 1000)),
    deviceType: 'Desktop',
    browser: 'Edge 126.0',
    os: 'Windows 10',
    ipAddress: '182.253.11.4 (Surabaya, ID)',
    status: 'Gagal',
    authMethod: 'Email / Password',
    failureReason: 'Kata sandi atau email tidak terdaftar'
  }
];

const STORAGE_KEY = 'simak_user_login_logs';
const CLEARED_FLAG_KEY = 'simak_user_login_logs_cleared';

export function getLocalLoginLogs(): UserLoginLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const isCleared = localStorage.getItem(CLEARED_FLAG_KEY) === 'true';
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        if (isCleared && parsed.length === 0) {
          return [];
        }
        // Upgrade legacy cache if it was restricted to only 1 school
        const uniqueSchools = new Set(parsed.map((p: any) => p.schoolName).filter(Boolean));
        if (uniqueSchools.size <= 1 && parsed.length <= 8) {
          saveLocalLoginLogs(INITIAL_SEED_LOGIN_LOGS);
          return INITIAL_SEED_LOGIN_LOGS;
        }
        if (parsed.length > 0) {
          return parsed;
        }
        return [];
      }
    }

    if (isCleared) {
      return [];
    }

    // Return INITIAL_SEED_LOGIN_LOGS only on first run if never cleared
    return INITIAL_SEED_LOGIN_LOGS;
  } catch (e) {
    console.error('Error reading login logs from localStorage:', e);
    return [];
  }
}

export function saveLocalLoginLogs(logs: UserLoginLog[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(0, 150)));
  } catch (e) {
    console.error('Error saving login logs to localStorage:', e);
  }
}

export function restoreDefaultDemoLogs(): UserLoginLog[] {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CLEARED_FLAG_KEY);
    saveLocalLoginLogs(INITIAL_SEED_LOGIN_LOGS);
  }
  return INITIAL_SEED_LOGIN_LOGS;
}

export async function recordUserLoginLog(entry: Partial<UserLoginLog>): Promise<UserLoginLog> {
  const deviceInfo = getClientDeviceInfo();
  const now = new Date();
  
  const newLog: UserLoginLog = {
    id: entry.id || `LOG-${Date.now().toString().slice(-6)}`,
    userId: entry.userId || '',
    name: entry.name || 'Pengguna SIMAK',
    email: entry.email || 'user@simakmerdeka.sch.id',
    nip: entry.nip || '-',
    role: entry.role || 'Guru Pengampu',
    schoolName: entry.schoolName || 'SMA Negeri 1 Indonesia - Sekolah Penggerak',
    loginTime: now.toISOString(),
    loginTimeFormatted: formatDateTimeIndonesian(now),
    deviceType: entry.deviceType || deviceInfo.deviceType,
    browser: entry.browser || deviceInfo.browser,
    os: entry.os || deviceInfo.os,
    ipAddress: entry.ipAddress || '180.252.164.12 (Jakarta, ID)',
    status: entry.status || 'Berhasil',
    authMethod: entry.authMethod || 'Email Resmi & Kata Sandi',
    failureReason: entry.failureReason
  };

  // 1. Save to local storage
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CLEARED_FLAG_KEY);
    }
    const currentLogs = getLocalLoginLogs();
    const updated = [newLog, ...currentLogs.filter(l => l.id !== newLog.id)];
    saveLocalLoginLogs(updated);
  } catch (err) {
    console.warn('LocalStorage error recording login log:', err);
  }

  // 2. Persist to Firestore
  try {
    await addDoc(collection(db, 'userLoginLogs'), {
      ...newLog,
      createdAt: serverTimestamp()
    });
  } catch (firestoreErr) {
    console.warn('Firestore userLoginLogs add note:', firestoreErr);
  }

  return newLog;
}

export function subscribeToUserLoginLogs(callback: (logs: UserLoginLog[]) => void): () => void {
  // Start with local logs
  const initial = getLocalLoginLogs();
  callback(initial);

  try {
    const q = query(collection(db, 'userLoginLogs'), orderBy('createdAt', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const isCleared = typeof window !== 'undefined' && localStorage.getItem(CLEARED_FLAG_KEY) === 'true';

      if (!snapshot.empty) {
        const firestoreLogs: UserLoginLog[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          firestoreLogs.push({
            id: docSnap.id,
            name: data.name || 'Pengguna',
            email: data.email || '',
            nip: data.nip || '',
            role: data.role || 'Guru Pengampu',
            schoolName: data.schoolName || '',
            loginTime: data.loginTime || new Date().toISOString(),
            loginTimeFormatted: data.loginTimeFormatted || '',
            deviceType: data.deviceType || 'Desktop',
            browser: data.browser || 'Browser',
            os: data.os || 'OS',
            ipAddress: data.ipAddress || '127.0.0.1',
            status: data.status || 'Berhasil',
            authMethod: data.authMethod || 'Email/Password',
            failureReason: data.failureReason
          });
        });
        
        saveLocalLoginLogs(firestoreLogs);
        callback(firestoreLogs);
      } else {
        // If snapshot is empty
        if (isCleared) {
          saveLocalLoginLogs([]);
          callback([]);
        } else {
          const local = getLocalLoginLogs();
          callback(local);
        }
      }
    }, (error) => {
      console.warn('userLoginLogs snapshot error, falling back to local:', error);
      callback(getLocalLoginLogs());
    });

    return unsubscribe;
  } catch (err) {
    console.warn('subscribeToUserLoginLogs error:', err);
    return () => {};
  }
}

export async function clearAllLoginLogsFromStorage(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem(CLEARED_FLAG_KEY, 'true');
  }
  try {
    const snap = await getDocs(collection(db, 'userLoginLogs'));
    const deletePromises = snap.docs.map(d => deleteDoc(doc(db, 'userLoginLogs', d.id)));
    await Promise.all(deletePromises);
  } catch (e) {
    console.warn('Clear remote login logs note:', e);
  }
}
