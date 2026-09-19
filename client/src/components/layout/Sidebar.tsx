import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  Target,
  FileCheck2,
  FolderLock,
  CarFront,
  HelpCircle,
  Settings,
  Users,
  CheckSquare,
  ClipboardList,
  Calendar,
  Network,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export const Sidebar: React.FC = () => {
  const { user, role } = useAuth();
  const location = useLocation();

  const clientNav = [
    { label: 'Dashboard', path: '/client/dashboard', icon: LayoutDashboard },
    { label: 'My Finances', path: '/client/finances', icon: Wallet },
    { label: 'My Goals', path: '/client/goals', icon: Target },
    { label: 'My Policies', path: '/client/policies', icon: FileCheck2 },
    { label: 'Documents Vault', path: '/client/documents', icon: FolderLock },
    { label: 'Motor Claims Wizard', path: '/client/claims', icon: CarFront },
    { label: 'Service Requests', path: '/client/service-requests', icon: HelpCircle },
    { label: 'Settings & Profile', path: '/client/settings', icon: Settings },
  ];

  const adviserNav = [
    { label: 'Executive Dashboard', path: '/adviser/dashboard', icon: LayoutDashboard },
    { label: 'Clients Directory', path: '/adviser/clients', icon: Users },
    { label: 'Tasks & Reminders', path: '/adviser/tasks', icon: CheckSquare },
    { label: 'Claims Overview', path: '/adviser/claims', icon: CarFront },
    { label: 'Service Requests Queue', path: '/adviser/service-requests', icon: ClipboardList },
    { label: 'Calendar & Reviews', path: '/adviser/calendar', icon: Calendar },
    { label: 'Integrations Hub', path: '/adviser/integrations', icon: Network },
  ];

  const currentNav = role === 'adviser' ? adviserNav : clientNav;

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-[#D9D9D9] flex flex-col justify-between min-h-[calc(100vh-4rem)]">
      <div className="py-4">
        {/* Navigation Category Label */}
        <div className="px-6 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#6B6B6B]">
          {role === 'adviser' ? 'Adviser Workspace' : 'Client Portfolio'}
        </div>

        {/* Links */}
        <nav className="space-y-1 px-3">
          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(`${item.path}/`));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? role === 'adviser'
                      ? 'bg-[#1F1F1F] text-white font-semibold shadow-xs'
                      : 'bg-[#C62828] text-white font-semibold shadow-xs'
                    : 'text-[#1F1F1F] hover:bg-[#F2F2F2] hover:text-[#111111]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#6B6B6B]'}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Institutional Credentials Badge (No cross-portal switching) */}
      <div className="p-3.5 m-3 bg-[#F8F9FA] rounded-lg border border-[#D9D9D9]">
        {role === 'adviser' ? (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#111111] mb-1">
              <Award className="w-4 h-4 text-[#C62828]" />
              <span>Advisory Practice Book</span>
            </div>
            <p className="text-xs font-semibold text-[#1F1F1F] truncate">{user?.name || 'Johan van der Merwe'}</p>
            <p className="text-[11px] text-[#6B6B6B] mt-0.5 leading-snug">
              Key Individual • FSP #48291
            </p>
            <div className="mt-2 pt-2 border-t border-[#E5E5E5] flex items-center justify-between text-[10px]">
              <span className="text-[#6B6B6B]">FAIS Representative</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Active
              </span>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#111111] mb-1">
              <ShieldCheck className="w-4 h-4 text-[#C62828]" />
              <span>Private Wealth Mandate</span>
            </div>
            <p className="text-xs font-semibold text-[#1F1F1F] truncate">{user?.name || 'Sipho Dlamini'}</p>
            <p className="text-[11px] text-[#6B6B6B] mt-0.5 leading-snug">
              Account: RS-PWM-8820
            </p>
            <div className="mt-2 pt-2 border-t border-[#E5E5E5] flex items-center justify-between text-[10px]">
              <span className="text-[#6B6B6B]">FICA Verification</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Verified
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
