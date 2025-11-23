import React from 'react';
import { cn } from '@/utils/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
        const variants = {
            primary: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-lg shadow-primary/20 border-transparent',
            secondary: 'bg-surface-light dark:bg-surface-dark backdrop-blur-md border-gray-200 dark:border-gray-700 text-foreground hover:bg-gray-100 dark:hover:bg-gray-800',
            outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary/10',
            ghost: 'bg-transparent text-foreground hover:bg-gray-100 dark:hover:bg-gray-800',
            danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20',
        };

        const sizes = {
            sm: 'h-8 px-3 text-xs',
            md: 'h-10 px-4 py-2',
            lg: 'h-12 px-6 text-lg',
            icon: 'h-10 w-10 p-2 flex items-center justify-center',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'relative inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                    'active:scale-95 disabled:pointer-events-none disabled:opacity-50',
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
