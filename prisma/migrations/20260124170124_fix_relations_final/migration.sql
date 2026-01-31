-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "assignedType" TEXT,
ADD COLUMN     "checkinCounter" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "checkoutCounter" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "parentAssetId" TEXT;

-- AlterTable
ALTER TABLE "CustodyItem" ADD COLUMN     "acceptanceNote" TEXT,
ADD COLUMN     "signature" TEXT;

-- AlterTable
ALTER TABLE "employee_requests" ADD COLUMN     "assetId" TEXT;

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_settings" (
    "id" TEXT NOT NULL,
    "warrantyAlertDays" INTEGER NOT NULL DEFAULT 30,
    "licenseAlertDays" INTEGER NOT NULL DEFAULT 30,
    "maintenanceAlertDays" INTEGER NOT NULL DEFAULT 7,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "dashboardNotifications" BOOLEAN NOT NULL DEFAULT true,
    "notificationEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_alerts" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'WARNING',
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityName" TEXT,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "daysLeft" INTEGER NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isDismissed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Accessory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "modelNumber" TEXT,
    "manufacturer" TEXT,
    "categoryId" TEXT,
    "totalQty" INTEGER NOT NULL DEFAULT 0,
    "minQty" INTEGER NOT NULL DEFAULT 5,
    "remainingQty" INTEGER NOT NULL DEFAULT 0,
    "purchaseDate" TIMESTAMP(3),
    "cost" DOUBLE PRECISION DEFAULT 0,
    "orderNumber" TEXT,
    "supplierId" TEXT,
    "locationId" TEXT,
    "image" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Accessory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessoryUser" (
    "id" TEXT NOT NULL,
    "accessoryId" TEXT NOT NULL,
    "userId" TEXT,
    "employeeId" TEXT,
    "assignedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "AccessoryUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_email_idx" ON "password_reset_tokens"("email");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "system_alerts_type_idx" ON "system_alerts"("type");

-- CreateIndex
CREATE INDEX "system_alerts_severity_idx" ON "system_alerts"("severity");

-- CreateIndex
CREATE INDEX "system_alerts_isRead_idx" ON "system_alerts"("isRead");

-- CreateIndex
CREATE INDEX "system_alerts_isDismissed_idx" ON "system_alerts"("isDismissed");

-- CreateIndex
CREATE INDEX "Accessory_categoryId_idx" ON "Accessory"("categoryId");

-- CreateIndex
CREATE INDEX "AccessoryUser_userId_idx" ON "AccessoryUser"("userId");

-- CreateIndex
CREATE INDEX "AccessoryUser_employeeId_idx" ON "AccessoryUser"("employeeId");

-- CreateIndex
CREATE INDEX "AccessoryUser_accessoryId_idx" ON "AccessoryUser"("accessoryId");

-- AddForeignKey
ALTER TABLE "employee_requests" ADD CONSTRAINT "employee_requests_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_parentAssetId_fkey" FOREIGN KEY ("parentAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accessory" ADD CONSTRAINT "Accessory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AssetCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accessory" ADD CONSTRAINT "Accessory_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accessory" ADD CONSTRAINT "Accessory_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessoryUser" ADD CONSTRAINT "AccessoryUser_accessoryId_fkey" FOREIGN KEY ("accessoryId") REFERENCES "Accessory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessoryUser" ADD CONSTRAINT "AccessoryUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessoryUser" ADD CONSTRAINT "AccessoryUser_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
