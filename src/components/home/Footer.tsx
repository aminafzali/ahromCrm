// src/components/home/Footer.tsx
import DIcon from "@/@Client/Components/common/DIcon";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-teal-800 text-white pt-12 pb-8 rounded-tl-3xl rounded-tr-3xl">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">اهرم</h3>
            <p className="text-slate-300 text-sm">
              مدیریت هوشمند درخواست‌ها، خدمات و مشتریان؛ همه‌چیز در یک پنل ساده
              و قدرتمند.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a className="text-slate-300 hover:text-white" href="#">
                <DIcon icon="fa-instagram" cdi={false} />
              </a>
              <a className="text-slate-300 hover:text-white" href="#">
                <DIcon icon="fa-telegram" cdi={false} />
              </a>
              <a className="text-slate-300 hover:text-white" href="#">
                <DIcon icon="fa-whatsapp" cdi={false} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">دسترسی سریع</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>
                <Link href="/about">درباره ما</Link>
              </li>
              <li>
                <Link href="/contact">تماس با ما</Link>
              </li>
              <li>
                <Link href="/products">محصولات</Link>
              </li>
              <li>
                <Link href="/request">ثبت درخواست</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">خدمات</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>تعمیر یخچال</li>
              <li>تعمیر لباسشویی</li>
              <li>تعمیر ظرفشویی</li>
              <li>تعمیر کولر</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">اطلاعات تماس</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li className="flex items-center gap-2">
                <DIcon icon="fa-location-dot" cdi={false} classCustom="ml-2" />{" "}
                تهران، خیابان ولیعصر
              </li>
              <li className="flex items-center gap-2">
                <DIcon icon="fa-phone" cdi={false} classCustom="ml-2" />{" "}
                021-12345678
              </li>
              <li className="flex items-center gap-2">
                <DIcon icon="fa-envelope" cdi={false} classCustom="ml-2" />{" "}
                info@example.com
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 text-center text-slate-400 text-sm">
          <div>تمامی حقوق محفوظ است © {new Date().getFullYear()}</div>
        </div>
      </div>
    </footer>
  );
}

// import DIcon from "@/@Client/Components/common/DIcon";
// import Link from "next/link";

// export default function Footer() {
//   return (
//     <footer className="bg-gray-900 text-white pt-16 pb-8">
//       <div className="container mx-auto px-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
//           {/* About Section */}
//           <div>
//             <h3 className="text-xl font-bold mb-4">درباره ما</h3>
//             <p className="text-gray-400 mb-4">
//               ارائه دهنده خدمات تعمیر لوازم خانگی با بیش از 10 سال تجربه و تیمی متخصص
//             </p>
//             <div className="flex space-x-4">
//               <a href="#" className="text-gray-400 hover:text-white">
//                 <DIcon icon="fa-instagram" cdi={false} />
//               </a>
//               <a href="#" className="text-gray-400 hover:text-white">
//                 <DIcon icon="fa-telegram" cdi={false} />
//               </a>
//               <a href="#" className="text-gray-400 hover:text-white">
//                 <DIcon icon="fa-whatsapp" cdi={false} />
//               </a>
//             </div>
//           </div>

//           {/* Quick Links */}
//           <div>
//             <h3 className="text-xl font-bold mb-4">دسترسی سریع</h3>
//             <ul className="space-y-2">
//               <li>
//                 <Link href="/about" className="text-gray-400 hover:text-white">
//                   درباره ما
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/contact" className="text-gray-400 hover:text-white">
//                   تماس با ما
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/products" className="text-gray-400 hover:text-white">
//                   محصولات
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/request" className="text-gray-400 hover:text-white">
//                   ثبت درخواست
//                 </Link>
//               </li>
//             </ul>
//           </div>

//           {/* Services */}
//           <div>
//             <h3 className="text-xl font-bold mb-4">خدمات</h3>
//             <ul className="space-y-2">
//               <li className="text-gray-400">تعمیر یخچال</li>
//               <li className="text-gray-400">تعمیر لباسشویی</li>
//               <li className="text-gray-400">تعمیر ظرفشویی</li>
//               <li className="text-gray-400">تعمیر کولر</li>
//             </ul>
//           </div>

//           {/* Contact Info */}
//           <div>
//             <h3 className="text-xl font-bold mb-4">اطلاعات تماس</h3>
//             <ul className="space-y-2">
//               <li className="flex items-center text-gray-400">
//                 <DIcon icon="fa-location-dot" cdi={false} classCustom="ml-2" />
//                 تهران، خیابان ولیعصر
//               </li>
//               <li className="flex items-center text-gray-400">
//                 <DIcon icon="fa-phone" cdi={false} classCustom="ml-2" />
//                 021-12345678
//               </li>
//               <li className="flex items-center text-gray-400">
//                 <DIcon icon="fa-envelope" cdi={false} classCustom="ml-2" />
//                 info@example.com
//               </li>
//             </ul>
//           </div>
//         </div>

//         {/* Copyright */}
//         <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
//           <p>تمامی حقوق محفوظ است © {new Date().getFullYear()}</p>
//         </div>
//       </div>
//     </footer>
//   );
// }
