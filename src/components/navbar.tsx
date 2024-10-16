import { Sun } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center border-b border-gray-200">
      <Link className="flex items-center justify-center" href="#">
        <Sun className="h-6 w-6 text-green-600" />
        <span className="ml-2 text-xl font-semibold text-gray-900">
          PrabhaWatt
        </span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <Link
          className="text-sm font-medium text-gray-700 hover:text-green-600"
          href="#"
        >
          Features
        </Link>
        <Link
          className="text-sm font-medium text-gray-700 hover:text-green-600"
          href="#"
        >
          Pricing
        </Link>
        <Link
          className="text-sm font-medium text-gray-700 hover:text-green-600"
          href="#"
        >
          About
        </Link>
        <Link
          className="text-sm font-medium text-gray-700 hover:text-green-600"
          href="#"
        >
          Contact
        </Link>
      </nav>
    </header>
  );
}
