import React, { useState } from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  CheckCircle2, 
  X,
  Info,
  ExternalLink
} from 'lucide-react';
import { MenuHealthInfo, MenuHealthIssue } from '../lib/menuHealthService';
import { NavTab } from './SidebarNavigation';

interface MenuErrorDiagnosticBannerProps {
  activeTab: NavTab;
  tabLabel?: string;
  healthInfo?: MenuHealthInfo;
  onNavigateTab?: (tab: NavTab) => void;
  className?: string;
}

export const MenuErrorDiagnosticBanner: React.FC<MenuErrorDiagnosticBannerProps> = ({
  activeTab,
  tabLabel,
  healthInfo,
  onNavigateTab,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showWarnings, setShowWarnings] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  // If dismissed or no health info or no errors or on validation tab, do not render error banner
  if (isDismissed || !healthInfo || healthInfo.invalidCount === 0 || activeTab === 'validasi') {
    return null;
  }

  const errorIssues = healthInfo.errorIssues || [];
  const warningIssues = healthInfo.warningIssues || [];
  const friendlyTabName = tabLabel || (
    activeTab === 'students' ? 'Data Siswa' :
    activeTab === 'grades' ? 'Kelola Nilai' :
    activeTab === 'attendance' ? 'Presensi Siswa' :
    activeTab === 'settings' ? 'Pengaturan Sekolah' :
    activeTab === 'master-data' ? 'Monitoring Akun / Master Data' :
    activeTab === 'extra-tasks' ? 'Tugas Tambahan & Remedial' :
    activeTab === 'dashboard' ? 'Dashboard Utama' :
    activeTab
  );

  return (
    <div 
      id={`menu-error-banner-${activeTab}`}
      className={`mb-4 border-2 border-rose-400 bg-white shadow-md text-slate-800 transition-all ${className}`}
    >
      {/* Banner Header Bar */}
      <div className="bg-rose-700 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-1.5 bg-rose-900/60 border border-rose-300/40 rounded-none shrink-0 text-amber-300">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider bg-rose-900 text-rose-100 px-2 py-0.5 border border-rose-400">
                STATUS MENU ERROR
              </span>
              <span className="text-xs sm:text-sm font-bold tracking-tight text-white">
                Ditemukan {healthInfo.invalidCount} Data yang Salah pada Halaman {friendlyTabName}
              </span>
            </div>
            <p className="text-[11px] text-rose-100 hidden sm:block mt-0.5">
              Data berikut tidak memenuhi standar validasi sistem dan harus diperbaiki agar laporan serta sinkronisasi berjalan normal.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {warningIssues.length > 0 && (
            <button
              type="button"
              onClick={() => setShowWarnings(!showWarnings)}
              className={`px-2.5 py-1 text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                showWarnings 
                  ? 'bg-amber-400 text-slate-950 border-amber-300' 
                  : 'bg-rose-800/80 hover:bg-rose-800 text-amber-200 border-rose-500'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
              <span>{warningIssues.length} Data Kurang</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2.5 py-1 text-[11px] font-bold bg-rose-800/80 hover:bg-rose-800 text-white border border-rose-500 transition-colors cursor-pointer flex items-center gap-1"
            title={isExpanded ? 'Perkecil tampilan rincian' : 'Buka tampilan rincian'}
          >
            {isExpanded ? (
              <>
                <span>Tutup Rincian</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Lihat {healthInfo.invalidCount} Data Salah</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 text-rose-200 hover:text-white hover:bg-rose-800 transition-colors cursor-pointer"
            title="Sembunyikan pemberitahuan ini sementara"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Diagnostic Breakdown */}
      {isExpanded && (
        <div className="p-3.5 sm:p-4 bg-rose-50/40 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs border-b border-rose-200/80 pb-2.5">
            <div className="text-slate-700 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              <span>Rincian Data yang Salah & Petunjuk Perbaikan:</span>
            </div>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('validasi')}
                className="text-xs font-bold text-rose-700 hover:text-rose-900 inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <span>Buka Pusat Validasi Lengkap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Error Issue Cards Table */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {errorIssues.length > 0 ? (
              errorIssues.map((issue: MenuHealthIssue, idx: number) => (
                <div 
                  key={issue.id || idx}
                  className="bg-white border-l-4 border-l-rose-600 border border-slate-200 p-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">
                        {issue.itemTitle}
                      </span>
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-mono font-bold text-[10px] border border-rose-200">
                        Kolom: {issue.field}
                      </span>
                    </div>

                    <div className="flex items-start gap-1.5 text-rose-700 font-medium text-xs mt-1">
                      <span className="font-bold text-rose-800 shrink-0">Kesalahan:</span>
                      <span>{issue.reason}</span>
                    </div>

                    {issue.actionHint && (
                      <div className="flex items-start gap-1.5 text-slate-600 text-[11px] mt-0.5">
                        <span className="font-semibold text-slate-700 shrink-0">Solusi:</span>
                        <span>{issue.actionHint}</span>
                      </div>
                    )}
                  </div>

                  {issue.targetTab && onNavigateTab && issue.targetTab !== activeTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab(issue.targetTab!)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold shrink-0 self-start md:self-center transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Perbaiki di Menu Terkait</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="p-3 bg-white border border-rose-200 text-xs text-slate-600">
                Data error terdeteksi pada konfigurasi menu ini. Silakan periksa kolom terkait di bawah.
              </div>
            )}
          </div>

          {/* Optional Warning Issues Drawer */}
          {showWarnings && warningIssues.length > 0 && (
            <div className="mt-4 pt-3 border-t border-amber-200 bg-amber-50/70 p-3 border border-amber-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Data Kurang / Perlu Dilengkapi ({warningIssues.length} Item):</span>
                </span>
                <span className="text-[10px] font-semibold text-amber-800">
                  Data ini tidak memblokir sistem tetapi dianjurkan untuk dilengkapi
                </span>
              </div>

              <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                {warningIssues.map((warn: MenuHealthIssue, idx: number) => (
                  <div 
                    key={warn.id || idx}
                    className="bg-white border-l-3 border-l-amber-500 border border-amber-200 p-2.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{warn.itemTitle}</div>
                      <div className="text-amber-800 text-[11px] mt-0.5">
                        <strong>Kekurangan:</strong> {warn.reason}
                      </div>
                    </div>
                    {warn.actionHint && (
                      <span className="text-[10px] text-slate-500 italic shrink-0">
                        {warn.actionHint}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
