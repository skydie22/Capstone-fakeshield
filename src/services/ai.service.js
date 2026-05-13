// src/services/ai.service.js
import axios from 'axios';

const aiClient = axios.create({
  baseURL: process.env.AI_ENGINE_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

const checkHealth = async () => {
  const { data } = await aiClient.get('/health');
  return data;
};

/**
 * @param {string} text - Text to predict
 * @returns {Promise<{
 *   label: string,
 *   confidence: number,
 *   confidence_raw: number,
 *   confidence_level: string,
 *   confidence_color: string,
 *   top_suspicious_words: Array<{word: string, attention_score: number}>,
 *   attention_per_word: Record<string, number>
 * }>}
 */
const predict = async (text) => {
  try {
    const { data } = await aiClient.post('/predict', { text });
    return data;
  } catch (error) {
    if (error.response) {
      const err = new Error(
        `AI Engine error: ${error.response.data?.detail || error.response.statusText}`
      );
      err.statusCode = error.response.status;
      throw err;
    }
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      const err = new Error('AI Engine is unreachable. Please try again later.');
      err.statusCode = 503;
      throw err;
    }
    throw error;
  }
};

export { checkHealth, predict };
