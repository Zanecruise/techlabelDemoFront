'use client';

import React, { useEffect } from 'react';
import Sidebar from '@/components/layout/sidebar';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If the user data has finished loading and there is no user, redirect to login
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  // While checking user auth, show a loading screen
  if (isUserLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <Loader2 className="animate-spin h-16 w-16 text-primary" />
      </div>
    );
  }

  // If user is logged in, show the app layout
  if (user) {
    return (
      <div className="flex h-full">
        <Sidebar />
        <main className="flex-1 h-full overflow-hidden">{children}</main>
      </div>
    );
  }

  // If there's no user and we're not loading, we're likely redirecting.
  // Return null or a loader to prevent rendering children.
  return (
    <div className="flex h-full w-full items-center justify-center bg-background">
        <Loader2 className="animate-spin h-16 w-16 text-primary" />
    </div>
  );
}
