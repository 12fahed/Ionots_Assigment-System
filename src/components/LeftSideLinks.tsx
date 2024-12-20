'use client'

import { Home, Book, Menu } from 'lucide-react'
import Link from "next/link"
import React from "react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import logo from "@/public/logo.png"

interface LeftSideLinksProps {
  userType: string
}

const LeftSideLinks: React.FC<LeftSideLinksProps> = ({ userType }) => {
  const pathname = usePathname()

  const navItems = [
    { href: "/landing", label: "Home", icon: Home },
    ...(userType === "instructor" ? [{ href: "/landing/uploadAssignment", label: "Upload Assignment", icon: Book }] : []),
  ]

  const getLinkClasses = (path: string) => {
    return cn(
      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out",
      pathname === path
        ? "text-white bg-indigo-500 shadow-md"
        : "text-gray-700 hover:text-white hover:bg-indigo-100"
    );    
  }

  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-background border-b">
      <div className="flex items-center space-x-4">
        <Image
          src={logo}
          alt="logo"
          width={100}
          height={100}
          className="rounded-md"
        />
        <div className="hidden md:flex items-center space-x-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={getLinkClasses(item.href)}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <div className="flex flex-col space-y-4 mt-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={getLinkClasses(item.href)}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  )
}

export default LeftSideLinks

