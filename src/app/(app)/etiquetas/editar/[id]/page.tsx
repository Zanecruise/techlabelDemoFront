import Header from '@/components/layout/header';
import EditarEtiquetaClient from './client';

export default function EditarEtiquetaPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col h-full">
      <Header title={`Editar Etiqueta #${params.id}`} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <EditarEtiquetaClient />
      </main>
    </div>
  );
}
