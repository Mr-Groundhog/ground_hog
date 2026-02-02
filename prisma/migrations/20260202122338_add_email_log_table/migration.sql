-- CreateEnum
CREATE TYPE "public"."EmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "public"."email_logs" (
    "id" TEXT NOT NULL,
    "from_email" TEXT NOT NULL,
    "to_email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT,
    "status" "public"."EmailStatus" NOT NULL DEFAULT 'PENDING',
    "error_message" TEXT,
    "ip" TEXT NOT NULL,
    "send_count" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_at" TIMESTAMPTZ,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_logs_ip_idx" ON "public"."email_logs"("ip");

-- CreateIndex
CREATE INDEX "email_logs_created_at_idx" ON "public"."email_logs"("created_at");

-- CreateIndex
CREATE INDEX "email_logs_status_idx" ON "public"."email_logs"("status");
