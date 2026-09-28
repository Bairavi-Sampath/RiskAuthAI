import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  highlight?: boolean;
  accentColor?: string;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  trend,
  highlight,
  icon,
}) => {
  return (
    <div
      className={`p-5 rounded-lg border transition-all duration-200 ${
        highlight
          ? 'bg-[#FFFFFF] dark:bg-[#1A1A1A] border-[#E6C65C] dark:border-[#E6C65C]/60 shadow-sm'
          : 'bg-[#FFFFFF] dark:bg-[#171717] border-[#E8E6DF] dark:border-[#262626]'
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93]">
          {label}
        </span>
        {icon && (
          <div className="text-[#66635C] dark:text-[#9E9B93] p-1 rounded">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-3">
        <span className="text-2xl font-bold font-mono tracking-tight text-[#111111] dark:text-[#F4F4F2] tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>

        {trend && (
          <span
            className={`text-xs font-mono font-medium ${
              trend.direction === 'up'
                ? 'text-rose-600 dark:text-rose-400'
                : trend.direction === 'down'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-neutral-500'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-2 text-xs text-[#66635C] dark:text-[#9E9B93]">
          {subtext}
        </p>
      )}
    </div>
  );
};
