import { useState } from 'react';

const ArticleTextCard = ({ text, suspiciousWords }) => {
  const [showFull, setShowFull] = useState(false);
  const isLong = text && text.length > 500;
  const displayText = isLong && !showFull ? text.slice(0, 500) + '...' : text;

  const highlightText = (txt, words) => {
    if (!words || words.length === 0 || !txt) return txt;
    
    const sortedWords = [...words].sort((a, b) => b.length - a.length);
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

export default ArticleTextCard;
