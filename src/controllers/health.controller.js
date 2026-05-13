// src/controllers/health.controller.js
import * as aiService from '../services/ai.service.js';

const health = async (req, res, next) => {
  try {
    const aiStatus = await aiService.checkHealth();
    res.status(200).json({
      success: true,
      status: 'ok',
      service: 'express-ai-proxy',
      aiEngine: aiStatus,
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      status: 'ok',
      service: 'express-ai-proxy',
      aiEngine: 'unavailable',
    });
  }
};

export { health };
