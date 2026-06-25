import React, { InputHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: LucideIcon;
}

export const Input: React.FC<InputProps> = ({ label, icon: Icon, id, className = '', ...props }) => (
  <div className="space-y-1">
    <label htmlFor={id} className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-300 ml-1">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 group-focus-within:text-amber-400 transition-colors">
        <Icon size={16} />
      </div>
      <input
        id={id}
        className={`w-full bg-white/50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-xl py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all placeholder:text-emerald-400 dark:placeholder:text-emerald-600 text-sm text-emerald-950 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
    </div>
  </div>
);
