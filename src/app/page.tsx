import Header from '@/components/layout/header';
import ProductTable from '@/components/dashboard/product-table';
import CommandLogger from '@/components/dashboard/command-logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { products as initialProducts } from '@/lib/data';
import { Package } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Dashboard" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2" />
                  Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProductTable initialProducts={initialProducts} />
              </CardContent>
            </Card>
          </div>
          <div>
            <CommandLogger />
          </div>
        </div>
      </main>
    </div>
  );
}
