// src/components/home/Testimonials.tsx
import DIcon from "@/@Client/Components/common/DIcon";

export default function Testimonials() {
  const testimonials = [
    {
      name: "علی محمدی",
      role: "مشتری",
      content:
        "کیفیت خدمات عالی بود و تکنسین‌ها بسیار حرفه‌ای و خوش‌برخورد بودند.",
      rating: 5,
    },
    {
      name: "مریم احمدی",
      role: "مشتری",
      content:
        "سرعت رسیدگی به درخواست و قیمت‌های منصفانه از نقاط قوت این مجموعه است.",
      rating: 5,
    },
    {
      name: "رضا کریمی",
      role: "مشتری",
      content:
        "از نحوه برخورد و کیفیت خدمات کاملاً راضی هستم و حتماً به دیگران هم پیشنهاد می‌کنم.",
      rating: 4,
    },
  ];

  return (
    <section className="py-16 bg-white rounded-2xl shadow-sm border">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-extrabold text-center mb-8">
          نظرات مشتریان
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="p-6 rounded-xl bg-slate-50 border">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">
                  {t.name
                    .split(" ")
                    .map((s) => s[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{t.name}</h4>
                    <div className="text-sm text-slate-500">— {t.role}</div>
                  </div>
                  <div className="mt-2 text-slate-600">{t.content}</div>
                  <div className="mt-4 flex items-center gap-1">
                    {[...Array(t.rating)].map((_, k) => (
                      <DIcon
                        key={k}
                        icon="fa-star"
                        cdi={false}
                        classCustom="text-yellow-400"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// import DIcon from "@/@Client/Components/common/DIcon";

// export default function Testimonials() {
//   const testimonials = [
//     {
//       name: "علی محمدی",
//       role: "مشتری",
//       content:
//         "کیفیت خدمات عالی بود و تکنسین‌ها بسیار حرفه‌ای و خوش‌برخورد بودند.",
//       rating: 5,
//     },
//     {
//       name: "مریم احمدی",
//       role: "مشتری",
//       content:
//         "سرعت رسیدگی به درخواست و قیمت‌های منصفانه از نقاط قوت این مجموعه است.",
//       rating: 5,
//     },
//     {
//       name: "رضا کریمی",
//       role: "مشتری",
//       content:
//         "از نحوه برخورد و کیفیت خدمات کاملاً راضی هستم و حتماً به دیگران هم پیشنهاد می‌کنم.",
//       rating: 4,
//     },
//   ];

//   return (
//     <div className="py-16">
//       <div className="container mx-auto px-4">
//         <h2 className="text-3xl font-bold text-center mb-12">
//           نظرات مشتریان ما
//         </h2>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//           {testimonials.map((testimonial, index) => (
//             <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
//               <div className="flex items-center mb-4">
//                 {[...Array(testimonial.rating)].map((_, i) => (
//                   <DIcon
//                     key={i}
//                     icon="fa-star"
//                     cdi={false}
//                     classCustom="text-yellow-400"
//                   />
//                 ))}
//               </div>
//               <p className="text-gray-600 mb-4">{testimonial.content}</p>
//               <div className="flex items-center">
//                 <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
//                 <div>
//                   <h4 className="font-bold">{testimonial.name}</h4>
//                   <p className="text-gray-500 text-sm">{testimonial.role}</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
