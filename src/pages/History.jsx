import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getCategory, timeAgo, formatDate, normalizeCheckResult } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';

const History = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [history, setHistory] = useState({ data: [], pagination: {}, loading: true, error: null });
  const [page, setPage] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  useEffect(() => {
    if (!isAuthenticated) {
      setHistory({ data: [], pagination: {}, loading: false, error: null });
      return;
    }

    const fetchHistory = async () => {
      setHistory(prev => ({ ...prev, loading: true }));
      try {
        const res = await api.get(`/api/history?page=${page}&limit=12`);
        const rawData = res.data.data || [];
        setHistory({
          data: rawData.map(normalizeCheckResult),
          pagination: res.data.pagination || {}, 
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
          className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-900 tracking-widest uppercase mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Kembali ke Dashboard
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Akses Terbatas</h1>
          <p className="text-gray-500 max-w-sm mx-auto mb-8">Silakan masuk ke akun Anda untuk melihat riwayat lengkap pemeriksaan berita.</p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-[#1E293B] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-md active:scale-95"
          >
            LOGIN SEKARANG
          </button>
        </div>
      </div>
    );
  }

  if (history.loading && page === 1) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse">
        <div className="h-8 w-48 bg-gray-100 rounded mb-12" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-white rounded-2xl border border-gray-100 shadow-sm" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 pb-24">
      {/* Header Section - Same as News */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-6">
        <div className="max-w-2xl">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-gray-900 tracking-[0.2em] uppercase mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            DASHBOARD
          </button>
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">Riwayat Pemeriksaan</h2>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">Kelola dan tinjau kembali seluruh riwayat analisis berita yang telah Anda lakukan di platform FakeShield.</p>
        </div>
        <div className="bg-slate-100 px-4 py-2 rounded-full text-[11px] font-bold text-slate-500 border border-slate-200 uppercase tracking-widest self-start md:self-end">
          Total: {history.pagination.total || 0} Artikel
        </div>
      </div>

      {history.error ? (
        <div className="bg-red-50 text-red-700 p-8 sm:p-12 rounded-2xl text-center border border-red-100 max-w-2xl mx-auto">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <h3 className="text-lg font-bold mb-2">Gagal memuat riwayat</h3>
          <p className="text-sm opacity-80">{history.error}</p>
        </div>
      ) : history.data.length === 0 ? (
        <div className="py-20 sm:py-32 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 px-6">
          <svg className="w-12 sm:w-16 h-12 sm:h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20l-7-7 7-7"></path></svg>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[11px] mb-8">Anda belum memiliki riwayat analisis</p>
          <button onClick={() => navigate('/')} className="bg-[#1E293B] text-white px-8 py-3.5 rounded-xl font-bold text-xs hover:bg-gray-800 transition-all shadow-md active:scale-95 uppercase tracking-widest">
            Analisis Berita Sekarang
          </button>
        </div>
      ) : (
        <>
          {/* Card Grid - Identical to News page */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {history.data.map((item) => {
              const cat = getCategory(item.confidence, item.label);
              return (
                <div 
                  key={item.id} 
                  onClick={() => navigate(`/result/${item.id}`)}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
                >
                  {/* Card Header (Category Icon) */}
                  <div className={`h-40 sm:h-44 flex items-center justify-center relative overflow-hidden ${cat.bgLightClass}`}>
                    <div className="absolute inset-0 opacity-10 bg-grid-slate-900/[0.1] [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))]"></div>
                    <span className="text-6xl group-hover:scale-110 transition-transform duration-500 z-10">{cat.emoji}</span>
                    
                    <div className="absolute top-4 left-4">
                      <span className={`bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-sm border border-white/20 ${cat.textClass}`}>
                        {cat.label}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex justify-between">
                      <span>{formatDate(item.createdAt)}</span>
                      <span>{timeAgo(item.createdAt)}</span>
                    </div>
                    
                    <h3 className="text-base sm:text-[17px] font-bold text-gray-900 leading-snug mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {item.text || "Tidak ada teks"}
                    </h3>

                    {/* Progress Bar Section */}
                    <div className="mt-auto pt-4 border-t border-gray-50 flex flex-col gap-3">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                          <span>AI CONFIDENCE</span>
                          <span className={cat.textClass}>{Math.round(item.confidence * 100)}%</span>
                       </div>
                       <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full ${cat.bgClass} transition-all duration-500`} style={{ width: `${item.confidence * 100}%` }}></div>
                       </div>
                       <div className="mt-2 flex items-center justify-end">
                          <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                            LIHAT DETAIL
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7-7 7"></path></svg>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination - Consistent with News */}
          {history.pagination.totalPages > 1 && (
            <div className="mt-16 sm:mt-20 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-4 pb-10">
              <div className="flex items-center gap-3">
                <button 
                  disabled={page === 1}
                  onClick={(e) => { e.stopPropagation(); setPage(p => p - 1); }}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-all active:scale-90 shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                
                <div className="flex items-center gap-2">
                  {[...Array(history.pagination.totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={(e) => { e.stopPropagation(); setPage(i + 1); }}
                      className={`w-10 sm:w-12 h-10 sm:h-12 rounded-xl text-sm font-bold transition-all active:scale-90 ${page === i + 1 ? 'bg-[#1E293B] text-white shadow-lg shadow-slate-200' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'}`}
                    >
                      {i + 1}
                    </button>
                  )).slice(Math.max(0, page - 2), Math.min(history.pagination.totalPages, page + 1))}
                </div>

                <button 
                  disabled={page === history.pagination.totalPages}
                  onClick={(e) => { e.stopPropagation(); setPage(p => p + 1); }}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-all active:scale-90 shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>
              
              <div className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] sm:ml-4">
                Halaman {page} dari {history.pagination.totalPages}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default History;
