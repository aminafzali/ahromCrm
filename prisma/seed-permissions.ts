import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Script برای اضافه کردن Permissionهای جدید مرتبط با
 * Inventory, Orders, Shop Settings, Payments, Shipping
 */

const newPermissions = [
  // ===== Inventory Permissions =====
  {
    module: "inventory",
    action: "inventory.view",
    description: "مشاهده موجودی انبار",
  },
  {
    module: "inventory",
    action: "inventory.manage",
    description: "مدیریت موجودی انبار (افزودن، کاهش، انتقال)",
  },
  {
    module: "inventory",
    action: "inventory.adjust",
    description: "تنظیم دستی موجودی",
  },
  {
    module: "inventory",
    action: "inventory.transfer",
    description: "انتقال کالا بین انبارها",
  },
  {
    module: "inventory",
    action: "warehouse.view",
    description: "مشاهده انبارها",
  },
  {
    module: "inventory",
    action: "warehouse.manage",
    description: "مدیریت انبارها (ایجاد، ویرایش، حذف)",
  },

  // ===== Orders Permissions =====
  {
    module: "orders",
    action: "orders.view",
    description: "مشاهده سفارشات",
  },
  {
    module: "orders",
    action: "orders.create",
    description: "ایجاد سفارش جدید",
  },
  {
    module: "orders",
    action: "orders.update",
    description: "ویرایش سفارشات",
  },
  {
    module: "orders",
    action: "orders.cancel",
    description: "لغو سفارش",
  },
  {
    module: "orders",
    action: "orders.status-change",
    description: "تغییر وضعیت سفارش",
  },
  {
    module: "orders",
    action: "orders.delete",
    description: "حذف سفارش",
  },
  {
    module: "orders",
    action: "orders.invoice",
    description: "تبدیل سفارش به فاکتور",
  },

  // ===== Payment Gateway Permissions =====
  {
    module: "payment-gateway",
    action: "payment-gateway.view",
    description: "مشاهده تنظیمات درگاه‌های پرداخت",
  },
  {
    module: "payment-gateway",
    action: "payment-gateway.manage",
    description: "مدیریت درگاه‌های پرداخت (ایجاد، ویرایش، حذف)",
  },
  {
    module: "payment-gateway",
    action: "payment-gateway.activate",
    description: "فعال/غیرفعال کردن درگاه پرداخت",
  },
  {
    module: "payment-gateway",
    action: "payment-gateway.test",
    description: "تست اتصال به درگاه پرداخت",
  },

  // ===== Shipping Permissions =====
  {
    module: "shipping",
    action: "shipping.view",
    description: "مشاهده روش‌های ارسال",
  },
  {
    module: "shipping",
    action: "shipping.manage",
    description: "مدیریت روش‌های ارسال (ایجاد، ویرایش، حذف)",
  },
  {
    module: "shipping",
    action: "shipping.zones-view",
    description: "مشاهده مناطق ارسال",
  },
  {
    module: "shipping",
    action: "shipping.zones-manage",
    description: "مدیریت مناطق ارسال",
  },
  {
    module: "shipping",
    action: "shipping.calculate",
    description: "محاسبه هزینه ارسال",
  },

  // ===== Shop Settings Permissions =====
  {
    module: "shop",
    action: "shop.settings-view",
    description: "مشاهده تنظیمات فروشگاه",
  },
  {
    module: "shop",
    action: "shop.settings-manage",
    description: "مدیریت تنظیمات فروشگاه",
  },
  {
    module: "shop",
    action: "shop.products-visibility",
    description: "مدیریت نمایش محصولات در فروشگاه",
  },
  {
    module: "shop",
    action: "shop.payment-options",
    description: "مدیریت روش‌های پرداخت محصولات",
  },

  // ===== POS Permissions =====
  {
    module: "pos",
    action: "pos.access",
    description: "دسترسی به صفحه فروش حضوری (POS)",
  },
  {
    module: "pos",
    action: "pos.sale",
    description: "ثبت فروش حضوری",
  },

  // ===== Purchase Orders Permissions =====
  {
    module: "purchase-orders",
    action: "purchase-orders.view",
    description: "مشاهده سفارشات خرید",
  },
  {
    module: "purchase-orders",
    action: "purchase-orders.create",
    description: "ایجاد سفارش خرید جدید",
  },
  {
    module: "purchase-orders",
    action: "purchase-orders.update",
    description: "ویرایش سفارشات خرید",
  },
  {
    module: "purchase-orders",
    action: "purchase-orders.approve",
    description: "تایید سفارش خرید",
  },
  {
    module: "purchase-orders",
    action: "purchase-orders.receive",
    description: "تایید دریافت کالای سفارش خرید",
  },
  {
    module: "purchase-orders",
    action: "purchase-orders.cancel",
    description: "لغو سفارش خرید",
  },
];

async function seedPermissions() {
  console.log("🌱 Starting permissions seed...");

  // Get all workspaces
  const workspaces = await prisma.workspace.findMany();

  if (workspaces.length === 0) {
    console.log("⚠️  No workspaces found. Please create a workspace first.");
    return;
  }

  for (const workspace of workspaces) {
    console.log(
      `\n📦 Processing workspace: ${workspace.name} (ID: ${workspace.id})`
    );

    let createdCount = 0;
    let skippedCount = 0;

    for (const perm of newPermissions) {
      try {
        // Check if permission already exists
        const existing = await prisma.permission.findUnique({
          where: {
            action_workspaceId: {
              action: perm.action,
              workspaceId: workspace.id,
            },
          },
        });

        if (existing) {
          console.log(`  ⏭️  Skipped (exists): ${perm.action}`);
          skippedCount++;
          continue;
        }

        // Create permission
        await prisma.permission.create({
          data: {
            workspaceId: workspace.id,
            action: perm.action,
            module: perm.module,
            description: perm.description,
          },
        });

        console.log(`  ✅ Created: ${perm.action}`);
        createdCount++;
      } catch (error) {
        console.error(`  ❌ Error creating ${perm.action}:`, error);
      }
    }

    console.log(
      `\n📊 Summary for ${workspace.name}: ${createdCount} created, ${skippedCount} skipped`
    );
  }

  console.log("\n✨ Permissions seed completed!");
}

seedPermissions()
  .catch((error) => {
    console.error("❌ Error in seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
