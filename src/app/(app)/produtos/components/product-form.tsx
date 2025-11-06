
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import DesignSelector, { designs } from './design-selector';

export interface ProductFormData {
    name: string;
    brand: string;
    sku: string;
    price: number;
    promoPrice?: number;
    proportionalValue: string;
    unitOfMeasure: string;
    date: string;
    gtin: string;
    selectedLabelId: string | null;
    selectedDesign: string | null;
    designData: Record<string, any>;
}

interface ProductFormProps {
    productId?: string;
    initialData?: ProductFormData;
    onSubmit: (data: ProductFormData) => void;
    onCancel: () => void;
}

export default function ProductForm({ productId, initialData, onSubmit, onCancel }: ProductFormProps) {
  const firestore = useFirestore();

  const [formData, setFormData] = useState<ProductFormData>(initialData || {
    name: '',
    brand: '',
    sku: '',
    price: 0,
    promoPrice: undefined,
    proportionalValue: '',
    unitOfMeasure: '',
    date: '',
    gtin: '',
    selectedLabelId: null,
    selectedDesign: null,
    designData: {},
  });
  
  // Set form data when initialData changes
  useEffect(() => {
      if(initialData) {
          setFormData(initialData);
      }
  }, [initialData])

  // Fetch available (unassigned) labels + the one currently assigned to this product (if editing)
  const availableLabelsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const conditions: (string | null)[] = [null];
    if (initialData?.selectedLabelId) {
      conditions.push(initialData.selectedLabelId);
    }
    // Query for labels that have no productId or have the same productId as the one being edited.
     return query(collection(firestore, 'labels'), where('productId', 'in', conditions));
  }, [firestore, initialData?.selectedLabelId]);
  
  const { data: availableLabels, isLoading: isLoadingLabels } = useCollection(availableLabelsQuery);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    setFormData(prev => ({
        ...prev,
        [id]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };
  
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, selectedLabelId: value === 'none' ? null : value }));
  };

  const handleDesignChange = (designId: string | null) => {
      setFormData(prev => ({
          ...prev,
          selectedDesign: designId,
          // Reset design data when design changes
          designData: designId === prev.selectedDesign ? prev.designData : {}
      }));
  };

  const handleDesignDataChange = (field: string, value: string) => {
      setFormData(prev => ({
          ...prev,
          designData: {
              ...prev.designData,
              [field]: value,
          }
      }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.sku) {
      alert('Por favor, preencha os campos Nome, Preço e SKU.');
      return;
    }

    let finalDesignData = { ...formData.designData };

    // Ensure all fields for the selected design are present in the final data
    if (formData.selectedDesign) {
      const designDetails = designs.find(d => d.id === formData.selectedDesign);
      if (designDetails) {
        designDetails.fields.forEach(field => {
          if (!(field in finalDesignData)) {
            finalDesignData[field] = ''; // Add the field with an empty string if it's missing
          }
        });
      }
    }
    
    onSubmit({
      ...formData,
      designData: finalDesignData,
    });
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
                  value={productId ? productId.substring(0,8) : "Automático"}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" placeholder="Nome" value={formData.name} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                <Label htmlFor="brand">Marca</Label>
                <Input id="brand" placeholder="Marca" value={formData.brand} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" placeholder="000000" value={formData.sku} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitOfMeasure">Unidade de Medida</Label>
                <Input id="unitOfMeasure" placeholder="Ex: kg, L, Un" value={formData.unitOfMeasure} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Preço</Label>
                <Input id="price" placeholder="00,00" type="number" value={formData.price} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promoPrice">Preço promocional</Label>
                <Input id="promoPrice" placeholder="00,00" type="number" value={formData.promoPrice || ''} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proportionalValue">
                  Valor proporcional por unidade de medida
                </Label>
                <Input id="proportionalValue" placeholder="00,00 x kg" value={formData.proportionalValue} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input id="date" placeholder="00/00/0000" type="date" value={formData.date} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gtin">GTIN</Label>
                <Input
                  id="gtin"
                  placeholder="Número global do item comercial"
                  value={formData.gtin} onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="label-select">Associar Etiqueta</Label>
                 <Select onValueChange={handleSelectChange} value={formData.selectedLabelId || 'none'}>
                    <SelectTrigger id="label-select">
                        <SelectValue placeholder={isLoadingLabels ? "A carregar etiquetas..." : "Selecione uma etiqueta disponível"} />
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
            
            <DesignSelector 
              selectedDesign={formData.selectedDesign}
              designData={formData.designData}
              onDesignSelect={handleDesignChange}
              onDataChange={handleDesignDataChange}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button
                variant="destructive"
                type="button"
                onClick={onCancel}
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
