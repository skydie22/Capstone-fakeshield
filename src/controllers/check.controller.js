// src/controllers/check.controller.js
import * as checkService from '../services/check.service.js';

const runCheck = async (req, res, next) => {
  try {
    const { text } = req.body;
    const userId = req.user.id;

    const result = await checkService.runCheck({ userId, text });

    res.status(201).json({
      success: true,
      message: 'Check completed.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const result = await checkService.getHistory({ page, limit });

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

// const getHistory = async (req, res, next) => {
//   try {
//     const userId = req.user.id;
//     const page = parseInt(req.query.page) || 1;
//     const limit = Math.min(parseInt(req.query.limit) || 10, 50);

//     const result = await checkService.getUserHistory(userId, { page, limit });

//     res.status(200).json({
//       success: true,
//       ...result,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

const getCheckById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await checkService.getCheckById(userId, id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export { runCheck, getHistory, getCheckById };
