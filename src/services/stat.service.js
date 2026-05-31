import prisma from '../config/prisma.js';

const getStats = async () => {
  const [totalChecks, totalHoax, totalValid, avgConfidence] = await Promise.all([
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
    prisma.check.aggregate({
      _avg : {confidence: true},
    }),
  ]);


  const accuracy = avgConfidence._avg.confidence ? parseFloat((avgConfidence._avg.confidence * 100).toFixed(1)): null;

  return {
    totalChecks,
    totalValid,
    totalHoax,
    accuracy,
    accuracyStatus:  totalChecks > 0 ? 'estimated' : 'placeholder',
    accuracyMessage: 'Estimasi berdasarkan rata-rata confidence model',

  };
};

export { getStats };