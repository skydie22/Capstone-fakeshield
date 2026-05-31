// Format tanggal: "28 Apr 2026, 10:30"
export const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).replace('.', ':');
};

// Potong teks panjang
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

import { CATEGORIES } from '../constants/categories';

// Konversi confidence score ke kategori sesuai normalisasi backend
export const getCategory = (confidence, label, confidenceLevel = null) => {
  // Jika ada confidenceLevel dari backend, gunakan itu
  if (confidenceLevel) {
    const found = Object.values(CATEGORIES).find(c => c.label.toLowerCase() === confidenceLevel.toLowerCase());
    if (found) return found;
  }

  const normalizedLabel = label ? label.toLowerCase() : '';
  
  // Jika label adalah 'bukan_hoaks' atau 'valid'
  if (normalizedLabel === 'valid' || normalizedLabel === 'bukan_hoaks') {
    return CATEGORIES.VALID;
  }
  
  // Default adalah HOAKS
  return CATEGORIES.HOAKS;
};

// Format angka: 10234 -> "10.234"
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '';
  return new Intl.NumberFormat('id-ID').format(num);
};

// Hitung berapa lama yang lalu
export const timeAgo = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " tahun lalu";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " bulan lalu";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " hari lalu";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " jam lalu";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " menit lalu";
  return Math.floor(seconds) + " detik lalu";
};

/**
 * Normalisasi hasil check dari API agar kompatibel dengan komponen frontend
 */
export const normalizeCheckResult = (result) => {
  if (!result) return null;

  const normalized = { 
    ...result,
    // Petakan field snake_case (FastAPI) ke camelCase (Backend/Frontend)
    id: result.id || result._id,
    label: result.label || (result.confidence_raw >= 0.5 ? 'hoaks' : 'bukan_hoaks'),
    confidence: typeof result.confidence === 'number' ? result.confidence : (result.confidence_raw || 0),
    confidenceLevel: result.confidenceLevel || result.confidence_level || (result.label === 'hoaks' ? 'Hoaks' : 'Valid'),
    wordScores: result.wordScores || result.attention_per_word || {}
  };

  // Handle suspiciousWords jika dalam format array of objects [{word, attention_score}]
  const rawSuspicious = result.suspiciousWords || result.top_suspicious_words || [];
  if (Array.isArray(rawSuspicious) && rawSuspicious.length > 0) {
    if (typeof rawSuspicious[0] === 'object' && rawSuspicious[0] !== null) {
      // 1. Jika wordScores belum ada, buat dari suspiciousWords
      if (Object.keys(normalized.wordScores).length === 0) {
        normalized.wordScores = rawSuspicious.reduce((acc, curr) => {
          if (curr.word) {
            acc[curr.word] = curr.attention_score || 0;
          }
          return acc;
        }, {});
      }

      // 2. Ubah suspiciousWords menjadi array of strings untuk tag list dan highlighter
      normalized.suspiciousWords = rawSuspicious.map(sw => sw.word).filter(Boolean);
    } else {
      normalized.suspiciousWords = rawSuspicious;
    }
  }

  // Pastikan properti dasar ada untuk menghindari error rendering
  if (!normalized.text) normalized.text = "";
  if (!normalized.wordScores) normalized.wordScores = {};
  if (!Array.isArray(normalized.suspiciousWords)) normalized.suspiciousWords = [];
  
  return normalized;
};
