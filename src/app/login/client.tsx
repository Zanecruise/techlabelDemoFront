'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClipboardCheck, Loader2 } from 'lucide-react';
import { useAuth, initiateEmailSignIn, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged } from 'firebase/auth';

export default function LoginClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (user && !isUserLoading) {
        setIsLoggingIn(false);
        router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = () => {
    if (email && password) {
      setIsLoggingIn(true);
      initiateEmailSignIn(auth, email, password, (error) => {
        setIsLoggingIn(false);
        toast({
            variant: 'destructive',
            title: 'Login Falhou',
            description: 'E-mail ou senha inválidos. Por favor, tente novamente.'
        });
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro de Login',
        description: 'Por favor, insira o e-mail e a senha.',
      });
    }
  };

  // If user is already logged in, the AppLayout will handle redirection.
  // Show a loader on this page only while the login process is active.
  if (isUserLoading) {
       return (
        <main className="flex min-h-screen items-center justify-center bg-background p-4">
            <Loader2 className="animate-spin h-16 w-16 text-primary" />
        </main>
      )
  }


  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl font-bold mb-4">TechLabel</h1>
          <div className="bg-primary/10 p-6 rounded-full">
            <div className="bg-primary/20 p-6 rounded-full">
              <ClipboardCheck className="h-32 w-32 text-primary" />
            </div>
          </div>
        </div>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Acesse sua conta para gerenciar as etiquetas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleLogin} disabled={isLoggingIn}>
              {isLoggingIn ? <Loader2 className="animate-spin" /> : 'Continuar'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
