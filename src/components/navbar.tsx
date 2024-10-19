"use client";

import { useAuthContext } from "@/context/auth-context";
import { Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Navbar() {
  const { user } = useAuthContext();
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  useEffect(() => {
    const smoothScroll = (e: MouseEvent) => {
      e.preventDefault();
      const targetId = (e.currentTarget as HTMLAnchorElement)
        .getAttribute("href")
        ?.slice(1);
      if (targetId) {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach((link) => {
      link.addEventListener("click", smoothScroll as EventListener);
    });

    return () => {
      links.forEach((link) => {
        link.removeEventListener("click", smoothScroll as EventListener);
      });
    };
  }, []);

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center border-b border-gray-200 sticky top-0 bg-white z-10">
      <Link className="flex items-center justify-center" href="/">
        <Sun className="h-6 w-6 text-green-600" />
        <span className="ml-2 text-xl font-semibold text-gray-900">
          PrabhaWatt
        </span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        {isLandingPage && (
          <>
            <a
              className="text-sm font-medium text-gray-700 hover:text-green-600 cursor-pointer"
              href="#benefits"
            >
              Benefits
            </a>
            <a
              className="text-sm font-medium text-gray-700 hover:text-green-600 cursor-pointer"
              href="#why-choose"
            >
              Why Choose Us
            </a>
            <a
              className="text-sm font-medium text-gray-700 hover:text-green-600 cursor-pointer"
              href="#get-started"
            >
              Get Started
            </a>
          </>
        )}
        {user ? (
          <>
            <Link
              className="text-sm font-medium text-gray-700 hover:text-green-600 cursor-pointer"
              href={"/dashboard"}
            >
              Dashboard
            </Link>
            <Link
              className="text-sm font-medium text-gray-700 hover:text-green-600 cursor-pointer"
              href={"/settings"}
            >
              Settings
            </Link>
          </>
        ) : (
          <Link
            className="text-sm font-medium text-gray-700 hover:text-green-600 cursor-pointer"
            href={"/sign-in"}
          >
            Sign In
          </Link>
        )}
      </nav>
    </header>
  );
}
