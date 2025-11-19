'use client';

import { useMemo, useState } from 'react';
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
import { MoreHorizontal, Pencil, Search, Trash2, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking, updateDocumentNonBlocking, setDocumentNonBlocking, getDocument } from '@/firebase';
import { collection, doc, getDoc } from 'firebase/firestore';

type Status = 'linked' | 'unlinked' | 'error';

const statusConfig = {
  linked: { color: 'bg-green-500', text: 'Etiqueta com produto vinculado' },
  unlinked: { color: 'bg-yellow-500', text: 'Etiqueta sem produto vinculado' },
  error: { color: 'bg-red-500', text: 'Etiqueta apresenta falha' },
};

export default function EtiquetasClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const firestore = useFirestore();
  
  const labelsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'labels');
  }, [firestore]);

  const { data: labels, isLoading: isLoadingLabels } = useCollection(labelsCollection);

  const productsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'products');
  }, [firestore]);
  const { data: products, isLoading: isLoadingProducts } = useCollection(productsCollection);

  const getStatus = (label: any): Status => {
    // This is a placeholder for more complex logic
    if (label.productId) return 'linked';
    return 'unlinked';
  }

  const getLinkedProduct = (productId: string | null) => {
    if (!productId || !products) return null;
    return products.find((p: any) => p.id === productId);
  }

  const filteredLabels = useMemo(() => {
    if (!labels || !products) return [];
    if (!searchTerm) return labels;

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return labels.filter((label: any) => {
      // Check MAC Address
      if (label.macAddress && label.macAddress.toLowerCase().includes(lowerCaseSearchTerm)) {
        return true;
      }

      // Check linked product name or SKU
      const product = getLinkedProduct(label.productId);
      if (product) {
        if (product.name && product.name.toLowerCase().includes(lowerCaseSearchTerm)) {
          return true;
        }
        if (product.sku && product.sku.toLowerCase().includes(lowerCaseSearchTerm)) {
          return true;
        }
      }

      return false;
    });
  }, [labels, products, searchTerm]);
  
  const handleDelete = async (label: any) => {
    if (!firestore || !label || !label.id) return;

    const labelRef = doc(firestore, 'labels', label.id);
    
    // 1. Unlink product if linked
    if (label.productId) {
        const productRef = doc(firestore, 'products', label.productId);
        await updateDocumentNonBlocking(productRef, { labelId: null });
    }

    // 2. Delete sync document if MAC address exists
    if (label.macAddress) {
        const syncRef = doc(firestore, 'label_sync', label.macAddress);
        await deleteDocumentNonBlocking(syncRef);
    }
    
    // 3. Delete the label itself
    await deleteDocumentNonBlocking(labelRef);

    // 4. Log the deletion
    const logRef = doc(collection(firestore, 'command_logs'));
    await setDocumentNonBlocking(logRef, {
        command: `Exclusão da etiqueta: ${label.macAddress}`,
        details: `Etiqueta com MAC Address ${label.macAddress} foi excluída.`,
        timestamp: new Date().toISOString(),
        label: label.id,
    });
  };


  const isLoading = isLoadingLabels || isLoadingProducts;


  if (isLoading) {
    return <div>A carregar...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Pesquisar por MAC, Nome do Produto ou SKU..."
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
                <TableHead>Endereço MAC</TableHead>
                <TableHead>Produto Vinculado</TableHead>
                <TableHead className="w-24 text-center">Status</TableHead>
                <TableHead className="w-24 text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLabels.map((label: any) => {
                const status = getStatus(label);
                const product = getLinkedProduct(label.productId);
                return (
                  <TableRow key={label.id}>
                    <TableCell>{label.macAddress}</TableCell>
                    <TableCell>
                      {product ? (
                        `${product.name} (SKU: ${product.sku})`
                      ) : (
                        <span className="text-muted-foreground">
                          Nenhum produto vinculado
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <div
                          className={`h-3 w-3 rounded-full ${statusConfig[status].color}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                     <AlertDialog>
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
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                       <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. Isto irá excluir permanentemente a etiqueta e removerá qualquer vínculo com produtos.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(label)}>Sim, excluir</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-6">
        <div className="flex items-center gap-6">
            {Object.values(statusConfig).map((s) => (
            <div key={s.text} className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${s.color}`} />
                <span className="text-sm text-muted-foreground">{s.text}</span>
            </div>
            ))}
        </div>
         <Button asChild>
          <Link href="/etiquetas/adicionar">
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar etiqueta
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
