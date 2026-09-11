import React, { useState } from 'react';
import { TeacherProfile } from '../types';
import { 
  Sparkles, 
  FileText, 
  Map, 
  HelpCircle, 
  ClipboardList, 
  MessageSquare, 
  Send, 
  Bot,
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import Markdown from 'react-markdown';

interface GeminiAssistantViewProps {
  teacher?: TeacherProfile;
  selectedClass: string;
  subjects: string[];
}

export const GeminiAssistantView: React.FC<GeminiAssistantViewProps> = ({
  teacher,
  selectedClass,
  subjects
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'rpp' | 'atp' | 'soal' | 'lkpd'>('chat');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Form States
  const [subject, setSubject] = useState(subjects[0] || 'Biologi');
  const [grade, setGrade] = useState(selectedClass !== 'Semua Kelas' ? selectedClass : 'Kelas X / Fase E');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('2 JP (2 x 45 Menit)');
  const [modelLearning, setModelLearning] = useState('Problem Based Learning (PBL)');
  const [difficulty, setDifficulty] = useState('HOTS (High Order Thinking Skills)');
  const [customPrompt, setCustomPrompt] = useState('');
  const [freePrompt, setFreePrompt] = useState('');

  const tabs = [
    { id: 'chat', label: 'Asisten Chat', icon: MessageSquare },
    { id: 'rpp', label: 'Modul Ajar (RPP)', icon: FileText },
    { id: 'atp', label: 'Alur Tujuan', icon: Map },
    { id: 'soal', label: 'Bank Soal', icon: HelpCircle },
    { id: 'lkpd', label: 'LKPD', icon: ClipboardList }
  ] as const;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'chat' && !freePrompt.trim()) return;
    if (activeTab !== 'chat' && !topic.trim()) return;

    setIsLoading(true);
    setResult('');
    
    try {
      const response = await window.mockFetch('/api/ai/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docType: activeTab,
          subject,
          grade,
          topic,
          duration,
          modelLearning,
          difficulty,
          customPrompt,
          prompt: freePrompt
        })
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.result);
      } else {
        setResult(`**Error:** ${data.error || 'Terjadi kesalahan'}`);
      }
    } catch (error: any) {
      setResult(`**Error:** Gagal menghubungi server AI (${error.message})`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#002f54] via-[#164e63] to-[#003d6d] rounded-none p-6 sm:p-8 text-white shadow-lg relative overflow-hidden border border-cyan-400/20">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-12">
          <Bot className="w-72 h-72 text-white" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/20 border border-cyan-300/40 text-cyan-200 text-xs font-bold backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>Asisten AI Kemendikbudristek</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            Asisten AI Kurikulum Merdeka
          </h1>
          <p className="text-sm text-cyan-100 leading-relaxed">
            Asisten cerdas untuk membantu Bapak/Ibu <strong>{teacher?.name || 'Guru'}</strong> dalam menyusun perangkat ajar, rubrik penilaian, dan konsultasi pedagogis secara instan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Controls */}
        <div className="lg:col-span-4 space-y-4">
          {/* Tab Selector */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="grid grid-cols-2 gap-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-[#164e63] text-white shadow-md' 
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    } ${tab.id === 'chat' ? 'col-span-2' : 'col-span-1'}`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-200' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleGenerate} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 mb-2 pb-3 border-b border-slate-100">
              <Bot className="w-5 h-5 text-[#164e63]" />
              <h2 className="font-bold text-slate-800">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
            </div>

            {activeTab === 'chat' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Pertanyaan / Perintah</label>
                  <textarea
                    value={freePrompt}
                    onChange={(e) => setFreePrompt(e.target.value)}
                    placeholder="Contoh: Berikan ide permainan edukatif untuk materi sel biologi kelas 11..."
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164e63] text-sm min-h-[200px] resize-y"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Mata Pelajaran</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164e63] text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Kelas / Fase</label>
                    <input
                      type="text"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164e63] text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Topik / Materi Pokok</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Contoh: Sistem Pencernaan Manusia"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164e63] text-sm"
                    required
                  />
                </div>

                {(activeTab === 'rpp' || activeTab === 'atp' || activeTab === 'lkpd') && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Alokasi Waktu</label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164e63] text-sm"
                    />
                  </div>
                )}

                {activeTab === 'rpp' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Model Pembelajaran</label>
                    <select
                      value={modelLearning}
                      onChange={(e) => setModelLearning(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164e63] text-sm"
                    >
                      <option value="Problem Based Learning (PBL)">Problem Based Learning (PBL)</option>
                      <option value="Project Based Learning (PjBL)">Project Based Learning (PjBL)</option>
                      <option value="Inquiry Learning">Inquiry Learning</option>
                      <option value="Discovery Learning">Discovery Learning</option>
                      <option value="Direct Instruction">Keterampilan Langsung (Direct Instruction)</option>
                    </select>
                  </div>
                )}

                {activeTab === 'soal' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Tingkat Kesukaran</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164e63] text-sm"
                    >
                      <option value="HOTS (High Order Thinking Skills)">HOTS (Analisis, Evaluasi, Mencipta)</option>
                      <option value="MOTS (Middle Order Thinking Skills)">MOTS (Penerapan)</option>
                      <option value="LOTS (Low Order Thinking Skills)">LOTS (Mengingat, Memahami)</option>
                      <option value="Campuran (Proporsional)">Campuran Proporsional</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Catatan Tambahan (Opsional)</label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Instruksi spesifik... (Misal: Sesuaikan dengan gaya belajar visual)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#164e63] text-sm min-h-[80px] resize-y"
                  />
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#164e63] hover:bg-cyan-800 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm text-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sedang Menyusun...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Generate Dokumen</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Output / Result */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full min-h-[500px]">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-800">Hasil Generate</h3>
              </div>
              
              {result && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#164e63] transition-all shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
                </button>
              )}
            </div>

            <div className="p-6 flex-1 overflow-auto bg-white rounded-b-xl">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-cyan-100 rounded-full animate-pulse"></div>
                    <Loader2 className="w-16 h-16 text-[#164e63] animate-spin absolute top-0 left-0" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">AI Sedang Bekerja...</h3>
                    <p className="text-sm text-slate-500 mt-1">Mengumpulkan referensi dan merangkai dokumen sesuai pedoman.</p>
                  </div>
                </div>
              ) : result ? (
                <div className="markdown-body prose prose-slate prose-sm sm:prose-base max-w-none">
                  <Markdown>{result}</Markdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20 opacity-60">
                  <Bot className="w-20 h-20 text-slate-300" />
                  <div>
                    <h3 className="font-bold text-slate-500 text-lg">Belum Ada Hasil</h3>
                    <p className="text-sm text-slate-400 mt-1 max-w-md">
                      Pilih jenis dokumen di panel sebelah kiri dan isi formulir yang disediakan, lalu klik Generate untuk memulai.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
