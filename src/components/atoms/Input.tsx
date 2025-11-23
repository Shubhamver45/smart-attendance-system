import React from 'react';
import { cn } from '@/utils/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, error, icon, ...props }, ref) => {
        return (
            <div className="relative w-full">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                        {icon}
                    </div>
                )}
                <input
                    ref={ref}
                    className={cn(
                        'flex h-10 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-surface-light/50 dark:bg-surface-dark/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm transition-all duration-200',
                        icon && 'pl-10',
                        error && 'border-red-500 focus-visible:ring-red-500',
                        className
                    )}
                    {...props}
                />
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
