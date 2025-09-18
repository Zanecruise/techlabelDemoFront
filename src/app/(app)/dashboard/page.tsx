'use client';

import { ChartPie, Package, History, Mail, Phone } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
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

const chartData = [
  { browser: 'chrome', visitors: 275, fill: 'var(--color-chrome)' },
  { browser: 'safari', visitors: 200, fill: 'var(--color-safari)' },
  { browser: 'firefox', visitors: 187, fill: 'var(--color-firefox)' },
];

const chartConfig = {
  visitors: {
    label: 'Visitors',
  },
  chrome: {
    label: 'Chrome',
    color: 'hsl(var(--chart-1))',
  },
  safari: {
    label: 'Safari',
    color: 'hsl(var(--chart-2))',
  },
  firefox: {
    label: 'Firefox',
    color: 'hsl(var(--chart-3))',
  },
};

const historyItems = [
  {
    id: 0,
    detail: 'Exclusão de Produto',
    status: 'success',
  },
  {
    id: 1,
    detail: 'Edição de Template de Etiqueta',
    status: 'success',
  },
  {
    id: 2,
    detail: 'Edição de Produto',
    status: 'warning',
  },
];

export default function DashboardPage() {
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
                  data={chartData}
                  dataKey="visitors"
                  nameKey="browser"
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
                              {chartData
                                .reduce((acc, curr) => acc + curr.visitors, 0)
                                .toLocaleString()}
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
                  data={chartData}
                  dataKey="visitors"
                  nameKey="browser"
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
                              {chartData
                                .reduce((acc, curr) => acc + curr.visitors, 0)
                                .toLocaleString()}
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
            <List>
              {historyItems.map((item) => (
                <ListItem key={item.id} className="flex justify-between items-center">
                  <span>{item.detail}</span>
                  <div
                    className={`h-4 w-4 rounded-full border-2 ${
                      item.status === 'success'
                        ? 'bg-green-500'
                        : item.status === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                  />
                </ListItem>
              ))}
            </List>
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
}