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

// Konversi confidence score ke kategori
export const getCategory = (confidence) => {
  if (confidence >= 0.90) {
    return {
      label: 'Sangat Terindikasi Hoaks',
      emoji: '🔴',
      description: 'Artikel ini memiliki karakteristik hoaks yang sangat kuat berdasarkan analisis AI.',
      colorClass: 'text-red-600',
      textClass: 'text-red-600',
      bgClass: 'bg-red-600',
      bgLightClass: 'bg-red-50',
      borderClass: 'border-red-600',
      badgeClass: 'bg-red-100 text-red-800',
      recommendation: 'Sangat disarankan untuk TIDAK menyebarkan konten ini. Laporkan ke Kominfo atau Mafindo.',
    };
  } else if (confidence >= 0.70) {
    return {
      label: 'Terindikasi Hoaks',
      emoji: '🟠',
      description: 'Artikel ini memiliki beberapa indikasi hoaks yang perlu diwaspadai.',
      colorClass: 'text-orange-600',
      textClass: 'text-orange-600',
      bgClass: 'bg-orange-600',
      bgLightClass: 'bg-orange-50',
      borderClass: 'border-orange-500',
      badgeClass: 'bg-orange-100 text-orange-800',
      recommendation: 'Verifikasi ke sumber terpercaya sebelum menyebarkan konten ini.',
    };
  } else if (confidence >= 0.50) {
    return {
      label: 'Perlu Verifikasi',
      emoji: '🟡',
      description: 'Artikel ini memiliki beberapa elemen yang meragukan dan perlu dicek lebih lanjut.',
      colorClass: 'text-yellow-600',
      textClass: 'text-yellow-600',
      bgClass: 'bg-yellow-500',
      bgLightClass: 'bg-yellow-50',
      borderClass: 'border-yellow-500',
      badgeClass: 'bg-yellow-100 text-yellow-800',
      recommendation: 'Periksa ke situs fact-checker seperti Cek Fakta Kompas atau Tempo Cek Fakta.',
    };
  } else {
    return {
      label: 'Kemungkinan Valid',
      emoji: '🟢',
      description: 'Artikel ini tampak tidak mengandung karakteristik hoaks yang signifikan.',
      colorClass: 'text-green-600',
      textClass: 'text-green-600',
      bgClass: 'bg-green-600',
      bgLightClass: 'bg-green-50',
      borderClass: 'border-green-500',
      badgeClass: 'bg-green-100 text-green-800',
      recommendation: 'Tetap bijak dalam berbagi informasi. Selalu cek sumber sebelum menyebarkan.',
    };
  }
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
