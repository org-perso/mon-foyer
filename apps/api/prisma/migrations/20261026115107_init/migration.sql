-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('EXPENSE', 'INCOME');

-- CreateEnum
CREATE TYPE "TransactionScope" AS ENUM ('PERSONAL', 'HOUSEHOLD');

-- CreateEnum
CREATE TYPE "HouseholdRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "defaultCurrency" CHAR(3) NOT NULL DEFAULT 'MGA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "household" (
    "id" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "photoKey" VARCHAR(255),
    "currency" CHAR(3) NOT NULL DEFAULT 'MGA',
    "timezone" VARCHAR(64) NOT NULL DEFAULT 'Indian/Antananarivo',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "household_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "household_member" (
    "id" UUID NOT NULL,
    "householdId" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "HouseholdRole" NOT NULL DEFAULT 'MEMBER',
    "displayName" VARCHAR(80),
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "household_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation" (
    "id" UUID NOT NULL,
    "householdId" UUID NOT NULL,
    "invitedById" TEXT,
    "email" TEXT,
    "role" "HouseholdRole" NOT NULL DEFAULT 'MEMBER',
    "tokenHash" CHAR(64) NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedById" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" UUID NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "icon" VARCHAR(40),
    "color" VARCHAR(9),
    "householdId" UUID,
    "ownerId" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" UUID NOT NULL,
    "type" "TransactionType" NOT NULL,
    "scope" "TransactionScope" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "occurredOn" DATE NOT NULL,
    "authorId" TEXT NOT NULL,
    "ownerId" TEXT,
    "householdId" UUID,
    "memberId" UUID,
    "categoryId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE INDEX "household_member_userId_idx" ON "household_member"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "household_member_householdId_userId_key" ON "household_member"("householdId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "invitation_tokenHash_key" ON "invitation"("tokenHash");

-- CreateIndex
CREATE INDEX "invitation_householdId_status_idx" ON "invitation"("householdId", "status");

-- CreateIndex
CREATE INDEX "category_householdId_type_idx" ON "category"("householdId", "type");

-- CreateIndex
CREATE INDEX "category_ownerId_type_idx" ON "category"("ownerId", "type");

-- CreateIndex
CREATE INDEX "transaction_householdId_occurredOn_idx" ON "transaction"("householdId", "occurredOn");

-- CreateIndex
CREATE INDEX "transaction_ownerId_occurredOn_idx" ON "transaction"("ownerId", "occurredOn");

-- CreateIndex
CREATE INDEX "transaction_memberId_idx" ON "transaction"("memberId");

-- CreateIndex
CREATE INDEX "transaction_categoryId_idx" ON "transaction"("categoryId");

-- CreateIndex
CREATE INDEX "transaction_authorId_idx" ON "transaction"("authorId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "household" ADD CONSTRAINT "household_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "household_member" ADD CONSTRAINT "household_member_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "household_member" ADD CONSTRAINT "household_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "household_member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ───────── Contraintes métier (non exprimables dans le schéma Prisma) ─────────

-- Une transaction personnelle n'est rattachée à aucun foyer ; une transaction
-- commune est rattachée à un foyer et n'a pas de propriétaire individuel.
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_scope_consistency_check" CHECK (
  ("scope" = 'PERSONAL'  AND "ownerId" IS NOT NULL AND "householdId" IS NULL AND "memberId" IS NULL)
  OR
  ("scope" = 'HOUSEHOLD' AND "householdId" IS NOT NULL AND "ownerId" IS NULL)
);

-- Les montants sont strictement positifs ; le sens est porté par "type".
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_amount_positive_check" CHECK ("amount" > 0);

-- Code devise ISO 4217 en majuscules.
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_currency_format_check" CHECK ("currency" ~ '^[A-Z]{3}$');
ALTER TABLE "household"   ADD CONSTRAINT "household_currency_format_check"   CHECK ("currency" ~ '^[A-Z]{3}$');

-- Une catégorie appartient soit à un foyer, soit à un utilisateur, jamais aux deux.
ALTER TABLE "category" ADD CONSTRAINT "category_single_owner_check" CHECK (
  ("householdId" IS NOT NULL AND "ownerId" IS NULL)
  OR
  ("householdId" IS NULL AND "ownerId" IS NOT NULL)
);

-- Unicité du nom de catégorie (insensible à la casse) par propriétaire et par type.
CREATE UNIQUE INDEX "category_household_name_type_key" ON "category" ("householdId", lower("name"), "type") WHERE "householdId" IS NOT NULL;
CREATE UNIQUE INDEX "category_owner_name_type_key"     ON "category" ("ownerId", lower("name"), "type")     WHERE "ownerId" IS NOT NULL;
