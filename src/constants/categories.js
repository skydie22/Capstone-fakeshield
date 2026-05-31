export const COLORS = {
  danger: '#DC2626',   // Red-600
  success: '#16A34A',  // Green-600
  neutral: '#1E293B',  // Slate-800
};

export const CATEGORIES = {
  HOAKS: {
    label: 'Hoaks',
    emoji: '🔴',
    description: 'Artikel ini terindikasi hoaks berdasarkan analisis AI.',
    colorClass: 'text-red-600',
    bgClass: 'bg-red-600',
    bgLightClass: 'bg-red-50',
    borderClass: 'border-red-600',
    badgeClass: 'bg-red-100 text-red-800',
    recommendation: 'Sangat disarankan untuk TIDAK menyebarkan konten ini. Verifikasi ulang ke sumber terpercaya.',
    hex: COLORS.danger
  },
  VALID: {
    label: 'Valid',
    emoji: '🟢',
    description: 'Artikel ini tampak tidak mengandung karakteristik hoaks yang signifikan.',
    colorClass: 'text-green-600',
    bgClass: 'bg-green-600',
    bgLightClass: 'bg-green-50',
    borderClass: 'border-green-500',
    badgeClass: 'bg-green-100 text-green-800',
    recommendation: 'Tetap bijak dalam berbagi informasi. Selalu cek sumber sebelum menyebarkan.',
    hex: COLORS.success
  }
};
