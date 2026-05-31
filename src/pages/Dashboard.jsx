import { useEffect, useState, useRef, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import CheckForm from '../components/CheckForm';
import StatCard from '../components/StatCard';
import WordAttentionChart from '../components/WordAttentionChart';
import api, { publicApi } from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { getCategory, timeAgo, normalizeCheckResult } from '../utils/helpers';
import { COLORS as APP_COLORS } from '../constants/categories';

const PIE_COLORS = [APP_COLORS.danger, APP_COLORS.warning, APP_COLORS.caution, APP_COLORS.success];

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const resultRef = useRef(null);
  const [stats, setStats] = useState({
    totalChecks: 0,
    totalHoax: 0,
    totalValid: 0,
    accuracy: null,
    accuracyStatus: '',
    accuracyMessage: '',
    loading: true,
    error: false
  });
  const [news, setNews] = useState({ data: [], pagination: {}, loading: true, error: false });
  const [trends, setTrends] = useState({ data: [], loading: true, error: false });
  const [categories, setCategories] = useState({ data: [], loading: true, error: false });
  
  // Normalize categories for PieChart (grouping all possible labels)
  const normalizedCategories = useMemo(() => {
    const grouped = { 'Hoaks': 0, 'Valid': 0 };
    categories.data.forEach(item => {
      const name = (item.name || '').toLowerCase();
      // Menangani semua variasi label (hoaks, bukan_hoaks, valid, sangat valid, dll)
      if (name.includes('hoaks')) {
        grouped['Hoaks'] += item.count || 0;
      } else if (name.includes('valid') || name.includes('bukan')) {
        grouped['Valid'] += item.count || 0;
      } else {
        // Fallback jika tidak ada kata kunci yang cocok
        grouped['Hoaks'] += item.count || 0;
      }
    });
    return Object.entries(grouped)
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => ({ name, count }));
  }, [categories.data]);

  const [history, setHistory] = useState({ data: [], pagination: {}, loading: true, error: false });
  
  // Data Fallback (Sampel) agar grafik selalu tampil meskipun kosong atau belum login
  const displayTrends = useMemo(() => {
    if (!trends.data || trends.data.length === 0) {
      return [];
    }
    
    // Recharts butuh minimal 2 titik data untuk menggambar garis/area.
    // Jika hanya ada 1 hari (misal user baru tes hari ini), kita tambahkan hari kemarin (0).
    const realData = [...trends.data];
    if (realData.length === 1) {
      const todayStr = realData[0].date;
      const todayObj = new Date(todayStr);
      todayObj.setDate(todayObj.getDate() - 1);
      const yesterdayStr = todayObj.toISOString().split('T')[0];
      
      realData.unshift({
        date: yesterdayStr,
        hoaxCount: 0,
        validCount: 0
      });
    }
    return realData;
  }, [trends.data]);

  const hasRealData = stats.totalChecks > 0;
  const displayCategories = hasRealData ? [
    { name: 'Hoaks', count: stats.totalHoax },
    { name: 'Valid', count: stats.totalValid }
  ].filter(item => item.count > 0) : [];

  const [activeResult, setActiveResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Tangani scroll jika ada hash di URL (misal: #check-section)
    if (window.location.hash === '#check-section') {
      const element = document.getElementById('check-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        // Fokuskan textarea jika memungkinkan untuk UX yang lebih baik
        const textarea = element.querySelector('textarea');
        if (textarea) textarea.focus();
      }
    }
  }, []);

  const scrollToResult = () => {
    if (resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const fetchHistory = async () => {
    try {
      const histRes = await api.get('/api/history?limit=5');
      const data = (histRes.data?.data || []).map(normalizeCheckResult);
      const pagination = histRes.data?.pagination || histRes.data?.meta || {};
      setHistory({ data, pagination, loading: false, error: false });
    } catch (err) {
      setHistory({ data: [], pagination: {}, loading: false, error: true });
    }
  };

  const handleCheckResult = async (resultOrId) => {
    // Jika input adalah objek (hasil lengkap dari POST), gunakan langsung
    if (typeof resultOrId === 'object' && resultOrId !== null) {
      setActiveResult(normalizeCheckResult(resultOrId));
      if (isAuthenticated) fetchHistory();
      // Beri sedikit delay agar DOM terupdate sebelum scroll
      setTimeout(scrollToResult, 100);
      return;
    }

    // Fallback: Jika input adalah ID, fetch data (hanya bekerja jika login)
    setIsAnalyzing(true);
    try {
      const axiosInstance = isAuthenticated ? api : publicApi;
      const response = await axiosInstance.get(`/api/checks/${resultOrId}`);
      const rawResult = response.data?.data || response.data;
      setActiveResult(normalizeCheckResult(rawResult));
      if (isAuthenticated) fetchHistory();
      setTimeout(scrollToResult, 100);
    } catch (err) {
      console.error("Gagal mengambil detail hasil:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // News selalu publik
      const newsRes = await publicApi.get('/api/news?pageSize=10').catch(() => ({ data: { data: { articles: [] } } }));
      const newsData = newsRes.data?.data;
      setNews({ 
        data: newsData?.articles || [], 
        pagination: { totalResults: newsData?.totalResults || 0 }, 
        loading: false, 
        error: false 
      });

      // Hanya fetch stats, trends, dan categories jika login
      if (isAuthenticated) {
        const axiosInstance = api;
        const [statsRes, trendsRes, catRes] = await Promise.all([
          axiosInstance.get('/api/stats').catch(() => ({
            data: {
              data: {
                totalChecks: 0,
                totalHoax: 0,
                totalValid: 0,
                accuracy: null,
                accuracyStatus: 'placeholder',
                accuracyMessage: 'Akurasi model belum tersedia'
              }
            }
          })),
          axiosInstance.get('/api/trends').catch(() => ({ data: { data: [] } })),
          axiosInstance.get('/api/categories').catch(() => ({ data: { data: [] } }))
        ]);

        const statsData = statsRes.data?.data || statsRes.data;
        setStats({ ...statsData, loading: false });
        setTrends({ data: trendsRes.data?.data || [], loading: false, error: false });
        setCategories({ data: catRes.data?.data || [], loading: false, error: false });
      } else {
        // Jika tidak login, set loading ke false agar UI tidak berputar selamanya
        setStats(prev => ({ ...prev, loading: false }));
        setTrends(prev => ({ ...prev, loading: false }));
        setCategories(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      setNews(prev => ({ ...prev, loading: false, error: true }));
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchDashboardData();

    if (isAuthenticated) {
      fetchHistory();
    } else {
      setHistory({ data: [], loading: false, error: false });
    }
  }, [isAuthenticated]);

  const handleCloseResult = () => {
    setActiveResult(null);
    fetchDashboardData(); // Refresh statistik saat hasil ditutup
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Check Form */}
        <div className="lg:col-span-2" id="check-section">
          <CheckForm onResult={handleCheckResult} onLoading={setIsAnalyzing} />
        </div>

        {/* Right Column: Latest News */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
               <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20l-7-7 7-7"></path></svg>
               <h3 className="font-bold text-gray-900 uppercase text-[13px] tracking-widest">BERITA TERKINI</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[400px]">
              {news.loading ? (
                <div className="p-6 space-y-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-50 rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
              ) : news.data.length === 0 ? (
                <div className="p-10 text-center text-gray-500 text-sm">
                  Tidak ada berita tersedia saat ini.
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {news.data.map((item, idx) => {
                    const newsUrl = item.url && item.url !== '#' 
                      ? item.url 
                      : `https://www.google.com/search?q=${encodeURIComponent(item.title)}`;

                    return (
                      <a 
                        key={idx} 
                        href={newsUrl}
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="block p-5 hover:bg-gray-50 transition-colors group cursor-pointer select-none"
                      >
                        <h4 className="text-[14px] font-bold text-gray-900 leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {item.title}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                          <span>{item.source}</span>
                          <span>{new Date(item.publishedAt).toLocaleDateString('id-ID')}</span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-3">
               <button 
                 onClick={() => navigate('/news')}
                 className="w-full py-2 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-900 uppercase tracking-widest hover:bg-gray-50 transition-colors shadow-sm"
               >
                 Lihat Semua Berita
               </button>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter text-center">
                 Disediakan oleh NewsAPI.org
               </p>
            </div>
          </div>
        </div>

        {/* Bottom Left: Visualisasi Hoaks */}
        <div className="lg:col-span-2" ref={resultRef}>
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
             <div className="flex items-center justify-between p-6 border-b border-gray-100">
               <div className="flex items-center gap-3">
                 <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                 <h3 className="font-bold text-gray-900 uppercase text-[13px] tracking-widest">
                   {activeResult ? 'HASIL ANALISIS TERBARU' : 'STATISTIK DETEKSI GLOBAL'}
                 </h3>
               </div>
               <div className="flex items-center gap-4">
                  {activeResult && (
                    <button 
                      onClick={handleCloseResult}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-colors"
                    >
                      Lihat Statistik Global
                    </button>
                  )}
                  {!isAuthenticated && <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>}
               </div>
             </div>
             
             {isAnalyzing ? (
               <div className="flex-1 p-6 flex flex-col md:flex-row gap-6 min-h-[350px] animate-pulse">
                  <div className="flex-1 bg-gray-100 rounded-xl h-[250px]"></div>
                  <div className="w-[300px] bg-gray-100 rounded-xl h-[250px]"></div>
               </div>
             ) : activeResult ? (
               <div className="flex-1 p-8 flex flex-col animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div>
                        {(() => {
                          const cat = getCategory(activeResult.confidence, activeResult.label);
                          return (
                            <div className="space-y-6">
                              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wider ${cat.badgeClass}`}>
                                <span>{cat.emoji}</span> {cat.label}
                              </div>
                              <p className="text-gray-700 leading-relaxed font-medium">
                                {cat.description}
                              </p>
                              
                              <div className="space-y-2 pt-2">
                                <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                  <span>Keyakinan AI</span>
                                  <span>{Math.round(activeResult.confidence * 100)}%</span>
                                </div>
                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                  <div className={`h-full ${cat.bgClass}`} style={{ width: `${activeResult.confidence * 100}%` }}></div>
                                </div>
                              </div>

                              <div className="pt-4 flex gap-3">
                                {isAuthenticated && (
                                  <button 
                                    onClick={() => navigate(`/result/${activeResult.id}`)}
                                    className="bg-[#1E293B] text-white px-5 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-sm"
                                  >
                                    Detail Lengkap
                                  </button>
                                )}
                                <button 
                                  onClick={handleCloseResult}
                                  className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-colors"
                                >
                                  Tutup
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                    </div>
                    
                    <div className="bg-slate-50 p-6 rounded-xl border border-gray-100">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Pengaruh Kata Terhadap Hasil:</p>
                       <WordAttentionChart wordScores={activeResult.wordScores} variant={activeResult.label?.toLowerCase() === 'hoaks' ? 'hoaks' : 'valid'} />
                    </div>
                  </div>
               </div>
             ) : !isAuthenticated ? (
               <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 min-h-[350px] p-10 relative overflow-hidden">
                 <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 2px, transparent 10px)' }}></div>
                 <div className="z-10 flex flex-col items-center text-center">
                   <div className="w-16 h-16 bg-[#1E293B] rounded-full flex items-center justify-center mb-5 shadow-lg">
                     <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                   </div>
                   <h4 className="text-2xl font-bold text-gray-900 mb-3">Statistik Terkunci</h4>
                   <p className="text-gray-600 text-center max-w-sm text-[15px] leading-relaxed mb-6">
                     Data statistik deteksi global dan visualisasi tren hoaks hanya tersedia untuk akun terverifikasi.
                   </p>
                   <button 
                     onClick={() => navigate('/auth')}
                     className="bg-[#1E293B] text-white px-8 py-3 rounded-xl font-bold text-[12px] uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md hover:shadow-lg active:scale-95"
                   >
                     Login untuk Akses Penuh
                   </button>
                 </div>
               </div>
             ) : (
               <div className="flex-1 flex flex-col p-6 gap-6">
                  {/* Summary Stats Row */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <StatCard 
                      title="TOTAL PENGECEKAN" 
                      value={stats.totalChecks} 
                      subtitle="Berita yang dianalisis"
                    />
                    <StatCard 
                      title="BERITA VALID" 
                      value={stats.totalValid} 
                      subtitle="Berita terverifikasi"
                    />
                    <StatCard 
                      title="BERITA HOAKS" 
                      value={stats.totalHoax} 
                      subtitle="Indikasi hoaks ditemukan"
                    />
                    <StatCard 
                      title="AKURASI MODEL" 
                      value={stats.accuracy === null ? 'N/A' : `${stats.accuracy}%`}
                      subtitle={stats.accuracyMessage || 'Akurasi rata-rata'}
                    />
                  </div>

                  {trends.loading || categories.loading ? (
                    <div className="flex-1 p-6 flex flex-col md:flex-row gap-6 min-h-[250px] animate-pulse">
                      <div className="flex-1 bg-gray-100 rounded-xl h-[200px]"></div>
                      <div className="w-[300px] bg-gray-100 rounded-xl h-[200px]"></div>
                    </div>
                  ) : (
                    /* Charts Row */
                    <div className="flex-1 flex flex-col md:flex-row items-center gap-6 min-h-[300px]">
                      <div className="flex-1 w-full h-[250px] flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-gray-100">
                          {displayTrends.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={displayTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})} tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Legend iconType="circle" wrapperStyle={{fontSize: 12}} />
                                <Area type="monotone" dataKey="hoaxCount" name="Hoaks" stroke="#DC2626" fill="#FEE2E2" strokeWidth={2} />
                                <Area type="monotone" dataKey="validCount" name="Valid" stroke="#16A34A" fill="#DCFCE7" strokeWidth={2} />
                              </AreaChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="flex flex-col items-center text-gray-400 gap-2">
                              <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
                              <span className="text-[10px] font-bold uppercase tracking-widest">Tren data belum tersedia</span>
                            </div>
                          )}
                      </div>
                      <div className="w-full md:w-[300px] h-[250px] relative flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-gray-100">
                          {displayCategories.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie 
                                  data={displayCategories} 
                                  cx="50%" 
                                  cy="50%" 
                                  innerRadius={65} 
                                  outerRadius={85} 
                                  paddingAngle={5}
                                  dataKey="count" 
                                  nameKey="name"
                                  stroke="none"
                                >
                                  {displayCategories.map((entry, index) => {
                                    const name = entry.name?.toLowerCase() || '';
                                    let color = APP_COLORS.neutral;
                                    if (name === 'hoaks') color = APP_COLORS.danger;
                                    else if (name === 'valid' || name === 'bukan_hoaks') color = APP_COLORS.success;
                                    else if (name.includes('hoaks')) color = APP_COLORS.danger;
                                    else if (name.includes('valid')) color = APP_COLORS.success;

                                    return <Cell key={`cell-${index}`} fill={color} />;
                                  })}
                                </Pie>
                                <Tooltip 
                                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                  formatter={(value, name) => [`${value} Artikel`, name]} 
                                />
                                <Legend iconType="circle" wrapperStyle={{fontSize: 10, paddingTop: 10}} />
                              </PieChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="flex flex-col items-center text-gray-400 gap-2">
                              <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.003 0 0120.488 9z"></path></svg>
                              <span className="text-[10px] font-bold uppercase tracking-widest">Kategori belum tersedia</span>
                            </div>
                          )}
                          
                          {/* Label Tengah Donut */}
                          {displayCategories.length > 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                               <span className="text-[22px] font-black text-gray-900 leading-none">
                                 {displayCategories.reduce((acc, curr) => acc + (curr.count || 0), 0)}
                               </span>
                               <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total Data</span>
                            </div>
                          )}
                      </div>
                    </div>
                  )}
               </div>
             )}
           </div>
        </div>

        {/* Bottom Right: Riwayat Pemeriksaan */}
        <div className="lg:col-span-1">
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
             <div className="p-6 border-b border-gray-100 flex items-center gap-3">
               <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               <h3 className="font-bold text-gray-900 uppercase text-[13px] tracking-widest">RIWAYAT PEMERIKSAAN</h3>
             </div>
             
             {!isAuthenticated ? (
                <div className="flex-1 flex flex-col items-center justify-center p-10 min-h-[300px]">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"></path></svg>
                  </div>
                  <h4 className="text-[17px] font-medium text-gray-900 mb-2">Belum ada riwayat</h4>
                  <p className="text-[15px] text-gray-500 text-center leading-relaxed">
                    Login untuk melakukan analisis berita dan menyimpan riwayat hasil pemeriksaan Anda.
                  </p>
                </div>
             ) : history.loading ? (
                <div className="flex-1 p-6 space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-200 shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
             ) : history.data.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-10 min-h-[300px]">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"></path></svg>
                  </div>
                  <h4 className="text-[17px] font-medium text-gray-900 mb-2">Belum ada riwayat</h4>
                  <p className="text-[15px] text-gray-500 text-center leading-relaxed">
                    Hasil analisis berita Anda akan muncul secara otomatis di sini.
                  </p>
                </div>
             ) : (
                <div className="flex-1 overflow-y-auto bg-slate-50/30">
                  <div className="divide-y divide-gray-100">
                    {history.data.map((item) => {
                      const cat = getCategory(item.confidence, item.label);
                      return (
                        <div key={item.id} className="p-5 bg-white hover:bg-slate-50 transition-all flex gap-4 group cursor-pointer" onClick={() => navigate(`/result/${item.id}`)}>
                          <div className="mt-0.5 flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-gray-50 group-hover:bg-white border border-gray-100 shadow-sm transition-colors">
                            <span title={cat.label} className="text-[15px]">{cat.emoji}</span>
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <p className="text-[14px] text-gray-900 font-bold truncate mb-1.5">{item.text || "Tidak ada teks"}</p>
                            <div className="flex items-center gap-2 text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                              <span className={`px-2 py-0.5 rounded border ${cat.borderClass} ${cat.textClass} ${cat.bgLightClass} text-[9px]`}>
                                {Math.round(item.confidence * 100)}%
                              </span>
                              <span className="opacity-40">&bull;</span>
                              <span>{timeAgo(item.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-[#1E293B] transition-colors">
                              <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {[...Array(Math.max(0, 5 - history.data.length))].map((_, i) => (
                      <div key={`empty-${i}`} className="p-5 flex gap-4 items-center justify-center h-[92px] opacity-30 bg-transparent">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                          <div className="h-0.5 w-12 bg-gray-200 rounded-full"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
             )}

             <div className="border-t border-gray-100 p-5 flex justify-center">
               <button onClick={() => navigate('/history')} className="text-xs font-bold text-gray-900 tracking-widest uppercase hover:text-gray-600 transition-colors">
                 LIHAT SEMUA
               </button>
             </div>
           </div>
        </div>

      </div>

      {/* Simple Footer */}
      <footer className="mt-16 pt-8 pb-12 border-t border-gray-100">
        <p className="text-[11px] text-gray-400 font-bold tracking-widest uppercase text-center">
          &copy; 2026 FakeShield. <span className="text-gray-300">Dicoding by DBS.</span>
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
