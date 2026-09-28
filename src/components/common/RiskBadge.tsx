import React from 'react';
import { AuthDecision, RiskLevel } from '../../services/types';

interface RiskBadgeProps {
  level?: RiskLevel;
  decision?: AuthDecision;
  size?: 'sm' | 'md' | 'lg';
  showScore?: number;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  decision,
  size = 'md',
  showScore,
}) => {
  // If decision is provided, format decision
  if (decision) {
    const decisionConfig = {
      ALLOW: {
        label: 'Allowed',
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
        dot: 'bg-emerald-500',
      },
      OTP: {
        label: 'OTP Challenge',
        bg: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
        dot: 'bg-amber-500',
      },
      BLOCK: {
        label: 'Blocked',
        bg: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
        dot: 'bg-rose-500',
      },
    }[decision];

    const sizeClasses = {
      sm: 'text-xs px-2 py-0.5',
      md: 'text-xs px-2.5 py-1',
      lg: 'text-sm px-3 py-1.5',
    }[size];

    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium border rounded-md whitespace-nowrap ${decisionConfig.bg} ${sizeClasses}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${decisionConfig.dot}`} />
        <span>{decisionConfig.label}</span>
      </span>
    );
  }

  // If level is provided
  const config = {
    LOW: {
      label: 'Low Risk',
      color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
      dot: 'bg-emerald-500',
    },
    MEDIUM: {
      label: 'Medium Risk',
      color: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
      dot: 'bg-amber-500',
    },
    HIGH: {
      label: 'High Risk',
      color: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900',
      dot: 'bg-rose-500',
    },
  }[level || 'LOW'];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-md whitespace-nowrap ${config.color} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
      {typeof showScore === 'number' && (
        <span className="font-mono opacity-80 tabular-nums font-semibold">
          ({showScore}%)
        </span>
      )}
    </span>
  );
};
