import * as React from 'react';
import { cn } from '../../utils/slotManagementHelper';

type Variant = 'default' | 'secondary' | 'ghost' | 'destructive';
type Size = 'default' | 'sm' | 'lg' | 'icon';

const variantClasses: Record<Variant, string> = {
  default: 'bg-[#5f6FFF] text-white hover:bg-[#4e5ce6] focus:ring-[#5f6FFF]',
  secondary: 'bg-muted text-foreground hover:bg-muted/80',
  ghost: 'hover:bg-muted/50 bg-transparent',
  destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
};

const sizeClasses: Record<Size, string> = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 px-3',
  lg: 'h-11 px-8',
  icon: 'h-10 w-10 p-0',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = 'Button';
