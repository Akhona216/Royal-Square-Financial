import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  UserCheck,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { UserRole } from '../../types/index.js';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [role, setRole] = useState<UserRole>('client');
  const [email, setEmail] = useState('client@royalsquare.co.za');
  const [password, setPassword] = useState('Password@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  const handleRoleToggle = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setError(null);
    if (selectedRole === 'client') {
      setEmail('client@royalsquare.co.za');
    } else {
      setEmail('adviser@royalsquare.co.za');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both your registered email and password.');
      return;
    }
    setError(null);
    try {
      await login(email, role);
      if (role === 'adviser') {
        navigate('/adviser/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleQuickDemo = async (targetRole: UserRole) => {
    setError(null);
    const demoEmail = targetRole === 'adviser' ? 'adviser@royalsquare.co.za' : 'client@royalsquare.co.za';
    setRole(targetRole);
    setEmail(demoEmail);
    try {
      await login(demoEmail, targetRole);
      if (targetRole === 'adviser') {
        navigate('/adviser/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Demo authentication failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex justify-center items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#C62828] flex items-center justify-center text-white shadow-sm font-bold tracking-wider">
            <span className="text-base font-serif">RS</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-[#111111] tracking-tight">ROYAL SQUARE</span>
              <span className="text-[10px] uppercase tracking-widest bg-[#1F1F1F] text-white px-1.5 py-0.5 rounded font-semibold">
                Financial (Pty) Ltd
              </span>
            </div>
            <p className="text-[11px] text-[#6B6B6B] leading-none mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#C62828]" />
              FSP License #48291 • Category I Financial Services
            </p>
          </div>
        </div>

        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-[#111111]">
          Institutional Portal Sign In
        </h2>
        <p className="mt-1 text-center text-xs text-[#6B6B6B]">
          Access your private wealth balance sheet or practice management command center
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-lg border border-[#D9D9D9] shadow-xs">
          {/* Role Selection Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-[#1F1F1F] mb-2 uppercase tracking-wider">
              Select Advisory Role
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#F2F2F2] p-1 rounded-lg border border-[#D9D9D9]">
              <button
                type="button"
                onClick={() => handleRoleToggle('client')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  role === 'client'
                    ? 'bg-white text-[#C62828] shadow-xs'
                    : 'text-[#6B6B6B] hover:text-[#111111]'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Client Portal</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleToggle('adviser')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  role === 'adviser'
                    ? 'bg-[#1F1F1F] text-white shadow-xs'
                    : 'text-[#6B6B6B] hover:text-[#111111]'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Wealth Adviser</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1F1F1F] mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'client' ? 'client@royalsquare.co.za' : 'adviser@royalsquare.co.za'}
                  className="w-full pl-9 pr-3 py-2 text-sm text-[#111111] bg-white border border-[#D9D9D9] rounded-md focus:outline-none focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#1F1F1F] uppercase tracking-wider">
                  Password
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password reset link has been dispatched to your verified email.');
                  }}
                  className="text-xs text-[#C62828] hover:underline font-medium"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2 text-sm text-[#111111] bg-white border border-[#D9D9D9] rounded-md focus:outline-none focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#6B6B6B] hover:text-[#111111] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#1F1F1F]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#D9D9D9] text-[#C62828] focus:ring-[#C62828]"
                />
                <span>Remember this terminal</span>
              </label>
              <span className="text-[#6B6B6B]">256-bit TLS Encrypted</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-[#C62828] hover:bg-[#8E1B1B] text-white font-bold text-sm rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>Sign In as {role === 'adviser' ? 'Wealth Adviser' : 'Client'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-[#D9D9D9]">
            <div className="text-[11px] uppercase font-bold text-[#6B6B6B] tracking-wider mb-2.5 text-center">
              One-Click Persona Sign In
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('client')}
                className="w-full py-2 px-3 bg-[#F8F9FA] hover:bg-red-50 hover:border-red-200 border border-[#D9D9D9] rounded-md text-left flex items-center justify-between transition-colors cursor-pointer group"
              >
                <div>
                  <span className="text-xs font-bold text-[#111111] block group-hover:text-[#C62828]">
                    Sipho Dlamini (Client)
                  </span>
                  <span className="text-[11px] text-[#6B6B6B]">Private Wealth Portfolio • R 11.2M Net Worth</span>
                </div>
                <UserCheck className="w-4 h-4 text-[#6B6B6B] group-hover:text-[#C62828]" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('adviser')}
                className="w-full py-2 px-3 bg-[#F8F9FA] hover:bg-gray-100 hover:border-gray-400 border border-[#D9D9D9] rounded-md text-left flex items-center justify-between transition-colors cursor-pointer group"
              >
                <div>
                  <span className="text-xs font-bold text-[#111111] block group-hover:text-black">
                    Johan van der Merwe, CFP® (Adviser)
                  </span>
                  <span className="text-[11px] text-[#6B6B6B]">Key Individual • R 48.5M AUM Under Advice</span>
                </div>
                <Briefcase className="w-4 h-4 text-[#6B6B6B] group-hover:text-black" />
              </button>
            </div>
          </div>
        </div>

        {/* Signup Redirect link */}
        <div className="mt-4 text-center">
          <p className="text-xs text-[#6B6B6B]">
            New to Royal Square Financial?{' '}
            <Link to="/signup" className="text-[#C62828] hover:underline font-bold">
              Register new Client or Adviser mandate →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
