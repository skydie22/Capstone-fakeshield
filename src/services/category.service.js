import prisma from '../config/prisma.js';

const getCategories = async () => {
  const grouped = await prisma.check.groupBy({
    by: ['confidenceLevel'],
    _count: { confidenceLevel: true },
    orderBy: { _count: { confidenceLevel: 'desc' } },
  });

  return grouped.map((item) => ({
    name: item.confidenceLevel,
    count: item._count.confidenceLevel,
  }));
};

export { getCategories };