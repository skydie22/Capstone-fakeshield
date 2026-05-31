import { useEffect, useState } from 'react';
import api from '../api/axios';

const News = () => {
  const [news, setNews] = useState({ data: [], totalResults: 0, loading: true, error: false });
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchNews = async (pageNum) => {
    setNews(prev => ({ ...prev, loading: true }));
    try {
      const response = await api.get(`/api/news?page=${pageNum}&pageSize=${pageSize}`);
      const data = response.data?.data;
      
      setNews({
        data: data?.articles || [],
        totalResults: data?.totalResults || 0,
        loading: false,
        error: false
      });
    } catch (err) {
      setNews({ data: [], totalResults: 0, loading: false, error: true });
    }
  };

  useEffect(() => {
    fetchNews(page);
    window.scrollTo(0, 0);
  }, [page]);

  const totalPages = Math.min(Math.ceil(news.totalResults / pageSize), 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-6">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">Berita Terkini</h2>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">Kumpulan berita terbaru dari berbagai sumber terpercaya untuk membantu Anda tetap terinformasi dengan fakta yang akurat.</p>
        </div>
        <div className="bg-slate-100 px-4 py-2 rounded-full text-[11px] font-bold text-slate-500 border border-slate-200 uppercase tracking-widest self-start md:self-end">
          Total: {news.totalResults} Berita
        </div>
      </div>

      {news.loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="h-48 sm:h-52 bg-gray-100"></div>
              <div className="p-5 sm:p-6 space-y-4">
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                <div className="pt-2 h-3 bg-gray-50 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : news.error ? (
        <div className="bg-red-50 text-red-700 p-8 sm:p-12 rounded-2xl text-center border border-red-100 max-w-2xl mx-auto">
          <svg className="w-12 sm:w-16 h-12 sm:h-16 text-red-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <h3 className="text-lg font-bold mb-2">Gagal memuat berita</h3>
          <p className="text-sm sm:text-base mb-6 opacity-80">Terjadi kesalahan saat mengambil data dari server. Silakan coba beberapa saat lagi.</p>
          <button onClick={() => fetchNews(page)} className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-md active:scale-95">
            Coba Lagi
          </button>
        </div>
      ) : news.data.length === 0 ? (
        <div className="py-20 sm:py-32 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 px-6">
          <svg className="w-12 sm:w-16 h-12 sm:h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20l-7-7 7-7"></path></svg>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[11px]">Tidak ada berita yang ditemukan</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {news.data.map((item, idx) => (
              <a 
                key={idx} 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {item.urlToImage ? (
                  <div className="h-48 sm:h-52 overflow-hidden bg-gray-100 relative">
                    <img 
                      src={item.urlToImage} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black text-gray-800 uppercase tracking-widest shadow-sm border border-white/20">
                        {item.source}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 sm:h-52 bg-slate-50 flex items-center justify-center border-b border-gray-100">
                    <svg className="w-10 sm:w-12 h-10 sm:h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                )}
                <div className="p-5 sm:p-6 flex-1 flex flex-col">
                  <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3">
                    {new Date(item.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <h3 className="text-base sm:text-[17px] font-bold text-gray-900 leading-snug mb-3 group-hover:text-blue-600 transition-colors line-clamp-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-6 flex-1">
                    {item.description || "Tidak ada deskripsi tersedia untuk berita ini."}
                  </p>
                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[120px]">
                      {item.source}
                    </span>
                    <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                      BACA ARTIKEL
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7-7 7"></path></svg>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Mobile-friendly Pagination */}
          {totalPages > 1 && (
            <div className="mt-16 sm:mt-20 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-4 pb-10">
              <div className="flex items-center gap-3">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-all active:scale-90 shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 sm:w-12 h-10 sm:h-12 rounded-xl text-sm font-bold transition-all active:scale-90 ${page === i + 1 ? 'bg-[#1E293B] text-white shadow-lg shadow-slate-200' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'}`}
                    >
                      {i + 1}
                    </button>
                  )).slice(Math.max(0, page - 2), Math.min(totalPages, page + 1))}
                </div>

                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-all active:scale-90 shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>
              
              <div className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] sm:ml-4">
                Halaman {page} dari {totalPages}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default News;
