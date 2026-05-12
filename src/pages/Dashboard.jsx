import { useEffect, useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useNavigate } from 'react-router-dom';
import CheckForm from '../components/CheckForm';
import StatCard from '../components/StatCard';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { getCategory, timeAgo } from '../utils/helpers';

const COLORS = ['#DC2626', '#EA580C', '#D97706', '#16A34A'];

const WordAttentionChart = ({ wordScores }) => {
  const chartData = useMemo(() => {
    if (!wordScores) return [];
    return Object.entries(wordScores)
      .map(([word, score]) => ({ word, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [wordScores]);

  if (chartData.length === 0) return null;

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
          <XAxis type="number" hide />
          <YAxis dataKey="word" type="category" width={80} tick={{ fontSize: 10, fontWeight: 700, fill: '#4B5563' }} />
          <Tooltip 
             cursor={{fill: 'transparent'}}
             content={({ active, payload }) => {
               if (active && payload && payload.length) {
                 return (
                   <div className="bg-[#1E293B] text-white px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest">
                     Score: {(payload[0].value * 100).toFixed(0)}%
                   </div>
                 );
               }
               return null;
             }}
          />
          <Bar dataKey="score" fill="#EAB308" radius={[0, 4, 4, 0]} barSize={15} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [news, setNews] = useState({ data: [], loading: true, error: false });
  const [trends, setTrends] = useState({ data: [], loading: true, error: false });
  const [categories, setCategories] = useState({ data: [], loading: true, error: false });
  const [history, setHistory] = useState({ data: [], loading: true, error: false });
  const [stats, setStats] = useState({
    totalChecks: 0,
    totalHoax: 0,
    accuracy: null,
    accuracyStatus: 'placeholder',
    accuracyMessage: 'Akurasi model belum tersedia',
    loading: true
  });
  
  const [activeResult, setActiveResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchHistory = async () => {
    try {
      const histRes = await api.get('/api/checks/history?limit=5');
      setHistory({ data: histRes.data?.data || [], loading: false, error: false });
    } catch (err) {
      setHistory({ data: [], loading: false, error: true });
    }
  };

  const handleCheckResult = async (id) => {
    setIsAnalyzing(true);
    try {
      const response = await api.get(`/api/checks/${id}`);
      setActiveResult(response.data);
      // Refresh history
      fetchHistory();
    } catch (err) {
      console.error("Gagal mengambil detail hasil:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const [newsRes, statsRes] = await Promise.all([
          api.get('/api/news').catch(() => ({ data: [] })),
          api.get('/api/stats').catch(() => ({
            data: {
              totalChecks: 0,
              totalHoax: 0,
              accuracy: null,
              accuracyStatus: 'placeholder',
              accuracyMessage: 'Akurasi model belum tersedia'
            }
          }))
        ]);
        
        setNews({ data: newsRes.data, loading: false, error: false });
        setStats({ ...statsRes.data, loading: false });
      } catch {
        setNews({ data: [], loading: false, error: true });
        setStats({
          totalChecks: 0,
          totalHoax: 0,
          accuracy: null,
          accuracyStatus: 'placeholder',
          accuracyMessage: 'Akurasi model belum tersedia',
          loading: false
        });
      }
    };
    
    fetchPublicData();

    if (isAuthenticated) {
      const fetchAuthData = async () => {
        try {
          const [trendsRes, catRes, statsRes] = await Promise.all([
            api.get('/api/trends').catch(() => ({ data: [] })),
            api.get('/api/categories').catch(() => ({ data: [] })),
            api.get('/api/stats').catch(() => ({
              data: {
                totalChecks: 0,
                totalHoax: 0,
                accuracy: null,
                accuracyStatus: 'placeholder',
                accuracyMessage: 'Akurasi model belum tersedia'
              }
            }))
          ]);
          
          setTrends({ data: trendsRes.data, loading: false, error: false });
          setCategories({ data: catRes.data, loading: false, error: false });
          setStats({ ...statsRes.data, loading: false });
          fetchHistory();
        } catch {
          // Silent catch
        }
      };
      fetchAuthData();
    } else {
      setTrends({ data: [], loading: false, error: false });
      setCategories({ data: [], loading: false, error: false });
      setHistory({ data: [], loading: false, error: false });
    }
  }, [isAuthenticated]);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Check Form */}
        <div className="lg:col-span-2">
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
                    // Pastikan URL selalu valid atau fallback ke pencarian google
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

            <div className="p-5 border-t border-gray-100 bg-gray-50/50">
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter text-center">
                 Disediakan oleh NewsAPI.org
               </p>
            </div>
          </div>
        </div>

        {/* Bottom Left: Visualisasi Hoaks */}
        <div className="lg:col-span-2">
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
             <div className="flex items-center justify-between p-6 border-b border-gray-100">
               <div className="flex items-center gap-3">
                 <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                 <h3 className="font-bold text-gray-900 uppercase text-[13px] tracking-widest">
                   {activeResult ? 'HASIL ANALISIS TERBARU' : 'VISUALISASI DATA HOAKS'}
                 </h3>
               </div>
               <div className="flex items-center gap-4">
                  {activeResult && (
                    <button 
                      onClick={() => setActiveResult(null)}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-colors"
                    >
                      Lihat Statistik Global
                    </button>
                  )}
                  {!isAuthenticated && <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>}
               </div>
             </div>
             
             {!isAuthenticated ? (
               <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 min-h-[350px] p-10 relative overflow-hidden">
                 <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 2px, transparent 10px)' }}></div>
                 <div className="z-10 flex flex-col items-center">
                   <div className="w-16 h-16 bg-[#1E293B] rounded-full flex items-center justify-center mb-5 shadow-lg">
                     <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                   </div>
                   <h4 className="text-2xl font-bold text-gray-900 mb-3">Fitur Terkunci</h4>
                   <p className="text-gray-600 text-center max-w-sm text-[15px] leading-relaxed">
                     Visualisasi grafik interaktif hanya tersedia untuk akun terverifikasi. Silakan login untuk melihat pemetaan data.
                   </p>
                 </div>
               </div>
             ) : (trends.loading || categories.loading || isAnalyzing) ? (
               <div className="flex-1 p-6 flex flex-col md:flex-row gap-6 min-h-[350px] animate-pulse">
                  <div className="flex-1 bg-gray-100 rounded-xl h-[250px]"></div>
                  <div className="w-[300px] bg-gray-100 rounded-xl h-[250px]"></div>
               </div>
             ) : activeResult ? (
               <div className="flex-1 p-8 flex flex-col animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div>
                        {(() => {
                          const cat = getCategory(activeResult.confidence);
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
                                <button 
                                  onClick={() => navigate(`/result/${activeResult.id}`)}
                                  className="bg-[#1E293B] text-white px-5 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-sm"
                                >
                                  Detail Lengkap
                                </button>
                                <button 
                                  onClick={() => setActiveResult(null)}
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
                       <WordAttentionChart wordScores={activeResult.wordScores} />
                    </div>
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
                      title="BERITA HOAKS" 
                      value={stats.totalHoax} 
                      subtitle="Indikasi hoaks ditemukan"
                    />
                    <StatCard 
                      title="AKURASI MODEL" 
                      value={stats.accuracy === null ? 'N/A' : `${stats.accuracy}%`}
                      subtitle={stats.accuracyMessage || 'Belum tersedia'}
                    />
                  </div>

                  {/* Charts Row */}
                  <div className="flex-1 flex flex-col md:flex-row items-center gap-6 min-h-[300px]">
                    <div className="flex-1 w-full h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={trends.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})} tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                            <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Legend iconType="circle" wrapperStyle={{fontSize: 12}} />
                            <Area type="monotone" dataKey="hoaxCount" name="Hoaks" stroke="#DC2626" fill="#FEE2E2" strokeWidth={2} />
                            <Area type="monotone" dataKey="validCount" name="Valid" stroke="#16A34A" fill="#DCFCE7" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="w-full md:w-[300px] h-[250px] flex items-center justify-center">
                        <PieChart width={300} height={250}>
                          <Pie data={categories.data.length ? categories.data : [{name: "Tidak ada data", count: 1}]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="count" stroke="none">
                            {categories.data.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name) => [value + ' artikel', name]} />
                        </PieChart>
                    </div>
                  </div>
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
                <div className="flex-1 overflow-y-auto">
                  <div className="divide-y divide-gray-100">
                    {history.data.map((item) => {
                      const cat = getCategory(item.confidence);
                      return (
                        <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors flex gap-3 group cursor-pointer" onClick={() => navigate(`/result/${item.id}`)}>
                          <div className="mt-1 flex-shrink-0">
                            <span title={cat.label} className="text-sm">{cat.emoji}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 font-medium truncate mb-1">{item.text || "Tidak ada teks"}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className={`font-semibold ${cat.textClass}`}>{Math.round(item.confidence * 100)}%</span>
                              <span>&bull;</span>
                              <span>{timeAgo(item.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                          </div>
                        </div>
                      );
                    })}
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

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between text-[11px] text-gray-500 font-semibold tracking-widest uppercase">
        <p>&copy; 2026 FAKESHIELD. WIREFRAME FRAMEWORK.</p>
        <div className="flex gap-8 mt-4 md:mt-0">
          <a href="#" className="hover:text-gray-900 transition-colors">TERMS OF SERVICE</a>
          <a href="#" className="hover:text-gray-900 transition-colors">PRIVACY POLICY</a>
          <a href="#" className="hover:text-gray-900 transition-colors">DOCUMENTATION</a>
          <a href="#" className="hover:text-gray-900 transition-colors">SUPPORT</a>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
