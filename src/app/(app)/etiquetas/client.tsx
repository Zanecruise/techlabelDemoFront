'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

type Status = 'linked' | 'unlinked' | 'error';

const labels = [
  {
    id: '0',
    product: 'Leite Integral 1L',
    sku: '789456',
    status: 'linked' as Status,
  },
  {
    id: '1',
    product: 'Bolacha Morango Trakinas',
    sku: '451354',
    status: 'linked' as Status,
  },
  {
    id: '2',
    product: 'Salgadinho 300g Doritos',
    sku: '462318',
    status: 'error' as Status,
  },
  {
    id: '3',
    product: '',
    sku: '',
    status: 'unlinked' as Status,
  },
];

const statusConfig = {
  linked: { color: 'bg-green-500', text: 'Etiqueta com produto vinculado' },
  unlinked: { color: 'bg-yellow-500', text: 'Etiqueta sem produto vinculado' },
  error: { color: 'bg-red-500', text: 'Etiqueta apresenta falha' },
};

export default function EtiquetasClient() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLabels = labels.filter(
    (label) =>
      label.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      label.sku.toLowerCase().includes(searchTerm.toLowerCase())
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
                <TableHead>Produto</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="w-24 text-center">Status</TableHead>
                <TableHead className="w-24 text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLabels.map((label) => (
                <TableRow key={label.id}>
                  <TableCell>{label.id}</TableCell>
                  <TableCell>
                    {label.product || (
                      <span className="text-muted-foreground">
                        Nenhum produto vinculado
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{label.sku}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            statusConfig[label.status].color
                          }`}
                        />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/etiquetas/editar/${label.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 focus:text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-start gap-6 pt-6">
        {Object.values(statusConfig).map((s) => (
            <div key={s.text} className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${s.color}`} />
                <span className="text-sm text-muted-foreground">{s.text}</span>
            </div>
        ))}
      </CardFooter>
    </Card>
  );
}
