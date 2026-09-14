import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Image as ImageIcon, 
  Sparkles, 
  Check, 
  RotateCcw, 
  Save, 
  Eye, 
  Sliders, 
  Layout, 
  Upload, 
  Grid, 
  Layers, 
  SunMedium, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Info,
  Laptop,
  Maximize2,
  X
} from 'lucide-react';
import { LoginBackgroundConfig, LoginThemePreset, defaultLoginBackgroundConfig } from '../types';
import { TutWuriHandayaniLogo } from './TutWuriHandayaniLogo';

interface LoginBackgroundSettingsProps {
  currentConfig?: LoginBackgroundConfig;
  onSaveConfig: (newConfig: LoginBackgroundConfig) => void;
}

// Preset Themes Catalog
export const PRESET_THEMES: {
  id: LoginThemePreset;
  name: string;
  category: 'Gradien Resmi' | 'Tema Khusus' | 'Kustom';
  desc: string;
  from: string;
  via: string;
  to: string;
  headerFrom?: string;
  headerVia?: string;
  headerTo?: string;
  previewGradient: string;
  showGrid: boolean;
  showMosaic: boolean;
  defaultImageUrl?: string;
}[] = [
  {
    id: 'tech-blue',
    name: 'Peta Digital Indonesia (Resmi SIMAK)',
    category: 'Gradien Resmi',
    desc: 'Latar biru gradasi resmi dengan siluet peta dot-matrix kepulauan Indonesia dari Sabang sampai Merauke.',
    from: '#18568c',
    via: '#2372ab',
    to: '#114371',
    headerFrom: '#0b3259',
    headerVia: '#0f457b',
    headerTo: '#2589d6',
    previewGradient: 'from-[#18568c] via-[#2372ab] to-[#114371]',
    showGrid: false,
    showMosaic: false,
    defaultImageUrl: '/login_background.svg'
  },
  {
    id: 'royal-amber',
    name: 'Biru Royal & Emas Kemdikbud',
    category: 'Gradien Resmi',
    desc: 'Nuansa biru navy berwibawa dengan ornamen aksen emas pendidikan.',
    from: '#0a192f',
    via: '#1e3a8a',
    to: '#0f172a',
    headerFrom: '#07152b',
    headerVia: '#172554',
    headerTo: '#b45309',
    previewGradient: 'from-[#0a192f] via-[#1e3a8a] to-[#0f172a]',
    showGrid: true,
    showMosaic: true
  },
  {
    id: 'emerald-green',
    name: 'Emerald Kemdikbud & Hijau Edukasi',
    category: 'Gradien Resmi',
    desc: 'Gradasi hijau zamrud segar bernuansa alam, madrasah dan ramah lingkungan.',
    from: '#064e3b',
    via: '#047857',
    to: '#022c22',
    headerFrom: '#022c22',
    headerVia: '#065f46',
    headerTo: '#10b981',
    previewGradient: 'from-[#064e3b] via-[#047857] to-[#022c22]',
    showGrid: true,
    showMosaic: true
  },
  {
    id: 'midnight-dark',
    name: 'Midnight Dark Minimalis',
    category: 'Gradien Resmi',
    desc: 'Tema gelap modern berkelas tinggi dengan kontras tajam yang nyaman di mata.',
    from: '#090d16',
    via: '#131c2e',
    to: '#050811',
    headerFrom: '#050811',
    headerVia: '#0f172a',
    headerTo: '#334155',
    previewGradient: 'from-[#090d16] via-[#131c2e] to-[#050811]',
    showGrid: true,
    showMosaic: false
  },
  {
    id: 'crimson-maroon',
    name: 'Maroon Kebangsaan & Dedikasi',
    category: 'Tema Khusus',
    desc: 'Warna maroon elegan yang melambangkan semangat juang dan patriotisme pendidikan.',
    from: '#450a0a',
    via: '#881337',
    to: '#1c0505',
    headerFrom: '#3b0707',
    headerVia: '#7f1d1d',
    headerTo: '#dc2626',
    previewGradient: 'from-[#450a0a] via-[#881337] to-[#1c0505]',
    showGrid: true,
    showMosaic: true
  },
  {
    id: 'ocean-cyan',
    name: 'Deep Ocean & Cyan Futuristik',
    category: 'Tema Khusus',
    desc: 'Gradasi biru kehijauan samudra dengan kesan teknologi masa depan yang canggih.',
    from: '#083344',
    via: '#0e7490',
    to: '#041f2d',
    headerFrom: '#041f2d',
    headerVia: '#155e75',
    headerTo: '#06b6d4',
    previewGradient: 'from-[#083344] via-[#0e7490] to-[#041f2d]',
    showGrid: true,
    showMosaic: true
  },
  {
    id: 'purple-galaxy',
    name: 'Ungu Kreatif & Inspiratif',
    category: 'Tema Khusus',
    desc: 'Gradasi ungu teknologi yang dinamis dan mendorong kreativitas belajar mengajar.',
    from: '#2e1065',
    via: '#4c1d95',
    to: '#1e0842',
    headerFrom: '#1e0842',
    headerVia: '#581c87',
    headerTo: '#9333ea',
    previewGradient: 'from-[#2e1065] via-[#4c1d95] to-[#1e0842]',
    showGrid: true,
    showMosaic: true
  },
  {
    id: 'custom-gradient',
    name: 'Gradien Warna Kustom',
    category: 'Kustom',
    desc: 'Sesuaikan 3 perpaduan warna latar dan arah gradasi sesuai selera sekolah Anda.',
    from: '#1e293b',
    via: '#334155',
    to: '#0f172a',
    headerFrom: '#0f172a',
    headerVia: '#1e293b',
    headerTo: '#3b82f6',
    previewGradient: 'from-slate-800 via-slate-700 to-slate-900',
    showGrid: true,
    showMosaic: true
  },
  {
    id: 'custom-image',
    name: 'Wallpaper / Foto Kustom',
    category: 'Kustom',
    desc: 'Gunakan foto sekolah, gedung perpustakaan, atau gambar latar beresolusi tinggi.',
    from: '#18568c',
    via: '#2372ab',
    to: '#114371',
    previewGradient: 'from-cyan-900 via-indigo-900 to-slate-950',
    showGrid: false,
    showMosaic: false
  }
];

