import * as statService from '../services/stat.service.js';

const getStats = async (req, res, next) => {
  try {
    const result = await statService.getStats();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export { getStats };