# راهنمای Migration - تغییرات مدل UserGroup و اضافه شدن Price Lists

## ⚠️ تغییرات مهم

### 1. تغییر رابطه UserGroup

**قبل**: هر کاربر می‌توانست چند گروه کاربری داشته باشد (many-to-many)
**بعد**: هر کاربر فقط یک گروه کاربری دارد (one-to-many)

### 2. اضافه شدن ProductPriceList

مدل جدیدی برای مدیریت قیمت‌های گروهی محصولات اضافه شده است.

### 3. بهبود ProductVariant

فیلدهای جدید برای مدیریت بهتر واریانت‌ها اضافه شده است.

## 🔧 مراحل اجرای Migration

### مرحله 1: Backup گرفتن

```bash
# پشتیبان از دیتابیس
pg_dump your_database > backup_$(date +%Y%m%d).sql
```

### مرحله 2: اجرای Migration

```bash
# Generate Prisma Client
npx prisma generate

# اجرای migration
npx prisma migrate dev --name add-price-lists-and-update-usergroups

# یا در production:
npx prisma migrate deploy
```

### مرحله 3: اجرای Script انتقال داده

```bash
# تبدیل داده‌های قبلی
npx tsx prisma/migrations/migrate-usergroups.ts
```

این اسکریپت:

- برای هر `WorkspaceUser` که چند گروه دارد، اولین گروه را به عنوان گروه اصلی انتخاب می‌کند
- فیلد `userGroupId` را پر می‌کند
- جدول میانی `_WorkspaceUserToUserGroup` را پاک می‌کند

### مرحله 4: تست کردن

```bash
# اجرای تست‌ها
npm test

# بررسی lint errors
npm run lint
```

## 📝 تغییرات در کد

### در WorkspaceUser queries:

**قبل:**

```typescript
const user = await prisma.workspaceUser.findUnique({
  where: { id },
  include: {
    userGroups: true, // many-to-many
  },
});
const groupIds = user.userGroups.map((g) => g.id);
```

**بعد:**

```typescript
const user = await prisma.workspaceUser.findUnique({
  where: { id },
  include: {
    userGroup: true, // one-to-many
  },
});
const groupId = user.userGroup?.id;
```

## 🆕 امکانات جدید

### 1. لیست قیمت محصولات

```typescript
// ایجاد قیمت برای گروه کاربری
await prisma.productPriceList.create({
  data: {
    productId: 1,
    userGroupId: 2,
    price: 100000,
    discountPrice: 90000,
    discountPercent: 10,
  },
});

// دریافت قیمت محصول برای کاربر
const priceService = new ProductPriceListServiceApi();
const price = await priceService.getProductPriceForUserGroup(
  productId,
  userGroupId
);
```

### 2. واریانت‌های محصول بهبود یافته

```typescript
await prisma.productVariant.create({
  data: {
    productId: 1,
    name: "رنگ قرمز - سایز L",
    sku: "PROD-001-RED-L",
    price: 150000,
    stock: 50,
    attributes: {
      color: "red",
      size: "L",
    },
    images: ["url1.jpg", "url2.jpg"],
    weight: 500,
    isActive: true,
  },
});
```

## 🎯 API های جدید

### Product Variants

- `GET /api/product-variants?productId=1` - دریافت واریانت‌های یک محصول
- `POST /api/product-variants` - ایجاد واریانت جدید

### Product Price Lists

- `GET /api/product-price-lists?productId=1` - دریافت لیست قیمت‌های یک محصول
- `GET /api/product-price-lists?userGroupId=1` - دریافت تمام قیمت‌های یک گروه
- `POST /api/product-price-lists` - ایجاد لیست قیمت جدید

### Product Price

- `GET /api/products/{id}/price` - دریافت قیمت محصول (با توجه به گروه کاربر)

## ⚡ بهینه‌سازی‌ها

1. **Index ها اضافه شده**:

   - `ProductPriceList.userGroupId`
   - `ProductPriceList.productId`
   - `ProductVariant.productId`
   - `ProductVariant.sku`

2. **Unique Constraints**:
   - `ProductPriceList`: (productId, userGroupId)
   - `ProductVariant.sku`

## 🔄 Rollback (در صورت نیاز)

اگر نیاز به برگشت داشتید:

```bash
# بازگردانی از backup
psql your_database < backup_YYYYMMDD.sql

# یا rollback migration
npx prisma migrate resolve --rolled-back migration_name
```

## 📞 پشتیبانی

در صورت بروز هرگونه مشکل:

1. فایل log ها را بررسی کنید
2. از صحت backup اطمینان حاصل کنید
3. با تیم فنی تماس بگیرید
