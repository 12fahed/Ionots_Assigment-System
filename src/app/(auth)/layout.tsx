import React from "react";
import UnprotectedNavbar from "@/components/UnprotectedNavbar";
export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <UnprotectedNavbar />
      {children}
    </div>
  );
}
