import prisma from '../config/prisma.js';

const getStats = async () => {
  const [totalChecks, totalHoax, totalValid] = await Promise.all([
    prisma.check.count(),
    prisma.check.count({
      where: {
        label: { equals: 'HOAKS', mode: 'insensitive' },
        // label: { equals: 'VALID', mode: 'insensitive' },
      },
    }),
    prisma.check.count({
      where: {
        label: { equals: 'VALID', mode: 'insensitive' },
      },
    }),
  ]);

  return {
    totalChecks,
    totalValid,
    totalHoax,
    accuracy: null,
    accuracyStatus: 'placeholder',
    accuracyMessage: 'Akurasi model belum dihitung dari data evaluasi terverifikasi',
  };
};

export { getStats };