import Header from '@/components/layout/header';
import EditarProdutoClient from './client';

export default function EditarProdutoPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col h-full">
      <Header title={`Editar Produto #${params.id.substring(0, 4)}`} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <EditarProdutoClient productId={params.id} />
      </main>
    </div>
  );
}
