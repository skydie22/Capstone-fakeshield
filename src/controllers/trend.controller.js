import * as trendService from '../services/trend.service.js';

const getTrends = async (req, res, next) => {
  try {
    const result = await trendService.getTrends();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export { getTrends };