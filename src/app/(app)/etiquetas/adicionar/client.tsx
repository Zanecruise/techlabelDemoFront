'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirestore, setDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdicionarEtiquetaClient() {
  const router = useRouter();
  const firestore = useFirestore();
  const [macAddress, setMacAddress] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!macAddress || !firestore) {
      alert('Por favor, preencha o endereço MAC.');
      return;
    }

    const labelsCollection = collection(firestore, 'labels');
    // We can use the MAC address as the document ID if it's unique
    const labelId = macAddress.replace(/:/g, '');
    const labelRef = doc(labelsCollection, labelId);
    
    await setDocumentNonBlocking(labelRef, {
      macAddress,
      productId: null,
    }, { merge: true });

    // Log the creation
    const commandLogsCollection = collection(firestore, 'command_logs');
    const logRef = doc(commandLogsCollection);
    await setDocumentNonBlocking(logRef, {
        command: `Nova etiqueta criada: ${macAddress}`,
        details: `Etiqueta com MAC Address ${macAddress} foi adicionada.`,
        timestamp: new Date().toISOString(),
        label: labelId,
    }, { merge: true });


    router.push('/etiquetas');
  };


  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6 md:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="mac-address">Endereço MAC</Label>
              <Input
                id="mac-address"
                placeholder="00:1A:2B:3C:4D:5E"
                value={macAddress}
                onChange={(e) => setMacAddress(e.target.value)}
              />
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
