"use client";
import React, { useState, useEffect } from 'react';
import { useUser } from './UserProvider';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';

const ProtectionProvider = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useUser();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !isLoggedIn) {
      router.push('/'); // Adjust the path to your sign-in page
    }
  }, [isLoggedIn, hydrated, router]);

  if (!hydrated) {
    return (
      <div className="h-screen flex items-center justify-center w-full">
        <Loader className="w-6 h-6 animate-spin" />
      </div>
    );
      }

  if (!isLoggedIn) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectionProvider;
