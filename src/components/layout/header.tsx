import React from 'react';

interface HeaderProps {
  title: string;
  children?: React.ReactNode;
}

export default function Header({ title, children }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 md:p-6 border-b bg-card">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <div className="flex items-center space-x-2">{children}</div>
    </header>
  );
}
