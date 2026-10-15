import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, 
  Users, 
  Sparkles,
  AlertTriangle, 
  RefreshCw, 
  ArrowRight, 
  ArrowLeft, 
  Lock, 
  Eye, 
  EyeOff, 
  Building2, 
  ShieldCheck, 
  Check, 
  CheckCircle2, 
  Printer, 
  FileText, 
  Home, 
  LifeBuoy, 
  LogIn, 
  GraduationCap, 
  Info,
  X,
  Accessibility,
  KeyRound,
  Send,
  Smartphone,
  Mail,
  BadgeCheck,
  UserCheck,
  Clock,
  ShieldAlert,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { UserAccount, TeacherProfile, RegisteredSchool, PpdbRegistration } from '../types';
import { subscribeToRegisteredSchools, initialRegisteredSchools, deduplicateSchools, filterDeletedSchools, savePpdbRegistrationToFirebase } from '../lib/firebaseService';
import { TutWuriHandayaniLogo } from './TutWuriHandayaniLogo';

interface SscasnRegisterFormProps {
  onClose: () => void;
  onSwitchToLogin: (prefilledEmail?: string, prefilledNip?: string) => void;
  onRegisterSuccess?: (account: UserAccount, profile: TeacherProfile) => void;
  onRegisterPpdb?: (record: PpdbRegistration) => void;
  onOpenHelpdesk?: () => void;
  registeredUsers?: UserAccount[];
  registeredSchools?: RegisteredSchool[];
  isPpdbMode?: boolean;
}

export const SimakEmblemLogo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <div className={`flex items-center justify-center shrink-0 select-none ${className}`}>
    <TutWuriHandayaniLogo className="w-9 h-9 object-contain drop-shadow" />
  </div>
);

// Backward-compatible alias
export const BknEmblemLogo = SimakEmblemLogo;

