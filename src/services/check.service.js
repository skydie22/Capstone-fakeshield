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

  let check = await prisma.check.findUnique({ where: { contentHash } });

  if (!check) {
    const prediction = await aiService.predict(text);

    // langsung pakai dari FastAPI, tidak perlu reverse lagi
    const normalizedLabel = prediction.label === 'bukan_hoaks' ? 'valid' : 'hoaks';
    const normalizedConfidence = prediction.confidence;

    // hapus semua blok if/else rawLabel di sini

    check = await prisma.check.create({
      data: {
        contentHash,
        text,
        label: normalizedLabel,
        confidence: normalizedConfidence,
        confidenceLevel: prediction.confidence_level,
        suspiciousWords: prediction.top_suspicious_words,
        wordScores: prediction.attention_per_word,
        ...(userId && { userId }),
      },
    });
  }

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
