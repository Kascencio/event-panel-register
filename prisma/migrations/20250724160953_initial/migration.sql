-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'UNPAID', 'PARTIAL');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('generate', 'resend');

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "age" TEXT NOT NULL,
    "email" TEXT,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "paid_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "qr_code" TEXT,
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_by" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_history" (
    "id" SERIAL NOT NULL,
    "participant_id" TEXT NOT NULL,
    "previous_paid_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "new_paid_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "previous_total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "new_total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "previous_status" "PaymentStatus" NOT NULL,
    "new_status" "PaymentStatus" NOT NULL,
    "updated_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "payment_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scan_sessions" (
    "id" SERIAL NOT NULL,
    "participant_id" TEXT NOT NULL,
    "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scanned_by" TEXT,
    "device_info" TEXT,
    "location" TEXT,

    CONSTRAINT "scan_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_logs" (
    "id" SERIAL NOT NULL,
    "participant_id" TEXT NOT NULL,
    "qr_filename" TEXT NOT NULL,
    "action_type" "ActionType" NOT NULL,
    "sent_to" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qr_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "payment_history" ADD CONSTRAINT "payment_history_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scan_sessions" ADD CONSTRAINT "scan_sessions_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_logs" ADD CONSTRAINT "qr_logs_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
