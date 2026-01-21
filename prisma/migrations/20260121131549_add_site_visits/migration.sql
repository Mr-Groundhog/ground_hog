-- CreateTable
CREATE TABLE "public"."site_visits" (
    "id" TEXT NOT NULL,
    "uv" TEXT NOT NULL,
    "page_url" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "referrer" TEXT,
    "ip" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_visits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "site_visits_created_at_idx" ON "public"."site_visits"("created_at");

-- CreateIndex
CREATE INDEX "site_visits_page_url_idx" ON "public"."site_visits"("page_url");

-- CreateIndex
CREATE INDEX "site_visits_uv_idx" ON "public"."site_visits"("uv");
