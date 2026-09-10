import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  BookOpen, 
  FileText, 
  HelpCircle,
  Lightbulb
} from 'lucide-react';

interface AIAssistantModalProps {
  onClose: () => void;
  selectedClass: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  onClose,
  selectedClass
}) => {
  const [promptInput, setPromptInput] = useState<string>('');
  const [responseOutput, setResponseOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const presetTemplates = [
    {
      title: "📋 Modul Ajar (RPP) Diferensiasi Biologi",
      prompt: `Buatkan Rencana Modul Ajar Pembelajaran Diferensiasi Kurikulum Merdeka untuk Kelas ${selectedClass} mata pelajaran Biologi topik Struktur Sel & Transpor Membran. Lengkap dengan Alur Tujuan Pembelajaran (ATP), Pemahaman Bermakna, Pertanyaan Pemantik, dan Kegiatan Inti.`
    },
    {
      title: "🧩 Bank Soal Asesmen HOTS Biologi",
      prompt: `Buatkan 3 soal asesmen pilihan ganda berorientasi HOTS (Higher Order Thinking Skills) Kurikulum Merdeka tentang Keanekaragaman Hayati & Genetika beserta kunci jawaban dan pembahasannya.`
    },
    {
      title: "✉️ Draf Surat Panggilan Ortu (Absensi)",
      prompt: `Buatkan draf surat panggilan orang tua yang santun dan formal dari sekolah untuk siswa yang mengalami kecenderungan tidak hadir (alpa) tanpa keterangan lebih dari 3 kali.`
    },
    {
      title: "💡 Ide Projek P5 (Profil Pelajar Pancasila)",
      prompt: `Berikan 3 ide Projek Penguatan Profil Pelajar Pancasila (P5) dengan tema 'Keanekaragaman Hayati & Konservasi Lingkungan' yang relevan untuk siswa SMA/SMK.`
    }
  ];

  const handleGenerate = async (customPrompt?: string) => {
    const textToSubmit = customPrompt || promptInput;
    if (!textToSubmit) return;

    setLoading(true);
    setResponseOutput(null);

    try {
      const response = await window.mockFetch('/api/ai/catatan-rapor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: "Umum / Kelas " + selectedClass,
          nisn: "0000000000",
          className: selectedClass,
          gender: "L",
          grades: [{ subject: textToSubmit, score: 90, predicate: 'A' }]
        })
      });

      const data = await response.json();
      if (data.success && data.result) {
        setResponseOutput(
          `**HASIL ASISTEN PEDAGOGIS GEMINI 2.5 (KURIKULUM MERDEKA)**\n\n` +
          `**Catatan & Strategi Pembelajaran:**\n${data.result.catatanAkademik || ''}\n\n` +
          `**Pengembangan Karakter Siswa:**\n${data.result.catatanWaliKelas || ''}\n\n` +
          `**Rekomendasi Tindak Lanjut & Pengayaan:**\n${data.result.rekomendasiPengayaanRemedial || ''}`
        );
      } else {
        setResponseOutput(`Hasil rekomendasi pembelajaran untuk: "${textToSubmit}":\n\n1. Integrasikan media pembelajaran visual interaktif.\n2. Lakukan asesmen diagnostik di awal pembelajaran.\n3. Fasilitasi kerja kelompok heterogen.`);
      }
    } catch (err) {
      console.error(err);
      setResponseOutput("Maaf, terjadi kendala koneksi ke server AI. Sila coba beberapa saat lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!responseOutput) return;
    navigator.clipboard.writeText(responseOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-none max-w-3xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 text-slate-800 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-3 bg-[#004b87] -mx-6 -mt-6 p-6 rounded-t-xl ">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-none bg-[#00AEEF] flex items-center justify-center text-white font-black shadow-sm">
              <Sparkles className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Asisten AI Guru — SIMAK Kemendikbud
              </h3>
              <p className="text-[11px] text-blue-100 font-medium">
                Generator Modul Ajar, Soal HOTS, dan Deskripsi Capaian Rapor berbasis Gemini 2.5 AI
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-blue-200 hover:text-white rounded-none hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Quick Actions */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Pilih Template Permintaan Cepat:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {presetTemplates.map((t, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPromptInput(t.prompt);
                  handleGenerate(t.prompt);
                }}
                className="text-left bg-slate-50 hover:bg-blue-50 p-3 rounded-none border border-slate-200 hover:border-indigo-500 transition-all text-xs cursor-pointer group"
              >
                <div className="font-bold text-[#004b87] group-hover:text-blue-700">{t.title}</div>
                <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{t.prompt}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Atau Tuliskan Instruksi Khusus Anda:
          </label>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Contoh: Buatkan 5 soal pilihan ganda Biologi tentang Struktur Sel dan Organel..." 
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              className="flex-1 bg-slate-50 border border-slate-300 text-xs px-3 py-2.5 rounded-none text-slate-800 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => handleGenerate()}
              disabled={loading || !promptInput}
              className="bg-[#00AEEF] hover:bg-[#0096ce] text-white font-bold text-xs px-4 py-2.5 rounded-none flex items-center space-x-1.5 shadow transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Kirim</span>
            </button>
          </div>
        </div>

        {/* Response Viewer */}
        {loading && (
          <div className="p-8 text-center bg-blue-50/50 rounded-none border border-blue-100 space-y-2">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
            <p className="text-xs font-bold text-[#004b87]">Gemini 2.5 sedang menyusun dokumen Kurikulum Merdeka...</p>
            <p className="text-[10px] text-slate-500">Harap tunggu beberapa detik.</p>
          </div>
        )}

        {responseOutput && !loading && (
          <div className="bg-[#004b87] p-4 rounded-none border border-slate-800 text-white space-y-3 relative">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                Respon Lengkap Asisten AI
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-none border border-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
              </button>
            </div>

            <pre className="text-xs text-slate-200 font-sans whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
              {responseOutput}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
