"use client"

import { ApplicantSideBar } from "@/components/ApplicantSideBar"
import dynamic from 'next/dynamic'

const SidebarInset = dynamic(() => import('@/components/ui/sidebar').then((mod) => mod.SidebarInset), { ssr: false })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <ApplicantSideBar />
        <SidebarInset className="flex-1">
          {children}
        </SidebarInset>
    </div>                
  )
}

