import * as React from "react";
import { cn } from "../../utils/slotManagementHelper";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        // ——— base shape & spacing ———
        "flex h-10 w-full rounded-lg px-3 py-2 text-sm",
        // ——— light‑theme colours ———
        "bg-white border border-gray-300 placeholder:text-gray-500",
        // ——— dark‑theme overrides ———
        "dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400",
        // ——— focus & disabled states ———
        "focus:outline-none focus:ring-2 focus:ring-[#5f6FFF] focus:border-transparent",
        "disabled:opacity-50 disabled:pointer-events-none",
        // ——— caller‑supplied classes ———
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