export const SscasnRegisterForm: React.FC<SscasnRegisterFormProps> = ({
  onClose,
  onSwitchToLogin,
  onRegisterSuccess,
  onRegisterPpdb,
  onOpenHelpdesk,
  registeredUsers = [],
  registeredSchools: propsRegisteredSchools,
  isPpdbMode = false
}) => {
  // Stepper State (1 to 6)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [isPpdb, setIsPpdb] = useState<boolean>(Boolean(isPpdbMode));

  // Registered Schools List State
  const [schoolsList, setSchoolsList] = useState<RegisteredSchool[]>(() => {
    if (propsRegisteredSchools && propsRegisteredSchools.length > 0) return filterDeletedSchools(propsRegisteredSchools);
    const saved = typeof window !== 'undefined' ? localStorage.getItem('simak_registered_schools') : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return filterDeletedSchools(parsed);
      } catch (e) {}
    }
    return filterDeletedSchools(initialRegisteredSchools);
  });

  useEffect(() => {
    if (propsRegisteredSchools && propsRegisteredSchools.length > 0) {
      setSchoolsList(filterDeletedSchools(propsRegisteredSchools));
    } else {
      const unsub = subscribeToRegisteredSchools((list) => {
        if (list && list.length > 0) {
          setSchoolsList(filterDeletedSchools(list));
        } else {
          const saved = typeof window !== 'undefined' ? localStorage.getItem('simak_registered_schools') : null;
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setSchoolsList(filterDeletedSchools(parsed));
                return;
              }
            } catch (e) {}
          }
          setSchoolsList(filterDeletedSchools(initialRegisteredSchools));
        }
      });
      return () => unsub();
    }
  }, [propsRegisteredSchools]);

  // Langkah 1: Data Identitas Pendaftar
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan' | ''>('');
  const [birthPlace, setBirthPlace] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const getRandomCaptchaCode = () => {
    const chars = '23456789abcdefghkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const [captchaInput, setCaptchaInput] = useState<string>('');
  const [generatedCaptcha, setGeneratedCaptcha] = useState<string>(getRandomCaptchaCode);

  // Fields khusus Pendaftaran PPDB Siswa Baru
  const [nisn, setNisn] = useState<string>('');
  const [nik, setNik] = useState<string>('');
  const [sekolahAsal, setSekolahAsal] = useState<string>('');
  const [jalurPpdb, setJalurPpdb] = useState<string>('Zonasi');
  const [parentName, setParentName] = useState<string>('');
  const [parentPhone, setParentPhone] = useState<string>('');
  const [studentAddress, setStudentAddress] = useState<string>('');
  const [rt, setRt] = useState<string>('');
  const [rw, setRw] = useState<string>('');
  const [village, setVillage] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [regency, setRegency] = useState<string>('');

  // Additional fields khusus SPMB (Siswa & Orang Tua)
  const [religion, setReligion] = useState<string>('Islam');
  const [childOrder, setChildOrder] = useState<string>('1');
  const [siblingCount, setSiblingCount] = useState<string>('0');

  // Data Ayah Kandung
  const [fatherName, setFatherName] = useState<string>('');
  const [fatherBirthPlaceDate, setFatherBirthPlaceDate] = useState<string>('');
  const [fatherJob, setFatherJob] = useState<string>('Wiraswasta');
  const [fatherEdu, setFatherEdu] = useState<string>('SMA/SMK/MA');
  const [fatherAddress, setFatherAddress] = useState<string>('');

  // Data Ibu Kandung
  const [motherName, setMotherName] = useState<string>('');
  const [motherBirthPlaceDate, setMotherBirthPlaceDate] = useState<string>('');
  const [motherJob, setMotherJob] = useState<string>('Ibu Rumah Tangga');
  const [motherEdu, setMotherEdu] = useState<string>('SMA/SMK/MA');
  const [motherAddress, setMotherAddress] = useState<string>('');

  // Langkah 2: Data Akun & Peran
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [role, setRole] = useState<string>(isPpdbMode ? 'Siswa' : 'Guru Pengampu');
  const [subject, setSubject] = useState<string>('');
  const [assignedClass, setAssignedClass] = useState<string>('');
  const [jenjangPendidikan, setJenjangPendidikan] = useState<string>('');
  const [school, setSchool] = useState<string>('');

  // Kode acak 4 angka untuk nomor registrasi SPMB
  const randomRegCode = useMemo(() => Math.floor(1000 + Math.random() * 9000).toString(), []);

  // Otomatis segarkan kode captcha saat komponen dimuat
  useEffect(() => {
    refreshCaptcha();
  }, []);

  const filteredSchoolsList = useMemo(() => {
    if (!jenjangPendidikan) return [];
    const target = jenjangPendidikan.split('/')[0].trim().toLowerCase();
    const list = filterDeletedSchools(schoolsList);
    
    return list.filter(s => {
      const nameLower = (s.name || '').toLowerCase();
      const jenjangLower = (s.jenjang || '').toLowerCase();
      
      if (target === 'sd') {
        return jenjangLower.includes('sd') || jenjangLower.includes('mi') || nameLower.startsWith('sd') || nameLower.startsWith('mi');
      }
      if (target === 'smp') {
        return jenjangLower.includes('smp') || jenjangLower.includes('mts') || nameLower.startsWith('smp') || nameLower.startsWith('mts');
      }
      if (target === 'sma') {
        return jenjangLower.includes('sma') || jenjangLower.includes('ma') || jenjangLower.includes('smk') || nameLower.startsWith('sma') || nameLower.startsWith('ma') || nameLower.startsWith('smk') || (!jenjangLower && !nameLower.startsWith('sd') && !nameLower.startsWith('smp'));
      }
      return true;
    });
  }, [schoolsList, jenjangPendidikan]);

  const selectedSchoolObj = useMemo(() => {
    return schoolsList.find(s => s.name === school) || filteredSchoolsList[0] || schoolsList[0];
  }, [schoolsList, school, filteredSchoolsList]);

  useEffect(() => {
    if (jenjangPendidikan && filteredSchoolsList.length > 0) {
      if (!school || !filteredSchoolsList.some(s => s.name === school)) {
        setSchool(filteredSchoolsList[0].name);
      }
    } else if (!jenjangPendidikan) {
      setSchool('');
    }
  }, [jenjangPendidikan, filteredSchoolsList]);

  // Langkah 3: Pengaman Akun
  const [securityQ1, setSecurityQ1] = useState<string>('Siapa nama hewan peliharaan pertama Anda?');
  const [securityA1, setSecurityA1] = useState<string>('');
  const [securityQ2, setSecurityQ2] = useState<string>('Apa nama kota kelahiran Anda?');
  const [securityA2, setSecurityA2] = useState<string>('');

  // Langkah 4: Konfirmasi
  const [agreed, setAgreed] = useState<boolean>(false);

  // Feedback & Loading
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [registeredTimestamp, setRegisteredTimestamp] = useState<string>('');

  // Accessibility States
  const [showAccessibility, setShowAccessibility] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [highContrast, setHighContrast] = useState<boolean>(false);

  const refreshCaptcha = () => {
    const chars = '23456789abcdefghkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCaptcha(code);
    setCaptchaInput('');
  };

  // Step 1 Validation & SPMB Direct Submission
  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Nama Lengkap wajib diisi.');
      return;
    }
    if (isPpdb) {
      if (!nisn.trim() || nisn.length < 10) {
        setErrorMsg('NISN wajib diisi 10 digit angka.');
        return;
      }
      if (!nik.trim() || nik.length < 16) {
        setErrorMsg('NIK Siswa / No. KK wajib diisi 16 digit angka.');
        return;
      }
      if (!sekolahAsal.trim()) {
        setErrorMsg('Sekolah Asal (SD/SMP) wajib diisi.');
        return;
      }
    }
    if (!gender) {
      setErrorMsg('Jenis Kelamin wajib dipilih.');
      return;
    }
    if (!birthPlace.trim()) {
      setErrorMsg('Tempat Lahir wajib diisi.');
      return;
    }
    if (!birthDate) {
      setErrorMsg('Tanggal Lahir wajib dipilih.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Nomor Handphone Aktif minimal 10 digit angka.');
      return;
    }
    if (!isPpdb) {
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Alamat Email Aktif Pribadi tidak valid.');
        return;
      }
    }
    if (isPpdb) {
      if (!fatherName.trim()) {
        setErrorMsg('Nama Ayah Kandung wajib diisi.');
        return;
      }
      if (!motherName.trim()) {
        setErrorMsg('Nama Ibu Kandung wajib diisi.');
        return;
      }
      if (!studentAddress.trim()) {
        setErrorMsg('Alamat Domisili Siswa wajib diisi.');
        return;
      }
      if (!rt.trim()) {
        setErrorMsg('RT tempat tinggal wajib diisi.');
        return;
      }
      if (!rw.trim()) {
        setErrorMsg('RW tempat tinggal wajib diisi.');
        return;
      }
      if (!village.trim()) {
        setErrorMsg('Desa / Kelurahan wajib diisi.');
        return;
      }
      if (!district.trim()) {
        setErrorMsg('Kecamatan wajib diisi.');
        return;
      }
      if (!regency.trim()) {
        setErrorMsg('Kabupaten / Kota wajib diisi.');
        return;
      }
      if (!school.trim()) {
        setErrorMsg('Pilih Satuan Pendidikan / Sekolah Tujuan terlebih dahulu.');
        return;
      }
    }
    if (!isPpdb && captchaInput.trim().toLowerCase() !== generatedCaptcha.toLowerCase()) {
      setErrorMsg('Kode Captcha Pengaman tidak sesuai. Silakan ketik kembali kode yang tertera.');
      refreshCaptcha();
      return;
    }

    // Check if email already exists
    if (!isPpdb && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      const existing = registeredUsers.find(u => 
        u.email && u.email.toLowerCase() === cleanEmail
      );
      if (existing) {
        setErrorMsg(`Email "${cleanEmail}" sudah pernah terdaftar di sistem. Silakan login ke akun Anda.`);
        return;
      }
    }

    if (isPpdb) {
      // Transition to Langkah 2: Resume & Cetak Bukti Pendaftaran SPMB
      setRole('Siswa');
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2 Validation (Data Akun & Peran)
  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!password || password.length < 6) {
      setErrorMsg('Kata Sandi minimal 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi Kata Sandi tidak cocok dengan kata sandi yang dimasukkan.');
      return;
    }
    if (!school.trim()) {
      setErrorMsg('Nama Satuan Pendidikan / Sekolah wajib diisi.');
      return;
    }
    if ((role === 'Guru Pengampu' || role === 'Guru Kelas') && !subject.trim()) {
      setErrorMsg('Mata Pelajaran yang Diampu wajib diisi.');
      return;
    }
    if (role === 'Guru Kelas' && !assignedClass.trim()) {
      setErrorMsg('Kolom Kelas / Wali Kelas wajib diisi untuk Guru Kelas.');
      return;
    }

    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 3 Validation (Pengaman Akun)
  const handleNextStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!securityA1.trim()) {
      setErrorMsg('Jawaban Pengaman 1 wajib diisi.');
      return;
    }
    if (!securityA2.trim()) {
      setErrorMsg('Jawaban Pengaman 2 wajib diisi.');
      return;
    }

    setStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 4 Validation -> Go to Step 5 (Status & Antrean Aktivasi Administrator)
  const handleNextStep4 = () => {
    if (!agreed) {
      setErrorMsg('Anda harus mencentang pernyataan kebenaran data untuk melanjutkan ke tahap penyerahan pengajuan.');
      return;
    }
    setErrorMsg(null);
    setStep(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 5 Submit to Admin Queue -> Go to Step 6 (Bukti Pendaftaran)
  const handleFinalizeRegistration = () => {
    setErrorMsg(null);
    setIsSubmitting(true);

    const now = new Date();
    const formattedDate = new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(now);
    
    setRegisteredTimestamp(formattedDate);

    setTimeout(() => {
      setIsSubmitting(false);

      const newUid = `USER-SIMAK-${Date.now()}`;
      const newProfId = `PROF-SIMAK-${Date.now()}`;
      const cleanEmail = email.trim()
        ? email.trim().toLowerCase()
        : `spmb.${nisn.trim() || phone.trim() || Date.now()}@spmb.sekolah.id`;

      const newAccount: UserAccount = {
        uid: newUid,
        email: cleanEmail,
        password: isPpdb ? (password || nisn.trim() || phone.trim() || 'Siswa2026') : password,
        name: fullName.trim(),
        gender: gender || 'Laki-laki',
        schoolName: school.trim(),
        role: role,
        nip: '',
        phone: phone.trim(),
        birthPlace: birthPlace.trim(),
        birthDate: birthDate,
        registeredAt: now.toISOString(),
        profileId: newProfId,
        status: 'Menunggu Aktivasi',
        isMaintenance: false
      };

      const newProfile: TeacherProfile = {
        id: newProfId,
        name: fullName.trim(),
        gender: gender || 'Laki-laki',
        schoolName: school.trim(),
        title: role,
        nip: '',
        npsn: selectedSchoolObj?.npsn || '20500000',
        guardianClass: role === 'Guru Kelas' ? (assignedClass.trim() || '-') : '-',
        subjectRole: subject.trim() ? `${role} (${subject.trim()})` : role,
        academicYear: '2026/2027',
        semester: 'Ganjil',
        kkm: 75,
        principalName: 'Kepala Sekolah',
        principalNip: '19700101 199501 1 001',
        status: 'Nonaktif',
        isMaintenance: false
      };

      if (isPpdb) {
        const registrationNumber = `REG-SPMB-${now.getFullYear()}-${randomRegCode}`;
        const newPpdbRecord: PpdbRegistration = {
          id: `SPMB-${Date.now()}`,
          registrationNumber: registrationNumber,
          fullName: fullName.trim(),
          gender: (gender as 'Laki-laki' | 'Perempuan') || 'Laki-laki',
          birthPlace: birthPlace.trim(),
          birthDate: birthDate,
          phone: phone.trim(),
          email: cleanEmail,
          nisn: nisn.trim(),
          nik: nik.trim(),
          sekolahAsal: sekolahAsal.trim(),
          jalurPpdb: jalurPpdb || 'Zonasi',
          schoolTarget: school.trim() || 'Sekolah Terpilih',
          jenjangPendidikan: jenjangPendidikan || 'SMP / MTs',
          religion: religion || 'Islam',
          childOrder: childOrder || '1',
          siblingCount: siblingCount || '0',
          parentName: parentName.trim() || fatherName.trim(),
          parentPhone: parentPhone.trim() || phone.trim(),
          fatherName: fatherName.trim(),
          fatherBirthPlaceDate: fatherBirthPlaceDate.trim(),
          fatherJob: fatherJob,
          fatherEdu: fatherEdu,
          fatherAddress: fatherAddress.trim(),
          motherName: motherName.trim(),
          motherBirthPlaceDate: motherBirthPlaceDate.trim(),
          motherJob: motherJob,
          motherEdu: motherEdu,
          motherAddress: motherAddress.trim(),
          studentAddress: studentAddress.trim(),
          rt: rt.trim(),
          rw: rw.trim(),
          village: village.trim(),
          district: district.trim(),
          regency: regency.trim(),
          status: 'Menunggu Verifikasi',
          registeredAt: now.toISOString()
        };

        savePpdbRegistrationToFirebase(newPpdbRecord);
        if (onRegisterPpdb) {
          onRegisterPpdb(newPpdbRecord);
        }
      }

      if (onRegisterSuccess) {
        onRegisterSuccess(newAccount, newProfile);
      }

      setStep(isPpdb ? 3 : 6);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 700);
  };

  const handlePrintCard = () => {
    window.print();
  };

  // Steps definition for SIMAK Registration (6 Steps - Clickable 1 to 5)
  const stepsList = [
    { num: 1, label: 'Cek Identitas' },
    { num: 2, label: 'Data Akun' },
    { num: 3, label: 'Pengaman Akun' },
    { num: 4, label: 'Konfirmasi' },
    { num: 5, label: 'Aktivasi Admin' },
    { num: 6, label: 'Selesai' }
  ];

  return (
    <div className={`min-h-screen flex flex-col bg-[#f0f4f8] text-slate-800 ${
      fontSize === 'large' ? 'text-base' : fontSize === 'xlarge' ? 'text-lg' : 'text-sm'
    } ${highContrast ? 'contrast-125 saturate-150' : ''}`}>
      
      {/* 1. TOP NAVBAR HEADER (BRIGHT BLUE GRADIENT STYLE) */}
      <header className="w-full bg-gradient-to-r from-[#0369a1] via-[#0284c7] to-[#0ea5e9] text-white py-2.5 px-4 sm:px-8 border-b border-sky-300/40 shadow-md shrink-0 flex items-center justify-between z-30">
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <SimakEmblemLogo className="w-8 h-8 shrink-0 drop-shadow-sm" />
          <div>
            <h1 className="font-extrabold text-xs sm:text-sm md:text-base text-white leading-tight tracking-tight">
              {isPpdb ? 'SISTEM PENERIMAAN MURID BARU' : 'Sistem Informasi Akademik (SIMAK)'}
            </h1>
            <p className="text-[10px] sm:text-[11px] text-sky-100 font-medium line-clamp-1">
              {isPpdb ? 'Portal Penerimaan Murid Baru Online' : 'Portal Pendaftaran Akun Baru — Ikuti langkah pendaftaran akun berikut ini. Isilah data dengan benar.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2.5">
          {!isPpdb && (
            <button
              type="button"
              onClick={onOpenHelpdesk}
              className="text-xs font-semibold text-white/95 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-white/15"
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Helpdesk</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-white/95 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-white/15"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Portal</span>
          </button>

          {!isPpdb && (
            <button
              type="button"
              onClick={() => onSwitchToLogin(email)}
              className="bg-white/20 hover:bg-white/30 border border-white/40 text-white font-bold text-xs px-3.5 py-1 rounded-full flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. MAIN CARD CONTAINER (WIDER WITH SUBTLE CLEAN WHITE OUTLINE) */}
      <main className="flex-1 w-full max-w-5xl lg:max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-7 flex flex-col items-center">
        <div className="w-full bg-white rounded-2xl shadow-lg border-2 border-white ring-1 ring-white/70 overflow-hidden transition-all">
          
          {/* CARD TOP BANNER (ELEGANT BLUE GRADIENT WITH GRADUATION CAP) */}
          <div className="bg-gradient-to-r from-[#075985] via-[#0284c7] to-[#38bdf8] px-5 py-3.5 sm:px-6 sm:py-4 text-white flex items-center gap-3 border-b border-sky-300/40">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30 shadow-inner backdrop-blur-xs">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-xs" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base md:text-lg font-black text-white tracking-tight leading-tight">
                {isPpdb ? 'SISTEM PENERIMAAN MURID BARU' : 'Pendaftaran Akun Sistem Informasi Akademik (SIMAK)'}
              </h2>
              <p className="text-[11px] sm:text-xs text-sky-100 font-medium mt-0.5">
                {isPpdb ? 'Portal SPMB Merdeka' : 'Portal SIMAK Merdeka'}
              </p>
            </div>
          </div>

          {/* STEPPER BAR / INDICATOR */}
          <div className="bg-gradient-to-r from-sky-50/50 via-white to-sky-50/50 border-b border-slate-200 px-4 sm:px-8 py-3 sm:py-3.5">
            {isPpdb ? (
              <div className="w-full max-w-4xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
                {/* Step 1 Indicator */}
                <div
                  className={`flex items-center gap-2 select-none text-left p-2 sm:p-2.5 rounded-xl border transition-all cursor-default ${
                    step === 1 ? 'bg-sky-50/90 border-sky-300 ring-2 ring-sky-200/60 shadow-xs' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    step > 1 ? 'bg-emerald-600 text-white' : 'bg-[#1888c8] text-white shadow-sm shadow-[#1888c8]/30 ring-3 ring-sky-100'
                  }`}>
                    {step > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : 1}
                  </div>
                  <div>
                    <span className="block text-[9px] font-black tracking-wider uppercase text-[#1888c8]">
                      LANGKAH 1
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                      Pengisian Data SPMB
                    </span>
                  </div>
                </div>

                {/* Arrow / Line */}
                <div className="flex-1 h-0.5 bg-slate-200 hidden sm:block" />

                {/* Step 2 Indicator */}
                <div
                  className={`flex items-center gap-2 select-none text-left p-2 sm:p-2.5 rounded-xl border transition-all cursor-default ${
                    step === 2 ? 'bg-sky-50/90 border-sky-300 ring-2 ring-sky-200/60 shadow-xs' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    step > 2 ? 'bg-emerald-600 text-white' : step === 2 ? 'bg-[#1888c8] text-white shadow-sm shadow-[#1888c8]/30 ring-3 ring-sky-100' : 'border border-slate-300 text-slate-500 bg-white'
                  }`}>
                    {step > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : 2}
                  </div>
                  <div>
                    <span className="block text-[9px] font-black tracking-wider uppercase text-[#1888c8]">
                      LANGKAH 2
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                      Resume Pendaftaran
                    </span>
                  </div>
                </div>

                {/* Arrow / Line */}
                <div className="flex-1 h-0.5 bg-slate-200 hidden sm:block" />

                {/* Step 3 Indicator */}
                <div
                  className={`flex items-center gap-2 select-none text-left p-2 sm:p-2.5 rounded-xl border transition-all cursor-default ${
                    step === 3 ? 'bg-sky-50/90 border-sky-300 ring-2 ring-sky-200/60 shadow-xs' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    step === 3 ? 'bg-[#1888c8] text-white shadow-sm shadow-[#1888c8]/30 ring-3 ring-sky-100' : 'border border-slate-300 text-slate-500 bg-white'
                  }`}>
                    3
                  </div>
                  <div>
                    <span className="block text-[9px] font-black tracking-wider uppercase text-[#1888c8]">
                      LANGKAH 3
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                      Unduh Bukti Pendaftaran
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="w-full max-w-4xl mx-auto flex items-center justify-between">
                  {stepsList.map((st, idx) => {
                    const isActive = step === st.num;
                    const isCompleted = step > st.num;
                    return (
                      <React.Fragment key={st.num}>
                        <div
                          className={`flex items-center gap-1.5 sm:gap-2 select-none text-left p-1.5 rounded-xl border cursor-default ${
                            isActive 
                              ? 'bg-sky-50/90 border-sky-300 ring-2 ring-sky-200/60 shadow-xs' 
                              : 'border-transparent'
                          }`}
                        >
                          {/* Step Circle */}
                          <div className={`w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full flex items-center justify-center font-bold text-[11px] sm:text-xs shrink-0 transition-all ${
                            isActive
                              ? 'bg-[#1888c8] text-white shadow-sm shadow-[#1888c8]/30 ring-3 ring-sky-100 scale-105'
                              : isCompleted
                                ? 'bg-[#1888c8] text-white'
                                : 'border border-slate-300 text-slate-500 bg-white'
                          }`}>
                            {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : st.num}
                          </div>

                          {/* Step Text */}
                          <div className="text-left hidden md:block">
                            <span className={`block text-[9px] font-black tracking-wider uppercase transition-colors ${
                              isActive ? 'text-[#1888c8]' : isCompleted ? 'text-slate-600' : 'text-slate-400'
                            }`}>
                              LANGKAH {st.num}
                            </span>
                            <span className={`text-[11px] font-bold leading-tight transition-colors ${
                              isActive ? 'text-slate-900 font-extrabold' : isCompleted ? 'text-slate-700' : 'text-slate-500'
                            }`}>
                              {st.label}
                            </span>
                          </div>
                        </div>

                        {/* Horizontal Connector Line */}
                        {idx < stepsList.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1 sm:mx-2 transition-colors duration-300 ${
                            step > idx + 1 ? 'bg-[#1888c8]' : 'bg-slate-200'
                          }`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Mobile Step Progress Indicator (Non-clickable) */}
                <div className="mt-2.5 text-center md:hidden border-t border-slate-100 pt-2 flex items-center justify-center gap-1.5 flex-wrap">
                  {stepsList.map((st) => (
                    <div
                      key={st.num}
                      className={`px-2 py-1 text-[10px] font-extrabold rounded-lg select-none cursor-default ${
                        step === st.num
                          ? 'bg-[#1888c8] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {st.num}. {st.label}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* CARD BODY CONTENT */}
          <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5">
            
            {/* NOTICE WARNING BOX (PERHATIAN) */}
            <div className="p-3 sm:p-3.5 rounded-lg bg-[#edf6fc] border border-sky-200 text-sky-950 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#1888c8] shrink-0 mt-0.5" />
              <p className="text-[11px] sm:text-xs leading-relaxed">
                <span className="font-black text-sky-950">PERHATIAN: </span>
                Pengisian data identitas pendaftar pada Sistem Informasi Akademik (SIMAK) harus sesuai dengan data penugasan akademik yang sah. Penyalahgunaan identitas orang lain merupakan tindak pelanggaran dan akan dikenakan sanksi sesuai ketentuan yang berlaku.
              </p>
            </div>

            {/* ERROR ALERT IF ANY */}
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{errorMsg}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setErrorMsg(null)}
                  className="text-rose-500 hover:text-rose-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* STEP 1: CEK IDENTITAS / DATA IDENTITAS SPMB */}
            {step === 1 && (
              <form onSubmit={handleNextStep1} className="space-y-4 sm:space-y-5 animate-fadeIn">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <span className="text-[#1888c8] font-black text-xs sm:text-[13px] uppercase tracking-wider">
                    {isPpdb ? 'LANGKAH 1 : DATA IDENTITAS CALON SISWA BARU (SPMB)' : 'LANGKAH 1 : DATA IDENTITAS PENDAFTAR'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {/* Nama Lengkap */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isPpdb ? 'Nama Lengkap Calon Siswa Baru *' : 'Nama Lengkap beserta gelar *'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={isPpdb ? 'Contoh: Ananda Muhammad Rizki' : 'Contoh: Ahmad Dahlan, S.Pd.'}
                        className="w-full pl-3.5 pr-9 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                    </div>
                  </div>

                  {/* NISN (Jika PPDB) */}
                  {isPpdb && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        NISN (Nomor Induk Siswa Nasional) *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={10}
                        value={nisn}
                        onChange={(e) => setNisn(e.target.value.replace(/\D/g, ''))}
                        placeholder="10 Digit Angka NISN (contoh: 0081234567)"
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs"
                      />
                    </div>
                  )}

                  {/* NIK Siswa / No KK (Jika PPDB) */}
                  {isPpdb && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        NIK Siswa / No. Kartu Keluarga (16 Digit) *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={16}
                        value={nik}
                        onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                        placeholder="16 Digit Angka NIK KTP / KK"
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs"
                      />
                    </div>
                  )}

                  {/* Sekolah Asal (Jika PPDB) */}
                  {isPpdb && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Sekolah Asal (SD / SMP / TK Sebelumnya) *
                      </label>
                      <input
                        type="text"
                        required
                        value={sekolahAsal}
                        onChange={(e) => setSekolahAsal(e.target.value)}
                        placeholder="Contoh: SMP Negeri 1 Wagir / SD Negeri 1"
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs"
                      />
                    </div>
                  )}

                  {/* Tempat Lahir */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tempat Lahir *
                    </label>
                    <input
                      type="text"
                      required
                      value={birthPlace}
                      onChange={(e) => setBirthPlace(e.target.value)}
                      placeholder="Contoh: Malang / Jakarta"
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs"
                    />
                  </div>

                  {/* Jenis Kelamin */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Jenis Kelamin *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setGender('Laki-laki')}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          gender === 'Laki-laki'
                            ? 'bg-sky-50 border-[#1888c8] text-[#1888c8] ring-2 ring-sky-500/20 shadow-2xs'
                            : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          gender === 'Laki-laki' ? 'border-[#1888c8] bg-[#1888c8]' : 'border-slate-400'
                        }`}>
                          {gender === 'Laki-laki' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                        <span>Laki-laki</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setGender('Perempuan')}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          gender === 'Perempuan'
                            ? 'bg-sky-50 border-[#1888c8] text-[#1888c8] ring-2 ring-sky-500/20 shadow-2xs'
                            : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          gender === 'Perempuan' ? 'border-[#1888c8] bg-[#1888c8]' : 'border-slate-400'
                        }`}>
                          {gender === 'Perempuan' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                        <span>Perempuan</span>
                      </button>
                    </div>
                  </div>

                  {/* Tanggal Lahir */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tanggal Lahir (Sesuai Ijazah) *
                    </label>
                    <input
                      type="date"
                      required
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs cursor-pointer"
                    />
                  </div>

                  {/* Nomor Handphone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isPpdb ? 'No. HP / WhatsApp Siswa / Orang Tua *' : 'Nomor Handphone Aktif / WhatsApp *'}
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="Contoh: 081234567890"
                        className="w-full pl-3.5 pr-9 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] font-mono shadow-2xs"
                      />
                      <Smartphone className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                    </div>
                  </div>

                  {/* Agama (Khusus SPMB) */}
                  {isPpdb && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Agama *
                      </label>
                      <select
                        value={religion}
                        onChange={(e) => setReligion(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs cursor-pointer"
                      >
                        <option value="Islam">Islam</option>
                        <option value="Kristen Protestan">Kristen Protestan</option>
                        <option value="Katolik">Katolik</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Buddha">Buddha</option>
                        <option value="Khonghucu">Khonghucu</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                  )}

                  {/* Anak Ke (Khusus SPMB) */}
                  {isPpdb && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Anak Ke- *
                      </label>
                      <input
                        type="text"
                        required={isPpdb}
                        value={childOrder}
                        onChange={(e) => setChildOrder(e.target.value)}
                        placeholder="Contoh: 1"
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs font-mono"
                      />
                    </div>
                  )}

                  {/* Jumlah Saudara Kandung (Khusus SPMB) */}
                  {isPpdb && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Jumlah Saudara Kandung *
                      </label>
                      <input
                        type="text"
                        required={isPpdb}
                        value={siblingCount}
                        onChange={(e) => setSiblingCount(e.target.value)}
                        placeholder="Contoh: 2 (atau 0 jika anak tunggal)"
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs font-mono"
                      />
                    </div>
                  )}

                  {/* Email Aktif Pribadi (Hanya untuk pendaftar non-SPMB) */}
                  {!isPpdb && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Alamat Email Aktif *
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required={!isPpdb}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="nama@email.com"
                          className="w-full pl-3.5 pr-9 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] font-mono shadow-2xs"
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                      </div>
                    </div>
                  )}

                </div>

                {/* Data Orang Tua / Wali & Alamat Lengkap (Khusus SPMB) */}
                {isPpdb && (
                  <div className="space-y-4 pt-3 border-t border-slate-200">
                    
                    {/* SECTION AYAH KANDUNG */}
                    <div className="space-y-3 bg-slate-50/50 p-3.5 sm:p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-800 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-600" />
                          DATA AYAH KANDUNG
                        </span>
                        <div className="flex-1 h-px bg-slate-200" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Nama Ayah Kandung *
                          </label>
                          <input
                            type="text"
                            required={isPpdb}
                            value={fatherName}
                            onChange={(e) => setFatherName(e.target.value)}
                            placeholder="Contoh: Budi Santoso"
                            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Tempat, Tanggal Lahir Ayah
                          </label>
                          <input
                            type="text"
                            value={fatherBirthPlaceDate}
                            onChange={(e) => setFatherBirthPlaceDate(e.target.value)}
                            placeholder="Contoh: Malang, 15 Mei 1978"
                            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Pekerjaan Ayah
                          </label>
                          <input
                            type="text"
                            value={fatherJob}
                            onChange={(e) => setFatherJob(e.target.value)}
                            placeholder="Contoh: Wiraswasta / PNS / Buruh / Tani"
                            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Pendidikan Terakhir Ayah
                          </label>
                          <select
                            value={fatherEdu}
                            onChange={(e) => setFatherEdu(e.target.value)}
                            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs cursor-pointer"
                          >
                            <option value="SD/MI">SD/MI</option>
                            <option value="SMP/MTs">SMP/MTs</option>
                            <option value="SMA/SMK/MA">SMA/SMK/MA</option>
                            <option value="D3">D3</option>
                            <option value="S1/D4">S1 / D4</option>
                            <option value="S2">S2</option>
                            <option value="S3">S3</option>
                            <option value="Tidak Sekolah">Tidak Sekolah</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Alamat Ayah
                          </label>
                          <input
                            type="text"
                            value={fatherAddress}
                            onChange={(e) => setFatherAddress(e.target.value)}
                            placeholder="Contoh: Jl. Mawar No. 12, RT 01/RW 02 (kosongkan jika sama dengan siswa)"
                            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION IBU KANDUNG */}
                    <div className="space-y-3 bg-slate-50/50 p-3.5 sm:p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-800 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-600" />
                          DATA IBU KANDUNG
                        </span>
                        <div className="flex-1 h-px bg-slate-200" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Nama Ibu Kandung *
                          </label>
                          <input
                            type="text"
                            required={isPpdb}
                            value={motherName}
                            onChange={(e) => setMotherName(e.target.value)}
                            placeholder="Contoh: Siti Rahma"
                            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Tempat, Tanggal Lahir Ibu
                          </label>
                          <input
                            type="text"
                            value={motherBirthPlaceDate}
                            onChange={(e) => setMotherBirthPlaceDate(e.target.value)}
                            placeholder="Contoh: Surabaya, 20 Agustus 1982"
                            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Pekerjaan Ibu
                          </label>
                          <input
                            type="text"
                            value={motherJob}
                            onChange={(e) => setMotherJob(e.target.value)}
                            placeholder="Contoh: Ibu Rumah Tangga / PNS / Swasta"
                            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Pendidikan Terakhir Ibu
                          </label>
                          <select
                            value={motherEdu}
                            onChange={(e) => setMotherEdu(e.target.value)}
                            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs cursor-pointer"
                          >
                            <option value="SD/MI">SD/MI</option>
                            <option value="SMP/MTs">SMP/MTs</option>
                            <option value="SMA/SMK/MA">SMA/SMK/MA</option>
                            <option value="D3">D3</option>
                            <option value="S1/D4">S1 / D4</option>
                            <option value="S2">S2</option>
                            <option value="S3">S3</option>
                            <option value="Tidak Sekolah">Tidak Sekolah</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Alamat Ibu
                          </label>
                          <input
                            type="text"
                            value={motherAddress}
                            onChange={(e) => setMotherAddress(e.target.value)}
                            placeholder="Contoh: Jl. Mawar No. 12, RT 01/RW 02 (kosongkan jika sama dengan siswa)"
                            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION ALAMAT DOMISILI */}
                    <div className="space-y-3 bg-slate-50/80 p-3.5 sm:p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-800 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-[#1888c8]" />
                          NAMA WALI (OPSIONAL) & ALAMAT DOMISILI LENGKAP
                        </span>
                        <div className="flex-1 h-px bg-slate-200" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        {/* Nama Wali (Jika beda dari Ayah / Ibu) */}
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Nama Wali / Penanggung Jawab (Kosongi jika sama dengan Ayah/Ibu)
                          </label>
                          <input
                            type="text"
                            value={parentName}
                            onChange={(e) => setParentName(e.target.value)}
                            placeholder="Contoh: Kakek / Paman / Wali jika tidak tinggal bersama Ayah/Ibu"
                            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs"
                          />
                        </div>

                        {/* Alamat Jalan / Dusun / No. Rumah */}
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Alamat Jalan / Dusun / No. Rumah *
                          </label>
                          <input
                            type="text"
                            required={isPpdb}
                            value={studentAddress}
                            onChange={(e) => setStudentAddress(e.target.value)}
                            placeholder="Contoh: Jl. Merdeka No. 45, Dusun Krajan"
                            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs"
                          />
                        </div>

                        {/* RT */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            RT *
                          </label>
                          <input
                            type="text"
                            required={isPpdb}
                            value={rt}
                            onChange={(e) => setRt(e.target.value)}
                            placeholder="Contoh: 002"
                            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs"
                          />
                        </div>

                        {/* RW */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            RW *
                          </label>
                          <input
                            type="text"
                            required={isPpdb}
                            value={rw}
                            onChange={(e) => setRw(e.target.value)}
                            placeholder="Contoh: 005"
                            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs"
                          />
                        </div>

                        {/* Desa / Kelurahan */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Desa / Kelurahan *
                          </label>
                          <input
                            type="text"
                            required={isPpdb}
                            value={village}
                            onChange={(e) => setVillage(e.target.value)}
                            placeholder="Contoh: Sukorejo"
                            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs"
                          />
                        </div>

                        {/* Kecamatan */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Kecamatan *
                          </label>
                          <input
                            type="text"
                            required={isPpdb}
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            placeholder="Contoh: Wagir"
                            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs"
                          />
                        </div>

                        {/* Kabupaten / Kota */}
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Kabupaten / Kota *
                          </label>
                          <input
                            type="text"
                            required={isPpdb}
                            value={regency}
                            onChange={(e) => setRegency(e.target.value)}
                            placeholder="Contoh: Kabupaten Malang / Kota Malang"
                            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* Sekolah Tujuan (Khusus SPMB) */}
                {isPpdb && (
                  <div className="space-y-3 pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-[#1888c8] font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-[#1888c8]" />
                        SEKOLAH TUJUAN PENDAFTARAN (SPMB)
                      </span>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      {/* Jenjang Pendidikan Tujuan */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Jenjang Pendidikan Sekolah Tujuan *
                        </label>
                        <select
                          value={jenjangPendidikan}
                          onChange={(e) => setJenjangPendidikan(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs cursor-pointer"
                        >
                          <option value="">-- Pilih Jenjang --</option>
                          <option value="SD / MI">SD / MI (Sekolah Dasar / MI)</option>
                          <option value="SMP / MTs">SMP / MTs (Sekolah Menengah Pertama / MTs)</option>
                          <option value="SMA / MA / SMK">SMA / MA / SMK (Sekolah Menengah Kejuruan/Atas)</option>
                        </select>
                      </div>

                      {/* Pilihan Sekolah Tujuan */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Satuan Pendidikan / Sekolah Tujuan (SPMB) *
                        </label>
                        <select
                          required
                          value={school}
                          onChange={(e) => setSchool(e.target.value)}
                          disabled={!jenjangPendidikan}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          {filteredSchoolsList.length === 0 ? (
                            <option value="">
                              {!jenjangPendidikan ? '-- Pilih Jenjang Pendidikan Dahulu --' : '-- Tidak ada sekolah ditemukan --'}
                            </option>
                          ) : (
                            filteredSchoolsList.map((s) => (
                              <option key={s.id || s.name} value={s.name}>
                                {s.name} (NPSN: {s.npsn || '-'})
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Captcha Box (Non-SPMB Only) */}
                {!isPpdb && (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="px-4 py-1.5 bg-gradient-to-r from-sky-700 to-sky-900 text-white font-mono font-black text-lg tracking-widest rounded-md select-none shadow-inner border border-sky-800 transform rotate-1">
                          {generatedCaptcha}
                        </div>
                        <button
                          type="button"
                          onClick={refreshCaptcha}
                          title="Segarkan Captcha"
                          className="p-2 bg-white hover:bg-slate-100 text-slate-600 rounded-md border border-slate-300 transition-colors shadow-2xs cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex-1 w-full sm:w-auto">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Ketik Kode Captcha di atas *
                        </label>
                        <input
                          type="text"
                          required
                          value={captchaInput}
                          onChange={(e) => setCaptchaInput(e.target.value)}
                          placeholder="Masukkan kode captcha"
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs sm:text-sm font-semibold text-slate-800 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] font-mono shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Action Button */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-2.5">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-[#1888c8] hover:bg-[#1478b0] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {isPpdb ? (
                      <>
                        <span>Lanjutkan ke Langkah 2 : Resume Pendaftaran</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Lanjutkan ke Langkah 2</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2 (KHUSUS SPMB) : RESUME PENDAFTARAN */}
            {step === 2 && isPpdb && (
              <div className="space-y-4 sm:space-y-5 animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <span className="text-[#1888c8] font-black text-xs sm:text-[13px] uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#1888c8]" />
                    LANGKAH 2 : RESUME PENDAFTARAN SPMB
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <p className="text-xs text-slate-600">
                  Periksa kembali seluruh ringkasan data pendaftaran calon siswa baru sebelum melanjutkan ke halaman cetak bukti pendaftaran.
                </p>

                {/* TABEL RESUME DATA PENDAFTARAN */}
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <tbody className="divide-y divide-slate-200">
                      <tr className="bg-slate-50/70">
                        <td className="py-2 px-3 font-bold text-slate-600 w-1/3">Nama Lengkap Siswa</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{fullName}</td>
                      </tr>
                      {nisn && (
                        <tr className="bg-sky-50/80">
                          <td className="py-2 px-3 font-bold text-slate-700">NISN Siswa</td>
                          <td className="py-2 px-3 font-mono font-bold text-sky-800">{nisn}</td>
                        </tr>
                      )}
                      {nik && (
                        <tr>
                          <td className="py-2 px-3 font-bold text-slate-600">NIK Siswa / KK</td>
                          <td className="py-2 px-3 font-mono text-slate-800">{nik}</td>
                        </tr>
                      )}
                      {sekolahAsal && (
                        <tr className="bg-slate-50/70">
                          <td className="py-2 px-3 font-bold text-slate-600">Sekolah Asal</td>
                          <td className="py-2 px-3 font-semibold text-slate-800">{sekolahAsal}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-600">Tempat & Tanggal Lahir</td>
                        <td className="py-2 px-3 font-medium text-slate-800">{birthPlace}, {birthDate}</td>
                      </tr>
                      <tr className="bg-slate-50/70">
                        <td className="py-2 px-3 font-bold text-slate-600">Jenis Kelamin & Agama</td>
                        <td className="py-2 px-3 font-medium text-slate-800">{gender || '-'} | Agama: <span className="font-bold">{religion}</span></td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-600">Anak Ke / Sdr. Kandung</td>
                        <td className="py-2 px-3 font-medium text-slate-800">Anak ke-<strong>{childOrder}</strong> dari <strong>{siblingCount}</strong> bersaudara</td>
                      </tr>
                      <tr className="bg-slate-50/70">
                        <td className="py-2 px-3 font-bold text-slate-600">No. HP / WhatsApp</td>
                        <td className="py-2 px-3 font-mono text-slate-800">{phone}</td>
                      </tr>
                      {fatherName && (
                        <tr className="bg-slate-50/70">
                          <td className="py-2 px-3 font-bold text-slate-700">Data Ayah Kandung</td>
                          <td className="py-2 px-3 text-slate-800">
                            <div className="font-bold text-slate-900">{fatherName}</div>
                            <div className="text-slate-600 text-[11px]">TTL: {fatherBirthPlaceDate || '-'} | Pekerjaan: {fatherJob || '-'} | Pendidikan: {fatherEdu || '-'}</div>
                            {fatherAddress && <div className="text-slate-600 text-[11px] font-medium mt-0.5">Alamat: {fatherAddress}</div>}
                          </td>
                        </tr>
                      )}
                      {motherName && (
                        <tr>
                          <td className="py-2 px-3 font-bold text-slate-700">Data Ibu Kandung</td>
                          <td className="py-2 px-3 text-slate-800">
                            <div className="font-bold text-slate-900">{motherName}</div>
                            <div className="text-slate-600 text-[11px]">TTL: {motherBirthPlaceDate || '-'} | Pekerjaan: {motherJob || '-'} | Pendidikan: {motherEdu || '-'}</div>
                            {motherAddress && <div className="text-slate-600 text-[11px] font-medium mt-0.5">Alamat: {motherAddress}</div>}
                          </td>
                        </tr>
                      )}
                      {parentName && (
                        <tr className="bg-slate-50/70">
                          <td className="py-2 px-3 font-bold text-slate-600">Nama Wali / Penanggung Jawab</td>
                          <td className="py-2 px-3 font-semibold text-slate-800">
                            {parentName} {parentPhone && <span className="font-mono text-xs text-slate-600 font-normal ml-2">(No. HP: {parentPhone})</span>}
                          </td>
                        </tr>
                      )}
                      {(studentAddress || village || district || regency) && (
                        <tr>
                          <td className="py-2 px-3 font-bold text-slate-600">Alamat Domisili Lengkap</td>
                          <td className="py-2 px-3 text-slate-800">
                            {studentAddress && <div>{studentAddress}</div>}
                            {(rt || rw) && <div>RT {rt || '-'} / RW {rw || '-'}</div>}
                            {(village || district || regency) && (
                              <div className="text-slate-600 font-medium">
                                {[village && `Desa/Kel. ${village}`, district && `Kec. ${district}`, regency].filter(Boolean).join(', ')}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                      <tr className="bg-slate-50/70">
                        <td className="py-2 px-3 font-bold text-slate-600">Keterangan</td>
                        <td className="py-2 px-3 font-bold text-[#1888c8]">Siswa / Peserta Didik Baru (SPMB)</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-600">Sekolah Tujuan (SPMB)</td>
                        <td className="py-2 px-3 font-bold text-[#1888c8]">{school}</td>
                      </tr>
                      <tr className="bg-slate-50/70">
                        <td className="py-2 px-3 font-bold text-slate-600">NPSN Sekolah</td>
                        <td className="py-2 px-3 font-mono font-bold text-[#1888c8]">
                          {selectedSchoolObj?.npsn || '-'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Agreement Checkbox */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-300">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 w-3.5 h-3.5 rounded text-[#1888c8] focus:ring-sky-500 cursor-pointer"
                    />
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-800 leading-relaxed">
                      Saya menyatakan dengan sesungguhnya bahwa seluruh data pendaftaran SPMB yang saya isikan adalah benar, sah, dan sesuai dengan dokumen resmi.
                    </span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Langkah 1 (Edit Data)</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting || !agreed}
                    onClick={handleFinalizeRegistration}
                    className="w-full sm:w-auto bg-[#1888c8] hover:bg-[#1478b0] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengirim Data SPMB...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Kirim Data</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 (NON-SPMB): DATA AKUN & PERAN */}
            {step === 2 && !isPpdb && (
              <form onSubmit={handleNextStep2} className="space-y-4 sm:space-y-5 animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <span className="text-[#1888c8] font-black text-xs sm:text-[13px] uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#1888c8]" />
                    LANGKAH 2 : DATA AKUN & KATA SANDI
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Info Box Langkah 2 */}
                <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-sky-950 text-xs space-y-0.5">
                  <div className="font-bold flex items-center gap-1.5 text-sky-900">
                    <Info className="w-3.5 h-3.5 text-sky-700" />
                    <span>Pengaturan Akun & Keamanan:</span>
                  </div>
                  <p className="text-[11px] text-sky-900/90 leading-relaxed">
                    Tentukan kata sandi baru untuk login dan pilih peran wewenang serta satuan pendidikan Anda. Alamat email dan nama pendaftar terkunci sesuai pengisian Langkah 1.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {/* Email */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Email Resmi Akun
                      </label>
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        Langkah 1
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        disabled
                        value={email}
                        className="w-full pl-3.5 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-600 font-mono select-none"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                    </div>
                  </div>

                  {/* Nama Lengkap */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Nama Lengkap beserta gelar
                      </label>
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        Langkah 1
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        disabled
                        value={fullName}
                        className="w-full pl-3.5 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-600 select-none"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kata Sandi Baru *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full pl-3.5 pr-9 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ulangi Kata Sandi *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full pl-3.5 pr-9 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Hak Akses / Jabatan */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Hak Akses / Peran Akun *
                    </label>
                    <div className="relative">
                      {isPpdb ? (
                        <div className="p-2 bg-sky-50 border border-sky-300 rounded-lg text-xs font-bold text-sky-800 flex items-center justify-between">
                          <span>Siswa / Peserta Didik Baru (SPMB)</span>
                          <span className="text-[10px] bg-sky-200 text-sky-900 px-1.5 py-0.5 rounded">Otomatis SPMB</span>
                        </div>
                      ) : (
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs cursor-pointer"
                        >
                          <option value="Guru Pengampu">Guru Pengampu (Mata Pelajaran)</option>
                          <option value="Guru Kelas">Guru Kelas / Wali Kelas</option>
                          <option value="Siswa">Siswa / Peserta Didik</option>
                          <option value="Kurikulum">Tim Kurikulum / Pengelola KSP</option>
                          <option value="Tata Usaha (TU)">Staf Tata Usaha (TU) / Administrasi</option>
                          <option value="Keuangan">Bendahara / Pengelola Keuangan</option>
                          <option value="Kesiswaan">Wakasek Kesiswaan / Tim Kesiswaan</option>
                          <option value="Guru BK">Guru BK (Bimbingan Konseling)</option>
                          <option value="Kepala Sekolah">Kepala Sekolah / Manajemen</option>
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Jalur Pendaftaran SPMB (Khusus SPMB) */}
                  {isPpdb && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Jalur Pendaftaran SPMB *
                      </label>
                      <select
                        value={jalurPpdb}
                        onChange={(e) => setJalurPpdb(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs cursor-pointer"
                      >
                        <option value="Zonasi">Zonasi (Berdasarkan Domisili / Jarak Rumah)</option>
                        <option value="Prestasi">Prestasi (Nilai Rapor & Piagam Kejuaraan)</option>
                        <option value="Afirmasi">Afirmasi (KIP / Keluarga Kurang Mampu)</option>
                        <option value="Perpindahan Tugas">Perpindahan Tugas Orang Tua / Wali</option>
                      </select>
                    </div>
                  )}

                  {/* Nama Orang Tua / Wali (Khusus PPDB) */}
                  {isPpdb && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Ayah / Ibu / Wali Siswa *
                      </label>
                      <input
                        type="text"
                        required
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        placeholder="Contoh: Bambang Setyono (Ayah Kandung)"
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs"
                      />
                    </div>
                  )}

                  {/* No HP Orang Tua / Wali (Khusus PPDB) */}
                  {isPpdb && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        No. HP / WhatsApp Orang Tua / Wali *
                      </label>
                      <input
                        type="tel"
                        required
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="Contoh: 081298765432"
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs"
                      />
                    </div>
                  )}

                  {/* Mata Pelajaran (Diperlihatkan jika memilih Guru Pengampu atau Guru Kelas) */}
                  {(role === 'Guru Pengampu' || role === 'Guru Kelas') && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mata Pelajaran yang Diampu *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="Contoh: Matematika, Bahasa Indonesia, IPA, PJOK, dsb."
                          className="w-full pl-3.5 pr-9 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs"
                        />
                        <BookOpen className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium mt-1">
                        * Masukkan mata pelajaran utama yang Anda ampu di sekolah.
                      </p>
                    </div>
                  )}

                  {/* Kelas (Diperlihatkan jika memilih Guru Kelas) */}
                  {role === 'Guru Kelas' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Kelas / Wali Kelas *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={assignedClass}
                          onChange={(e) => setAssignedClass(e.target.value)}
                          placeholder="Contoh: Kelas 1A, Kelas IV, Kelas 7B, Kelas X, dsb."
                          className="w-full pl-3.5 pr-9 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs"
                        />
                        <Users className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium mt-1">
                        * Isikan nama kelas yang Anda ampu sebagai Guru Kelas / Wali Kelas.
                      </p>
                    </div>
                  )}

                  {/* Jenjang Pendidikan */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Jenjang Pendidikan / Tingkat Sekolah *
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={jenjangPendidikan}
                        onChange={(e) => setJenjangPendidikan(e.target.value)}
                        className="w-full pl-3.5 pr-9 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs cursor-pointer appearance-none"
                      >
                        <option value="">-- Pilih Jenjang Pendidikan --</option>
                        <option value="SD / MI">SD / MI (Sekolah Dasar / Madrasah Ibtidaiyah)</option>
                        <option value="SMP / MTs">SMP / MTs (Sekolah Menengah Pertama / Madrasah Tsanawiyah)</option>
                        <option value="SMA / MA">SMA / MA (Sekolah Menengah Atas / Madrasah Aliyah / SMK)</option>
                      </select>
                      <GraduationCap className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Nama Sekolah */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Sekolah / Satuan Pendidikan Terdaftar *
                    </label>
                    <div className="relative">
                      <select
                        required
                        disabled={!jenjangPendidikan}
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        className="w-full pl-3.5 pr-9 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs cursor-pointer appearance-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                      >
                        {!jenjangPendidikan ? (
                          <option value="">-- Pilih Jenjang Pendidikan Terlebih Dahulu --</option>
                        ) : filteredSchoolsList.length === 0 ? (
                          <option value="">-- Data Kosong (Belum Ada Sekolah Terdaftar) --</option>
                        ) : (
                          filteredSchoolsList.map((sch) => (
                            <option key={sch.id || sch.name} value={sch.name}>
                              {sch.name}
                            </option>
                          ))
                        )}
                      </select>
                      <Building2 className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>

                    <p className="text-[10px] text-slate-500 font-medium mt-1">
                      {!jenjangPendidikan 
                        ? '* Silakan pilih jenjang pendidikan terlebih dahulu untuk mengaktifkan pilihan sekolah.' 
                        : '* Pilihan sekolah terdaftar diatur dan hanya dapat ditambahkan oleh Administrator SIMAK.'}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Langkah 1</span>
                  </button>

                  <button
                    type="submit"
                    className="bg-[#1888c8] hover:bg-[#1478b0] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>Lanjutkan ke Langkah 3</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: PENGAMAN AKUN (PERTANYAAN PENGAMAN - NON SPMB) */}
            {step === 3 && !isPpdb && (
              <form onSubmit={handleNextStep3} className="space-y-4 sm:space-y-5 animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <span className="text-[#1888c8] font-black text-xs sm:text-[13px] uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    LANGKAH 3 : PERTANYAAN PENGAMAN AKUN
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-sky-950 text-xs space-y-0.5">
                  <div className="font-bold flex items-center gap-1.5 text-sky-900">
                    <HelpCircle className="w-3.5 h-3.5 text-sky-700" />
                    <span>Keamanan Akun SIMAK:</span>
                  </div>
                  <p className="text-[11px] text-sky-900/90 leading-relaxed">
                    Pertanyaan pengaman digunakan untuk memverifikasi kepemilikan akun saat Anda lupa kata sandi atau melakukan pemulihan akun di kemudian hari.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {/* Pertanyaan Pengaman 1 */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pilihan Pertanyaan Pengaman 1 *
                    </label>
                    <select
                      value={securityQ1}
                      onChange={(e) => setSecurityQ1(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs cursor-pointer"
                    >
                      <option value="Siapa nama hewan peliharaan pertama Anda?">Siapa nama hewan peliharaan pertama Anda?</option>
                      <option value="Apa nama SD tempat Anda pertama kali bersekolah?">Apa nama SD tempat Anda pertama kali bersekolah?</option>
                      <option value="Apa judul film favorit masa kecil Anda?">Apa judul film favorit masa kecil Anda?</option>
                    </select>
                  </div>

                  {/* Jawaban Pengaman 1 */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Jawaban Pengaman 1 *
                    </label>
                    <input
                      type="text"
                      required
                      value={securityA1}
                      onChange={(e) => setSecurityA1(e.target.value)}
                      placeholder="Masukkan jawaban pengaman 1"
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs"
                    />
                  </div>

                  {/* Pertanyaan Pengaman 2 */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pilihan Pertanyaan Pengaman 2 *
                    </label>
                    <select
                      value={securityQ2}
                      onChange={(e) => setSecurityQ2(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs cursor-pointer"
                    >
                      <option value="Apa nama kota kelahiran Anda?">Apa nama kota kelahiran Anda?</option>
                      <option value="Siapa nama guru paling berkesan saat Anda sekolah?">Siapa nama guru paling berkesan saat Anda sekolah?</option>
                      <option value="Apa makanan favorit Anda saat kecil?">Apa makanan favorit Anda saat kecil?</option>
                    </select>
                  </div>

                  {/* Jawaban Pengaman 2 */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Jawaban Pengaman 2 *
                    </label>
                    <input
                      type="text"
                      required
                      value={securityA2}
                      onChange={(e) => setSecurityA2(e.target.value)}
                      placeholder="Masukkan jawaban pengaman 2"
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-[#1888c8] shadow-2xs"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali</span>
                  </button>

                  <button
                    type="submit"
                    className="bg-[#1888c8] hover:bg-[#1478b0] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>Lanjutkan ke Konfirmasi</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: KONFIRMASI (RESUME PENDAFTARAN) */}
            {step === 4 && (
              <div className="space-y-4 sm:space-y-5 animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <span className="text-[#1888c8] font-black text-xs sm:text-[13px] uppercase tracking-wider">
                    LANGKAH 4 : RESUME PENDAFTARAN AKUN SIMAK
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <p className="text-xs text-slate-600">
                  Periksa kembali seluruh ringkasan data pendaftaran Anda sebelum menekan tombol pengajuan ke Administrator.
                </p>

                {/* Table Summary */}
                <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <tbody className="divide-y divide-slate-200">
                      <tr className="bg-slate-50/70">
                        <td className="py-2 px-3 font-bold text-slate-600 w-1/3">Nama Lengkap</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{fullName}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-600">Jenis Kelamin</td>
                        <td className="py-2 px-3 font-medium text-slate-800">{gender || '-'}</td>
                      </tr>
                      <tr className="bg-slate-50/70">
                        <td className="py-2 px-3 font-bold text-slate-600">Nomor Handphone / WA</td>
                        <td className="py-2 px-3 font-mono text-slate-800">{phone}</td>
                      </tr>
                      {!isPpdb && (
                        <tr>
                          <td className="py-2 px-3 font-bold text-slate-600">Email Pribadi</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-900">{email}</td>
                        </tr>
                      )}
                      <tr className="bg-slate-50/70">
                        <td className="py-2 px-3 font-bold text-slate-600">Tempat & Tanggal Lahir</td>
                        <td className="py-2 px-3 font-medium text-slate-800">{birthPlace}, {birthDate}</td>
                      </tr>
                      {isPpdb && nisn && (
                        <tr className="bg-sky-50/80">
                          <td className="py-2 px-3 font-bold text-slate-700">NISN Siswa</td>
                          <td className="py-2 px-3 font-mono font-bold text-sky-800">{nisn}</td>
                        </tr>
                      )}
                      {isPpdb && nik && (
                        <tr>
                          <td className="py-2 px-3 font-bold text-slate-600">NIK Siswa / KK</td>
                          <td className="py-2 px-3 font-mono text-slate-800">{nik}</td>
                        </tr>
                      )}
                      {isPpdb && sekolahAsal && (
                        <tr className="bg-slate-50/70">
                          <td className="py-2 px-3 font-bold text-slate-600">Sekolah Asal (Sebelumnya)</td>
                          <td className="py-2 px-3 font-semibold text-slate-800">{sekolahAsal}</td>
                        </tr>
                      )}
                      {isPpdb && jalurPpdb && (
                        <tr>
                          <td className="py-2 px-3 font-bold text-slate-600">Jalur Pendaftaran SPMB</td>
                          <td className="py-2 px-3 font-bold text-emerald-700">{jalurPpdb}</td>
                        </tr>
                      )}
                      {isPpdb && parentName && (
                        <tr className="bg-slate-50/70">
                          <td className="py-2 px-3 font-bold text-slate-600">Nama Orang Tua / Wali</td>
                          <td className="py-2 px-3 font-semibold text-slate-800">{parentName}</td>
                        </tr>
                      )}
                      {isPpdb && (studentAddress || village || district || regency) && (
                        <tr>
                          <td className="py-2 px-3 font-bold text-slate-600">Alamat Domisili Lengkap</td>
                          <td className="py-2 px-3 text-slate-800">
                            {studentAddress && <div>{studentAddress}</div>}
                            {(rt || rw) && <div>RT {rt || '-'} / RW {rw || '-'}</div>}
                            {(village || district || regency) && (
                              <div className="text-slate-600 font-medium">
                                {[village && `Desa/Kel. ${village}`, district && `Kec. ${district}`, regency].filter(Boolean).join(', ')}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                      <tr className="bg-slate-50/70">
                        <td className="py-2 px-3 font-bold text-slate-600">Hak Akses / Peran</td>
                        <td className="py-2 px-3 font-bold text-[#1888c8]">{role}</td>
                      </tr>
                      {(role === 'Guru Pengampu' || role === 'Guru Kelas') && subject && (
                        <tr>
                          <td className="py-2 px-3 font-bold text-slate-600">Mata Pelajaran</td>
                          <td className="py-2 px-3 font-bold text-slate-800">{subject}</td>
                        </tr>
                      )}
                      {role === 'Guru Kelas' && assignedClass && (
                        <tr className="bg-slate-50/70">
                          <td className="py-2 px-3 font-bold text-slate-600">Kelas / Wali Kelas</td>
                          <td className="py-2 px-3 font-bold text-slate-800">{assignedClass}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-600">Sekolah Tujuan (SPMB)</td>
                        <td className="py-2 px-3 font-medium text-slate-800">{school}</td>
                      </tr>
                      <tr className="bg-slate-50/70">
                        <td className="py-2 px-3 font-bold text-slate-600">NPSN Sekolah</td>
                        <td className="py-2 px-3 font-mono font-bold text-[#1888c8]">
                          {selectedSchoolObj?.npsn || '-'}
                        </td>
                      </tr>
                      <tr className="bg-slate-50/70">
                        <td className="py-2 px-3 font-bold text-slate-600">Pertanyaan Pengaman Akun</td>
                        <td className="py-2 px-3">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                            <Check className="w-3 h-3" /> 2 Pertanyaan Pengaman Terkonfigurasi
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Agreement Checkbox */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-300">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 w-3.5 h-3.5 rounded text-[#1888c8] focus:ring-sky-500 cursor-pointer"
                    />
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-800 leading-relaxed">
                      Saya menyatakan bahwa data yang saya masukkan adalah benar dan sah sesuai identitas dan penugasan akademik resmi. Apabila di kemudian hari ditemukan ketidaksesuaian data, saya bersedia menerima sanksi atau penonaktifan akun sesuai ketentuan yang berlaku.
                    </span>
                  </label>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep4}
                    className="bg-[#1888c8] hover:bg-[#1478b0] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>Lanjutkan ke Tahap Verifikasi & Antrean</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: STATUS PENDAFTARAN & ANTREAN AKTIVASI ADMINISTRATOR */}
            {step === 5 && (
              <div className="space-y-4 sm:space-y-5 animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <span className="text-[#1888c8] font-black text-xs sm:text-[13px] uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-[#1888c8]" />
                    LANGKAH 5 : STATUS PENGAJUAN & ANTREAN AKTIVASI ADMINISTRATOR
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Pemberitahuan Resmi Sistem */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50/90 border border-amber-300 flex flex-col sm:flex-row items-start justify-between gap-3 shadow-2xs">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-amber-900 uppercase tracking-wide">
                          Status Pendaftaran Pengguna Baru
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[9px] font-black tracking-wider uppercase">
                          Menunggu Aktivasi Administrator
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-900/90 mt-0.5 leading-relaxed">
                        Sesuai standar operasional pengamanan data SIMAK, <strong>aktivasi akun baru hanya dapat disahkan dan diaktifkan oleh Administrator Sekolah pada Halaman Administrator (Master Data)</strong>, bukan di dalam formulir pendaftaran publik.
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 bg-white px-3 py-1.5 rounded-lg border border-amber-200 text-right w-full sm:w-auto shadow-2xs">
                    <span className="text-[9px] text-slate-500 font-semibold block uppercase">Nomor Registrasi</span>
                    <span className="text-xs font-black text-slate-900 font-mono tracking-wider">
                      REG-SPMB-{new Date().getFullYear()}-{randomRegCode}
                    </span>
                  </div>
                </div>

                {/* Status Pengecekan Sistem Otomatis */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <BadgeCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-emerald-800 uppercase block">Identitas Pendaftar</span>
                      <span className="text-xs font-black text-emerald-950">Lengkap & Tervalidasi</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-emerald-800 uppercase block">Pengaman Akun</span>
                      <span className="text-xs font-black text-emerald-950">Kata Sandi & Pertanyaan OK</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-sky-50/80 border border-sky-200 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-[#1888c8] text-white flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-sky-800 uppercase block">Unit Kerja & Peran</span>
                      <span className="text-xs font-black text-sky-950 truncate max-w-[130px]">{role}</span>
                    </div>
                  </div>
                </div>

                {/* Informasi Alur Aktivasi di Halaman Administrator */}
                <div className="border border-sky-200 bg-sky-50/40 rounded-xl p-3.5 sm:p-4 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#1888c8] text-white flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                        Prosedur Aktivasi Akun oleh Administrator
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        Data pendaftaran Anda untuk peran <span className="font-bold text-slate-900">{role}</span> di <span className="font-bold text-slate-900">{school}</span> akan ditinjau secara langsung oleh Administrator.
                      </p>
                    </div>
                  </div>

                  {/* Tahapan Alur Aktivasi */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                    <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center">1</span>
                        <span className="text-xs font-bold text-slate-800">Isi Formulir</span>
                      </div>
                      <p className="text-[10px] text-slate-500">Biodata dan pengaman akun terisi.</p>
                      <span className="text-[9px] font-bold text-emerald-600 mt-0.5 block">✓ Selesai</span>
                    </div>

                    <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center">2</span>
                        <span className="text-xs font-bold text-slate-800">Kirim Berkas</span>
                      </div>
                      <p className="text-[10px] text-slate-500">Data masuk ke antrean server.</p>
                      <span className="text-[9px] font-bold text-emerald-600 mt-0.5 block">✓ Siap Kirim</span>
                    </div>

                    <div className="p-2 bg-amber-50/70 rounded-lg border border-amber-300 shadow-2xs">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="w-4 h-4 rounded-full bg-amber-500 text-white font-bold text-[9px] flex items-center justify-center">3</span>
                        <span className="text-xs font-bold text-amber-900">Aktivasi Admin</span>
                      </div>
                      <p className="text-[10px] text-amber-800/90">Aktivasi di Halaman Admin.</p>
                      <span className="text-[9px] font-bold text-amber-700 mt-0.5 block">⏳ Menunggu</span>
                    </div>

                    <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-700 font-bold text-[9px] flex items-center justify-center">4</span>
                        <span className="text-xs font-bold text-slate-800">Siap Login</span>
                      </div>
                      <p className="text-[10px] text-slate-500">Masuk portal dengan akun aktif.</p>
                      <span className="text-[9px] font-semibold text-slate-400 mt-0.5 block">Tahap Akhir</span>
                    </div>
                  </div>

                  <div className="text-[10px] sm:text-[11px] text-slate-600 flex items-center gap-2 bg-white/80 p-2.5 rounded-lg border border-sky-200">
                    <Info className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>Setelah menyelesaikan pendaftaran, silakan hubungi Administrator Sekolah Anda untuk mengesahkan dan mengaktifkan akun Anda pada <strong>Halaman Administrator</strong>.</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Konfirmasi</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleFinalizeRegistration}
                    className="bg-[#1888c8] hover:bg-[#1478b0] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyimpan Pengajuan...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Pengajuan & Buka Kartu Pendaftaran</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 (SPMB) / STEP 6 (SIMAK) : BUKTI PENDAFTARAN & KARTU TANDA PENDAFTARAN */}
            {((step === 3 && isPpdb) || (step === 6 && !isPpdb)) && (
              <div className="space-y-4 sm:space-y-5 animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <span className="text-[#1888c8] font-black text-xs sm:text-[13px] uppercase tracking-wider flex items-center gap-1.5">
                    {isPpdb ? (
                      <>
                        <Printer className="w-4 h-4 text-[#1888c8]" />
                        LANGKAH 3 : UNDUH BUKTI PENDAFTARAN SPMB
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        LANGKAH 6 : BUKTI PENDAFTARAN & KARTU AKUN SELESAI
                      </>
                    )}
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Banner Status Pengajuan */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50/90 border border-emerald-300 flex flex-col sm:flex-row items-start justify-between gap-3 shadow-2xs">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-emerald-900 uppercase tracking-wide">
                          Pendaftaran Berhasil Dikirim
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-900/90 mt-0.5 leading-relaxed">
                        Data pengajuan pendaftaran Anda telah tersimpan secara resmi di database. Silakan simpan atau cetak kartu bukti pendaftaran di bawah ini.
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 text-right w-full sm:w-auto shadow-2xs">
                    <span className="text-[9px] text-slate-500 font-semibold block uppercase">Nomor Registrasi</span>
                    <span className="text-xs font-black text-slate-900 font-mono tracking-wider">
                      REG-SPMB-{new Date().getFullYear()}-{randomRegCode}
                    </span>
                  </div>
                </div>

                {/* Print Styles for Bukti Pendaftaran */}
                <style>{`
                  @media print {
                    body * {
                      visibility: hidden !important;
                    }
                    #printable-bukti-card, #printable-bukti-card * {
                      visibility: visible !important;
                    }
                    #printable-bukti-card {
                      position: absolute !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 100% !important;
                      max-width: 100% !important;
                      margin: 0 !important;
                      padding: 0 !important;
                      border: 2px solid #0284c7 !important;
                      box-shadow: none !important;
                      background: white !important;
                    }
                    .no-print {
                      display: none !important;
                    }
                  }
                `}</style>

                {/* Printable Account Information Card with Clean Table */}
                <div id="printable-bukti-card" className="max-w-2xl mx-auto bg-white border-2 border-slate-300 rounded-xl overflow-hidden shadow-2xs">
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-[#075985] via-[#0284c7] to-[#0ea5e9] px-4 py-2.5 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <SimakEmblemLogo className="w-7 h-7" />
                      <div>
                        <span className="text-[9px] font-black uppercase text-sky-200 tracking-wider block">
                          KARTU TANDA BUKTI PENDAFTARAN
                        </span>
                        <h4 className="font-extrabold text-xs sm:text-sm text-white leading-tight">
                          Sistem Penerimaan Murid Baru (SPMB)
                        </h4>
                      </div>
                    </div>
                    <div className="hidden sm:block text-right">
                      <span className="text-[9px] text-sky-100 block font-semibold">Tahun Akademik</span>
                      <span className="text-[11px] font-black text-white">2026/2027</span>
                    </div>
                  </div>

                  {/* Card Body - Structured Table */}
                  <div className="p-3 sm:p-4 space-y-3">
                    <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                      <table className="w-full text-left text-xs">
                        <tbody className="divide-y divide-slate-200">
                          <tr className="bg-slate-50/70">
                            <td className="py-2 px-3 font-bold text-slate-600 w-1/3">Nomor Registrasi</td>
                            <td className="py-2 px-3 font-mono font-black text-slate-900">
                              REG-SPMB-{new Date().getFullYear()}-{randomRegCode}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-bold text-slate-600">Nama Pendaftar</td>
                            <td className="py-2 px-3 font-bold text-slate-900">{fullName}</td>
                          </tr>
                          <tr className="bg-slate-50/70">
                            <td className="py-2 px-3 font-bold text-slate-600">Jenis Kelamin</td>
                            <td className="py-2 px-3 font-medium text-slate-800">{gender || '-'}</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-bold text-slate-600">Nomor Handphone / WA</td>
                            <td className="py-2 px-3 font-mono text-slate-800">{phone}</td>
                          </tr>
                          {!isPpdb && (
                            <tr className="bg-slate-50/70">
                              <td className="py-2 px-3 font-bold text-slate-600">Email Resmi Akun</td>
                              <td className="py-2 px-3 font-mono font-bold text-slate-900">{email}</td>
                            </tr>
                          )}
                          <tr>
                            <td className="py-2 px-3 font-bold text-slate-600">Tempat & Tanggal Lahir</td>
                            <td className="py-2 px-3 font-medium text-slate-800">{birthPlace}, {birthDate}</td>
                          </tr>
                          {isPpdb && nisn && (
                            <tr className="bg-sky-50/80">
                              <td className="py-2 px-3 font-bold text-slate-700">NISN Siswa</td>
                              <td className="py-2 px-3 font-mono font-bold text-sky-800">{nisn}</td>
                            </tr>
                          )}
                          {isPpdb && sekolahAsal && (
                            <tr>
                              <td className="py-2 px-3 font-bold text-slate-600">Sekolah Asal</td>
                              <td className="py-2 px-3 font-semibold text-slate-800">{sekolahAsal}</td>
                            </tr>
                          )}
                          {isPpdb && religion && (
                            <tr className="bg-slate-50/70">
                              <td className="py-2 px-3 font-bold text-slate-600">Agama & Sdr. Kandung</td>
                              <td className="py-2 px-3 font-medium text-slate-800">Agama: <strong>{religion}</strong> | Anak ke-<strong>{childOrder}</strong> dari <strong>{siblingCount}</strong> bersaudara</td>
                            </tr>
                          )}
                          {isPpdb && fatherName && (
                            <tr className="bg-slate-50/70">
                              <td className="py-2 px-3 font-bold text-slate-700">Data Ayah Kandung</td>
                              <td className="py-2 px-3 text-slate-800">
                                <div className="font-bold text-slate-900">{fatherName}</div>
                                <div className="text-slate-600 text-[11px]">TTL: {fatherBirthPlaceDate || '-'} | Pekerjaan: {fatherJob || '-'} | Pendidikan: {fatherEdu || '-'}</div>
                                {fatherAddress && <div className="text-slate-600 text-[11px] font-medium mt-0.5">Alamat: {fatherAddress}</div>}
                              </td>
                            </tr>
                          )}
                          {isPpdb && motherName && (
                            <tr>
                              <td className="py-2 px-3 font-bold text-slate-700">Data Ibu Kandung</td>
                              <td className="py-2 px-3 text-slate-800">
                                <div className="font-bold text-slate-900">{motherName}</div>
                                <div className="text-slate-600 text-[11px]">TTL: {motherBirthPlaceDate || '-'} | Pekerjaan: {motherJob || '-'} | Pendidikan: {motherEdu || '-'}</div>
                                {motherAddress && <div className="text-slate-600 text-[11px] font-medium mt-0.5">Alamat: {motherAddress}</div>}
                              </td>
                            </tr>
                          )}
                          {isPpdb && parentName && (
                            <tr>
                              <td className="py-2 px-3 font-bold text-slate-600">Wali / Penanggung Jawab</td>
                              <td className="py-2 px-3 font-semibold text-slate-800">{parentName}</td>
                            </tr>
                          )}
                          {isPpdb && (studentAddress || village || district || regency) && (
                            <tr className="bg-slate-50/70">
                              <td className="py-2 px-3 font-bold text-slate-600">Alamat Domisili</td>
                              <td className="py-2 px-3 text-slate-800">
                                {studentAddress && <div>{studentAddress}</div>}
                                {(rt || rw) && <div>RT {rt || '-'} / RW {rw || '-'}</div>}
                                {(village || district || regency) && (
                                  <div className="text-slate-600 font-medium">
                                    {[village && `Desa/Kel. ${village}`, district && `Kec. ${district}`, regency].filter(Boolean).join(', ')}
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                          <tr className="bg-slate-50/70">
                            <td className="py-2 px-3 font-bold text-slate-600">Keterangan</td>
                            <td className="py-2 px-3 font-bold text-[#1888c8]">{isPpdb ? 'Siswa / Peserta Didik Baru (SPMB)' : role}</td>
                          </tr>
                          {(role === 'Guru Pengampu' || role === 'Guru Kelas') && subject && (
                            <tr>
                              <td className="py-2 px-3 font-bold text-slate-600">Mata Pelajaran</td>
                              <td className="py-2 px-3 font-bold text-slate-800">{subject}</td>
                            </tr>
                          )}
                          {role === 'Guru Kelas' && assignedClass && (
                            <tr className="bg-slate-50/70">
                              <td className="py-2 px-3 font-bold text-slate-600">Kelas / Wali Kelas</td>
                              <td className="py-2 px-3 font-bold text-slate-800">{assignedClass}</td>
                            </tr>
                          )}
                          <tr>
                            <td className="py-2 px-3 font-bold text-slate-600">{isPpdb ? 'Sekolah Tujuan (SPMB)' : 'Satuan Pendidikan'}</td>
                            <td className="py-2 px-3 font-medium text-slate-800">{school}</td>
                          </tr>
                          <tr className="bg-slate-50/70">
                            <td className="py-2 px-3 font-bold text-slate-600">NPSN Sekolah</td>
                            <td className="py-2 px-3 font-mono font-bold text-[#1888c8]">
                              {selectedSchoolObj?.npsn || '-'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Footer metadata */}
                    <div className="pt-1.5 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-1.5 border-t border-slate-100">
                      <span>Tanggal Pendaftaran: {registeredTimestamp || new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date())}</span>
                    </div>
                  </div>
                </div>

                {/* Petunjuk Tambahan */}
                <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-sky-950 text-xs flex items-center gap-2.5">
                  <Info className="w-4 h-4 text-sky-600 shrink-0" />
                  <div className="leading-relaxed text-left text-[11px] sm:text-xs">
                    <strong>Perhatian:</strong> Simpan bukti pendaftaran.
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 no-print">
                  {isPpdb ? (
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Kembali ke Resume (Langkah 2)</span>
                    </button>
                  ) : <div />}

                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handlePrintCard}
                      className="w-full sm:w-auto px-5 py-2.5 bg-sky-50 hover:bg-sky-100 text-[#1888c8] font-extrabold text-xs sm:text-sm rounded-lg transition-all border border-sky-300 flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-95"
                    >
                      <Printer className="w-4 h-4 text-[#1888c8]" />
                      <span>Cetak Bukti Pendaftaran</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onClose) {
                          onClose();
                        } else if (onSwitchToLogin) {
                          onSwitchToLogin(email || '');
                        }
                      }}
                      className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Check className="w-4 h-4 text-white" />
                      <span>Selesai</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* 3. FLOATING ACCESSIBILITY WIDGET BUTTON (HANYA UNTUK NON-SPMB) */}
      {!isPpdb && (
        <>
          <div className="fixed bottom-5 left-5 z-40">
            <button
              type="button"
              onClick={() => setShowAccessibility(!showAccessibility)}
              className="bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl flex items-center gap-2 transition-all cursor-pointer active:scale-95 border border-white/30"
              title="Buka Pengaturan Aksesibilitas"
            >
              <Accessibility className="w-4 h-4" />
              <span>Aksesibilitas</span>
            </button>
          </div>

          {/* ACCESSIBILITY DRAWER / MODAL */}
          {showAccessibility && (
            <div className="fixed bottom-20 left-5 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Accessibility className="w-4 h-4 text-[#0284c7]" />
                  <span>Pengaturan Aksesibilitas</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAccessibility(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-700 block mb-1.5">Ukuran Teks:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['normal', 'large', 'xlarge'] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setFontSize(sz)}
                        className={`py-1.5 px-2 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                          fontSize === sz
                            ? 'bg-[#0284c7] text-white border-[#0284c7]'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {sz === 'normal' ? 'Normal' : sz === 'large' ? 'Besar' : 'Ekstra'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-700">Kontras Tinggi:</span>
                  <button
                    type="button"
                    onClick={() => setHighContrast(!highContrast)}
                    className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                      highContrast ? 'bg-[#0284c7]' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                      highContrast ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 4. FOOTER */}
      <footer className="w-full py-4 px-4 sm:px-8 border-t border-slate-200 bg-white text-xs text-slate-500 font-medium text-center">
        <span>© 2026 Sistem Informasi Akademik (SIMAK) Merdeka</span>
      </footer>

    </div>
  );
};
