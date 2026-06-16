import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  children, 
  className = '', 
  isLoading = false,
  disabled,
  ...props 
}) => {
  const baseStyles = "font-bold transition-all flex items-center justify-center space-x-2 group active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  
  const variants = {
    primary: "bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-xl shadow-emerald-600/20",
    secondary: "bg-emerald-50 dark:bg-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-800 text-emerald-700 dark:text-emerald-100",
    outline: "border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-emerald-950",
    ghost: "hover:bg-emerald-100 dark:hover:bg-white/5 text-emerald-600 dark:text-emerald-300"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        children
      )}
    </button>
  );
};
