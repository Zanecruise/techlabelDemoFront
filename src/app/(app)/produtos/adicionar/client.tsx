'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

export default function AdicionarProdutoClient() {
  const router = useRouter();

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-4xl">
        <CardContent className="p-6 md:p-8">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="identificador">Identificador</Label>
                <Input
                  id="identificador"
                  placeholder="Identificador"
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" placeholder="Nome" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="marca">Marca</Label>
                <Input id="marca" placeholder="Marca" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" placeholder="000000" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="preco">Preço</Label>
                <Input id="preco" placeholder="00,00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preco-promocional">Preço promocional</Label>
                <Input id="preco-promocional" placeholder="00,00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor-proporcional">
                  Valor proporcional por unidade de medida
                </Label>
                <Input id="valor-proporcional" placeholder="00,00 x kg" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Input id="data" placeholder="00/00/0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gtin">GTIN</Label>
                <Input
                  id="gtin"
                  placeholder="Número global do item comercial"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                variant="destructive"
                type="button"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}