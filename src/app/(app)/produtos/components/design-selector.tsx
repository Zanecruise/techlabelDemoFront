'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const designs = [
  { id: 'template-1', name: 'Template 1', imageUrl: '/desing1.png', fields: ['product_name', 'price', 'sku', 'date'] },
  { id: 'design-2', name: 'Promoção', imageUrl: 'https://picsum.photos/seed/d2/200/120', fields: ['preco_antigo', 'preco_novo'] },
  { id: 'design-3', name: 'Informativo', imageUrl: 'https://picsum.photos/seed/d3/200/120', fields: ['titulo', 'info'] },
  { id: 'design-4', name: 'Minimalista', imageUrl: 'https://picsum.photos/seed/d4/200/120', fields: ['produto'] },
  { id: 'design-5', name: 'Código QR', imageUrl: 'https://picsum.photos/seed/d5/200/120', fields: ['qr_code_data'] },
  { id: 'design-6', name: 'Duas Colunas', imageUrl: 'https://picsum.photos/seed/d6/200/120', fields: ['coluna1', 'coluna2'] },
];

interface DesignSelectorProps {
  selectedDesign: string | null;
  designData: Record<string, any>;
  onDesignSelect: (designId: string | null) => void;
  onDataChange: (field: string, value: string) => void;
}

export default function DesignSelector({ selectedDesign, designData, onDesignSelect, onDataChange }: DesignSelectorProps) {

  const selectedDesignDetails = designs.find(d => d.id === selectedDesign);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Design da Etiqueta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {designs.map(design => (
            <div
              key={design.id}
              onClick={() => onDesignSelect(design.id === selectedDesign ? null : design.id)}
              className={cn(
                "border-2 rounded-lg overflow-hidden cursor-pointer transition-all",
                selectedDesign === design.id ? "border-primary scale-105" : "border-transparent hover:border-muted-foreground"
              )}
            >
              <Image
                src={design.imageUrl}
                alt={design.name}
                width={200}
                height={120}
                className="w-full h-auto object-cover aspect-[5/3]"
              />
              <p className="text-center text-sm font-medium p-2 bg-muted/50">{design.name}</p>
            </div>
          ))}
        </div>

        {selectedDesignDetails && selectedDesignDetails.fields.length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-semibold text-lg">Dados para o Design: {selectedDesignDetails.name}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedDesignDetails.fields.map(field => (
                <div key={field} className="space-y-2">
                    <Label htmlFor={`design-data-${field}`}>{field.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}</Label>
                    <Input
                    id={`design-data-${field}`}
                    placeholder={`Insira o valor para ${field}`}
                    value={designData[field] || ''}
                    onChange={(e) => onDataChange(field, e.target.value)}
                    />
                </div>
                ))}
            </div>
          </div>
        )}

        {selectedDesignDetails && selectedDesignDetails.fields.length === 0 && (
            <div className="text-center text-muted-foreground py-4 border-t">
                <p>Este design utiliza os dados principais do produto (Nome, Preço, SKU, etc.).</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
