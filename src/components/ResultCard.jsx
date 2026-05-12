import { getCategory } from '../utils/helpers';

const ConfidenceBar = ({ value, colorClass }) => (
  <div className="mt-4">
    <div className="flex justify-between items-center mb-1.5">
      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Keyakinan AI</span>
      <span className="text-sm font-black text-gray-900">{Math.round(value)}%</span>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200/50">
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const ResultCard = ({ result, onBack }) => {
  const category = getCategory(result.confidence);

  return (
    <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 flex-1 flex flex-col">
        {/* Header Result */}
        <div className="flex items-center justify-between mb-8">
            <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-lg font-black text-xs tracking-widest uppercase border-2 ${category.borderClass} ${category.bgLightClass} ${category.textClass}`}>
                <span className="text-lg">{category.emoji}</span>
                {category.label}
            </div>
            <button 
                onClick={onBack}
                className="text-[10px] font-black text-gray-400 hover:text-gray-900 uppercase tracking-[0.2em] transition-colors flex items-center gap-2 group"
            >
                <svg className="w-3.5 h-3.5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Kembali ke Grafik
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
                <div>
                    <h3 className="text-2xl font-black text-gray-900 leading-tight mb-4">
                        Hasil Analisis Terbaru
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-[15px]">
                        {category.description}
                    </p>
                </div>

                <ConfidenceBar value={result.confidence * 100} colorClass={category.bgClass} />
                
                <div className="pt-4 border-t border-gray-100">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Kata Kunci Mencurigakan:</p>
                    <div className="flex flex-wrap gap-2">
                        {result.suspiciousWords && result.suspiciousWords.length > 0 ? (
                            result.suspiciousWords.slice(0, 5).map((word, i) => (
                                <span key={i} className="px-3 py-1 bg-gray-50 border border-gray-200 text-gray-700 text-[11px] font-bold rounded uppercase tracking-wider">
                                    {word}
                                </span>
                            ))
                        ) : (
                            <span className="text-xs text-gray-400 italic font-medium">Tidak ada kata mencurigakan terdeteksi</span>
                        )}
                        {result.suspiciousWords?.length > 5 && (
                            <span className="text-[10px] font-bold text-gray-400 self-center">+{result.suspiciousWords.length - 5}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-gray-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <svg className="w-24 h-24 text-gray-900" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.994 7.994 0 0111 5c4.418 0 8 3.582 8 8a7.994 7.994 0 01-1.022 3.886l1.246 1.246a1 1 0 11-1.414 1.414l-1.246-1.246A7.994 7.994 0 0113 19c-4.418 0-8-3.582-8-8 0-.066.002-.132.006-.196L3.196 9.006A7.994 7.994 0 013 11c0 4.418 3.582 8 8 8.196l1.246 1.246a1 1 0 11-1.414 1.414l-1.246-1.246A7.994 7.994 0 0111 21c-4.418 0-8-3.582-8-8 0-.066.002-.132.006-.196L1.196 11.006A7.994 7.994 0 011 11c0-4.418 3.582-8 8-8a7.994 7.994 0 012.196.304l1.246-1.246a1 1 0 11 1.414 1.414L12.804 4.196A7.994 7.994 0 0111 4c-.418 0-.825.032-1.222.094L8.532 2.85a1 1 0 111.414-1.414l1.246 1.246A7.994 7.994 0 0111 1c4.418 0 8 3.582 8 8 0 .066-.002.132-.006.196l1.81 1.81A7.994 7.994 0 0121 11c0 4.418-3.582 8-8 8a7.994 7.994 0 01-2.196-.304l-1.246 1.246a1 1 0 11-1.414-1.414l1.246-1.246A7.994 7.994 0 0111 18c-.418 0-.825-.032-1.222-.094L7.968 19.15a1 1 0 11-1.414-1.414l1.246-1.246A7.994 7.994 0 019 17c-4.418 0-8-3.582-8-8 0-.066.002-.132.006-.196L.196 7.006A7.994 7.994 0 010 7c0-4.418 3.582-8 8-8a7.994 7.994 0 012.196.304l1.246-1.246a1 1 0 11 1.414 1.414L11.804 1.196z"></path></svg>
                </div>
                <div className="relative z-10 h-full flex flex-col">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Potongan Teks:</p>
                    <p className="text-gray-800 font-serif italic text-sm leading-relaxed line-clamp-6">
                        "{result.text}"
                    </p>
                    <div className="mt-auto pt-6 flex justify-center">
                        <button 
                            onClick={() => window.location.href = `/result/${result.id}`}
                            className="bg-white border border-gray-200 text-gray-900 px-5 py-2.5 rounded-lg font-bold text-[11px] uppercase tracking-widest hover:shadow-md hover:border-gray-300 transition-all flex items-center gap-2"
                        >
                            Lihat Detail Lengkap
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">AI Prediction Analysis Completed</span>
      </div>
    </div>
  );
};

export default ResultCard;
