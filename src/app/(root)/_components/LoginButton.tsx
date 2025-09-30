// src/app/(root)/_components/LoginButton.tsx
"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { Button } from "ndui-ahrom";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function LoginButton() {
  const { data: session, status } = useSession();

  // keep logic exactly the same, only UI improved
  if (status === "loading") {
    return (
      <Button disabled className="px-6 py-2 rounded-lg bg-teal-100">
        در حال بارگذاری...
      </Button>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/workspaces" className="inline-block">
          <Button variant="ghost" className="flex items-center gap-2">
            <DIcon icon="fa-grid" />
            <span className="text-teal-700 font-medium">پنل</span>
          </Button>
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition shadow-sm"
        >
          <DIcon icon="fa-sign-out" classCustom="!text-white" />
          <span>خروج</span>
        </button>
      </div>
    );
  }

  return (
    <Link href="/login" className="inline-block">
      <Button className="px-6 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:scale-[1.02] transition-transform shadow-md">
        ورود / ثبت نام
      </Button>
    </Link>
  );
}

// "use client";

// import DIcon from "@/@Client/Components/common/DIcon";
// import { Button } from "ndui-ahrom";
// import { signOut, useSession } from "next-auth/react";
// import Link from "next/link";

// export default function LoginButton() {
//   const { data: session, status } = useSession();

//   return (
//     <div className="mb-4  md:px-4 justify-center justify-items-center content-center">
//       {status === "loading" ? (
//         <Button disabled>در حال بارگذاری...</Button>
//       ) : session ? (
//         <div className="flex items-center">
//           {
//             <Link href="/workspaces">
//               <Button variant="ghost">
//                 <DIcon icon="fa-grid" />
//                 <h1 className=" text-teal-800">ورود به پنل</h1>
//               </Button>
//             </Link>
//           }

//           <Button
//             className="mx-1"
//             variant="primary"
//             onClick={() => signOut({ callbackUrl: "/" })}
//           >
//             <DIcon icon="fa-sign-out" classCustom="!text-white" />
//             <h1>خروج</h1>
//           </Button>
//         </div>
//       ) : (
//         <Link href="/login" className="hover:text-primary">
//           <Button>ورود / ثبت نام</Button>
//         </Link>
//       )}
//     </div>
//   );
// }
