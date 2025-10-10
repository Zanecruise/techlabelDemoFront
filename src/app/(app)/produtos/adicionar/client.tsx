'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirestore, addDocumentNonBlocking, useCollection, updateDocumentNonBlocking, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdicionarProdutoClient() {
  const router = useRouter();
  const firestore = useFirestore();
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [promoPrice, setPromoPrice] = useState('');
  const [proportionalValue, setProportionalValue] = useState('');
  const [date, setDate] = useState('');
  const [gtin, setGtin] = useState('');
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);

  const unassignedLabelsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Query for labels that are not associated with any product yet
    return query(collection(firestore, 'labels'), where('productId', '==', null));
  }, [firestore]);
  
  const { data: availableLabels, isLoading: isLoadingLabels } = useCollection(unassignedLabelsQuery);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !sku) {
      alert('Por favor, preencha os campos Nome, Preço e SKU.');
      return;
    }
    
    // 1. Add the product
    const productsCollection = collection(firestore, 'products');
    const newProductRef = await addDocumentNonBlocking(productsCollection, {
      name,
      description: '', 
      price: parseFloat(price),
      sku,
      brand,
      promoPrice: promoPrice ? parseFloat(promoPrice) : null,
      proportionalValue,
      date,
      gtin,
      labelId: selectedLabelId,
    });

    if (newProductRef && selectedLabelId) {
        // 2. If a label was selected, update the label to link it to the new product
        const labelRef = doc(firestore, 'labels', selectedLabelId);
        updateDocumentNonBlocking(labelRef, { productId: newProductRef.id });

        // 3. Update the product with the labelId
        const productRef = doc(firestore, 'products', newProductRef.id);
        updateDocumentNonBlocking(productRef, { labelId: selectedLabelId });
    }
    
    router.push('/produtos');
  };


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
                  placeholder="Automático"
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
                 <Select onValueChange={setSelectedLabelId} value={selectedLabelId || ''}>
                    <SelectTrigger id="label-select">
                        <SelectValue placeholder={isLoadingLabels ? "A carregar etiquetas..." : "Selecione uma etiqueta disponível"} />
                    </SelectTrigger>
                    <SelectContent>
                        {isLoadingLabels ? (
                            <SelectItem value="loading" disabled>A carregar...</SelectItem>
                        ) : (
                            availableLabels?.map((label: any) => (
                                <SelectItem key={label.id} value={label.id}>
                                    {label.macAddress}
                                </SelectItem>
                            ))
                        )}
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
