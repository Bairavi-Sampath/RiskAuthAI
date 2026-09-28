import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Download,
  Filter,
  Laptop,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import { RiskLevel, UserAccount } from '../services/types';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | RiskLevel>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Under Review' | 'Suspended'>('ALL');
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = riskFilter === 'ALL' || u.riskLevel === riskFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchesSearch && matchesRisk && matchesStatus;
  });

  return (
    <DashboardLayout activePageTitle="Users" activeBreadcrumb="User Directory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E6DF] dark:border-[#262626]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111111] dark:text-[#F4F4F2]">
              User Risk Profiles
            </h1>
            <p className="mt-1 text-xs text-[#66635C] dark:text-[#9E9B93]">
              Directory of organizational accounts with aggregate risk scores, device trust counts, and security baselines.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchUsers}
              className="p-2 rounded-lg border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#1A1A1A] text-[#66635C] dark:text-[#9E9B93] hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 rounded-xl border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#161616] space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-[#88857E] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by user name, email, department, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#E8E6DF] dark:border-[#2E2E2E] bg-white dark:bg-[#1A1A1A] text-[#111111] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#E6C65C]"
              />
            </div>

            {/* Risk filter */}
            <div className="md:col-span-3">
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value as any)}
                className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-[#E8E6DF] dark:border-[#2E2E2E] bg-white dark:bg-[#1A1A1A] text-[#111111] dark:text-white focus:outline-none"
              >
                <option value="ALL">All Risk Tiers</option>
                <option value="LOW">Low Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="HIGH">High Risk</option>
              </select>
            </div>

            {/* Status filter */}
            <div className="md:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-[#E8E6DF] dark:border-[#2E2E2E] bg-white dark:bg-[#1A1A1A] text-[#111111] dark:text-white focus:outline-none"
              >
                <option value="ALL">All Account Statuses</option>
                <option value="Active">Active</option>
                <option value="Under Review">Under Review</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-[#E8E6DF] dark:border-[#262626] bg-white dark:bg-[#161616] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAFAF8] dark:bg-[#1A1A1A] border-b border-[#E8E6DF] dark:border-[#262626] text-[#66635C] dark:text-[#9E9B93] uppercase font-semibold text-[10px]">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role & Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Avg Risk Score</th>
                  <th className="py-3 px-4">Last Login</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EEE6] dark:divide-[#222222]">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="hover:bg-[#F8F7F3] dark:hover:bg-[#1B1B1B] transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#111111] text-[#E6C65C] dark:bg-[#282828] dark:text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-[#111111] dark:text-white">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#66635C] dark:text-[#A8A49C]">
                      {user.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-[#111111] dark:text-white">{user.role}</p>
                      <p className="text-[11px] text-[#88857E]">{user.department}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          user.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : user.status === 'Under Review'
                            ? 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={user.riskLevel} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold tabular-nums">
                      {user.avgRiskScore}%
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#88857E]">
                      {user.lastLogin}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(user);
                        }}
                        className="text-xs text-[#E6C65C] font-semibold hover:underline"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Profile Modal */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white dark:bg-[#161616] border border-[#E8E6DF] dark:border-[#262626] rounded-2xl p-6 shadow-2xl space-y-5 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E6DF] dark:border-[#262626]">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#E6C65C]" />
                  <h3 className="font-bold text-sm text-[#111111] dark:text-white">
                    User Security Profile
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 text-[#88857E] hover:text-[#111111] dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#111111] text-[#E6C65C] dark:bg-[#282828] dark:text-white font-bold text-lg flex items-center justify-center">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#111111] dark:text-white">
                    {selectedUser.name}
                  </h2>
                  <p className="text-xs text-[#66635C] dark:text-[#9E9B93] font-mono">
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-[#E8E6DF] dark:border-[#2A2A2A] bg-[#F8F7F3] dark:bg-[#1C1C1C]">
                  <span className="text-[#88857E] text-[10px] block">Role & Department</span>
                  <span className="font-semibold text-[#111111] dark:text-white mt-0.5 block">
                    {selectedUser.role}
                  </span>
                  <span className="text-[11px] text-[#66635C] dark:text-[#9E9B93] block">
                    {selectedUser.department}
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-[#E8E6DF] dark:border-[#2A2A2A] bg-[#F8F7F3] dark:bg-[#1C1C1C]">
                  <span className="text-[#88857E] text-[10px] block">Security Baseline</span>
                  <div className="mt-1 flex items-center gap-2">
                    <RiskBadge level={selectedUser.riskLevel} size="sm" showScore={selectedUser.avgRiskScore} />
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-[#E8E6DF] dark:border-[#2A2A2A] bg-[#F8F7F3] dark:bg-[#1C1C1C]">
                  <span className="text-[#88857E] text-[10px] block">Registered Trusted Devices</span>
                  <span className="font-bold font-mono text-[#111111] dark:text-white mt-0.5 block">
                    {selectedUser.trustedDevicesCount} active machines
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-[#E8E6DF] dark:border-[#2A2A2A] bg-[#F8F7F3] dark:bg-[#1C1C1C]">
                  <span className="text-[#88857E] text-[10px] block">Account Status</span>
                  <span className="font-semibold text-emerald-600 mt-0.5 block">
                    {selectedUser.status}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 rounded-lg bg-[#111111] text-white dark:bg-[#E6C65C] dark:text-[#111111] text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
