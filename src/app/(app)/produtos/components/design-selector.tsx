'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const designs = [
  { id: 'template-1', name: 'Template 1', imageUrl: '/images/template1.jpg', fields: ['Nome do Produto', 'Valor', 'SKU', 'Data'] },
  { id: 'template-2', name: 'Template 2', imageUrl: '/images/template2.jpg', fields: ['Nome do Produto', 'Valor', 'SKU', 'Data', 'Unidade de Medida'] },
  { id: 'template-3', name: 'Template 3', imageUrl: '/images/template3.jpg', fields: ['Nome do Produto', 'Valor', 'Marca', 'texto1', 'texto2'] },
  { id: 'template-4', name: 'Template 4', imageUrl: '/images/template4.jpg', fields: ['Nome do Produto', 'Valor', 'Marca', 'texto1', 'texto2', 'Valor Promocional'] },
  { id: 'template-5', name: 'Template 5', imageUrl: '/images/template5.jpg', fields: ['texto1'] },
  { id: 'template-6', name: 'Template 6', imageUrl: '/images/template6.jpg', fields: ['texto1'] },
  { id: 'template-7', name: 'Template 7', imageUrl: '/images/template7.jpg', fields: ['texto1', 'texto2'] },
  { id: 'template-8', name: 'Template 8', imageUrl: '/images/template8.jpg', fields: ['texto1', 'texto2'] }
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    placeholder={`Insira o Valor para ${field}`}
                    value={designData[field] || ''}
                    onChange={(e) => onDataChange(field, e.target.value)}
                    />
                </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
