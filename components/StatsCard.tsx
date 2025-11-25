import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: 'blue' | 'green' | 'red' | 'purple' | 'orange';
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp,
  color = "blue"
}) => {
  const styles = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-l-blue-500" },
    green: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-l-emerald-500" },
    red: { bg: "bg-rose-50", text: "text-rose-600", border: "border-l-rose-500" },
    purple: { bg: "bg-violet-50", text: "text-violet-600", border: "border-l-violet-500" },
    orange: { bg: "bg-amber-50", text: "text-amber-600", border: "border-l-amber-500" },
  };

  const currentStyle = styles[color] || styles.blue;

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 p-6 transition-all hover:-translate-y-1 hover:shadow-lg group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{title}</h3>
        <div className={`p-2.5 rounded-lg ${currentStyle.bg} ${currentStyle.text} transition-transform group-hover:scale-110`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h2>
        {trend && (
          <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${trendUp ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {trend}
          </div>
        )}
      </div>
    </div>
  );
};