import Header from '@/components/layout/header';
import ProdutosClient from './client';

export default function ProdutosPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Produtos" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <ProdutosClient />
      </main>
    </div>
  );
}
