// import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcryptjs";
// const { hash } = bcrypt;

// const prisma = new PrismaClient();

// async function main() {
//   // Create demo users
//   const adminPassword = await hash("admin123", 10);
//   const userPassword = await hash("user123", 10);

//   // Create admin user
//   const admin = await prisma.user.upsert({
//     where: { phone: "09110000000" },
//     update: {},
//     create: {
//       name: "مدیر سیستم",
//       phone: "09110000000",
//       email: "admin@demo.com",
//       password: adminPassword,
//       role: "ADMIN",
//       address: "تهران، خیابان ولیعصر",
//     },
//   });

//   // Create admin user
//   const admin2 = await prisma.user.upsert({
//     where: { phone: "09929036524" },
//     update: {},
//     create: {
//       name: "میلاد خالقی",
//       phone: "09929036524",
//       email: "admin2@demo.com",
//       password: adminPassword,
//       role: "ADMIN",
//       address: "تهران، خیابان ولیعصر",
//     },
//   });

//   // Create admin user
//   const admin3 = await prisma.user.upsert({
//     where: { phone: "09371417732" },
//     update: {},
//     create: {
//       name: "امین افضلی",
//       phone: "09371417732",
//       email: "admin3@demo.com",
//       password: adminPassword,
//       role: "ADMIN",
//       address: "تهران، خیابان ولیعصر",
//     },
//   });

//   // Create regular user
//   const user = await prisma.user.upsert({
//     where: { phone: "09350000000" },
//     update: {},
//     create: {
//       name: "کاربر نمونه",
//       phone: "09350000000",
//       email: "user@demo.com",
//       password: userPassword,
//       role: "USER",
//       address: "تهران، خیابان ولیعصر",
//     },
//   });
//   // Create regular user
//   const user2 = await prisma.user.upsert({
//     where: { phone: "09364622568" },
//     update: {},
//     create: {
//       name: "میلاد خالقی",
//       phone: "09364622568",
//       email: "user2@demo.com",
//       password: userPassword,
//       role: "USER",
//       address: "تهران، خیابان ولیعصر",
//     },
//   });

//   // Create regular user
//   const user3 = await prisma.user.upsert({
//     where: { phone: "09360000000" },
//     update: {},
//     create: {
//       name: "میلاد خالقی",
//       phone: "09360000000",
//       email: "user3@demo.com",
//       password: userPassword,
//       role: "USER",
//       address: "تهران، خیابان ولیعصر",
//     },
//   });

//   // Create statuses
//   const statusess = [
//     { name: "در انتظار بررسی", color: "#6c757d", isLock: true },
//     { name: "در حال بررسی", color: "#007bff" },
//     { name: "در حال انجام", color: "#ffc107" },
//     { name: "تکمیل شده", color: "#28a745" },
//     { name: "لغو شده", color: "#dc3545" },
//   ];

//   for (const status of statusess) {
//     await prisma.status.upsert({
//       where: { name: status.name },
//       update: {},
//       create: status,
//     });
//   }

//   // Create service types
//   const serviceTypes = [
//     {
//       name: "تعمیر یخچال",
//       description: "تعمیر انواع یخچال و فریزر",
//       basePrice: 150000,
//     },
//     {
//       name: "تعمیر لباسشویی",
//       description: "تعمیر انواع ماشین لباسشویی",
//       basePrice: 200000,
//     },
//     {
//       name: "تعمیر کولر",
//       description: "تعمیر انواع کولر گازی و اسپلیت",
//       basePrice: 250000,
//     },
//     {
//       name: "تعمیر تلویزیون",
//       description: "تعمیر انواع تلویزیون",
//       basePrice: 150000,
//     },
//     {
//       name: "تعمیر مایکروویو",
//       description: "تعمیر انواع مایکروویو و فر",
//       basePrice: 120000,
//     },
//     {
//       name: "تعمیر جاروبرقی",
//       description: "تعمیر انواع جاروبرقی",
//       basePrice: 100000,
//     },
//     {
//       name: "تعمیر پکیج",
//       description: "تعمیر انواع پکیج و آبگرمکن",
//       basePrice: 200000,
//     },
//   ];

//   for (const service of serviceTypes) {
//     await prisma.serviceType.upsert({
//       where: { name: service.name },
//       update: {},
//       create: service,
//     });
//   }
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
