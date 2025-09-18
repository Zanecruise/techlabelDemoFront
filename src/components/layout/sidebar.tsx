'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart, Home, BotMessageSquare, Settings, ScanLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/smart-layout', label: 'Smart Layout', icon: BotMessageSquare },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <aside className="w-16 flex flex-col items-center space-y-4 py-4 bg-card border-r">
        <Link href="/" className="flex items-center justify-center">
            <ScanLine className="h-7 w-7 text-primary" />
            <span className="sr-only">LabelSync</span>
        </Link>
        <nav className="flex flex-col items-center space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center justify-center h-10 w-10 rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col items-center space-y-2">
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                    className={cn(
                        'flex items-center justify-center h-10 w-10 rounded-lg transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                    >
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Settings</span>
                    </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>Settings</p>
                </TooltipContent>
            </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
