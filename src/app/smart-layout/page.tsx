import Header from '@/components/layout/header';
import SmartLayoutClient from './client';

export default function SmartLayoutPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Smart Layout Generator" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <SmartLayoutClient />
      </main>
    </div>
  );
}
