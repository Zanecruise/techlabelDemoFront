'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, RefreshCw, Layers } from 'lucide-react';
import { useCommandLog } from '@/hooks/use-command-log';
import type { Product } from '@/lib/types';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ProductTableProps {
  initialProducts: Product[];
}

export default function ProductTable({ initialProducts }: ProductTableProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isSyncing, startSyncTransition] = useTransition();
  const { addLogEntry } = useCommandLog();
  const { toast } = useToast();

  const handleSyncPrices = () => {
    startSyncTransition(async () => {
      addLogEntry('Initiating price synchronization...');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

      setProducts(prevProducts =>
        prevProducts.map(p => ({
          ...p,
          price: parseFloat((p.price * (1 + (Math.random() - 0.5) * 0.1)).toFixed(2)),
        }))
      );
      
      addLogEntry('Price synchronization complete.');
      toast({
        title: 'Success',
        description: 'Product prices have been synchronized.',
      });
    });
  };

  const handleAction = (action: string, productName: string) => {
    addLogEntry(`Action: '${action}' on product '${productName}'`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleSyncPrices} disabled={isSyncing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          Sync Prices
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={48}
                    height={48}
                    className="rounded-md object-cover"
                    data-ai-hint={product.imageHint}
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{product.category}</Badge>
                </TableCell>
                <TableCell className="text-right font-mono">${product.price.toFixed(2)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleAction('Edit', product.name)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction('Customize Layout', product.name)}>
                        <Layers className="mr-2 h-4 w-4" />
                        Customize
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => handleAction('Delete', product.name)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
