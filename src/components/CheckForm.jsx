import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const CheckForm = ({ onResult, onLoading }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setError('Silakan login terlebih dahulu untuk melakukan analisis berita.');
      navigate('/auth');
      return;
    }

    if (text.length < 10) {
      setError('Teks terlalu pendek. Masukkan minimal 10 karakter.');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    if (onLoading) onLoading(true);

    try {
      const response = await api.post('/api/checks', { text });
      setText(''); // Kosongkan form
      if (onResult) onResult(response.data.id);
      // navigate(`/result/${response.data.id}`); // Navigasi dimatikan agar hasil muncul di dashboard
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat menganalisis. Pastikan server berjalan.');
    } finally {
      setIsSubmitting(false);
      if (onLoading) onLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        <h2 className="text-2xl font-bold text-gray-900">Analisis Berita</h2>
      </div>
      
      <p className="text-gray-600 mb-6 max-w-lg leading-relaxed text-sm">
        Masukkan teks berita untuk memverifikasi kebenaran informasi melalui sistem kecerdasan buatan kami.
      </p>

      {!isAuthenticated && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Pemeriksaan berita hanya tersedia untuk pengguna yang sudah login.
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-[250px] relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tempelkan isi berita di sini untuk dianalisis..."
          className="w-full flex-1 p-5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1E293B] focus:border-transparent resize-none text-gray-700 bg-gray-50"
        />
      </div>

      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

      <div className="flex justify-end mt-4">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || text.length === 0}
          className="bg-[#1E293B] text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
        >
          {isSubmitting ? 'Menganalisis...' : isAuthenticated ? 'Periksa Sekarang' : 'Login untuk Memeriksa'}
          {!isSubmitting && (
            <svg className="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default CheckForm;
