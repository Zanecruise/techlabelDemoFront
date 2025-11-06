'use client';

import { useRouter } from 'next/navigation';
import { useFirestore, setDocumentNonBlocking, updateDocumentNonBlocking, getDocument } from '@/firebase';
import { collection, doc, getDoc } from 'firebase/firestore';
import ProductForm from '../components/product-form';
import { type ProductFormData } from '../components/product-form';

export default function AdicionarProdutoClient() {
  const router = useRouter();
  const firestore = useFirestore();
  
  const handleSubmit = async (data: ProductFormData) => {
    if (!firestore) {
      alert('Ocorreu um erro de conexão. Tente novamente.');
      return;
    }
    
    // 1. Add the product
    const productsCollection = collection(firestore, 'products');
    const newProductRef = doc(productsCollection); // Create a reference with a new ID first
    
    const productData = {
      name: data.name,
      description: '', // Description is not in the form, default to empty
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

    await setDocumentNonBlocking(newProductRef, productData);

    // 2. If a label was selected, update the label to link it to the new product
    if (data.selectedLabelId) {
        const labelRef = doc(firestore, 'labels', data.selectedLabelId);
        await updateDocumentNonBlocking(labelRef, { productId: newProductRef.id });
    }
    
    // 3. Save the label design if selected
    if (data.selectedLabelId && data.selectedDesign) {
        const designCollection = collection(firestore, 'product_label_designs');
        const designDocRef = doc(designCollection, `${newProductRef.id}_${data.selectedLabelId}`);
        await setDocumentNonBlocking(designDocRef, {
            productId: newProductRef.id,
            labelId: data.selectedLabelId,
            designId: data.selectedDesign,
            designData: data.designData,
        });
    }

    // 4. Update the sync collection
    if (data.selectedLabelId && data.selectedDesign) {
        const labelSnap = await getDoc(doc(firestore, 'labels', data.selectedLabelId));
        if (labelSnap.exists() && labelSnap.data().macAddress) {
            const macAddress = labelSnap.data().macAddress;
            const syncRef = doc(firestore, 'label_sync', macAddress);
            
            const syncData = {
                macAddress: macAddress,
                productId: newProductRef.id,
                labelId: data.selectedLabelId,
                updatedAt: new Date().toISOString(),
                template: data.selectedDesign,
                templateModel: data.designData,
            };
            await setDocumentNonBlocking(syncRef, syncData);
        }
    }

     // 5. Log the creation
    const commandLogsCollection = collection(firestore, 'command_logs');
    const logRef = doc(commandLogsCollection);
    await setDocumentNonBlocking(logRef, {
        command: `Novo produto criado: ${data.name}`,
        details: `Produto ${data.name} (SKU: ${data.sku}) foi adicionado.`,
        timestamp: new Date().toISOString(),
        product: newProductRef.id,
        label: data.selectedLabelId
    });
    
    router.push('/produtos');
  };


  return (
    <ProductForm
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
    />
  );
}
