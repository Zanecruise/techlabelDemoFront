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
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking, updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, query, where, getDoc, doc } from 'firebase/firestore';
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

type Status = 'linked' | 'unlinked';

const statusConfig = {
  linked: { color: 'bg-green-500', text: 'Produto vinculado à uma etiqueta' },
  unlinked: { color: 'bg-yellow-500', text: 'Produto não vinculado à uma etiqueta' },
};

export default function ProdutosClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const firestore = useFirestore();
  
  const productsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'products');
  }, [firestore]);
  const { data: products, isLoading: isLoadingProducts } = useCollection(productsCollection);
  
  const labelsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'labels');
  }, [firestore]);
  const { data: labels, isLoading: isLoadingLabels } = useCollection(labelsCollection);

  const getLabelMacAddress = (labelId: string) => {
    if (!labels) return '...';
    const label = labels.find((l: any) => l.id === labelId);
    return label ? label.macAddress : 'N/A';
  }

  const filteredProducts = products?.filter(
    (product: any) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  const isLoading = isLoadingProducts || isLoadingLabels;

  const handleDelete = async (productId: string) => {
    if (!firestore) return;
    
    const productRef = doc(firestore, 'products', productId);
    const productSnap = await getDoc(productRef);

    if(!productSnap.exists()) {
        console.error("Produto não encontrado!");
        return;
    }

    const productData = productSnap.data();

    // 1. Unlink label if it exists
    if (productData.labelId) {
        const labelRef = doc(firestore, 'labels', productData.labelId);
        const labelSnap = await getDoc(labelRef);
        if(labelSnap.exists()){
            await updateDocumentNonBlocking(labelRef, { productId: null });

            // 2. Delete sync document for that label
            if (labelSnap.data().macAddress) {
                const syncRef = doc(firestore, 'label_sync', labelSnap.data().macAddress);
                await deleteDocumentNonBlocking(syncRef);
            }
        }
    }

    // 3. Delete product_label_design document
    if(productData.labelId){
        const designDocRef = doc(firestore, 'product_label_designs', `${productId}_${productData.labelId}`);
        await deleteDocumentNonBlocking(designDocRef);
    }
    
    // 4. Delete product
    await deleteDocumentNonBlocking(productRef);

    // 5. Log deletion
    const logRef = doc(collection(firestore, 'command_logs'));
    await setDocumentNonBlocking(logRef, {
        command: `Exclusão do produto: ${productData.name}`,
        details: `Produto ${productData.name} (SKU: ${productData.sku}) foi excluído.`,
        timestamp: new Date().toISOString(),
        product: productId,
    });
  };

  if (isLoading) {
    return <div>A carregar...</div>
  }

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
                <TableHead>Unidade de Medida</TableHead>
                <TableHead>Etiqueta (MAC)</TableHead>
                <TableHead className="w-24 text-center">Status</TableHead>
                <TableHead className="w-24 text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="bg-accent text-accent-foreground rounded-md w-8 h-8 flex items-center justify-center font-semibold">
                      {product.id.substring(0, 4)}
                    </div>
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    <div className="bg-accent text-accent-foreground rounded-md px-3 py-1 inline-block">
                      {product.sku}
                    </div>
                  </TableCell>
                  <TableCell>R$ {product.price}</TableCell>
                  <TableCell>{product.unitOfMeasure || <span className="text-muted-foreground">N/A</span>}</TableCell>
                  <TableCell>{product.labelId ? getLabelMacAddress(product.labelId) : <span className="text-muted-foreground">N/A</span>}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <div
                        className={`h-4 w-4 rounded-full border-2 ${
                          statusConfig[product.labelId ? 'linked' : 'unlinked'].color
                        }`}
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
                                    <Link href={`/produtos/editar/${product.id}`}>
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
                                    Esta ação não pode ser desfeita. Isto irá excluir permanentemente o produto e removerá qualquer vínculo com etiquetas.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(product.id)}>Sim, excluir</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
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
        <Button asChild>
          <Link href="/produtos/adicionar">
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar produto
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
