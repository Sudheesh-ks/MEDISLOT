import * as React from 'react';
import { cn } from '../../utils/slotManagementHelper';


export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg px-3 py-2 text-sm',
        'bg-white border border-gray-300 placeholder:text-gray-500',
        'dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400',
        'focus:outline-none focus:ring-2 focus:ring-[#5f6FFF] focus:border-transparent',
        'disabled:opacity-50 disabled:pointer-events-none',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
