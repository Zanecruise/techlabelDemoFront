import Header from '@/components/layout/header';
import HistoricoClient from './client';

export default function HistoricoPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Tela - Histórico" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <HistoricoClient />
      </main>
    </div>
  );
}
