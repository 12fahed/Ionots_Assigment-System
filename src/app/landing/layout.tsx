"use client";

import { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useTheme } from "next-themes";
import ProtectionProvider from "@/providers/ProtectionProvider";
import { useUser } from "@/providers/UserProvider";
import Header from "@/components/Header";
import MobileHeader from "@/components/Mobile-Header";

export default function Home({
  applicant,
  instructor,
}: {
  applicant: React.ReactNode;
  instructor: React.ReactNode;
}) {
  const { theme } = useTheme();
  const { user } = useUser();
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserType = async ({ uid }: { uid: string }) => {
      if (!uid) return;
      let applicantRef = doc(db, "Applicant", uid);
      let docSnap = await getDoc(applicantRef);

      if (!docSnap.exists()) {
        applicantRef = doc(db, "Instructor", uid);
        docSnap = await getDoc(applicantRef);
        setUserType("instructor"); 
      }
      
      else{
        setUserType(docSnap.data()?.type);
      };
    };

    fetchUserType({ uid: user?.uid || "" });
  }, []);

  return (
    <ProtectionProvider>
      <div className={`min-h-screen w-full ${theme}`}>
        { userType && userType === "instructor" && (
          <Header userType={userType ? userType : ""} />
        ) }
        { userType && userType === "instructor" && (
          <MobileHeader userType={userType ? userType : ""} />
        ) }
        <div className="flex flex-col mt-4">
          {userType == "applicant" && applicant}
          {userType == "instructor" && instructor}
        </div>
      </div>
    </ProtectionProvider>
  );
}
