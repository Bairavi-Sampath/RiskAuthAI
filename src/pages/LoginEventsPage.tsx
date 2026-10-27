import React, { useEffect, useState } from 'react';
import { Filter, RefreshCw, Search } from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import { LoginEvent, RiskLevel } from '../services/types';

export const LoginEventsPage: React.FC = () => {
  const [events, setEvents] = useState<LoginEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<LoginEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getLoginEvents();
      setEvents(data);
      setFilteredEvents(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    let result = [...events];

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.userName.toLowerCase().includes(query) ||
          e.userEmail.toLowerCase().includes(query) ||
          e.ipAddress.includes(query) ||
          e.location.toLowerCase().includes(query)
      );
    }

    if (selectedRiskLevel !== 'ALL') {
      result = result.filter((e) => e.riskLevel === selectedRiskLevel);
    }

    setFilteredEvents(result);
  }, [searchQuery, selectedRiskLevel, events]);

  return (
    <DashboardLayout activePageTitle="Login Activity" activeBreadcrumb="Login Activity">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E6DF] dark:border-[#262626]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111111] dark:text-[#F4F4F2]">
              Login Activity
            </h1>
            <p className="mt-1 text-xs text-[#66635C] dark:text-[#9E9B93]">
              Authentication history and evaluated risk scores.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchEvents}
            className="p-2 rounded-lg border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#1A1A1A] text-[#66635C] dark:text-[#9E9B93] hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8A867E] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user, email, or location..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E8E6DF] dark:border-[#2E2E2E] bg-white dark:bg-[#161616] text-[#111111] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#E6C65C]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#8A867E]" />
            <select
              value={selectedRiskLevel}
              onChange={(e) => setSelectedRiskLevel(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-[#E8E6DF] dark:border-[#2E2E2E] bg-white dark:bg-[#161616] text-[#111111] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#E6C65C]"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">LOW Risk</option>
              <option value="MEDIUM">MEDIUM Risk</option>
              <option value="HIGH">HIGH Risk</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="p-6 rounded-xl border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#161616]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E8E6DF] dark:border-[#262626] text-[#8A867E]">
                  <th className="py-2.5 px-3 font-semibold">User</th>
                  <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                  <th className="py-2.5 px-3 font-semibold">Location</th>
                  <th className="py-2.5 px-3 font-semibold">Risk Score</th>
                  <th className="py-2.5 px-3 font-semibold">Risk Level</th>
                  <th className="py-2.5 px-3 font-semibold">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EEE6] dark:divide-[#222222]">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-[#F8F7F3] dark:hover:bg-[#1C1C1C]">
                      <td className="py-3 px-3">
                        <div>
                          <span className="font-semibold text-[#111111] dark:text-white block">
                            {evt.userName}
                          </span>
                          <span className="text-[11px] text-[#8A867E]">{evt.userEmail}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[#66635C] dark:text-[#9E9B93]">
                        {evt.timestamp}
                      </td>
                      <td className="py-3 px-3 text-[#66635C] dark:text-[#9E9B93]">
                        {evt.location}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#111111] dark:text-white">
                        {evt.riskScore}%
                      </td>
                      <td className="py-3 px-3">
                        <RiskBadge level={evt.riskLevel} />
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 text-[11px] font-bold rounded ${
                            evt.decision === 'ALLOW'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : evt.decision === 'OTP'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {evt.decision}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#8A867E]">
                      No matching login events found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
