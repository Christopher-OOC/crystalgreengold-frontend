import React from 'react';
import { LucideIcon, TrendingUp } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Card } from '@/shared/ui/Card';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: string;
  chartData?: any[];
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  color = "amber",
  chartData = [
    { value: 10 }, { value: 25 }, { value: 15 }, { value: 30 }, { value: 20 }, { value: 40 }
  ]
}) => {
  const colorClasses: Record<string, string> = {
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  };

  const chartColors: Record<string, string> = {
    amber: "#f59e0b",
    emerald: "#10b981",
    blue: "#3b82f6",
    purple: "#a855f7",
    orange: "#f97316",
  };

  return (
    <Card 
      rounded="xl" 
      className="p-3 flex flex-col justify-between group hover:border-amber-500/30 dark:hover:border-white/10 transition-all"
    >
      <div className="flex justify-between items-start mb-2">
        <div className={`p-1.5 rounded-lg border ${colorClasses[color]}`}>
          <Icon size={16} />
        </div>
        {trend && (
          <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full text-[9px] font-bold">
            <TrendingUp size={8} />
            <span>{trend}</span>
          </div>
        )}
      </div>

      <div>
        <p className="text-slate-400 dark:text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-0.5">{label}</p>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
      </div>

      <div className="h-8 mt-2 -mx-1 opacity-50 group-hover:opacity-100 transition-opacity">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors[color]} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={chartColors[color]} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={chartColors[color]} 
              strokeWidth={2}
              fillOpacity={1} 
              fill={`url(#gradient-${color})`} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
