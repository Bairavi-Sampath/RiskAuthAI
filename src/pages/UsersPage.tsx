import React, { useEffect, useState } from 'react';
import { Filter, Search, UserCheck } from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import { UserAccount } from '../services/types';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const filteredUsers = users.filter((u) => {
    // Search query filter
    const matchesQuery =
      searchQuery.trim() === '' ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));

    // Risk level filter
    const matchesRisk =
      selectedRiskLevel === 'ALL' || u.riskLevel === selectedRiskLevel;

    // Status filter
    const matchesStatus =
      selectedStatus === 'ALL' || u.status === selectedStatus;

    return matchesQuery && matchesRisk && matchesStatus;
  });

  return (
    <DashboardLayout activePageTitle="User Directory" activeBreadcrumb="User Directory">
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-6 border-b border-[#E8E6DF] dark:border-[#262626]">
          <h1 className="text-2xl font-bold tracking-tight text-[#111111] dark:text-[#F4F4F2]">
            User Directory
          </h1>
          <p className="mt-1 text-xs text-[#66635C] dark:text-[#9E9B93]">
            Registered accounts, trust status, and average authentication risk.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8A867E] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name, email, or role..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E8E6DF] dark:border-[#2E2E2E] bg-white dark:bg-[#161616] text-[#111111] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#E6C65C]"
            />
          </div>

          {/* Risk Level Filter Dropdown */}
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

          {/* Account Status Filter Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-[#E8E6DF] dark:border-[#2E2E2E] bg-white dark:bg-[#161616] text-[#111111] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#E6C65C]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Under Review">Under Review</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="p-6 rounded-xl border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#161616]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E8E6DF] dark:border-[#262626] text-[#8A867E]">
                  <th className="py-2.5 px-3 font-semibold">User</th>
                  <th className="py-2.5 px-3 font-semibold">Role</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Avg Risk Score</th>
                  <th className="py-2.5 px-3 font-semibold">Risk Level</th>
                  <th className="py-2.5 px-3 font-semibold">Last Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EEE6] dark:divide-[#222222]">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-[#F8F7F3] dark:hover:bg-[#1C1C1C]">
                      <td className="py-3 px-3">
                        <div>
                          <span className="font-semibold text-[#111111] dark:text-white block">
                            {user.name}
                          </span>
                          <span className="text-[11px] text-[#8A867E]">{user.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[#66635C] dark:text-[#9E9B93]">
                        {user.role}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded ${
                            user.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#111111] dark:text-white">
                        {user.avgRiskScore}%
                      </td>
                      <td className="py-3 px-3">
                        <RiskBadge level={user.riskLevel} />
                      </td>
                      <td className="py-3 px-3 text-[#66635C] dark:text-[#9E9B93]">
                        {user.lastLogin}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#8A867E]">
                      No matching users found for the selected filters.
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
