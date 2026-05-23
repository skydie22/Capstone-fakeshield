import * as newsService from '../services/news.service.js';

const getNews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize) || 10, 20);

    const result = await newsService.getNews({ page, pageSize });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export { getNews };