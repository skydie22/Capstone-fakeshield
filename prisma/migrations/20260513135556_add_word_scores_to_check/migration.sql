/*
  Warnings:

  - Added the required column `wordScores` to the `Check` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Check" ADD COLUMN     "wordScores" JSONB NOT NULL;
