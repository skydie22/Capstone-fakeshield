import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api/axios';
import { getCategory, formatDate, normalizeCheckResult } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';

// Production Modular Components
import { CATEGORIES, COLORS as APP_COLORS } from '../constants/categories';
import ConfidenceBar from '../components/ConfidenceBar';
import WordAttentionChart from '../components/WordAttentionChart';
import ArticleTextCard from '../components/ArticleTextCard';

const PIE_COLORS = {
  'Sangat Terindikasi Hoaks': APP_COLORS.danger,
  'Terindikasi Hoaks': APP_COLORS.warning,
  'Perlu Verifikasi': APP_COLORS.caution,
  'Kemungkinan Valid': APP_COLORS.success,
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

const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/api/checks/${id}`);
        const rawResult = response.data?.data || response.data;
        setResult(normalizeCheckResult(rawResult));
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
    // ... skeleton code tetap sama ...
    return (
      <div className="max-w-4xl mx-auto px-6 py-10 animate-pulse">
        <div className="h-4 w-48 bg-gray-200 rounded mb-8" />
        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
          <div className="h-10 w-64 bg-gray-200 rounded-full mb-6" />
          <div className="h-6 w-full bg-gray-200 rounded mb-3" />
          <div className="h-4 w-3/4 bg-gray-200 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 h-64" />
          <div className="bg-white rounded-xl p-6 border border-gray-200 h-64" />
        </div>
      </div>
    );
  }

  if (error || !result) {
    // ... error code tetap sama ...
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

  const category = getCategory(result.confidence, result.label, result.confidenceLevel);
  
  // Data Donut per ID: Membandingkan Keyakinan vs Sisa (Probability Distribution)
  const isHoaks = result.label?.toLowerCase() === 'hoaks';
  const confidenceData = [
    { 
      name: isHoaks ? 'Indikasi Hoaks' : 'Indikasi Valid', 
      value: Math.round(result.confidence * 100),
      fill: category.hex || (isHoaks ? APP_COLORS.danger : APP_COLORS.success)
    },
    { 
      name: isHoaks ? 'Indikasi Valid' : 'Indikasi Hoaks', 
      value: Math.round((1 - result.confidence) * 100),
      fill: isHoaks ? '#DCFCE7' : '#FEE2E2' // Warna kontras yang lembut
    }
  ];

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
            <h3 className="font-bold text-gray-900 uppercase text-[13px] tracking-widest">VISUALISASI DATA {isHoaks ? 'HOAKS' : 'VALID'}</h3>
          </div>
          
          <div className="flex-1">
            {result.wordScores && Object.keys(result.wordScores).length > 0 ? (
              <>
                <p className="text-[11px] text-gray-500 mb-6 uppercase tracking-wider font-semibold">Tingkat Pengaruh Kata Terhadap Prediksi AI</p>
                <WordAttentionChart wordScores={result.wordScores} variant={isHoaks ? 'hoaks' : 'valid'} />
                <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm flex items-start gap-3 mt-4">
                   <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                   <p>Grafik ini menunjukkan kata-kata yang paling memengaruhi model AI dalam menentukan apakah berita ini {isHoaks ? 'hoaks' : 'valid'}.</p>
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
        
        {/* Right: Confidence Composition */}
        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm h-full flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
            <h3 className="font-bold text-gray-900 uppercase text-[13px] tracking-widest">KOMPOSISI ANALISIS</h3>
          </div>
          <p className="text-[13px] text-gray-500 mb-6">Distribusi keyakinan model untuk artikel ini</p>
          
          <div className={`rounded-lg p-4 mb-4 border flex items-center gap-3 ${category.bgLightClass} ${category.borderClass} border-opacity-30`}>
            <span className="text-xl">{category.emoji}</span>
            <p className="text-sm text-gray-800">
              Hasil utama: <strong className="font-bold">{category.label}</strong>
            </p>
          </div>

          <div className="flex-1 relative flex items-center justify-center min-h-[220px]">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie 
                  data={confidenceData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={65} 
                  outerRadius={85} 
                  paddingAngle={8}
                  dataKey="value" 
                  nameKey="name" 
                  stroke="none"
                >
                  {confidenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-md">
                          <p className="font-bold text-xs text-gray-900 uppercase tracking-widest">{payload[0].name}</p>
                          <p className="text-gray-600 text-[11px] mt-1 font-bold">{payload[0].value}% Keyakinan</p>
                        </div>
                      );
                    }
                    return null;
                  }} 
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize: 10, paddingTop: 15}} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Label Tengah Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <span className="text-[22px] font-black text-gray-900 leading-none">
                {Math.round(result.confidence * 100)}%
              </span>
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Confidence</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION C: Article Text Card */}
      <ArticleTextCard text={result.text} suspiciousWords={result.suspiciousWords} />

      {/* SECTION D: Recommendation Card */}
      <div className="bg-[#1E293B] text-white rounded-xl p-8 mt-6 shadow-md relative overflow-hidden">
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
          <button 
            onClick={() => navigate('/#check-section')} 
            className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
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
