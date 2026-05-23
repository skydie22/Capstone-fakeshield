// src/services/check.service.js
import crypto from 'crypto';
import prisma from '../config/prisma.js';
import * as aiService from './ai.service.js';

/**
 * Hash text content to detect duplicates
 */
const hashContent = (text) => {
  return crypto.createHash('sha256').update(text.trim()).digest('hex');
};

/**
 * Core: run a check on given text
 * - If same content was checked before, reuse the cached result
 * - Save to UserHistory regardless
 */
const runCheck = async ({ userId = null, text }) => {
  const contentHash = hashContent(text);

  // 1. Check for existing result (cache by content hash)
  let check = await prisma.check.findUnique({ where: { contentHash } });

  if (!check) {
    // 2. Call FastAPI /predict
    const prediction = await aiService.predict(text);

    // Normalize label dan confidence
    const rawLabel = prediction.label;
    const rawConfidence = prediction.confidence;

    let normalizedLabel;
    let normalizedConfidence;

    if (rawLabel === 'bukan_hoaks') {
      // reverse: confidence 0.0102 → 1 - 0.0102 = 0.9898 (valid)
      normalizedConfidence = parseFloat((1 - rawConfidence).toFixed(4));
      normalizedLabel = normalizedConfidence <= 0.49 ? 'hoaks' : 'valid';
    } else {
      // hoaks: confidence tetap
      normalizedConfidence = rawConfidence;
      normalizedLabel = 'hoaks';
    }

    // 3. Save new Check result
    check = await prisma.check.create({
      data: {
        contentHash,
        text,
        label: normalizedLabel,
        confidence: normalizedConfidence,
        confidenceLevel: prediction.confidence_level,
        suspiciousWords: prediction.top_suspicious_words,
        wordScores: prediction.attention_per_word,
        userId, // Associate with user for history (optional, can be null if we want global cache)
      },
    });
  }

  // 4. Record in UserHistory
  // await prisma.userHistory.create({
  //   data: { userId, checkId: check.id },
  // });

  return formatCheck(check);
};


/**
 * Get all history for a user
 */

const getHistory = async (userId,{ page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;

  const [total, checks] = await Promise.all([
    prisma.check.count({
      where: { userId },
    }),
    prisma.check.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    data: checks.map(formatCheck),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// const getUserHistory = async (userId, { page = 1, limit = 10 } = {}) => {
//   const skip = (page - 1) * limit;

//   const [total, histories] = await Promise.all([
//     prisma.userHistory.count({ where: { userId } }),
//     prisma.userHistory.findMany({
//       where: { userId },
//       skip,
//       take: limit,
//       orderBy: { createdAt: 'desc' },
//       include: {
//         check: {
//           select: {
//             id: true,
//             label: true,
//             confidence: true,
//             suspiciousWords: true,
//             createdAt: true,
//           },
//         },
//       },
//     }),
//   ]);

//   return {
//     data: histories.map((h) => ({
//       historyId: h.id,
//       checkedAt: h.createdAt,
//       ...formatCheck(h.check),
//     })),
//     meta: {
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     },
//   };
// };

/**
 * Get single check by ID (only if in user's history)
 */
const getCheckById = async (userId, checkId) => {
  const check = await prisma.check.findUnique({
    where: { id: checkId },
  });

  if (!check) {
    const error = new Error('Check not found.');
    error.statusCode = 404;
    throw error;
  }

  // owner-only validation
  if (check.userId !== userId) {
    const error = new Error('Access denied.');
    error.statusCode = 403;
    throw error;
  }

  return {
    id: check.id,
    text: check.text,
    label: check.label,
    confidence: check.confidence,
    confidenceLevel: check.confidenceLevel,
    suspiciousWords: check.suspiciousWords,
    wordScores: check.wordScores,
    createdAt: check.createdAt,
  };
};

const formatCheck = (check) => ({
  id: check.id,
  text: check.text,
  label: check.label,
  confidence: check.confidence,
  suspiciousWords: check.suspiciousWords,
  wordScores: check.wordScores,
  confidenceLevel: check.confidenceLevel,
  createdAt: check.createdAt,
});

export { runCheck, getHistory, getCheckById };
