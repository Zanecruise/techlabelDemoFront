import Header from '@/components/layout/header';
import EtiquetasClient from './client';

export default function EtiquetasPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Etiquetas" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <EtiquetasClient />
      </main>
    </div>
  );
}
