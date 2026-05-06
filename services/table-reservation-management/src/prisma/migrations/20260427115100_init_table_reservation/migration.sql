-- CreateTable
CREATE TABLE "reservations" (
    "reservation_id" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "contact_number" TEXT NOT NULL,
    "party_size" INTEGER NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("reservation_id")
);

-- CreateTable
CREATE TABLE "restaurant_tables" (
    "table_id" TEXT NOT NULL,
    "table_number" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_tables_pkey" PRIMARY KEY ("table_id")
);

-- CreateTable
CREATE TABLE "dining_sessions" (
    "session_id" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "reservation_id" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL,
    "expected_end_at" TIMESTAMP(3) NOT NULL,
    "actual_end_at" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "billing_status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dining_sessions_pkey" PRIMARY KEY ("session_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_tables_table_number_key" ON "restaurant_tables"("table_number");

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "restaurant_tables"("table_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dining_sessions" ADD CONSTRAINT "dining_sessions_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "restaurant_tables"("table_id") ON DELETE RESTRICT ON UPDATE CASCADE;
