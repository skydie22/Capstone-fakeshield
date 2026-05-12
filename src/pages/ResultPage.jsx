import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../api/axios';
import { getCategory, formatDate } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';

const COLORS = {
  'Sangat Terindikasi Hoaks': '#DC2626',
  'Terindikasi Hoaks': '#EA580C',
  'Perlu Verifikasi': '#D97706',
  'Kemungkinan Valid': '#16A34A',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-md">
        <p className="font-medium text-sm text-gray-900">{payload[0].name}</p>
        <p className="text-gray-600 text-xs mt-1">{payload[0].value} artikel</p>
      </div>
    );
  }
  return null;
};

const WordAttentionChart = ({ wordScores }) => {
  const chartData = useMemo(() => {
    if (!wordScores) return [];
    return Object.entries(wordScores)
      .map(([word, score]) => ({ word, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [wordScores]);

  if (chartData.length === 0) return null;

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="word" 
            type="category" 
            width={80} 
            tick={{ fontSize: 11, fontWeight: 600, fill: '#4B5563' }}
          />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-[#1E293B] text-white px-3 py-1.5 rounded shadow-lg text-[10px] font-bold uppercase tracking-wider">
                    Score: {(payload[0].value * 100).toFixed(1)}%
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="score" 
            fill="#EAB308" 
            radius={[0, 4, 4, 0]} 
            barSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const ConfidenceBar = ({ value, colorClass }) => {
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-gray-700 tracking-wide uppercase">Keyakinan Model AI</span>
        <span className="text-lg font-bold text-gray-900">{Math.round(value)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-3 rounded-full animate-bar-fill ${colorClass}`}
          style={{ '--bar-width': `${value}%`, width: `${value}%` }}
        />
      </div>
    </div>
  );
};

const ArticleTextCard = ({ text, suspiciousWords }) => {
  const [showFull, setShowFull] = useState(false);
  const isLong = text && text.length > 500;
  const displayText = isLong && !showFull ? text.slice(0, 500) + '...' : text;

  const highlightText = (txt, words) => {
    if (!words || words.length === 0 || !txt) return txt;
    
    // Sort words by length descending to match longer phrases first
    const sortedWords = [...words].sort((a, b) => b.length - a.length);
    // Escape regex special chars
    const escapedWords = sortedWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`\\b(${escapedWords.join('|')})\\b`, 'gi');
    
    const parts = txt.split(regex);
    
    return parts.map((part, i) => {
      if (sortedWords.some(w => w.toLowerCase() === part.toLowerCase())) {
        return (
          <mark key={i} className="bg-yellow-200 text-yellow-900 px-1 rounded-sm font-medium">
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  return (
    <div className="bg-white rounded-xl p-8 border border-gray-200 mt-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        <h3 className="font-bold text-gray-900 uppercase text-[13px] tracking-widest">TEKS YANG DIANALISIS</h3>
      </div>
      <div className="text-gray-700 leading-relaxed text-[15px] bg-slate-50 rounded-xl p-6 border border-gray-100 whitespace-pre-wrap font-serif">
        {highlightText(displayText, suspiciousWords)}
      </div>
      {isLong && (
        <div className="mt-4 flex justify-center border-t border-gray-100 pt-4">
          <button
            onClick={() => setShowFull(!showFull)}
            className="text-xs font-bold text-gray-900 tracking-widest uppercase hover:text-gray-600 transition-colors"
          >
            {showFull ? 'Tampilkan Lebih Sedikit' : 'Tampilkan Teks Lengkap'}
          </button>
        </div>
      )}
    </div>
  );
};

const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [categoriesData, setCategoriesData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [resultRes, catRes] = await Promise.all([
          api.get(`/api/checks/${id}`),
          api.get('/api/categories').catch(() => ({ data: [] }))
        ]);
        
        setResult(resultRes.data);
        setCategoriesData(catRes.data);
      } catch (err) {
        setError(err.response?.status === 404 ? 'Data tidak ditemukan' : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10 animate-pulse">
        <div className="h-4 w-48 bg-gray-200 rounded mb-8" />
        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
          <div className="h-10 w-64 bg-gray-200 rounded-full mb-6" />
          <div className="h-6 w-full bg-gray-200 rounded mb-3" />
          <div className="h-4 w-3/4 bg-gray-200 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 h-64 bg-gray-50" />
          <div className="bg-white rounded-xl p-6 border border-gray-200 h-64 bg-gray-50" />
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Hasil Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">Data analisis ini tidak tersedia atau mungkin sudah dihapus dari sistem kami.</p>
        <button onClick={() => navigate('/')} className="bg-[#1E293B] text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  const category = getCategory(result.confidence);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 pb-20">
      
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 tracking-wider uppercase mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Kembali ke Dashboard
      </button>

      {/* SECTION A: Hero Result Card */}
      <div className={`bg-white rounded-xl p-8 border border-gray-200 shadow-sm border-l-[6px] ${category.borderClass} relative overflow-hidden`}>
        <div className={`absolute top-0 right-0 bottom-0 w-1/3 opacity-20 bg-gradient-to-l from-current to-transparent pointer-events-none ${category.colorClass}`}></div>
        
        <div className="relative z-10">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm mb-6 ${category.badgeClass}`}>
            <span>{category.emoji}</span>
            <span className="tracking-wide uppercase">{category.label}</span>
          </div>

          <p className="text-gray-700 text-lg leading-relaxed max-w-2xl font-medium">
            {category.description}
          </p>

          <ConfidenceBar value={result.confidence * 100} colorClass={category.bgClass} />

          <div className="mt-6 flex items-center gap-2 text-xs text-gray-400 font-semibold tracking-wider uppercase">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Dianalisis: {formatDate(result.createdAt)}
          </div>
        </div>
      </div>

      {/* SECTION B: Detail Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        
        {/* Left: Word Attention Analysis */}
        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm h-full flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            <h3 className="font-bold text-gray-900 uppercase text-[13px] tracking-widest">VISUALISASI DATA HOAKS</h3>
          </div>
          
          <div className="flex-1">
            {result.wordScores && Object.keys(result.wordScores).length > 0 ? (
              <>
                <p className="text-[11px] text-gray-500 mb-6 uppercase tracking-wider font-semibold">Tingkat Pengaruh Kata Terhadap Prediksi AI</p>
                <WordAttentionChart wordScores={result.wordScores} />
                <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm flex items-start gap-3 mt-4">
                   <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                   <p>Grafik ini menunjukkan kata-kata yang paling memengaruhi model AI dalam menentukan apakah berita ini hoaks atau valid.</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <p className="text-gray-600 text-sm font-medium">Data visualisasi kata tidak tersedia untuk artikel ini.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Right: Category Distribution */}
        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm h-full flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
            <h3 className="font-bold text-gray-900 uppercase text-[13px] tracking-widest">DISTRIBUSI KATEGORI</h3>
          </div>
          <p className="text-[13px] text-gray-500 mb-6">Berdasarkan semua analisis di platform</p>
          
          <div className={`rounded-lg p-4 mb-4 border flex items-center gap-3 ${category.bgLightClass} ${category.borderClass} border-opacity-30`}>
            <span className="text-xl">{category.emoji}</span>
            <p className="text-sm text-gray-800">
              Hasil kamu masuk kategori <strong className="font-bold">{category.label}</strong>
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-[220px]">
            {categoriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={categoriesData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="count" nameKey="name" stroke="none">
                    {categoriesData.map((entry) => (
                      <Cell key={entry.name} fill={COLORS[entry.name] || '#94A3B8'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize: 12}} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
               <p className="text-sm text-gray-400">Data distribusi tidak tersedia</p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION C: Article Text Card */}
      <ArticleTextCard text={result.text} suspiciousWords={result.suspiciousWords} />

      {/* SECTION D: Recommendation Card */}
      <div className="bg-[#1E293B] text-white rounded-xl p-8 mt-6 shadow-md relative overflow-hidden">
        {/* Abstract background shape */}
        <svg className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 w-64 h-64 text-white opacity-5" fill="currentColor" viewBox="0 0 100 100"><path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 80c-16.5 0-30-13.5-30-30s13.5-30 30-30 30 13.5 30 30-13.5 30-30 30z"/></svg>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xl">💡</div>
            <h3 className="font-bold uppercase text-[15px] tracking-widest">APA YANG HARUS DILAKUKAN?</h3>
          </div>
          
          <p className="text-[17px] font-medium mb-8 leading-relaxed">
            {category.recommendation}
          </p>

          <div className="bg-white/10 rounded-lg p-5 border border-white/10 mb-6">
            <p className="font-semibold text-sm mb-3 tracking-wide uppercase">🔗 Verifikasi ke sumber terpercaya:</p>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#00B4D8]"></div> Cek Fakta Kompas → <a href="https://cekfakta.kompas.com" target="_blank" rel="noreferrer" className="text-white hover:text-[#00B4D8] underline decoration-white/30 underline-offset-4">cekfakta.kompas.com</a></li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#00B4D8]"></div> Tempo Cek Fakta → <a href="https://cekfakta.tempo.co" target="_blank" rel="noreferrer" className="text-white hover:text-[#00B4D8] underline decoration-white/30 underline-offset-4">cekfakta.tempo.co</a></li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#00B4D8]"></div> Mafindo → <a href="https://mafindo.or.id" target="_blank" rel="noreferrer" className="text-white hover:text-[#00B4D8] underline decoration-white/30 underline-offset-4">mafindo.or.id</a></li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#00B4D8]"></div> Kominfo → <a href="https://s.id/aduankonten" target="_blank" rel="noreferrer" className="text-white hover:text-[#00B4D8] underline decoration-white/30 underline-offset-4">s.id/aduankonten</a></li>
            </ul>
          </div>

          <div className="flex gap-3 text-slate-400 text-xs leading-relaxed border-t border-white/10 pt-5">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <p>
              Disclaimer: Hasil ini adalah prediksi komputasi model AI FakeShield dan tidak menjamin keakuratan 100%. 
              Gunakan hasil ini sebagai referensi awal, dan selalu lakukan verifikasi secara mandiri.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION E: CTA */}
      <div className="mt-16 flex flex-col items-center justify-center border-t border-gray-200 pt-10">
        <h4 className="text-lg font-bold text-gray-900 mb-6">Ingin cek berita lainnya?</h4>
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={() => navigate('/')} className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
             Cek Artikel Lain
          </button>
          {isAuthenticated && (
            <Link to="/history" className="bg-[#1E293B] text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm flex items-center justify-center gap-2">
              Lihat History Saya
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </Link>
          )}
        </div>
      </div>

    </div>
  );
};

export default ResultPage;