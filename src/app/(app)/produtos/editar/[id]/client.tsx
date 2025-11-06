'use client';

import { useFirestore, useDoc, updateDocumentNonBlocking, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking, getDocument } from '@/firebase';
import { doc, collection, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import ProductForm, { type ProductFormData } from '../../components/product-form';

export default function EditarProdutoClient({ productId }: { productId: string }) {
  const router = useRouter();
  const firestore = useFirestore();

  // Fetch the product to edit
  const productRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'products', productId);
  }, [firestore, productId]);
  const { data: productData, isLoading: isLoadingProduct } = useDoc(productRef);

  // Fetch the associated design
  const designQuery = useMemoFirebase(() => {
      if (!firestore || !productData?.labelId) return null;
      return doc(firestore, 'product_label_designs', `${productId}_${productData.labelId}`);
  }, [firestore, productId, productData?.labelId]);
  const { data: designData, isLoading: isLoadingDesign } = useDoc(designQuery);
  
  const [initialData, setInitialData] = useState<ProductFormData | undefined>();
  const [originalLabelId, setOriginalLabelId] = useState<string | null>(null);

  // CRITICAL: Reset state when navigating to a new product page
  useEffect(() => {
    setInitialData(undefined);
    setOriginalLabelId(null);
  }, [productId]);
  
  useEffect(() => {
    // Only set data if productData exists and initialData is not yet set for the current productId
    if (productData && initialData === undefined) {
      setInitialData({
          name: productData.name || '',
          brand: productData.brand || '',
          sku: productData.sku || '',
          price: productData.price || 0,
          promoPrice: productData.promoPrice || undefined,
          proportionalValue: productData.proportionalValue || '',
          unitOfMeasure: productData.unitOfMeasure || '',
          date: productData.date || '',
          gtin: productData.gtin || '',
          selectedLabelId: productData.labelId || null,
          selectedDesign: designData?.designId || null,
          designData: designData?.designData || {},
      });
      setOriginalLabelId(productData.labelId || null);
    }
  }, [productData, designData, initialData, productId]);

  const handleSubmit = async (data: ProductFormData) => {
    if (!productRef || !firestore) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }

    const productUpdateData = {
      name: data.name,
      price: data.price,
      sku: data.sku,
      brand: data.brand,
      promoPrice: data.promoPrice,
      proportionalValue: data.proportionalValue,
      unitOfMeasure: data.unitOfMeasure,
      date: data.date,
      gtin: data.gtin,
      labelId: data.selectedLabelId,
    };
    
    // 1. Update the product data
    await updateDocumentNonBlocking(productRef, productUpdateData);

    // 2. Handle label association change
    if (originalLabelId !== data.selectedLabelId) {
      // Unlink the old label if there was one
      if (originalLabelId) {
        const oldLabelRef = doc(firestore, 'labels', originalLabelId);
        await updateDocumentNonBlocking(oldLabelRef, { productId: null });
        
        // Remove old sync doc
        const oldLabelDoc = await getDoc(doc(firestore, 'labels', originalLabelId));
        if(oldLabelDoc.exists() && oldLabelDoc.data()?.macAddress) {
            const oldSyncRef = doc(firestore, 'label_sync', oldLabelDoc.data().macAddress);
            await deleteDocumentNonBlocking(oldSyncRef);
        }
      }
      // Link the new label if one was selected
      if (data.selectedLabelId) {
        const newLabelRef = doc(firestore, 'labels', data.selectedLabelId);
        await updateDocumentNonBlocking(newLabelRef, { productId });
      }
    }
    
    // 3. Save the label design
    if (data.selectedLabelId && data.selectedDesign) {
        const designDocRef = doc(firestore, 'product_label_designs', `${productId}_${data.selectedLabelId}`);
        await setDocumentNonBlocking(designDocRef, {
            productId: productId,
            labelId: data.selectedLabelId,
            designId: data.selectedDesign,
            designData: data.designData,
        }, { merge: true });
    }
    
    // 4. Update the sync collection
    if (data.selectedLabelId) {
        const currentLabelData = (await getDoc(doc(firestore, 'labels', data.selectedLabelId))).data();
        if (currentLabelData?.macAddress) {
            const syncRef = doc(firestore, 'label_sync', currentLabelData.macAddress);
            const templateId = data.selectedDesign ? parseInt(data.selectedDesign.replace('template-', '')) : null;

            const syncData = {
                macAddress: currentLabelData.macAddress,
                productId: productId,
                labelId: data.selectedLabelId,
                updatedAt: new Date().toISOString(),
                template: templateId,
                templateModel: data.designData,
            };
            await setDocumentNonBlocking(syncRef, syncData, { merge: true });
        }
    }


    // 5. Log the edit
    const commandLogsCollection = doc(collection(firestore, 'command_logs'));
    await setDocumentNonBlocking(commandLogsCollection, {
        command: `Edição do produto: ${data.name}`,
        details: `Produto ${data.name} (SKU: ${data.sku}) foi atualizado.`,
        timestamp: new Date().toISOString(),
        product: productId,
        label: data.selectedLabelId,
    }, { merge: true });

    router.push('/produtos');
  };

  if (isLoadingProduct || isLoadingDesign || !initialData) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <ProductForm
        productId={productId}
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
    />
  );
}
