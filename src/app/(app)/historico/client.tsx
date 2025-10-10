'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { format } from 'date-fns';

type Status = 'success' | 'warning' | 'error';

const statusConfig = {
  success: { color: 'bg-green-500', text: 'Sucesso' },
  warning: { color: 'bg-yellow-500', text: 'Alerta' },
  error: { color: 'bg-red-500', text: 'Erro' },
};

export default function HistoricoClient() {
  const firestore = useFirestore();
  const historyCollection = collection(firestore, 'command_logs');
  const { data: historyItems, isLoading } = useCollection(historyCollection);
  
  const getStatus = (detail: string): Status => {
      if (detail.toLowerCase().includes('negada') || detail.toLowerCase().includes('fail')) {
          return 'error';
      }
      if (detail.toLowerCase().includes('edição')) {
          return 'warning';
      }
      return 'success';
  }

  if (isLoading) {
    return <div>A carregar...</div>;
  }

  return (
    <Card>
      <CardHeader>
        {/* Can be used for filters in the future */}
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Identificador</TableHead>
                <TableHead>Detalhe</TableHead>
                <TableHead>Data e Hora</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Etiqueta</TableHead>
                <TableHead className="w-24 text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyItems?.map((item: any) => {
                const status = getStatus(item.details);
                return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="bg-accent text-accent-foreground rounded-md w-8 h-8 flex items-center justify-center font-semibold">
                      {item.id.substring(0, 4)}
                    </div>
                  </TableCell>
                  <TableCell>{item.details}</TableCell>
                  <TableCell>{format(new Date(item.timestamp), 'dd/MM/yyyy HH:mm:ss')}</TableCell>
                  <TableCell>{item.product || ''}</TableCell>
                  <TableCell>{item.label || ''}</TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <div
                        className={`h-4 w-4 rounded-full border-2 ${
                          statusConfig[status].color
                        }`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-start gap-6 pt-6">
        {Object.entries(statusConfig).map(([key, s]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`h-4 w-4 rounded-full border-2 ${s.color}`} />
            <span className="text-sm text-muted-foreground">{s.text}</span>
          </div>
        ))}
      </CardFooter>
    </Card>
  );
}
