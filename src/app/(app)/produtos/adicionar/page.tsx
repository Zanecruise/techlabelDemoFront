import Header from '@/components/layout/header';
import AdicionarProdutoClient from './client';

export default function AdicionarProdutoPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Adicionar Produto" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <AdicionarProdutoClient />
      </main>
    </div>
  );
}
