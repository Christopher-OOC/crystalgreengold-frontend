import React, { InputHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: LucideIcon;
}

export const Input: React.FC<InputProps> = ({ label, icon: Icon, id, className, ...props }) => (
  <div className="space-y-1">
    <label htmlFor={id} className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors">
        <Icon size={16} />
      </div>
      <input
        id={id}
        className={`w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm ${className}`}
        {...props}
      />
    </div>
  </div>
);
