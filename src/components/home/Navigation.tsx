import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "ndui-ahrom";
import DIcon from "@/@Client/Components/common/DIcon";
import { useState } from "react";

export default function Navigation() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: "صفحه اصلی", href: "/" },
    { label: "محصولات", href: "/products" },
    { label: "درخواست خدمات", href: "/request" },
    { label: "درباره ما", href: "/about" },
    { label: "تماس با ما", href: "/contact" },
  ];

  return (
    <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">لوگو</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors"
              >
                {item.label}
              </Link>
            ))}

            <div className="flex items-center space-x-2 space-x-reverse mr-4">
              {status === "loading" ? (
                <div className="animate-pulse w-20 h-8 bg-gray-200 rounded" />
              ) : session ? (
                <div className="flex items-center gap-2">
                  <Link href={session.user.role === "ADMIN" ? "/dashboard" : "/panel"}>
                    <Button
                      variant="ghost"
                      icon={<DIcon icon={session.user.role === "ADMIN" ? "fa-grid" : "fa-user"} />}
                    >
                      {session.user.role === "ADMIN" ? "پنل مدیریت" : "پنل کاربری"}
                    </Button>
                  </Link>
                  <Button
                    variant="primary"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    icon={<DIcon icon="fa-sign-out" classCustom="text-white" />}
                  >
                    خروج
                  </Button>
                </div>
              ) : (
                <Link href="/login">
                  <Button>ورود / ثبت نام</Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-50 focus:outline-none"
            >
              <DIcon icon={isOpen ? "fa-xmark" : "fa-bars"} classCustom="text-2xl" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          {status === "authenticated" && (
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <Link
                href={session?.user.role === "ADMIN" ? "/dashboard" : "/panel"}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                {session?.user.role === "ADMIN" ? "پنل مدیریت" : "پنل کاربری"}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full text-right px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                خروج
              </button>
            </div>
          )}

          {status === "unauthenticated" && (
            <div className="border-t border-gray-200 pt-4">
              <Link
                href="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                ورود / ثبت نام
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}