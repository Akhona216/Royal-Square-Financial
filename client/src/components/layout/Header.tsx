import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  UserCheck,
  Briefcase,
  LogOut,
  LogIn,
  UserPlus,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { NotificationBell } from '../notifications/NotificationBell.js';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#D9D9D9] shadow-xs">
      <div className="px-6 h-16 flex items-center justify-between">
        {/* Brand & Identity */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded bg-[#C62828] flex items-center justify-center text-white shadow-sm font-bold tracking-wider group-hover:bg-[#8E1B1B] transition-colors">
            <span className="text-sm font-serif">RS</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-[#111111] tracking-tight">ROYAL SQUARE</span>
              <span className="text-[10px] uppercase tracking-widest bg-[#1F1F1F] text-white px-1.5 py-0.5 rounded font-semibold">
                Financial (Pty) Ltd
              </span>
            </div>
            <p className="text-[11px] text-[#6B6B6B] leading-none mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#C62828]" />
              Authorized Financial Services Provider • FSP #48291
            </p>
          </div>
        </Link>

        {/* Center / Right controls: Role workspace indicator & profile */}
        <div className="flex items-center gap-3">
          {/* Active Portal Indicator Badge (strictly shows current user's workspace) */}
          {user && (
            <div className="hidden sm:flex items-center">
              {role === 'adviser' ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#1F1F1F] text-white text-xs font-semibold shadow-xs">
                  <Briefcase className="w-3.5 h-3.5 text-[#E53935]" />
                  <span>Adviser Practice Workspace</span>
                  <span className="text-[10px] bg-[#333333] px-1.5 py-0.5 rounded text-gray-300 font-mono">
                    FSP #48291
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-50 text-[#C62828] border border-red-200 text-xs font-semibold shadow-xs">
                  <UserCheck className="w-3.5 h-3.5 text-[#C62828]" />
                  <span>Private Wealth Client Portal</span>
                  <span className="text-[10px] bg-red-100 text-[#C62828] px-1.5 py-0.5 rounded font-mono font-bold">
                    FICA Verified
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Global Notification Center */}
          {user && <NotificationBell />}

          {/* User Profile & Account Dropdown */}
          <div className="relative pl-2 border-l border-[#D9D9D9]" ref={dropdownRef}>
            {user ? (
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-[#F2F2F2] transition-colors cursor-pointer text-left"
              >
                <div className="text-right hidden md:block">
                  <div className="text-xs font-bold text-[#111111] leading-tight">{user.name}</div>
                  <div className="text-[10px] text-[#6B6B6B] uppercase font-medium tracking-wide">
                    {role === 'adviser' ? 'Certified Financial Planner' : 'Private Wealth Client'}
                  </div>
                </div>
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold uppercase text-white shadow-xs ${
                    role === 'adviser' ? 'bg-[#1F1F1F]' : 'bg-[#C62828]'
                  }`}
                >
                  {user.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('') || 'RS'}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#6B6B6B]" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-[#C62828] text-white hover:bg-[#8E1B1B] transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold border border-[#D9D9D9] text-[#111111] hover:bg-gray-100 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Register
                </Link>
              </div>
            )}

            {/* Dropdown Menu */}
            {dropdownOpen && user && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-[#D9D9D9] py-2 z-50 animate-in fade-in-50 duration-100">
                <div className="px-4 py-2 border-b border-[#D9D9D9]">
                  <p className="text-xs font-bold text-[#111111] truncate">{user.name}</p>
                  <p className="text-[11px] text-[#6B6B6B] truncate">{user.email}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        role === 'adviser'
                          ? 'bg-[#1F1F1F] text-white'
                          : 'bg-red-50 text-[#C62828] border border-red-200'
                      }`}
                    >
                      {role === 'adviser' ? 'Adviser Portal' : 'Client Portal'}
                    </span>
                    <span className="text-[10px] text-[#6B6B6B]">FSP #48291</span>
                  </div>
                </div>

                <div className="py-1">
                  {role === 'adviser' ? (
                    <>
                      <Link
                        to="/adviser/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full text-left px-4 py-2 text-xs text-[#111111] hover:bg-[#F8F9FA] flex items-center gap-2"
                      >
                        <Briefcase className="w-4 h-4 text-[#1F1F1F]" />
                        <span>Executive Adviser Dashboard</span>
                      </Link>
                      <Link
                        to="/adviser/clients"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full text-left px-4 py-2 text-xs text-[#111111] hover:bg-[#F8F9FA] flex items-center gap-2"
                      >
                        <UserCheck className="w-4 h-4 text-[#6B6B6B]" />
                        <span>Clients Directory</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/client/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full text-left px-4 py-2 text-xs text-[#111111] hover:bg-[#F8F9FA] flex items-center gap-2"
                      >
                        <UserCheck className="w-4 h-4 text-[#C62828]" />
                        <span>My Wealth Dashboard</span>
                      </Link>
                      <Link
                        to="/client/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full text-left px-4 py-2 text-xs text-[#111111] hover:bg-[#F8F9FA] flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#6B6B6B]" />
                        <span>FICA Profile & Security</span>
                      </Link>
                    </>
                  )}
                </div>

                <div className="border-t border-[#D9D9D9] pt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
