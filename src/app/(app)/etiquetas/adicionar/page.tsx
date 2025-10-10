import Header from '@/components/layout/header';
import AdicionarEtiquetaClient from './client';

export default function AdicionarEtiquetaPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Adicionar Etiqueta" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <AdicionarEtiquetaClient />
      </main>
    </div>
  );
}
