-- DropForeignKey
ALTER TABLE "account" DROP CONSTRAINT "account_userId_fkey";

-- DropForeignKey
ALTER TABLE "session" DROP CONSTRAINT "session_userId_fkey";

-- AlterTable
ALTER TABLE "household" DROP COLUMN "photoKey",
ADD COLUMN     "photoPublicId" VARCHAR(255),
ADD COLUMN     "photoVersion" INTEGER;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "emailVerified",
DROP COLUMN "image",
ADD COLUMN     "imageUrl" TEXT,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(120);

-- DropTable
DROP TABLE "account";

-- DropTable
DROP TABLE "session";

-- DropTable
DROP TABLE "verification";

