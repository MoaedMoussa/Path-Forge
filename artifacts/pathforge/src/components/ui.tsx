import React from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';

export function Button({ className, variant = 'default', size = 'default', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'ghost' | 'destructive', size?: 'default' | 'sm' | 'lg' | 'icon' }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded font-mono text-xs uppercase tracking-wider transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-primary text-primary-foreground hover:bg-primary/90": variant === 'default',
          "border border-border bg-transparent hover:bg-muted": variant === 'outline',
          "hover:bg-muted hover:text-foreground": variant === 'ghost',
          "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === 'destructive',
          "h-9 px-4 py-2": size === 'default',
          "h-8 rounded px-3": size === 'sm',
          "h-10 rounded px-8": size === 'lg',
          "h-9 w-9": size === 'icon',
        },
        className
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-9 w-full rounded border border-border bg-black/50 px-3 py-1 text-sm font-mono shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-xs font-mono tracking-wider leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground", className)}
      {...props}
    />
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded border border-border bg-card text-card-foreground shadow-sm", className)} {...props} />
  );
}

export function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "secondary" | "outline" | "destructive" }) {
  return (
    <div className={cn(
      "inline-flex items-center rounded border px-2.5 py-0.5 text-xs font-mono font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      {
        "border-transparent bg-primary text-primary-foreground hover:bg-primary/80": variant === 'default',
        "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === 'secondary',
        "border-border text-foreground": variant === 'outline',
        "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80": variant === 'destructive',
      },
      className
    )} {...props} />
  );
}
