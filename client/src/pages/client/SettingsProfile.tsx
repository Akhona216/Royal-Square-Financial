import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  Smartphone,
  Mail,
  Phone,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { Input } from '../../components/common/Input.js';
import { useAuth } from '../../context/AuthContext.js';

export const SettingsProfile: React.FC = () => {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || 'Sipho Dlamini');
  const [email, setEmail] = useState(user?.email || 'client@royalsquare.co.za');
  const [phone, setPhone] = useState(user?.phone || '+27 82 459 8920');
  const [idNumber, setIdNumber] = useState(user?.idNumber || '8803155123088');
  const [taxNumber, setTaxNumber] = useState(user?.taxNumber || '9482103492');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="border-b border-[#D9D9D9] pb-5">
        <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Client Profile & Security Credentials</h1>
        <p className="text-xs text-[#6B6B6B] mt-1">
          Manage regulatory FICA profile information, multi-factor authentication, and assigned wealth adviser contact.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-md flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Profile credentials updated and verified against FSP compliance records.
        </div>
      )}

      {/* Persona Details Form */}
      <Card title="FICA Personal Particulars" subtitle="Official details registered under FSP license #48291">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Legal Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="South African National ID Number"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Primary Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Mobile Number (SMS / OTP)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input
              label="SARS Income Tax Reference"
              value={taxNumber}
              onChange={(e) => setTaxNumber(e.target.value)}
              required
            />
          </div>

          <div className="pt-3 flex justify-end">
            <Button type="submit" variant="primary" size="md">
              Update Profile Information
            </Button>
          </div>
        </form>
      </Card>

      {/* Security & MFA */}
      <Card title="Security & Authentication" subtitle="Two-factor authentication and login credentials">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-lg border border-[#D9D9D9]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-white border border-[#D9D9D9] flex items-center justify-center text-[#C62828]">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-[#111111] block">Two-Factor Authentication (SMS / App)</span>
                <span className="text-xs text-[#6B6B6B]">
                  Required for authorizing portfolio transactions, debit order changes, and claim settlements.
                </span>
              </div>
            </div>
            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer ${
                twoFactorEnabled ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-[#D9D9D9]">
            <div>
              <span className="text-sm font-bold text-[#111111] block">Account Password</span>
              <span className="text-xs text-[#6B6B6B]">Last updated 45 days ago • Complies with 12-character complexity</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert('Password reset link sent to your verified email address.')}
            >
              Change Password
            </Button>
          </div>
        </div>
      </Card>

      {/* Dedicated Adviser Contact Card */}
      <Card title="Your Assigned Wealth Adviser" subtitle="Senior Certified Financial Planner (CFP®) assigned to your portfolio">
        <div className="p-4 bg-[#F8F9FA] rounded-lg border border-[#D9D9D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#1F1F1F] text-white flex items-center justify-center font-bold text-sm">
              JM
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#111111]">Johan van der Merwe, CFP®</h4>
              <p className="text-xs text-[#6B6B6B]">Key Individual • Royal Square Financial (Pty) Ltd</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-[#111111]">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#C62828]" />
                  adviser@royalsquare.co.za
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#C62828]" />
                  +27 83 912 4001
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert('Direct advisory phone line: +27 83 912 4001')}
          >
            Direct Advisory Line
          </Button>
        </div>
      </Card>
    </div>
  );
};
