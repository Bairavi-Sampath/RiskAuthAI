import React from 'react';
import { Sliders } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { RiskSimulator } from '../components/simulator/RiskSimulator';

export const RiskAnalysisPage: React.FC = () => {
  return (
    <DashboardLayout activePageTitle="Risk Analysis" activeBreadcrumb="Simulator">
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-6 border-b border-[#E8E6DF] dark:border-[#262626]">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#66635C] dark:text-[#9E9B93] mb-1">
            <Sliders className="w-4 h-4 text-[#E6C65C]" />
            <span>Interactive Risk Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111111] dark:text-[#F4F4F2]">
            Risk Analysis & Model Simulator
          </h1>
          <p className="mt-1 text-xs text-[#66635C] dark:text-[#9E9B93]">
            Evaluate custom login signals against the trained Random Forest model and examine real-time SHAP feature attributions and policy enforcement.
          </p>
        </div>

        {/* Live Simulator Component */}
        <RiskSimulator showConsoleAction={true} />
      </div>
    </DashboardLayout>
  );
};
