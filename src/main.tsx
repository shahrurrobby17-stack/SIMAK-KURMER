import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

declare global {
  interface Window {
    mockFetch: typeof fetch;
    __firebase_id_token?: string;
  }
}

// Mock API for static frontend version
window.mockFetch = async (input, init) => {
  const url = typeof input === 'string' ? input : (input instanceof Request ? input.url : '');
  if (url.startsWith('/api/ai/')) {
    console.log('[MOCK AI FETCH]', url, init);
    let result = "Mohon maaf, fitur AI Generator (Gemini) tidak dapat digunakan pada versi statis (tanpa server) untuk menjaga keamanan API Key. Ini adalah teks simulasi/mock.";
    
    if (url.includes('catatan-rapor')) {
      result = "Siswa menunjukkan perkembangan yang baik dalam pembelajaran. Tetap pertahankan semangat belajar (Simulasi AI - Versi Statis).";
    } else if (url.includes('analisis-kelas')) {
      result = '{"rataRata": 85, "tertinggi": 95, "terendah": 75, "saran": "Tingkatkan latihan soal (Simulasi AI)", "distribusi": {"A": 10, "B": 15, "C": 5, "D": 0}}';
      return new Response(JSON.stringify({ success: true, result: JSON.parse(result) }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Simulate network delay
    await new Promise(r => setTimeout(r, 1500));
    return new Response(JSON.stringify({ success: true, result }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  return fetch(input, init);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
