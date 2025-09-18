'use client';
import { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Type, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type Tool = 'pencil' | 'text' | 'image';

export default function EditarEtiquetaClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('pencil');
  const [color, setColor] = useState('#000000');
  const router = useRouter();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Set a white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = nativeEvent;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'pencil') {
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
      setIsDrawing(true);
    }
  };

  const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool !== 'pencil') return;
    const { offsetX, offsetY } = nativeEvent;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(offsetX, offsetY);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'pencil') {
      ctx.closePath();
      setIsDrawing(false);
    }
  };
  
  const handleAddText = () => {
    const text = prompt('Digite o texto:');
    if (text && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            ctx.fillStyle = color;
            ctx.font = '20px Arial';
            ctx.fillText(text, 50, 50); // Example position
        }
    }
  }


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-center items-center bg-gray-200 rounded-md">
              <canvas
                ref={canvasRef}
                width={400}
                height={300}
                className="cursor-crosshair rounded-md shadow-lg"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold">Ferramentas</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant={tool === 'pencil' ? 'secondary' : 'outline'} onClick={() => setTool('pencil')}>
                <Pencil className="mr-2" /> Desenhar
              </Button>
              <Button variant={tool === 'text' ? 'secondary' : 'outline'} onClick={handleAddText}>
                <Type className="mr-2" /> Texto
              </Button>
            </div>
             <div className="space-y-2">
                <Label htmlFor="color-picker">Cor</Label>
                <Input id="color-picker" type="color" value={color} onChange={(e) => setColor(e.target.value)} className="p-1 h-10"/>
            </div>
          </CardContent>
        </Card>
        
        <Card>
            <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold">Templates</h3>
                 <div className="grid grid-cols-2 gap-2">
                    <Image src="https://picsum.photos/seed/template1/150/100" alt="Template 1" width={150} height={100} className="rounded-md object-cover" />
                    <Image src="https://picsum.photos/seed/template2/150/100" alt="Template 2" width={150} height={100} className="rounded-md object-cover" />
                 </div>
                 <h3 className="font-semibold">Templates Promocionais</h3>
                 <div className="grid grid-cols-2 gap-2">
                    <Image src="https://picsum.photos/seed/promo1/150/100" alt="Template Promocional 1" width={150} height={100} className="rounded-md object-cover" />
                    <Image src="https://picsum.photos/seed/promo2/150/100" alt="Template Promocional 2" width={150} height={100} className="rounded-md object-cover" />
                 </div>
            </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button variant="outline" className="w-full" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button className="w-full">
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}
