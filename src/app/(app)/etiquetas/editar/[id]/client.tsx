'use client';
import { useState, useEffect } from 'react';
import {
  useFirestore,
  useDoc,
  useCollection,
  useMemoFirebase,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
  setDocumentNonBlocking,
} from '@/firebase';
import { doc, collection, query, where, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Trash2, Link, Link2Off } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function EditarEtiquetaClient({ labelId }: { labelId: string }) {
  const router = useRouter();
  const firestore = useFirestore();

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Fetch the label being edited
  const labelRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'labels', labelId);
  }, [firestore, labelId]);
  const { data: labelData, isLoading: isLoadingLabel } = useDoc(labelRef);

  // Fetch all products to populate the dropdown
  const productsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'products');
  }, [firestore]);
  const { data: products, isLoading: isLoadingProducts } = useCollection(productsCollection);
  
  // Fetch the currently linked product's details
  const linkedProductRef = useMemoFirebase(() => {
    if (!firestore || !labelData?.productId) return null;
    return doc(firestore, 'products', labelData.productId);
  }, [firestore, labelData?.productId]);
  const { data: linkedProductData } = useDoc(linkedProductRef);
  
  // Set initial selection when label data loads
  useEffect(() => {
    if (labelData) {
      setSelectedProductId(labelData.productId);
    }
  }, [labelData]);

  const updateSyncCollection = async (labelDoc: any, productDoc: any | null) => {
    if (!firestore || !labelDoc?.macAddress) return;

    const syncRef = doc(firestore, 'label_sync', labelDoc.macAddress);

    if (!productDoc) {
      // If no product, delete the sync document
      await deleteDocumentNonBlocking(syncRef);
      return;
    }
    
    const designDocRef = doc(firestore, 'product_label_designs', `${productDoc.id}_${labelDoc.id}`);
    const designSnap = await getDoc(designDocRef);
    const designData = designSnap.exists() ? designSnap.data() : { designId: null, designData: {} };

    const syncData = {
        macAddress: labelDoc.macAddress,
        productId: productDoc.id,
        labelId: labelDoc.id,
        updatedAt: new Date().toISOString(),
        template: designData?.designId,
        templateModel: designData?.designData,
        ...productDoc
    };
    await setDocumentNonBlocking(syncRef, syncData, { merge: true });
  }

  const handleSave = async () => {
    if (!firestore || !labelRef || !labelData) return;
    
    const originalProductId = labelData?.productId;

    // If the product link has changed
    if (originalProductId !== selectedProductId) {
        // Unlink the old product
        if(originalProductId) {
            const oldProductRef = doc(firestore, 'products', originalProductId);
            await updateDocumentNonBlocking(oldProductRef, { labelId: null });
            const oldProductSnap = await getDoc(oldProductRef);
            if(oldProductSnap.exists()){
                 await updateSyncCollection({ ...labelData, id: labelId }, null); // Signal removal
            }
        }
        
        // Link the new product
        if(selectedProductId) {
            const newProductRef = doc(firestore, 'products', selectedProductId);
            await updateDocumentNonBlocking(newProductRef, { labelId: labelId });
            const newProductSnap = await getDoc(newProductRef);
             if(newProductSnap.exists()){
                await updateSyncCollection({ ...labelData, id: labelId }, { ...newProductSnap.data(), id: newProductSnap.id });
            }
        }
        
        // Update the label itself
        await updateDocumentNonBlocking(labelRef, { productId: selectedProductId });
        
        // Log the change
        logAction(`Vínculo da etiqueta alterado. Antigo produto: ${originalProductId || 'Nenhum'}. Novo produto: ${selectedProductId || 'Nenhum'}`);
    }

    router.push('/etiquetas');
  };

  const handleUnlink = async () => {
      if (!firestore || !labelData?.productId || !labelData) return;
      
      const productRef = doc(firestore, 'products', labelData.productId);
      const currentLabelRef = doc(firestore, 'labels', labelId);

      // Update both documents
      await updateDocumentNonBlocking(productRef, { labelId: null });
      await updateDocumentNonBlocking(currentLabelRef, { productId: null });

      // Remove from sync collection
      if (labelData.macAddress) {
          const syncRef = doc(firestore, 'label_sync', labelData.macAddress);
          await deleteDocumentNonBlocking(syncRef);
      }
      
      logAction(`Produto ${labelData.productId} desvinculado da etiqueta.`);
      setSelectedProductId(null); // Update UI state
      router.refresh();
  };

  const handleDelete = async () => {
    if (!firestore || !labelRef || !labelData) return;
    
    // If a product is linked, unlink it first
    if(labelData?.productId){
        const productRef = doc(firestore, 'products', labelData.productId);
        await updateDocumentNonBlocking(productRef, { labelId: null });
    }
    
     // Remove from sync collection
    if (labelData.macAddress) {
        const syncRef = doc(firestore, 'label_sync', labelData.macAddress);
        await deleteDocumentNonBlocking(syncRef);
    }
    
    await deleteDocumentNonBlocking(labelRef);
    logAction(`Etiqueta ${labelId} foi excluída.`);
    router.push('/etiquetas');
  };

  const logAction = async (details: string) => {
    if (!firestore) return;
    const logRef = doc(collection(firestore, 'command_logs'));
    await setDocumentNonBlocking(logRef, {
        command: `Gerenciamento de etiqueta: ${labelData?.macAddress}`,
        details,
        timestamp: new Date().toISOString(),
        label: labelId,
    }, { merge: true });
  }

  const isLoading = isLoadingLabel || isLoadingProducts;

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  }

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Etiqueta: {labelData?.macAddress}</CardTitle>
          <CardDescription>
            {linkedProductData ? `Atualmente vinculada ao produto: ${linkedProductData.name} (SKU: ${linkedProductData.sku})` : 'Esta etiqueta não está vinculada a nenhum produto.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="product-select">Associar a um Produto</Label>
                <Select onValueChange={(value) => setSelectedProductId(value === 'none' ? null : value)} value={selectedProductId || 'none'}>
                    <SelectTrigger id="product-select">
                        <SelectValue placeholder="Selecione um produto..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">Nenhum (Desvincular)</SelectItem>
                        {products?.map((product: any) => (
                            <SelectItem key={product.id} value={product.id} disabled={!!product.labelId && product.labelId !== labelId}>
                                {product.name} {product.labelId && product.labelId !== labelId && '(Já vinculado)'}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <p className="text-sm text-muted-foreground">Selecione um produto para vincular a esta etiqueta. Produtos que já possuem uma etiqueta não podem ser selecionados.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
                 <Button onClick={handleUnlink} variant="outline" className="w-full" disabled={!labelData?.productId}>
                    <Link2Off className="mr-2"/>
                    Desvincular Produto Atual
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                            <Trash2 className="mr-2" />
                            Excluir Etiqueta
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isto irá excluir permanentemente a etiqueta e removerá qualquer vínculo com produtos.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Sim, excluir</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </CardContent>
        <div className="p-6 pt-0 flex justify-end gap-4">
            <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
            <Button onClick={handleSave}>
                <Link className="mr-2"/>
                Salvar Vínculo
            </Button>
        </div>
      </Card>
    </div>
  );
}
