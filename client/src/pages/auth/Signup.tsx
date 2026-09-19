import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone,
  CreditCard,
  UserCheck,
  Briefcase,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { UserRole } from '../../types/index.js';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [role, setRole] = useState<UserRole>('client');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+27 ');
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedFica, setAgreedFica] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password) {
      setError('Please fill in all mandatory account fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and confirmation password do not match.');
      return;
    }

    if (!agreedFica) {
      setError('You must confirm the statutory FICA and FAIS compliance declaration.');
      return;
    }

    try {
      await register({
        name,
        email,
        role,
        phone,
        idNumber,
        password,
      });

      if (role === 'adviser') {
        navigate('/adviser/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
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
              FSP License #48291 • Client Onboarding & Key Individual Registry
            </p>
          </div>
        </div>

        <h2 className="mt-5 text-center text-2xl font-bold tracking-tight text-[#111111]">
          Register New Mandate Account
        </h2>
        <p className="mt-1 text-center text-xs text-[#6B6B6B]">
          Establish institutional wealth portal credentials or financial adviser practice registration
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-7 px-6 sm:px-8 rounded-lg border border-[#D9D9D9] shadow-xs">
          {/* Role Selection Tabs */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-[#1F1F1F] mb-2 uppercase tracking-wider">
              Account Classification
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#F2F2F2] p-1 rounded-lg border border-[#D9D9D9]">
              <button
                type="button"
                onClick={() => setRole('client')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  role === 'client'
                    ? 'bg-white text-[#C62828] shadow-xs'
                    : 'text-[#6B6B6B] hover:text-[#111111]'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Private Wealth Client</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('adviser')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  role === 'adviser'
                    ? 'bg-[#1F1F1F] text-white shadow-xs'
                    : 'text-[#6B6B6B] hover:text-[#111111]'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Wealth Adviser / CFP®</span>
              </button>
            </div>
            <p className="text-[11px] text-[#6B6B6B] mt-1.5">
              {role === 'client'
                ? 'Individual or corporate client accessing balance sheet, policy schedules, claims, and documents.'
                : 'Certified FAIS representative or Key Individual managing institutional client books and compliance.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1F1F1F] mb-1 uppercase tracking-wider">
                Full Legal Name {role === 'adviser' ? '& Qualifications' : ''}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === 'client' ? 'e.g. Sipho Dlamini' : 'e.g. Johan van der Merwe, CFP®'}
                  className="w-full pl-9 pr-3 py-2 text-sm text-[#111111] bg-white border border-[#D9D9D9] rounded-md focus:outline-none focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F1F1F] mb-1 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.co.za"
                    className="w-full pl-9 pr-3 py-2 text-sm text-[#111111] bg-white border border-[#D9D9D9] rounded-md focus:outline-none focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F1F1F] mb-1 uppercase tracking-wider">
                  Mobile Number (SMS / OTP)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+27 82 000 0000"
                    className="w-full pl-9 pr-3 py-2 text-sm text-[#111111] bg-white border border-[#D9D9D9] rounded-md focus:outline-none focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F1F1F] mb-1 uppercase tracking-wider">
                {role === 'client' ? 'South African National ID Number (13 Digits)' : 'FSP Representative / Key Individual ID'}
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder={role === 'client' ? 'e.g. 8803155123088' : 'e.g. FSP-REP-912048'}
                  className="w-full pl-9 pr-3 py-2 text-sm text-[#111111] bg-white border border-[#D9D9D9] rounded-md focus:outline-none focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F1F1F] mb-1 uppercase tracking-wider">
                  Master Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
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

              <div>
                <label className="block text-xs font-semibold text-[#1F1F1F] mb-1 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-9 pr-3 py-2 text-sm text-[#111111] bg-white border border-[#D9D9D9] rounded-md focus:outline-none focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828]"
                  />
                </div>
              </div>
            </div>

            {/* Compliance Declaration Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#1F1F1F]">
                <input
                  type="checkbox"
                  required
                  checked={agreedFica}
                  onChange={(e) => setAgreedFica(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-[#D9D9D9] text-[#C62828] focus:ring-[#C62828]"
                />
                <span>
                  I declare that these particulars are accurate under the Financial Intelligence Centre Act (FICA Act 38 of 2001) and authorize Royal Square Financial (Pty) Ltd to maintain my mandate records under FSP #48291.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-2.5 px-4 bg-[#C62828] hover:bg-[#8E1B1B] text-white font-bold text-sm rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Registering Mandate...</span>
              ) : (
                <>
                  <span>Create {role === 'adviser' ? 'Wealth Adviser' : 'Client'} Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Login Redirect */}
        <div className="mt-4 text-center">
          <p className="text-xs text-[#6B6B6B]">
            Already registered with Royal Square Financial?{' '}
            <Link to="/login" className="text-[#C62828] hover:underline font-bold">
              Sign in to your portal here →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
