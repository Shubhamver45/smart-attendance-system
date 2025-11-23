import React from 'react';
import { cn } from '@/utils/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, hoverEffect = false, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'rounded-2xl border border-gray-200 dark:border-gray-800 bg-surface-light dark:bg-surface-dark backdrop-blur-md p-6 shadow-sm transition-all duration-300',
                    hoverEffect && 'hover:shadow-lg hover:-translate-y-1 hover:border-primary/30',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';
