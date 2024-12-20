import {
  Home,
  History,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import logo from "@/public/logo.png"
import Image from "next/image";

const LeftSideLinks = ({ userType }: { userType: string }) => {
  const pathname = usePathname();
  const getLinkClasses = (path: string) => {
    return pathname === path
      ? "flex items-center gap-2 px-2 py-2 text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-700 shadow-lg dark:shadow-blue-600/50 transition-all duration-300 ease-in-out"
      : "flex items-center gap-2 px-2 py-2 text-gray-700 dark:text-gray-300 transition-all duration-300 ease-in-out hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-600/50";
  };

  return (
    <nav className="flex items-center px-2 text-sm font-medium lg:px-4 space-x-6">
      <Image
        src={logo}
        alt="logo"
        width={100}
        height={100}
        className="rounded-md"
      />
    </nav>
  );
};

export default LeftSideLinks;
