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

type Status = 'success' | 'warning' | 'error';

const historyItems = [
  {
    id: 0,
    detail: 'Exclusão de Produto',
    dateTime: '10/04/2025 12:44:35',
    product: '17',
    label: '',
    status: 'success' as Status,
  },
  {
    id: 1,
    detail: 'Edição de Template de Etiqueta',
    dateTime: '10/04/2025 14:21:17',
    product: '',
    label: '11',
    status: 'success' as Status,
  },
  {
    id: 2,
    detail: 'Edição de Produto',
    dateTime: '11/04/2025 08:01:56',
    product: '1',
    label: '8',
    status: 'warning' as Status,
  },
  {
    id: 3,
    detail: 'Tentativa de acesso a API negada',
    dateTime: '11/04/2025 11:48:11',
    product: '',
    label: '',
    status: 'error' as Status,
  },
];

const statusConfig = {
  success: { color: 'bg-green-500', text: 'Sucesso' },
  warning: { color: 'bg-yellow-500', text: 'Alerta' },
  error: { color: 'bg-red-500', text: 'Erro' },
};

export default function HistoricoClient() {
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
              {historyItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="bg-accent text-accent-foreground rounded-md w-8 h-8 flex items-center justify-center font-semibold">
                      {item.id}
                    </div>
                  </TableCell>
                  <TableCell>{item.detail}</TableCell>
                  <TableCell>{item.dateTime}</TableCell>
                  <TableCell>{item.product}</TableCell>
                  <TableCell>{item.label}</TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <div
                        className={`h-4 w-4 rounded-full border-2 ${
                          statusConfig[item.status].color
                        }`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 text-sm text-muted-foreground p-4 bg-accent rounded-md">
            <p>O sistema registrou um acesso negado na API em 11/04/2025 as 11:48:11</p>
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
