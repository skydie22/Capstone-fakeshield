import prisma from '../config/prisma.js';

const getTrends = async () => {
  const checks = await prisma.check.findMany({
    select: {
      label: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // Group by tanggal
  const grouped = {};

  for (const check of checks) {
    const date = check.createdAt.toISOString().split('T')[0]; // "2026-05-06"

    if (!grouped[date]) {
      grouped[date] = { date, hoaxCount: 0, validCount: 0 };
    }

    // Sesuaikan kondisi dengan label yang dikembalikan FastAPI
    if (check.label.toLowerCase() === 'hoaks') {
      grouped[date].hoaxCount += 1;
    } else {
      grouped[date].validCount += 1;
    }
  }

  return Object.values(grouped);
};

export { getTrends };