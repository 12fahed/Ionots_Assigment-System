"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";
import { useTheme } from "next-themes";
import logo from "@/public/logo.png"
import { usePathname } from "next/navigation";

export default function UnprotectedNavbar() {
  const { theme } = useTheme();
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-transparent dark:bg-transparen dark:border-slate-800 backdrop-blur-md">

      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Image
              src={theme === "dark" ? logo : logo}
              alt="logo"
              width={100}
              height={100}
              className="rounded-md"
            />
          </div>
          {pathname === "/auth/change-password" && (
            <Button variant={"link"}>
              <Link href="/dashboard" className="flex items-center">
                <ArrowLeft className="ml-2 h-4 w-4"/>
                Dashboard
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
