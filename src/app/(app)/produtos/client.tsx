'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Pencil,
  Search,
  PlusCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

type Status = 'linked' | 'unlinked';

const products = [
  {
    id: '0',
    name: 'Rosquinha chocolate Ninfa',
    sku: '123456',
    price: 'R$ 23,90',
    status: 'linked' as Status,
  },
  {
    id: '1',
    name: 'Desodorante Rexona',
    sku: '451354',
    price: 'R$ 23,90',
    status: 'unlinked' as Status,
  },
  {
    id: '2',
    name: 'Creme Dental Sorriso',
    sku: '462318',
    price: 'R$ 23,90',
    status: 'unlinked' as Status,
  },
];

const statusConfig = {
  linked: { color: 'bg-green-500', text: 'Produto vinculado à uma etiqueta' },
  unlinked: { color: 'bg-yellow-500', text: 'Produto não vinculado à uma etiqueta' },
};

export default function ProdutosClient() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Pesquisar..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="w-16 text-center">Editar</TableHead>
                <TableHead className="w-16 text-center">Inativar</TableHead>
                <TableHead className="w-24 text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="bg-accent text-accent-foreground rounded-md w-8 h-8 flex items-center justify-center font-semibold">
                      {product.id}
                    </div>
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    <div className="bg-accent text-accent-foreground rounded-md px-3 py-1 inline-block">
                      {product.sku}
                    </div>
                  </TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <div
                        className={`h-4 w-4 rounded-full border-2 ${
                          statusConfig[product.status].color
                        }`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-6 pt-6">
        <div className="flex items-center gap-6">
            {Object.values(statusConfig).map((s) => (
                <div key={s.text} className="flex items-center gap-2">
                    <div className={`h-4 w-4 rounded-full border-2 ${s.color}`} />
                    <span className="text-sm text-muted-foreground">{s.text}</span>
                </div>
            ))}
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar produto
        </Button>
      </CardFooter>
    </Card>
  );
}
