'use client';

import { ChartPie, Package, History, Mail, Phone, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Label, Pie, PieChart } from 'recharts';
import Header from '@/components/layout/header';
import { List, ListItem } from '@/components/ui/list';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, limit, orderBy, query } from 'firebase/firestore';

const chartConfig = {
  count: {
    label: 'Count',
  },
  linked: {
    label: 'Vinculadas',
    color: 'hsl(var(--chart-1))',
  },
  unlinked: {
    label: 'Não Vinculadas',
    color: 'hsl(var(--chart-2))',
  },
   withLabel: {
    label: 'Com Etiqueta',
    color: 'hsl(var(--chart-1))',
  },
  withoutLabel: {
    label: 'Sem Etiqueta',
    color: 'hsl(var(--chart-2))',
  },
};


export default function DashboardPage() {
    const firestore = useFirestore();

    const labelsCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'labels');
    }, [firestore]);
    const { data: labels, isLoading: isLoadingLabels } = useCollection(labelsCollection);

    const productsCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'products');
    }, [firestore]);
    const { data: products, isLoading: isLoadingProducts } = useCollection(productsCollection);

    const historyCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'command_logs'), orderBy('timestamp', 'desc'), limit(3));
    }, [firestore]);
    const { data: historyItems, isLoading: isLoadingHistory } = useCollection(historyCollection);
    
    const getStatus = (detail: string) => {
      if (detail.toLowerCase().includes('negada') || detail.toLowerCase().includes('fail') || detail.toLowerCase().includes('failed')) {
          return 'error';
      }
      if (detail.toLowerCase().includes('edição') || detail.toLowerCase().includes('generated') || detail.toLowerCase().includes('update')) {
          return 'warning';
      }
      return 'success';
  }


    const labelsChartData = useMemoFirebase(() => {
        if (!labels) return [];
        const linked = labels.filter((label: any) => label.productId).length;
        const unlinked = labels.length - linked;
        return [
            { name: 'linked', count: linked, fill: 'var(--color-linked)' },
            { name: 'unlinked', count: unlinked, fill: 'var(--color-unlinked)' },
        ];
    }, [labels]);

    const productsChartData = useMemoFirebase(() => {
        if (!products) return [];
        const withLabel = products.filter((product: any) => product.labelId).length;
        const withoutLabel = products.length - withLabel;
        return [
            { name: 'withLabel', count: withLabel, fill: 'var(--color-withLabel)' },
            { name: 'withoutLabel', count: withoutLabel, fill: 'var(--color-withoutLabel)' },
        ];
    }, [products]);
    
    const totalLabels = labels?.length || 0;
    const totalProducts = products?.length || 0;
    
    const isLoading = isLoadingLabels || isLoadingProducts || isLoadingHistory;


  return (
    <div className="flex flex-col h-full">
      <Header title="Tela de Início" />
      <main className="flex-1 grid md:grid-cols-2 lg:grid-cols-2 gap-8 p-4 md:p-6 lg:p-8 overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ChartPie className="mr-2" />
              Etiquetas
            </CardTitle>
          </CardHeader>
          <CardContent>
             {isLoading ? (
                 <div className="flex justify-center items-center h-[250px]"><Loader2 className="animate-spin" /></div>
             ) : (
                <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[250px]"
                >
                <PieChart>
                    <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                    data={labelsChartData}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={60}
                    strokeWidth={5}
                    >
                    <Label
                        content={({ viewBox }) => {
                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                            return (
                            <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                                dominantBaseline="middle"
                            >
                                <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                                >
                                {totalLabels.toLocaleString()}
                                </tspan>
                                <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                                >
                                Total
                                </tspan>
                            </text>
                            );
                        }
                        }}
                    />
                    </Pie>
                </PieChart>
                </ChartContainer>
             )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2" />
              Produtos
            </CardTitle>
          </CardHeader>
          <CardContent>
             {isLoading ? (
                 <div className="flex justify-center items-center h-[250px]"><Loader2 className="animate-spin" /></div>
             ) : (
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={productsChartData}
                  dataKey="count"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {totalProducts.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Total
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="mr-2" />
              Histórico
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
             {isLoading ? (
                  <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" /></div>
             ) : (
                <List>
                {historyItems && historyItems.map((item: any) => {
                    const status = getStatus(item.command);
                    return(
                    <ListItem key={item.id} className="flex justify-between items-center">
                      <span className="truncate pr-4">{item.command}</span>
                      <div
                        className={`h-4 w-4 rounded-full border-2 flex-shrink-0 ${
                          status === 'success'
                            ? 'bg-green-500'
                            : status === 'warning'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                      />
                    </ListItem>
                    )
                })}
                {historyItems?.length === 0 && (
                    <div className="text-center text-muted-foreground py-10">
                        Nenhum histórico encontrado.
                    </div>
                )}
                </List>
             )}
          </CardContent>
          <div className="p-6 pt-0">
             <Button asChild className="w-full">
                <Link href="/historico">
                    Ver histórico completo
                </Link>
             </Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 rounded-lg bg-accent p-3">
              <Phone className="h-6 w-6 text-primary" />
              <span>+55 (45) 99924-1456</span>
            </div>
            <div className="flex items-center gap-4 rounded-lg bg-accent p-3">
              <Mail className="h-6 w-6 text-primary" />
              <span>suporte@techlabel.com</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
