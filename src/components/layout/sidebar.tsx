'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Tag,
  Package,
  History,
  GitBranch,
  LogOut,
  ClipboardCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/etiquetas', label: 'Etiquetas', icon: Tag },
  { href: '/produtos', label: 'Produtos', icon: Package },
  { href: '/historico', label: 'Histórico', icon: History },
];

export default function Sidebar() {
  const pathname = usePathname();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/'); // Redirect to login page after sign out
      toast({
        title: 'Desconectado',
        description: 'Você saiu da sua conta com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível fazer logout. Tente novamente.',
      });
    }
  };

  return (
    <aside className="w-64 flex flex-col bg-card border-r p-4">
      <div className="flex items-center gap-2 px-2 py-4">
        <ClipboardCheck className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold">TechLabel</span>
      </div>
      <Separator />
      <nav className="flex flex-col gap-2 mt-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-accent',
                isActive && 'bg-accent text-primary font-semibold'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <LogOut className="h-5 w-5" />
              Sair
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Você será desconectado do sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Não</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>Sim</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </aside>
  );
}
