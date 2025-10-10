'use client';

import React from 'react';
import Sidebar from '@/components/layout/sidebar';
import { FirebaseClientProvider } from '@/firebase';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <div className="flex h-full">
        <Sidebar />
        <main className="flex-1 h-full overflow-hidden">{children}</main>
      </div>
    </FirebaseClientProvider>
  );
}