// Preset Photo Library
export const PRESET_WALLPAPERS = [
  {
    id: 'indonesia-map-official',
    name: 'Peta Dot Matrix Indonesia (Resmi SIMAK)',
    url: '/login_background.svg',
    desc: 'Siluet titik digital kepulauan Indonesia berlatar biru Kemdikbud'
  },
  {
    id: 'school-building',
    name: 'Gedung Sekolah Modern',
    url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1600&q=80',
    desc: 'Arsitektur gedung pendidikan modern'
  },
  {
    id: 'library-study',
    name: 'Perpustakaan Digital',
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1600&q=80',
    desc: 'Suasana ruang baca & belajar tenang'
  },
  {
    id: 'digital-classroom',
    name: 'Teknologi Pendidikan',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80',
    desc: 'Pembelajaran modern berbasis digital'
  },
  {
    id: 'abstract-geo',
    name: 'Geometri Sains & Tech',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
    desc: 'Pola sirkuit dan teknologi sains'
  }
];

export const LoginBackgroundSettings: React.FC<LoginBackgroundSettingsProps> = ({
  currentConfig = defaultLoginBackgroundConfig,
  onSaveConfig
}) => {
  // Initialize state with currentConfig merged with defaults
  const [config, setConfig] = useState<LoginBackgroundConfig>(() => ({
    ...defaultLoginBackgroundConfig,
    ...currentConfig
  }));

  // Track the last serialized config we synced to avoid loops and allow external updates
  const lastSyncedConfigJsonRef = React.useRef<string>(JSON.stringify(currentConfig || {}));

  // Sync from parent props if parent received an update from Firebase
  useEffect(() => {
    if (!currentConfig) return;
    const parentJson = JSON.stringify(currentConfig);
    if (parentJson !== lastSyncedConfigJsonRef.current) {
      lastSyncedConfigJsonRef.current = parentJson;
      setConfig(prev => ({
        ...defaultLoginBackgroundConfig,
        ...currentConfig
      }));
    }
  }, [currentConfig]);

  const [activeSettingsTab, setActiveSettingsTab] = useState<'preset' | 'colors' | 'image' | 'effects'>('preset');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showFullPreviewModal, setShowFullPreviewModal] = useState<boolean>(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);
  const [isAutoApplyEnabled, setIsAutoApplyEnabled] = useState<boolean>(true);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');

  // Real-time auto-apply effect with debounce
  useEffect(() => {
    if (!isAutoApplyEnabled) return;

    const timer = setTimeout(() => {
      const currentConfigWithoutTime = { ...currentConfig, updatedAt: undefined };
      const localConfigWithoutTime = { ...config, updatedAt: undefined };
      
      if (JSON.stringify(currentConfigWithoutTime) !== JSON.stringify(localConfigWithoutTime)) {
        const timestamped: LoginBackgroundConfig = {
          ...config,
          updatedAt: new Date().toISOString()
        };
        lastSyncedConfigJsonRef.current = JSON.stringify(timestamped);
        onSaveConfig(timestamped);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [config, isAutoApplyEnabled, currentConfig, onSaveConfig]);

  // Helper to update state and immediately apply to parent
  const applyConfigUpdate = (updated: LoginBackgroundConfig, statusMessage?: string) => {
    const timestamped: LoginBackgroundConfig = {
      ...updated,
      updatedAt: new Date().toISOString()
    };
    lastSyncedConfigJsonRef.current = JSON.stringify(timestamped);
    setConfig(timestamped);
    
    // Notify parent immediately
    onSaveConfig(timestamped);

    if (statusMessage) {
      setSaveStatus(statusMessage);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleSelectPreset = (presetId: LoginThemePreset) => {
    const matched = PRESET_THEMES.find(t => t.id === presetId);
    if (!matched) return;

    const newConfig: LoginBackgroundConfig = {
      ...config,
      themePreset: presetId,
      imageUrl: matched.defaultImageUrl || '',
      imageChunks: [],
      primaryColor: matched.from,
      secondaryColor: matched.via,
      tertiaryColor: matched.to,
      showTechGrid: matched.showGrid,
      showPixelMosaic: matched.showMosaic
    };

    applyConfigUpdate(newConfig, `Tema "${matched.name}" berhasil dipilih dan langsung diterapkan!`);
  };

  const handleSelectPresetWallpaper = (wp: typeof PRESET_WALLPAPERS[0] | string) => {
    const url = typeof wp === 'string' ? wp : wp.url;
    const name = typeof wp === 'string' ? 'Wallpaper Pendidikan' : wp.name;
    const newConfig: LoginBackgroundConfig = {
      ...config,
      themePreset: 'custom-image',
      imageUrl: url,
      imageChunks: [],
      imageFit: 'cover',
      imageScale: 100,
      imagePosition: 'center',
      overlayDarkness: 0
    };

    applyConfigUpdate(newConfig, `Wallpaper "${name}" berhasil diterapkan!`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so the user can re-upload the same file if needed
    e.target.value = '';

    if (file.size > 12 * 1024 * 1024) {
      setErrorMessage('Ukuran file terlalu besar. Harap gunakan file di bawah 12 MB.');
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          
          const compressImage = (maxDim: number, quality: number) => {
            let width = img.width;
            let height = img.height;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              return canvas.toDataURL('image/jpeg', quality);
            }
            return '';
          };

          // Optimized compression to fit comfortably within Firestore document limit (< 400 KB)
          let dataUrl = compressImage(1280, 0.72);
          
          if (dataUrl.length > 350000) {
            dataUrl = compressImage(1024, 0.60);
          }
          
          if (dataUrl.length > 350000) {
            dataUrl = compressImage(800, 0.50);
          }

          if (dataUrl.length > 500000) {
            setErrorMessage('Ukuran gambar setelah dikompresi masih melebihi batas database. Silakan gunakan gambar yang lebih kecil.');
            setTimeout(() => setErrorMessage(null), 5000);
            return;
          }

          const newConfig: LoginBackgroundConfig = {
            ...config,
            themePreset: 'custom-image',
            imageUrl: dataUrl,
            imageChunks: [],
            imageFit: 'cover',
            imageScale: 100,
            imagePosition: 'center',
            imageOpacity: 100,
            overlayDarkness: 0,
            updatedAt: new Date().toISOString()
          };

          applyConfigUpdate(newConfig, 'Foto berhasil diunggah dan langsung terpasang sebagai background login!');
        };
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = (urlToApply?: string) => {
    const targetUrl = (urlToApply !== undefined ? urlToApply : customUrlInput).trim();
    if (!targetUrl) return;

    const newConfig: LoginBackgroundConfig = {
      ...config,
      themePreset: 'custom-image',
      imageUrl: targetUrl,
      imageChunks: [],
      imageFit: config.imageFit || 'cover',
      imageScale: config.imageScale ?? 100,
      imagePosition: config.imagePosition || 'center'
    };

    applyConfigUpdate(newConfig, 'URL gambar kustom berhasil diterapkan sebagai background login!');
    setCustomUrlInput('');
  };

  const handleConfirmResetToDefault = () => {
    const resetConfig: LoginBackgroundConfig = { 
      ...defaultLoginBackgroundConfig, 
      updatedAt: new Date().toISOString() 
    };
    applyConfigUpdate(resetConfig, 'Latar belakang telah dikembalikan ke Default SIMAK.');
    setShowResetConfirmModal(false);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    applyConfigUpdate(config, 'Pengaturan background login berhasil disimpan dan diterapkan ke seluruh pengguna!');
  };

  // Generate background CSS style for preview with robust image vs gradient separation
  const getPreviewBackgroundStyle = () => {
    let finalImageUrl = (config.imageChunks && config.imageChunks.length > 0)
      ? config.imageChunks.join('') 
      : (config.imageUrl || '');

    if (!finalImageUrl && (config.themePreset === 'tech-blue' || !config.themePreset)) {
      finalImageUrl = '/login_background.svg';
    }

    const isImageMode = config.themePreset === 'custom-image' || 
      ((config.themePreset === 'tech-blue' || !config.themePreset) && Boolean(finalImageUrl && finalImageUrl.trim().length > 0));

    if (isImageMode && finalImageUrl && finalImageUrl.trim().length > 0) {
      let bgSize = 'cover';
      const fit = config.imageFit || 'cover';
      const scale = config.imageScale ?? 100;
      
      if (fit === 'contain') {
        bgSize = scale !== 100 ? `${scale}% auto` : 'contain';
      } else if (fit === 'fit-width') {
        bgSize = scale !== 100 ? `${scale}% auto` : '100% auto';
      } else if (fit === 'fit-height') {
        bgSize = scale !== 100 ? `auto ${scale}%` : 'auto 100%';
      } else if (fit === 'scale') {
        bgSize = `${scale}% auto`;
      } else if (fit === 'repeat') {
        bgSize = scale !== 100 ? `${scale}%` : 'auto';
      } else {
        // cover
        bgSize = scale !== 100 ? `${scale}% auto` : 'cover';
      }

      let pos = 'center center';
      if (config.imagePosition === 'top' || config.imagePosition === 'center top') pos = 'center top';
      else if (config.imagePosition === 'bottom' || config.imagePosition === 'center bottom') pos = 'center bottom';
      else if (config.imagePosition === 'left') pos = 'left center';
      else if (config.imagePosition === 'right') pos = 'right center';

      return {
        backgroundImage: `url("${finalImageUrl}")`,
        backgroundSize: bgSize,
        backgroundPosition: pos,
        backgroundRepeat: fit === 'repeat' ? 'repeat' : 'no-repeat',
        backgroundAttachment: config.backgroundScrollMode === 'fixed' ? 'fixed' : 'scroll',
        backgroundColor: config.primaryColor || '#18568c',
        opacity: (config.imageOpacity ?? 100) / 100
      };
    }

    // Pure gradient mode for custom-gradient and all color presets
    const matchedPreset = PRESET_THEMES.find(t => t.id === config.themePreset);
    const from = config.primaryColor || matchedPreset?.from || '#164377';
    const via = config.secondaryColor || matchedPreset?.via || '#1d60a5';
    const to = config.tertiaryColor || matchedPreset?.to || '#11396a';

    let dir = '135deg'; // default to-br
    if (config.gradientDirection === 'to-r') dir = '90deg';
    else if (config.gradientDirection === 'to-b') dir = '180deg';
    else if (config.gradientDirection === 'to-tr') dir = '45deg';

    if (config.gradientDirection === 'radial') {
      return {
        background: `radial-gradient(circle at center, ${via} 0%, ${from} 50%, ${to} 100%)`
      };
    }

    return {
      background: `linear-gradient(${dir}, ${from} 0%, ${via} 50%, ${to} 100%)`
    };
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-none bg-gradient-to-r from-cyan-50 via-slate-50 to-indigo-50 border border-cyan-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#164e63] text-white rounded-none shadow-xs">
            <Palette className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-800">Pengaturan Background Halaman Login</h2>
              <span className="px-2 py-0.5 bg-cyan-100 text-[#164e63] font-bold text-[10px] rounded-none border border-cyan-200">
                Administrator
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Ubah gaya tampilan, palet warna gradasi, wallpaper foto, dan efek grid pada portal login SIMAK.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowResetConfirmModal(true)}
            className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 rounded-none flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
            title="Kembalikan ke warna asli default SIMAK"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Default</span>
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            className="px-4 py-2 bg-[#164e63] hover:bg-cyan-800 text-white font-bold text-xs rounded-none flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
          >
            <Save className="w-4 h-4 text-amber-300" />
            <span>Terapkan Latar</span>
          </button>
        </div>
      </div>

      {/* Error Alert Notification */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-300 text-rose-900 rounded-none text-xs font-bold flex items-center justify-between gap-2 animate-fadeIn shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setErrorMessage(null)}
            className="text-rose-700 hover:text-rose-900 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Save Success Alert Notification */}
      {saveStatus && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-none text-xs font-bold flex items-center justify-between gap-2 animate-fadeIn shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveStatus}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setSaveStatus(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full border border-slate-300 shadow-2xl p-5 animate-scaleUp">
            <div className="flex items-center gap-3 mb-3 text-slate-800">
              <div className="p-2 bg-amber-100 text-amber-700">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold">Kembalikan ke Background Default?</h3>
            </div>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Pengaturan latar belakang login SIMAK akan dikembalikan ke tema asli default sistem (Peta Dot Matrix Indonesia dengan warna biru laut resmi). Seluruh foto kustom atau gradasi akan direset.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmResetToDefault}
                className="px-4 py-2 bg-[#164e63] hover:bg-cyan-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5 text-amber-300" />
                <span>Ya, Reset ke Default</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid Layout: Left Configuration, Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Settings Configuration Tabs & Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Sub Navigation Tabs */}
          <div className="flex items-center border-b border-slate-200 bg-white p-1 gap-1">
            <button
              type="button"
              onClick={() => setActiveSettingsTab('preset')}
              className={`flex-1 py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeSettingsTab === 'preset'
                  ? 'bg-[#164e63] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Tema Preset</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSettingsTab('colors')}
              className={`flex-1 py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeSettingsTab === 'colors'
                  ? 'bg-[#164e63] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Warna & Gradien</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSettingsTab('image')}
              className={`flex-1 py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeSettingsTab === 'image'
                  ? 'bg-[#164e63] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Foto Wallpaper</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSettingsTab('effects')}
              className={`flex-1 py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeSettingsTab === 'effects'
                  ? 'bg-[#164e63] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Efek Grid & Filter</span>
            </button>
          </div>

          {/* TAB 1: PRESET THEMES */}
          {activeSettingsTab === 'preset' && (
            <div className="bg-white border border-slate-200 p-4 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Pilih Preset Tema Login Resmi</h3>
                  <p className="text-[11px] text-slate-500">Klik salah satu tema di bawah untuk menerapkan palet warna secara instan</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200">
                  {PRESET_THEMES.length} Tema
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {PRESET_THEMES.map((theme) => {
                  const isSelected = config.themePreset === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleSelectPreset(theme.id)}
                      className={`text-left p-3 border transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected 
                          ? 'border-[#164e63] ring-2 ring-cyan-500 bg-cyan-50/40 shadow-xs' 
                          : 'border-slate-200 hover:border-cyan-300 hover:bg-slate-50/80 bg-white'
                      }`}
                    >
                      <div>
                        {/* Swatch Header Preview Bar */}
                        <div className="h-10 w-full rounded-none overflow-hidden relative border border-black/10 shadow-2xs mb-2">
                          <div 
                            className="w-full h-full"
                            style={{
                              background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.via} 50%, ${theme.to} 100%)`
                            }}
                          >
                            {theme.showGrid && (
                              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]" />
                            )}
                          </div>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 p-1 bg-[#164e63] text-white shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800">{theme.name}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {theme.desc}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-mono text-[9px]">{theme.from} • {theme.to}</span>
                        {isSelected ? (
                          <span className="text-[#164e63] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Terpilih
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">Klik Pilih</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM COLORS & GRADIENTS */}
          {activeSettingsTab === 'colors' && (
            <div className="bg-white border border-slate-200 p-4 space-y-4 shadow-2xs">
              <div>
                <h3 className="text-xs font-bold text-slate-800">Kustomisasi Gradasi Warna</h3>
                <p className="text-[11px] text-slate-500">Tentukan 3 perpaduan warna latar utama untuk menciptakan gradasi yang pas</p>
              </div>

              <div className="space-y-3 pt-1 text-xs">
                
                {/* Color From */}
                <div className="p-3 bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <label className="block font-bold text-slate-700">Warna Awal (From Color)</label>
                    <span className="text-[10px] text-slate-500">Warna sudut atas kiri</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.primaryColor || '#164377'}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        themePreset: 'custom-gradient',
                        primaryColor: e.target.value,
                        imageUrl: '',
                        imageChunks: []
                      }))}
                      className="w-8 h-8 rounded-none border border-slate-300 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={config.primaryColor || '#164377'}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        themePreset: 'custom-gradient',
                        primaryColor: e.target.value,
                        imageUrl: '',
                        imageChunks: []
                      }))}
                      className="w-20 px-2 py-1 bg-white border border-slate-300 text-[11px] font-mono font-bold uppercase"
                    />
                  </div>
                </div>

                {/* Color Via */}
                <div className="p-3 bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <label className="block font-bold text-slate-700">Warna Tengah (Via Color)</label>
                    <span className="text-[10px] text-slate-500">Warna transisi di bagian tengah</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.secondaryColor || '#1d60a5'}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        themePreset: 'custom-gradient',
                        secondaryColor: e.target.value,
                        imageUrl: '',
                        imageChunks: []
                      }))}
                      className="w-8 h-8 rounded-none border border-slate-300 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={config.secondaryColor || '#1d60a5'}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        themePreset: 'custom-gradient',
                        secondaryColor: e.target.value,
                        imageUrl: '',
                        imageChunks: []
                      }))}
                      className="w-20 px-2 py-1 bg-white border border-slate-300 text-[11px] font-mono font-bold uppercase"
                    />
                  </div>
                </div>

                {/* Color To */}
                <div className="p-3 bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <label className="block font-bold text-slate-700">Warna Akhir (To Color)</label>
                    <span className="text-[10px] text-slate-500">Warna sudut bawah kanan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.tertiaryColor || '#11396a'}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        themePreset: 'custom-gradient',
                        tertiaryColor: e.target.value,
                        imageUrl: '',
                        imageChunks: []
                      }))}
                      className="w-8 h-8 rounded-none border border-slate-300 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={config.tertiaryColor || '#11396a'}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        themePreset: 'custom-gradient',
                        tertiaryColor: e.target.value,
                        imageUrl: '',
                        imageChunks: []
                      }))}
                      className="w-20 px-2 py-1 bg-white border border-slate-300 text-[11px] font-mono font-bold uppercase"
                    />
                  </div>
                </div>

                {/* Gradient Direction */}
                <div className="p-3 bg-slate-50 border border-slate-200 space-y-2">
                  <label className="block font-bold text-slate-700">Arah Gradien Warna</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'to-br', label: 'Diagonal Bawah' },
                      { id: 'to-r', label: 'Ke Kanan' },
                      { id: 'to-b', label: 'Ke Bawah' },
                      { id: 'to-tr', label: 'Diagonal Atas' },
                      { id: 'radial', label: 'Radial Tengah' },
                    ].map((dir) => (
                      <button
                        key={dir.id}
                        type="button"
                        onClick={() => setConfig(prev => ({ 
                          ...prev, 
                          themePreset: 'custom-gradient',
                          gradientDirection: dir.id as any,
                          imageUrl: '',
                          imageChunks: []
                        }))}
                        className={`p-2 text-center text-[10px] font-bold border transition-all cursor-pointer ${
                          config.gradientDirection === dir.id
                            ? 'bg-[#164e63] text-white border-[#164e63]'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {dir.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: WALLPAPER / CUSTOM IMAGE */}
          {activeSettingsTab === 'image' && (
            <div className="bg-white border border-slate-200 p-4 space-y-4 shadow-2xs">
              <div>
                <h3 className="text-xs font-bold text-slate-800">Foto & Wallpaper Latar Belakang</h3>
                <p className="text-[11px] text-slate-500">Gunakan wallpaper bertema sekolah atau unggah foto gedung sekolah Anda sendiri</p>
              </div>

              {/* Preset Gallery */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Galeri Wallpaper Pendidikan</label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_WALLPAPERS.map((wp) => (
                    <button
                      key={wp.id}
                      type="button"
                      onClick={() => handleSelectPresetWallpaper(wp.url)}
                      className={`text-left border p-1.5 transition-all cursor-pointer relative group ${
                        config.imageUrl === wp.url && config.themePreset === 'custom-image'
                          ? 'border-[#164e63] ring-2 ring-cyan-500 bg-cyan-50'
                          : 'border-slate-200 hover:border-cyan-300 bg-slate-50'
                      }`}
                    >
                      <div className="h-16 w-full overflow-hidden relative">
                        <img 
                          src={wp.url} 
                          alt={wp.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {config.imageUrl === wp.url && config.themePreset === 'custom-image' && (
                          <div className="absolute top-1 right-1 p-0.5 bg-[#164e63] text-white">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <div className="mt-1">
                        <span className="block font-bold text-[11px] text-slate-800 truncate">{wp.name}</span>
                        <span className="block text-[9px] text-slate-500 truncate">{wp.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom URL or Upload */}
              <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                {/* Active Custom Image Thumbnail Card if present */}
                {(() => {
                  const activeImg = (config.imageChunks && config.imageChunks.length > 0)
                    ? config.imageChunks.join('')
                    : (config.imageUrl || '');
                  
                  if (!activeImg) return null;

                  return (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-none flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-12 bg-slate-900 border border-emerald-400 overflow-hidden shrink-0 relative">
                          <img 
                            src={activeImg} 
                            alt="Foto Latar Belakang Aktif" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Foto Latar Belakang Aktif Terpasang</span>
                          </div>
                          <p className="text-[10px] text-emerald-700 mt-0.5">
                            {config.imageChunks && config.imageChunks.length > 0 
                              ? `Foto Kustom Terunggah (${config.imageChunks.length} bagian aman database)` 
                              : 'Wallpaper / Tautan Gambar Terpilih'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = {
                              ...config,
                              themePreset: 'tech-blue' as LoginThemePreset,
                              imageUrl: '',
                              imageChunks: [],
                              updatedAt: new Date().toISOString()
                            };
                            setConfig(updated);
                            onSaveConfig(updated);
                            setSaveStatus('Foto latar belakang dihapus.');
                            setTimeout(() => setSaveStatus(null), 3000);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 font-bold text-[10px] cursor-pointer"
                        >
                          Hapus Foto
                        </button>
                      </div>
                    </div>
                  );
                })()}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tautan / URL Gambar Kustom atau Upload Foto</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex flex-1 gap-1">
                      <input
                        type="url"
                        value={customUrlInput || (config.imageUrl?.startsWith('data:') ? '' : (config.imageUrl || ''))}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomUrlInput(val);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyCustomUrl();
                          }
                        }}
                        placeholder="https://contoh-domain.com/foto-sekolah.jpg"
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 text-xs font-mono focus:bg-white focus:outline-hidden focus:border-[#164e63]"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyCustomUrl()}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 cursor-pointer shrink-0"
                      >
                        Pasang URL
                      </button>
                    </div>
                    <label className="px-4 py-2 bg-[#164e63] hover:bg-cyan-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Foto Baru</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                {/* Helpful Tip for Google Chrome 100% Zoom */}
                <div className="p-3 bg-cyan-50 border border-cyan-200 text-cyan-900 rounded-none text-xs flex items-start gap-2">
                  <Info className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <span className="font-bold text-cyan-900">Solusi Gambar Terlalu Besar pada Zoom Chrome 100%:</span>
                    <p className="text-slate-700 mt-0.5">
                      Gunakan mode <strong>"Pas Lebar Layar (100% Lebar)"</strong> atau atur <strong>Skala Zoom Gambar ke 75% atau 50%</strong> di bawah agar foto pas proporsional dan tidak terpotong.
                    </p>
                  </div>
                </div>

                {/* Image Fit & Scale Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ukuran / Penyesuaian Foto (Fit)</label>
                    <select
                      value={config.imageFit || 'cover'}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        imageFit: e.target.value as any
                      }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs font-medium"
                    >
                      <option value="fit-width">Pas Lebar Layar (100% Width - Pas Chrome 100%)</option>
                      <option value="contain">Contain (Pas Utuh - Tidak Terpotong)</option>
                      <option value="cover">Cover (Penuh Layar Sesuai Aspek)</option>
                      <option value="fit-height">Pas Tinggi Layar (100% Height)</option>
                      <option value="scale">Skala Bebas / Kustom Zoom (%)</option>
                      <option value="repeat">Repeat (Ulang Pola / Ubin)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Posisi Fokus Gambar</label>
                    <select
                      value={config.imagePosition || 'center'}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        imagePosition: e.target.value as any
                      }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs font-medium"
                    >
                      <option value="center">Tengah Layar (Center)</option>
                      <option value="top">Atas (Top Center)</option>
                      <option value="bottom">Bawah (Bottom Center)</option>
                      <option value="left">Sisi Kiri (Left)</option>
                      <option value="right">Sisi Kanan (Right)</option>
                    </select>
                  </div>
                </div>

                {/* Zoom / Scale Slider & Quick Presets */}
                <div className="p-3 bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#164e63]" />
                      <span>Skala Zoom Gambar Latar (Perkecil / Perbesar)</span>
                    </span>
                    <span className="text-[#164e63] font-mono text-xs px-2 py-0.5 bg-cyan-100 border border-cyan-200 font-bold">
                      {config.imageScale ?? 75}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="20"
                    max="120"
                    step="5"
                    value={config.imageScale ?? 75}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      imageScale: Number(e.target.value)
                    }))}
                    className="w-full h-2 bg-slate-200 rounded-none accent-[#164e63]"
                  />

                  {/* Preset Scale Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-500 font-semibold">Pintasan Cepat:</span>
                    {[
                      { label: '35% (Sangat Kecil)', val: 35 },
                      { label: '50% (Kecil)', val: 50 },
                      { label: '65% (Sedang Kecil)', val: 65 },
                      { label: '75% (Proporsional Pas)', val: 75 },
                      { label: '100% (Ukuran Penuh)', val: 100 }
                    ].map((btn) => (
                      <button
                        key={btn.val}
                        type="button"
                        onClick={() => setConfig(prev => ({ ...prev, imageScale: btn.val }))}
                        className={`px-2 py-1 text-[10px] font-bold border transition-all cursor-pointer ${
                          (config.imageScale ?? 75) === btn.val
                            ? 'bg-[#164e63] text-white border-[#164e63]'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Opacity Slider */}
                <div className="p-3 bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Opasitas Gambar</span>
                    <span className="text-[#164e63] font-mono">{config.imageOpacity ?? 100}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={config.imageOpacity ?? 100}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      imageOpacity: Number(e.target.value)
                    }))}
                    className="w-full h-2 bg-slate-200 rounded-none accent-[#164e63]"
                  />
                </div>

                {/* Background Scroll Behavior */}
                <div className="p-3 bg-slate-50 border border-slate-200 space-y-2">
                  <label className="block font-bold text-slate-700">Perilaku Gulir Latar (Scroll Behavior)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, backgroundScrollMode: 'scroll' }))}
                      className={`p-2 text-left border text-xs font-bold transition-all cursor-pointer ${
                        (config.backgroundScrollMode ?? 'scroll') === 'scroll'
                          ? 'bg-[#164e63] text-white border-[#164e63]'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block">Ikut Ter-Scroll (Standar)</span>
                      <span className={`text-[10px] font-normal block ${
                        (config.backgroundScrollMode ?? 'scroll') === 'scroll' ? 'text-cyan-100' : 'text-slate-500'
                      }`}>
                        Background bergerak selaras konten
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, backgroundScrollMode: 'fixed' }))}
                      className={`p-2 text-left border text-xs font-bold transition-all cursor-pointer ${
                        config.backgroundScrollMode === 'fixed'
                          ? 'bg-[#164e63] text-white border-[#164e63]'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block">Tetap / Diam (Fixed)</span>
                      <span className={`text-[10px] font-normal block ${
                        config.backgroundScrollMode === 'fixed' ? 'text-cyan-100' : 'text-slate-500'
                      }`}>
                        Background statis di layar
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TECH GRID, MOSAIC & FILTER EFFECTS */}
          {activeSettingsTab === 'effects' && (
            <div className="bg-white border border-slate-200 p-4 space-y-4 shadow-2xs">
              <div>
                <h3 className="text-xs font-bold text-slate-800">Efek Ornamen Grid, Dimmer & Blur</h3>
                <p className="text-[11px] text-slate-500">Sesuaikan transparansi dan efek ornamen agar tulisan login tetap kontras tinggi</p>
              </div>

              <div className="space-y-3 pt-1 text-xs">
                
                {/* Tech Grid Toggle */}
                <div className="p-3 bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Grid className="w-4 h-4 text-[#164e63]" />
                    <div>
                      <span className="block font-bold text-slate-800">Grid Garis Digital Tech</span>
                      <span className="text-[10px] text-slate-500">Pola garis kotak modern di seluruh latar</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.showTechGrid ?? true}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      showTechGrid: e.target.checked
                    }))}
                    className="w-4 h-4 text-[#164e63] rounded-none cursor-pointer"
                  />
                </div>

                {/* Pixel Mosaic Cluster Toggle */}
                <div className="p-3 bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-[#164e63]" />
                    <div>
                      <span className="block font-bold text-slate-800">Mozaik Piksel Pojok Kiri Atas</span>
                      <span className="text-[10px] text-slate-500">Blok piksel transparan modern di atas logo</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.showPixelMosaic ?? true}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      showPixelMosaic: e.target.checked
                    }))}
                    className="w-4 h-4 text-[#164e63] rounded-none cursor-pointer"
                  />
                </div>

                {/* Floating Tiles Toggle */}
                <div className="p-3 bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#164e63]" />
                    <div>
                      <span className="block font-bold text-slate-800">Blok Transparan Melayang (Floating Tiles)</span>
                      <span className="text-[10px] text-slate-500">Kotak aksen futuristik di area tengah</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.showFloatingTiles ?? true}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      showFloatingTiles: e.target.checked
                    }))}
                    className="w-4 h-4 text-[#164e63] rounded-none cursor-pointer"
                  />
                </div>

                {/* Overlay Darkness / Dimmer Slider */}
                <div className="p-3 bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <SunMedium className="w-3.5 h-3.5 text-slate-600" />
                      Kegelapan Lapisan Latar (Overlay Dimmer)
                    </span>
                    <span className="text-[#164e63] font-mono">{config.overlayDarkness ?? 0}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="85"
                    value={config.overlayDarkness ?? 0}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      overlayDarkness: Number(e.target.value)
                    }))}
                    className="w-full h-2 bg-slate-200 rounded-none accent-[#164e63]"
                  />
                  <p className="text-[10px] text-slate-500">
                    Meningkatkan nilai kegelapan akan membuat teks putih dan kartu login lebih jelas dan mudah terbaca.
                  </p>
                </div>

                {/* Overlay Blur Slider */}
                <div className="p-3 bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Efek Blur Gambar Latar (Blur Intensity)</span>
                    <span className="text-[#164e63] font-mono">{config.overlayBlur ?? 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="16"
                    value={config.overlayBlur ?? 0}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      overlayBlur: Number(e.target.value)
                    }))}
                    className="w-full h-2 bg-slate-200 rounded-none accent-[#164e63]"
                  />
                  <p className="text-[10px] text-slate-500">
                    Memberikan efek blur halus pada wallpaper foto agar fokus tertuju ke elemen login.
                  </p>
                </div>

                {/* Background Scroll Behavior Mode */}
                <div className="p-3 bg-slate-50 border border-slate-200 space-y-2">
                  <label className="block font-bold text-slate-800">Perilaku Gulir Latar (Scroll Behavior)</label>
                  <p className="text-[10px] text-slate-500">Tentukan apakah background ikut bergeser saat halaman portal di-scroll ke bawah</p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, backgroundScrollMode: 'scroll' }))}
                      className={`p-2 text-left border text-xs font-bold transition-all cursor-pointer ${
                        (config.backgroundScrollMode ?? 'scroll') === 'scroll'
                          ? 'bg-[#164e63] text-white border-[#164e63]'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block">Ikut Ter-Scroll (Standar)</span>
                      <span className={`text-[10px] font-normal block ${
                        (config.backgroundScrollMode ?? 'scroll') === 'scroll' ? 'text-cyan-100' : 'text-slate-500'
                      }`}>
                        Background bergerak saat scroll
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, backgroundScrollMode: 'fixed' }))}
                      className={`p-2 text-left border text-xs font-bold transition-all cursor-pointer ${
                        config.backgroundScrollMode === 'fixed'
                          ? 'bg-[#164e63] text-white border-[#164e63]'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block">Tetap Diam (Fixed)</span>
                      <span className={`text-[10px] font-normal block ${
                        config.backgroundScrollMode === 'fixed' ? 'text-cyan-100' : 'text-slate-500'
                      }`}>
                        Background diam di viewport
                      </span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Right Column: Interactive Live Preview Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#164e63]" />
              <span>Pratinjau Langsung (Live Preview)</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowFullPreviewModal(true)}
              className="text-[11px] text-[#164e63] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Layar Penuh</span>
            </button>
          </div>

          {/* Scaled Interactive Simulated Screen Container */}
          <div className="bg-slate-900 border-2 border-slate-800 rounded-none overflow-hidden shadow-md relative">
            
            {/* Window bar */}
            <div className="bg-slate-800 px-3 py-1.5 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[9px] font-mono text-slate-400">simakmerdeka.ai.studio/login</span>
              <div className="w-8" />
            </div>

            {/* Simulated Login Page Canvas */}
            <div 
              className="relative w-full h-[400px] overflow-hidden flex flex-col justify-between p-3 select-none transition-all duration-300"
              style={getPreviewBackgroundStyle()}
            >
              {/* Blur & Dimmer Overlay Layer */}
              <div 
                className="absolute inset-0 pointer-events-none transition-all duration-300"
                style={{
                  backgroundColor: config.overlayDarkness ? `rgba(0, 0, 0, ${config.overlayDarkness / 100})` : 'transparent',
                  backdropFilter: config.overlayBlur ? `blur(${config.overlayBlur}px)` : undefined
                }}
              />

              {/* Tech Grid Pattern */}
              {(config.showTechGrid ?? true) && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
                  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="previewGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                        <path d="M 24 0 L 0 0 0 24" fill="none" stroke={`rgba(255, 255, 255, ${(config.gridLineOpacity ?? 15) / 100})`} strokeWidth="0.75" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#previewGrid)" />
                    
                    {(config.showPixelMosaic ?? true) && (
                      <g fill="#ffffff">
                        <rect x="0" y="0" width="24" height="24" opacity="0.35" />
                        <rect x="24" y="0" width="24" height="24" opacity="0.25" />
                        <rect x="0" y="24" width="24" height="24" opacity="0.2" />
                        <rect x="48" y="0" width="24" height="24" opacity="0.15" />
                        <rect x="24" y="24" width="24" height="24" opacity="0.12" />
                        <rect x="0" y="48" width="24" height="24" opacity="0.1" />
                      </g>
                    )}

                    {(config.showFloatingTiles ?? true) && (
                      <g fill="#ffffff">
                        <rect x="160" y="120" width="24" height="24" opacity="0.2" />
                        <rect x="184" y="144" width="24" height="24" opacity="0.15" />
                      </g>
                    )}
                  </svg>
                </div>
              )}

              {/* Mini Simulated Header */}
              <div className="relative z-10 w-full bg-transparent backdrop-blur-xs border-b border-white/20 p-1.5 flex items-center justify-between text-white">
                <div className="flex items-center gap-1.5">
                  <TutWuriHandayaniLogo className="w-4 h-4 text-sky-400" />
                  <span className="text-[9px] font-bold tracking-tight">Sistem Informasi Akademik</span>
                </div>
                <div className="px-2 py-0.5 bg-white/20 text-white text-[8px] font-bold rounded-none">Masuk</div>
              </div>

              {/* Mini Simulated Hero Content */}
              <div className="relative z-10 my-auto space-y-2 text-center text-white px-2">
                <h4 className="text-sm sm:text-base font-bold leading-tight drop-shadow-sm">
                  Sistem Informasi Akademik
                </h4>
                <p className="text-[9px] text-cyan-100 max-w-xs mx-auto line-clamp-2 leading-tight">
                  Manajemen terpadu administrasi mengajar & asesmen Kurikulum Merdeka.
                </p>

                {/* Mini Login Card Mockup */}
                <div className="mt-2 bg-white/95 text-slate-800 p-2.5 shadow-lg max-w-[200px] mx-auto text-left border border-white/40">
                  <div className="text-[9px] font-bold text-slate-800 flex items-center gap-1 mb-1">
                    <span className="w-1.5 h-1.5 bg-[#164e63] rounded-none"></span>
                    Login Portal Guru
                  </div>
                  <div className="space-y-1">
                    <div className="h-4 bg-slate-100 border border-slate-200 px-1 text-[7px] text-slate-400 flex items-center">
                      NIP / Email Anda
                    </div>
                    <div className="h-4 bg-slate-100 border border-slate-200 px-1 text-[7px] text-slate-400 flex items-center">
                      ••••••••
                    </div>
                    <div className="h-4 bg-[#164e63] text-white text-[8px] font-bold flex items-center justify-center">
                      Masuk ke Sistem
                    </div>
                  </div>
                </div>
              </div>

              {/* Mini Running Info Footer */}
              <div className="relative z-10 w-full bg-black/40 backdrop-blur-xs border-t border-white/10 px-2 py-1 flex items-center justify-between text-[8px] text-cyan-100">
                <span>SIMAK v3.7.0</span>
                <span>Kemdikbudristek RI</span>
              </div>
            </div>

            {/* Preview Status Bar */}
            <div className="bg-slate-100 px-3 py-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-700">
                  Tema Aktif: <span className="text-[#164e63] font-semibold">{PRESET_THEMES.find(t => t.id === config.themePreset)?.name || 'Kustom'}</span>
                </span>
                
                <div className="hidden sm:flex items-center gap-2 px-2 border-l border-slate-300">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={isAutoApplyEnabled}
                      onChange={(e) => setIsAutoApplyEnabled(e.target.checked)}
                    />
                    <div className="w-7 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                  <span className="text-[10px] font-semibold text-slate-600">Simpan Real-time</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSave()}
                className={`px-3 py-1 ${isAutoApplyEnabled ? 'bg-slate-300 text-slate-500 hover:bg-slate-400 hover:text-white' : 'bg-[#164e63] hover:bg-cyan-800 text-white'} font-bold text-xs rounded-none flex items-center gap-1 shadow-2xs transition-colors`}
              >
                <Save className="w-3 h-3" />
                <span>Simpan Manual</span>
              </button>
            </div>
          </div>

          {/* Quick Help Tip */}
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-none text-xs flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Perubahan background akan langsung disimpan ke database dan diterapkan otomatis pada halaman login untuk seluruh pengguna yang mengakses sistem.
            </p>
          </div>

        </div>

      </div>

      {/* Full Screen Modal Preview */}
      {showFullPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl border border-slate-300 relative overflow-hidden animate-fadeIn">
            <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-bold">Pratinjau Layar Penuh Background Login</span>
              </div>
              <button
                type="button"
                onClick={() => setShowFullPreviewModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div 
              className="flex-1 relative overflow-hidden flex flex-col justify-between p-6"
              style={getPreviewBackgroundStyle()}
            >
              {/* Blur & Dimmer Overlay Layer */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundColor: `rgba(0, 0, 0, ${(config.overlayDarkness ?? 35) / 100})`,
                  backdropFilter: config.overlayBlur ? `blur(${config.overlayBlur}px)` : undefined
                }}
              />

              {/* Tech Grid Pattern */}
              {(config.showTechGrid ?? true) && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
                  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="fullModalGrid" width="36" height="36" patternUnits="userSpaceOnUse">
                        <path d="M 36 0 L 0 0 0 36" fill="none" stroke={`rgba(255, 255, 255, ${(config.gridLineOpacity ?? 15) / 100})`} strokeWidth="0.75" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#fullModalGrid)" />
                  </svg>
                </div>
              )}

              {/* Modal Top Header */}
              <div className="relative z-10 w-full bg-slate-900/60 backdrop-blur-xs border-b border-white/20 p-3 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <TutWuriHandayaniLogo className="w-6 h-6 text-sky-400" />
                  <span className="text-sm font-bold">Sistem Informasi Akademik</span>
                </div>
                <div className="px-3 py-1 bg-cyan-600 text-xs font-bold">Masuk Portal</div>
              </div>

              {/* Modal Hero Content */}
              <div className="relative z-10 my-auto text-center text-white space-y-3 max-w-xl mx-auto">
                <h2 className="text-3xl font-bold leading-tight drop-shadow-md">
                  Sistem Informasi Akademik
                </h2>
                <p className="text-sm text-cyan-100">
                  Sistem manajemen terpadu pengelolaan administrasi mengajar, perangkat pembelajaran Kurikulum Merdeka.
                </p>
              </div>

              {/* Modal Bottom Bar */}
              <div className="relative z-10 w-full bg-black/40 backdrop-blur-xs border-t border-white/10 p-2 flex items-center justify-between text-xs text-cyan-100">
                <span>SIMAK Merdeka v3.7.0</span>
                <button
                  type="button"
                  onClick={() => {
                    handleSave();
                    setShowFullPreviewModal(false);
                  }}
                  className="px-3 py-1 bg-[#164e63] hover:bg-cyan-800 text-white font-bold"
                >
                  Terapkan Tema Ini
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
