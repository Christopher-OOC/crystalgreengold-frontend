import React from 'react';
import { User, Users, ArrowRightLeft, PieChart as PieIcon, BarChart } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card } from '@/shared/ui/Card';
import { formatCurrency } from '@/lib/utils/format';
import { DashboardMetrics,NetworkStructureProps,FinancialMetricsProps } from '@/lib/types/metrics.types';
// import { useDashboardStore, selectDashboardMetrics } from '../../store';

export const NetworkStructure = ({ data }: NetworkStructureProps) => {
  const nodes = [
    { label: 'Sponsor',  name: data?.sponsorUsername || '—', icon: User },
    { label: 'Placer',   name: data?.placerUsername || '—', icon: User },
    { label: 'Left Leg', name: data?.leftLegUsername || '—', icon: ArrowRightLeft },
    { label: 'Right Leg',name: data?.rightLegUsername || '—', icon: ArrowRightLeft },
  ];

  return (
    <Card className="p-3">
      <div className="flex items-center space-x-2 mb-3">
        <div className="p-1 bg-emerald-500/10 text-emerald-500 rounded-lg">
          <Users size={16} />
        </div>
        <h3 className="text-base font-bold text-emerald-950 dark:text-white">Network Structure</h3>
      </div>

      <div className="space-y-2">
        {nodes.map((node, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-white/5 border border-emerald-50 dark:border-white/5 hover:border-amber-400/20 dark:hover:border-white/10 transition-all">
            <div className="flex items-center space-x-3">
              <div className="p-1.5 bg-white dark:bg-emerald-900 rounded-lg text-emerald-400 shadow-sm border border-emerald-50 dark:border-transparent">
                <node.icon size={16} />
              </div>
              <div>
                <p className="text-[9px] font-bold text-emerald-400 dark:text-emerald-600 uppercase tracking-widest">{node.label}</p>
                <p className="text-xs font-medium text-emerald-800 dark:text-emerald-100">{node.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const FinancialMetrics = ({ data, analysisData, isAdmin }: FinancialMetricsProps) => {
  const metrics = [
    { label: 'Total Left PV',       value: String(data?.monthlyLeftPv ?? 0),              trend: '↑ 0%' },
    { label: 'Total Right PV',      value: String(data?.monthlyRightPv ?? 0),             trend: '↑ 0%' },
    { label: 'Available Balance',   value: formatCurrency(data?.availableBalance ?? 0),    isMoney: true },
    { label: 'Daily Binary Earning',value: formatCurrency(data?.dailyBinaryEarning ?? 0), isMoney: true },
    ...(isAdmin ? [{ label: 'Accumulated PVs', value: analysisData?.accumulatedPvs ?? 0, isMoney: false }] : []),
  ];

  return (
    <Card className="p-3">
      <div className="flex items-center space-x-2 mb-3">
        <div className="p-1 bg-purple-500/10 text-purple-500 rounded-lg">
          <User size={16} />
        </div>
        <h3 className="text-base font-bold text-emerald-950 dark:text-white">Financial Metrics</h3>
      </div>

      <div className="space-y-0.5">
        {metrics.map((metric, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-emerald-50 dark:border-white/5 last:border-0">
            <div className="flex items-center space-x-2">
              <div className={`w-1 h-1 rounded-full ${metric.isMoney ? 'bg-amber-400' : 'bg-purple-500'}`} />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{metric.label}</span>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-emerald-950 dark:text-white">{metric.value}</p>
              {metric.trend && <p className="text-[9px] text-emerald-600 dark:text-emerald-500 font-bold">{metric.trend}</p>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const SalesDistribution = ({ data }: { data: DashboardMetrics | null }) => {
  const leftPV  = data?.monthlyLeftPv   ?? 0;
  const rightPV = data?.monthlyRightPv  ?? 0;
  const salesPV = data?.monthlySalesPv  ?? 0;
  const total   = leftPV + rightPV + salesPV || 1; // avoid divide-by-zero

  const chartData = [
    { name: 'Left PV',  value: Math.round((leftPV  / total) * 100) },
    { name: 'Right PV', value: Math.round((rightPV / total) * 100) },
    { name: 'Sales PV', value: Math.round((salesPV / total) * 100) },
  ];
  const COLORS = ['#f59e0b', '#10b981', '#3b82f6'];

  return (
    <Card className="p-3">
      <div className="flex items-center space-x-2 mb-3">
        <div className="p-1 bg-yellow-500/10 text-yellow-500 rounded-lg">
          <PieIcon size={16} />
        </div>
        <h3 className="text-base font-bold text-emerald-950 dark:text-white">Sales Distribution</h3>
      </div>

      <div className="h-[140px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-xl font-bold text-emerald-950 dark:text-white">100%</p>
            <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest">Total</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {chartData.map((item, i) => (
          <div key={i} className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">{item.name}</span>
            </div>
            <p className="text-xs font-bold text-emerald-950 dark:text-white">{item.value}%</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const MonthlyPVAnalysis = ({ data }: { data: DashboardMetrics | null }) => {
  const now = new Date();
  const monthLabel = now.toLocaleString('default', { month: 'short' }); // e.g. "Mar"

  const chartData = [
    {
      name: monthLabel,
      left:  data?.monthlyLeftPv  ?? 0,
      right: data?.monthlyRightPv ?? 0,
    },
  ];

  return (
    <Card className="p-3">
      <div className="flex items-center space-x-2 mb-3">
        <div className="p-1 bg-emerald-500/10 text-emerald-500 rounded-lg">
          <BarChart size={16} />
        </div>
        <h3 className="text-base font-bold text-emerald-950 dark:text-white">Monthly PV Analysis</h3>
      </div>

      <div className="h-[170px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ReBarChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-black/5 dark:text-white/5"
              vertical={false}
            />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 9 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 9 }}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(245, 158, 11, 0.05)' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="left" fill="#3b82f6" radius={[3, 3, 0, 0]} barSize={10} />
            <Bar dataKey="right" fill="#f59e0b" radius={[3, 3, 0, 0]} barSize={10} />
          </ReBarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex justify-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Left PV</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Right PV</span>
        </div>
      </div>
    </Card>
  );
};
