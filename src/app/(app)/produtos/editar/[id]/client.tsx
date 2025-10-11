'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirestore, useDoc, updateDocumentNonBlocking, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export default function EditarProdutoClient({ productId }: { productId: string }) {
  const router = useRouter();
  const firestore = useFirestore();

  // Fetch the product to edit
  const productRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'products', productId);
  }, [firestore, productId]);
  const { data: productData, isLoading: isLoadingProduct } = useDoc(productRef);

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [promoPrice, setPromoPrice] = useState('');
  const [proportionalValue, setProportionalValue] = useState('');
  const [date, setDate] = useState('');
  const [gtin, setGtin] = useState('');
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [originalLabelId, setOriginalLabelId] = useState<string | null>(null);

  // Fetch available (unassigned) labels + the one currently assigned to this product
  const availableLabelsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'labels'), where('productId', 'in', [null, productId]));
  }, [firestore, productId]);
  const { data: availableLabels, isLoading: isLoadingLabels } = useCollection(availableLabelsQuery);

  useEffect(() => {
    if (productData) {
      setName(productData.name || '');
      setBrand(productData.brand || '');
      setSku(productData.sku || '');
      setPrice(productData.price?.toString() || '');
      setPromoPrice(productData.promoPrice?.toString() || '');
      setProportionalValue(productData.proportionalValue || '');
      setDate(productData.date || '');
      setGtin(productData.gtin || '');
      setSelectedLabelId(productData.labelId || null);
      setOriginalLabelId(productData.labelId || null);
    }
  }, [productData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !sku || !productRef) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }

    // 1. Update the product data
    await updateDocumentNonBlocking(productRef, {
      name,
      price: parseFloat(price),
      sku,
      brand,
      promoPrice: promoPrice ? parseFloat(promoPrice) : null,
      proportionalValue,
      date,
      gtin,
      labelId: selectedLabelId,
    });

    // 2. Handle label association change
    if (originalLabelId !== selectedLabelId) {
      // Unlink the old label if there was one
      if (originalLabelId) {
        const oldLabelRef = doc(firestore, 'labels', originalLabelId);
        await updateDocumentNonBlocking(oldLabelRef, { productId: null });
      }
      // Link the new label if one was selected
      if (selectedLabelId) {
        const newLabelRef = doc(firestore, 'labels', selectedLabelId);
        await updateDocumentNonBlocking(newLabelRef, { productId });
      }
    }

    router.push('/produtos');
  };

  if (isLoadingProduct || isLoadingLabels) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-4xl">
        <CardContent className="p-6 md:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="identificador">Identificador</Label>
                <Input
                  id="identificador"
                  value={productId.substring(0,8)}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="marca">Marca</Label>
                <Input id="marca" placeholder="Marca" value={brand} onChange={(e) => setBrand(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" placeholder="000000" value={sku} onChange={(e) => setSku(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="preco">Preço</Label>
                <Input id="preco" placeholder="00,00" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preco-promocional">Preço promocional</Label>
                <Input id="preco-promocional" placeholder="00,00" type="number" value={promoPrice} onChange={(e) => setPromoPrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor-proporcional">
                  Valor proporcional por unidade de medida
                </Label>
                <Input id="valor-proporcional" placeholder="00,00 x kg" value={proportionalValue} onChange={(e) => setProportionalValue(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Input id="data" placeholder="00/00/0000" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gtin">GTIN</Label>
                <Input
                  id="gtin"
                  placeholder="Número global do item comercial"
                  value={gtin} onChange={(e) => setGtin(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="label-select">Associar Etiqueta</Label>
                 <Select onValueChange={(value) => setSelectedLabelId(value === 'none' ? null : value)} value={selectedLabelId || 'none'}>
                    <SelectTrigger id="label-select">
                        <SelectValue placeholder="Selecione uma etiqueta disponível" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {availableLabels?.map((label: any) => (
                            <SelectItem key={label.id} value={label.id}>
                                {label.macAddress}
                            </SelectItem>
                        ))}
                         {availableLabels?.length === 0 && !isLoadingLabels && (
                             <SelectItem value="no-labels" disabled>Nenhuma etiqueta disponível</SelectItem>
                         )}
                    </SelectContent>
                </Select>
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
