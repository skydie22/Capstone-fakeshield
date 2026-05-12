import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getCategory, timeAgo, formatDate } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';

const History = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [history, setHistory] = useState({ data: [], pagination: {}, loading: true, error: null });
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      setHistory({ data: [], pagination: {}, loading: false, error: null });
      return;
    }

    const fetchHistory = async () => {
      setHistory(prev => ({ ...prev, loading: true }));
      try {
        const res = await api.get(`/api/checks/history?page=${page}&limit=10`);
        setHistory({
          data: res.data.data,
          pagination: res.data.pagination,
          loading: false,
          error: null
        });
      } catch (err) {
        setHistory({
          data: [],
          pagination: {},
          loading: false,
          error: err.response?.data?.message || 'Gagal memuat riwayat'
        });
      }
    };

    fetchHistory();
  }, [isAuthenticated, page]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 tracking-widest uppercase mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Kembali ke Dashboard
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-100">
            <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Riwayat Memerlukan Login</h1>
          <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
            Anda perlu login terlebih dahulu untuk melihat dan melanjutkan akses ke riwayat pemeriksaan berita.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/auth')}
              className="bg-[#1E293B] text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors"
            >
              Login Sekarang
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (history.loading && page === 1) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded mb-8" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-24 bg-white rounded-xl border border-gray-200 shadow-sm" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 tracking-widest uppercase mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Kembali ke Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Riwayat Pemeriksaan</h1>
          <p className="text-gray-500 mt-2 text-[15px]">Daftar lengkap berita yang telah Anda analisis sebelumnya.</p>
        </div>
        
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm self-start md:self-center">
          <span className="text-sm font-medium text-gray-600">Total: </span>
          <span className="text-sm font-bold text-gray-900">{history.pagination.total || 0} Artikel</span>
        </div>
      </div>

      {history.error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-xl mb-8 flex items-center gap-4">
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <p className="font-medium">{history.error}</p>
        </div>
      )}

      {!history.loading && history.data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
             <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20l-7-7 7-7"></path></svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Riwayat</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-8 leading-relaxed">
            Anda belum melakukan pemeriksaan berita apapun. Mulailah dengan menganalisis teks di dashboard.
          </p>
          <button onClick={() => navigate('/')} className="bg-[#1E293B] text-white px-8 py-3 rounded-lg font-bold text-sm hover:bg-gray-800 transition-all shadow-md active:scale-95 tracking-wide">
            CEK BERITA SEKARANG
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {history.data.map((item) => {
            const cat = getCategory(item.confidence);
            return (
              <div 
                key={item.id} 
                onClick={() => navigate(`/result/${item.id}`)}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group flex flex-col md:flex-row md:items-center gap-6"
              >
                <div className={`w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center text-2xl ${cat.bgLightClass} ${cat.borderClass} border-2`}>
                   {cat.emoji}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-widest uppercase border ${cat.borderClass} ${cat.textClass}`}>
                      {cat.label}
                    </span>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <h4 className="text-[17px] font-bold text-gray-900 leading-snug mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {item.text}
                  </h4>
                  <p className="text-sm text-gray-500 font-medium">
                    Tingkat keyakinan model AI: <span className={`font-bold ${cat.textClass}`}>{Math.round(item.confidence * 100)}%</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Lihat Detail
                  </span>
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#1E293B] group-hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {history.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              
              <div className="flex items-center gap-2">
                {[...Array(history.pagination.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${page === i + 1 ? 'bg-[#1E293B] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {i + 1}
                  </button>
                )).slice(Math.max(0, page - 3), Math.min(history.pagination.totalPages, page + 2))}
              </div>

              <button 
                disabled={page === history.pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default History;
