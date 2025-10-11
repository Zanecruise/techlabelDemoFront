'use client';

import { useFirestore, useDoc, updateDocumentNonBlocking, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc, } from 'firebase/firestore';
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

  useEffect(() => {
    if (productData) {
      setInitialData({
          name: productData.name || '',
          brand: productData.brand || '',
          sku: productData.sku || '',
          price: productData.price || 0,
          promoPrice: productData.promoPrice || undefined,
          proportionalValue: productData.proportionalValue || '',
          date: productData.date || '',
          gtin: productData.gtin || '',
          selectedLabelId: productData.labelId || null,
          selectedDesign: designData?.designId || null,
          designData: designData?.designData || {},
      });
      setOriginalLabelId(productData.labelId || null);
    }
  }, [productData, designData]);

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


    // 4. Log the edit
    const commandLogsCollection = doc(firestore, 'command_logs', crypto.randomUUID());
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
