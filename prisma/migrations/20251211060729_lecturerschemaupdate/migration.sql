/*
  Warnings:

  - Added the required column `firstName` to the `Lecturer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Lecturer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lecturer" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "middleName" TEXT,
ADD COLUMN     "phone" TEXT;
