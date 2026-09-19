import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  Smartphone,
  Mail,
  Phone,
  Building2,
  Home,
  MapPin,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  History,
  FileText,
  Save,
  RefreshCw,
  HelpCircle,
  ExternalLink,
  KeyRound,
} from 'lucide-react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { Input, Select } from '../../components/common/Input.js';
import { Modal } from '../../components/common/Modal.js';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { ClientProfile, AuditLogEntry } from '../../types/index.js';

const SA_BANKS = [
  { name: 'Standard Bank of South Africa', defaultBranch: '051001' },
  { name: 'First National Bank (FNB)', defaultBranch: '250655' },
  { name: 'Nedbank', defaultBranch: '198765' },
  { name: 'Absa Bank', defaultBranch: '632005' },
  { name: 'Capitec Bank', defaultBranch: '470010' },
  { name: 'Investec Bank', defaultBranch: '580105' },
  { name: 'Discovery Bank', defaultBranch: '679000' },
  { name: 'African Bank', defaultBranch: '430000' },
  { name: 'TymeBank', defaultBranch: '678910' },
];

const PROVINCES = [
  'Gauteng',
  'Western Cape',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Free State',
  'Mpumalanga',
  'Limpopo',
  'North West',
  'Northern Cape',
];

export const SettingsProfile: React.FC = () => {
  const { user } = useAuth();

  // Active section tab
  const [activeTab, setActiveTab] = useState<'personal' | 'addresses' | 'emergency' | 'banking' | 'audit'>('personal');

  // Loading & submission state
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Personal Info form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [occupation, setOccupation] = useState('');
  const [employer, setEmployer] = useState('');
  const [preferredCommunication, setPreferredCommunication] = useState<'Email' | 'SMS' | 'Phone' | 'WhatsApp'>('Email');
  const [preferredLanguage, setPreferredLanguage] = useState('English');

  // Addresses
  const [resStreet, setResStreet] = useState('');
  const [resSuburb, setResSuburb] = useState('');
  const [resCity, setResCity] = useState('');
  const [resProvince, setResProvince] = useState('Gauteng');
  const [resPostalCode, setResPostalCode] = useState('');
  const [resCountry, setResCountry] = useState('South Africa');

  const [sameAsResidential, setSameAsResidential] = useState(true);
  const [postalStreet, setPostalStreet] = useState('');
  const [postalSuburb, setPostalSuburb] = useState('');
  const [postalCity, setPostalCity] = useState('');
  const [postalProvince, setPostalProvince] = useState('Gauteng');
  const [postalCode, setPostalCode] = useState('');

  // Emergency Contact
  const [emName, setEmName] = useState('');
  const [emRelationship, setEmRelationship] = useState('Spouse');
  const [emPhone, setEmPhone] = useState('');
  const [emAltPhone, setEmAltPhone] = useState('');
  const [emEmail, setEmEmail] = useState('');

  // Banking Details
  const [bankName, setBankName] = useState('Standard Bank of South Africa');
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState<'Cheque / Current' | 'Savings' | 'Transmission'>('Cheque / Current');
  const [branchCode, setBranchCode] = useState('051001');
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'pending_verification' | 'unverified'>('verified');
  const [verificationRequiredNote, setVerificationRequiredNote] = useState<string | undefined>('');
  const [verifiedAt, setVerifiedAt] = useState<string | undefined>('');
  const [showAccountNumber, setShowAccountNumber] = useState(false);

  // Verification Modal for Banking
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyingBanking, setVerifyingBanking] = useState(false);

  // Security toggles
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.profile.get();
      if (res.data) {
        populateForm(res.data);
      }
      if (res.recentAuditLogs) {
        setAuditLogs(res.recentAuditLogs);
      }
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      setErrorMsg(err.message || 'Failed to load personal profile');
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (p: ClientProfile) => {
    setName(p.name || '');
    setEmail(p.email || '');
    setPhone(p.phone || '');
    setIdNumber(p.idNumber || '');
    setTaxNumber(p.taxNumber || '');
    setMaritalStatus(p.maritalStatus || 'Married in Community of Property');
    setOccupation(p.occupation || 'Consultant');
    setEmployer(p.employer || 'Private Enterprise');
    setPreferredCommunication(p.preferredCommunication || 'Email');
    setPreferredLanguage(p.preferredLanguage || 'English');
    setTwoFactorEnabled(p.twoFactorEnabled ?? true);

    if (p.residentialAddress) {
      setResStreet(p.residentialAddress.street || '');
      setResSuburb(p.residentialAddress.suburb || '');
      setResCity(p.residentialAddress.city || '');
      setResProvince(p.residentialAddress.province || 'Gauteng');
      setResPostalCode(p.residentialAddress.postalCode || '');
      setResCountry(p.residentialAddress.country || 'South Africa');
    }

    if (p.postalAddress) {
      setSameAsResidential(p.postalAddress.sameAsResidential ?? true);
      setPostalStreet(p.postalAddress.street || '');
      setPostalSuburb(p.postalAddress.suburb || '');
      setPostalCity(p.postalAddress.city || '');
      setPostalProvince(p.postalAddress.province || 'Gauteng');
      setPostalCode(p.postalAddress.postalCode || '');
    }

    if (p.emergencyContact) {
      setEmName(p.emergencyContact.name || '');
      setEmRelationship(p.emergencyContact.relationship || 'Spouse');
      setEmPhone(p.emergencyContact.phone || '');
      setEmAltPhone(p.emergencyContact.alternativePhone || '');
      setEmEmail(p.emergencyContact.email || '');
    }

    if (p.bankingDetails) {
      setBankName(p.bankingDetails.bankName || 'Standard Bank of South Africa');
      setAccountHolder(p.bankingDetails.accountHolder || '');
      setAccountNumber(p.bankingDetails.accountNumber || '');
      setAccountType(p.bankingDetails.accountType || 'Cheque / Current');
      setBranchCode(p.bankingDetails.branchCode || '051001');
      setVerificationStatus(p.bankingDetails.verificationStatus || 'verified');
      setVerificationRequiredNote(p.bankingDetails.verificationRequiredNote);
      setVerifiedAt(p.bankingDetails.verifiedAt);
    }
  };

  const handleBankSelectionChange = (newBank: string) => {
    setBankName(newBank);
    const found = SA_BANKS.find((b) => b.name === newBank);
    if (found) {
      setBranchCode(found.defaultBranch);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload: Partial<ClientProfile> = {
        name,
        email,
        phone,
        maritalStatus,
        occupation,
        employer,
        preferredCommunication,
        preferredLanguage,
        residentialAddress: {
          street: resStreet,
          suburb: resSuburb,
          city: resCity,
          province: resProvince,
          postalCode: resPostalCode,
          country: resCountry,
        },
        postalAddress: {
          sameAsResidential,
          street: sameAsResidential ? resStreet : postalStreet,
          suburb: sameAsResidential ? resSuburb : postalSuburb,
          city: sameAsResidential ? resCity : postalCity,
          province: sameAsResidential ? resProvince : postalProvince,
          postalCode: sameAsResidential ? resPostalCode : postalCode,
          country: resCountry,
        },
        emergencyContact: {
          name: emName,
          relationship: emRelationship,
          phone: emPhone,
          alternativePhone: emAltPhone,
          email: emEmail,
        },
        bankingDetails: {
          bankName,
          accountHolder,
          accountNumber,
          accountType,
          branchCode,
          verificationStatus,
        },
      };

      const res = await api.profile.update(payload);

      if (res.data) {
        populateForm(res.data);
      }

      if (res.auditEntry) {
        setAuditLogs((prev) => [res.auditEntry, ...prev.filter((l) => l.id !== res.auditEntry.id)]);
      }

      setSuccessMsg(res.message || 'Your personal profile information has been securely updated and verified.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setErrorMsg(err.message || 'Validation error: please check required fields.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyBankingSubmit = async () => {
    if (!verificationCode || verificationCode.length < 4) {
      setErrorMsg('Please enter a valid 6-digit OTP confirmation code.');
      return;
    }
    setVerifyingBanking(true);
    try {
      const res = await api.profile.verifyBanking(`OTP ${verificationCode} & Bank Confirmation`);
      if (res.data) {
        populateForm(res.data);
      }
      setIsVerifyModalOpen(false);
      setVerificationCode('');
      setSuccessMsg('Banking details verified successfully. Payouts and debit orders are active.');
      // Refresh audit logs
      const logsRes = await api.profile.getAuditLogs();
      if (logsRes.data) setAuditLogs(logsRes.data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Please try again.');
    } finally {
      setVerifyingBanking(false);
    }
  };

  const maskedAccountNumber = accountNumber
    ? `•••• •••• ${accountNumber.slice(-4)}`
    : '•••• •••• ••••';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="border-b border-[#D9D9D9] pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#111111] tracking-tight">My Profile & Personal Information</h1>
            <p className="text-xs text-[#6B6B6B] mt-1">
              View, manage, and securely update your regulatory FICA details, residential address, emergency contact, and banking information.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              FICA Verified
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold rounded-lg flex items-start justify-between gap-3 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-sm">Profile Successfully Updated</span>
              <p className="text-emerald-800 mt-0.5 font-normal">{successMsg}</p>
            </div>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Notification Alert */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-900 text-xs font-semibold rounded-lg flex items-start justify-between gap-3 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-sm">Action Required</span>
              <p className="text-red-800 mt-0.5 font-normal">{errorMsg}</p>
            </div>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-red-700 hover:text-red-900 text-xs underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Profile Section Tabs */}
      <div className="flex border-b border-[#D9D9D9] overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('personal')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'personal'
              ? 'border-[#C62828] text-[#C62828]'
              : 'border-transparent text-[#6B6B6B] hover:text-[#111111]'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Personal & FICA
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'addresses'
              ? 'border-[#C62828] text-[#C62828]'
              : 'border-transparent text-[#6B6B6B] hover:text-[#111111]'
          }`}
        >
          <Home className="w-4 h-4" />
          Addresses
        </button>

        <button
          onClick={() => setActiveTab('emergency')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'emergency'
              ? 'border-[#C62828] text-[#C62828]'
              : 'border-transparent text-[#6B6B6B] hover:text-[#111111]'
          }`}
        >
          <Phone className="w-4 h-4" />
          Emergency Contact
        </button>

        <button
          onClick={() => setActiveTab('banking')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'banking'
              ? 'border-[#C62828] text-[#C62828]'
              : 'border-transparent text-[#6B6B6B] hover:text-[#111111]'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Banking Details
          {verificationStatus === 'pending_verification' && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'border-[#C62828] text-[#C62828]'
              : 'border-transparent text-[#6B6B6B] hover:text-[#111111]'
          }`}
        >
          <History className="w-4 h-4" />
          Audit & Security Log
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-[#6B6B6B] text-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#C62828] mb-2" />
          Loading your verified client profile records...
        </div>
      ) : (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* TAB 1: PERSONAL & FICA */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <Card
                title="FICA Personal Identity Particulars"
                subtitle="Official identity information registered under FSP license regulations"
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Legal Name (as per ID document)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <div>
                      <Input
                        label="South African National ID Number"
                        value={idNumber}
                        disabled
                        className="bg-[#F5F5F5] font-mono cursor-not-allowed"
                      />
                      <span className="text-[10px] text-[#6B6B6B] mt-1 block">
                        Identity number is locked to your verified FICA record. Contact your advisor to amend.
                      </span>
                    </div>
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
                      label="Contact Mobile Number (SMS / OTP)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                    <Input
                      label="SARS Tax Reference Number"
                      value={taxNumber}
                      onChange={(e) => setTaxNumber(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E5E5E5]">
                    <Select
                      label="Marital Status"
                      value={maritalStatus}
                      onChange={(e) => setMaritalStatus(e.target.value)}
                      options={[
                        { label: 'Single', value: 'Single' },
                        { label: 'Married in Community of Property', value: 'Married in Community of Property' },
                        { label: 'Married out of Community (with Accrual)', value: 'Married out of Community (with Accrual)' },
                        { label: 'Married out of Community (without Accrual)', value: 'Married out of Community (without Accrual)' },
                        { label: 'Divorced', value: 'Divorced' },
                        { label: 'Widowed', value: 'Widowed' },
                      ]}
                    />

                    <Input
                      label="Occupation / Professional Title"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="Employer / Business Name"
                      value={employer}
                      onChange={(e) => setEmployer(e.target.value)}
                    />

                    <Select
                      label="Preferred Communication"
                      value={preferredCommunication}
                      onChange={(e) => setPreferredCommunication(e.target.value as any)}
                      options={[
                        { label: 'Email', value: 'Email' },
                        { label: 'SMS', value: 'SMS' },
                        { label: 'WhatsApp', value: 'WhatsApp' },
                        { label: 'Phone Call', value: 'Phone' },
                      ]}
                    />

                    <Select
                      label="Correspondence Language"
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      options={[
                        { label: 'English', value: 'English' },
                        { label: 'Afrikaans', value: 'Afrikaans' },
                        { label: 'isiZulu', value: 'isiZulu' },
                        { label: 'isiXhosa', value: 'isiXhosa' },
                        { label: 'Sesotho', value: 'Sesotho' },
                      ]}
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <Card
                title="Residential Physical Address"
                subtitle="Your primary domicile registered for risk ratings, short-term insurance, and tax residency"
              >
                <div className="space-y-4">
                  <Input
                    label="Street Address / House & Building"
                    value={resStreet}
                    onChange={(e) => setResStreet(e.target.value)}
                    placeholder="e.g. 14 Wilton Avenue"
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Suburb"
                      value={resSuburb}
                      onChange={(e) => setResSuburb(e.target.value)}
                      placeholder="e.g. Bryanston"
                      required
                    />
                    <Input
                      label="City / Metro"
                      value={resCity}
                      onChange={(e) => setResCity(e.target.value)}
                      placeholder="e.g. Johannesburg"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Select
                      label="Province"
                      value={resProvince}
                      onChange={(e) => setResProvince(e.target.value)}
                      options={PROVINCES.map((p) => ({ label: p, value: p }))}
                    />

                    <Input
                      label="Postal Code"
                      value={resPostalCode}
                      onChange={(e) => setResPostalCode(e.target.value)}
                      placeholder="e.g. 2191"
                      required
                    />

                    <Input
                      label="Country"
                      value={resCountry}
                      onChange={(e) => setResCountry(e.target.value)}
                      disabled
                      className="bg-[#F5F5F5]"
                    />
                  </div>
                </div>
              </Card>

              <Card
                title="Postal Address"
                subtitle="Address for official postal notices and hardcopy policy documentation"
              >
                <div className="space-y-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#111111]">
                    <input
                      type="checkbox"
                      checked={sameAsResidential}
                      onChange={(e) => setSameAsResidential(e.target.checked)}
                      className="rounded border-[#D9D9D9] text-[#C62828] focus:ring-[#C62828] cursor-pointer"
                    />
                    Postal address is identical to my residential physical address
                  </label>

                  {!sameAsResidential && (
                    <div className="space-y-4 pt-2 border-t border-[#E5E5E5]">
                      <Input
                        label="Postal Address / P.O. Box / PostNet Suite"
                        value={postalStreet}
                        onChange={(e) => setPostalStreet(e.target.value)}
                        placeholder="e.g. PostNet Suite 412, Private Bag X1"
                        required={!sameAsResidential}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Postal Suburb"
                          value={postalSuburb}
                          onChange={(e) => setPostalSuburb(e.target.value)}
                        />
                        <Input
                          label="Postal City"
                          value={postalCity}
                          onChange={(e) => setPostalCity(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select
                          label="Postal Province"
                          value={postalProvince}
                          onChange={(e) => setPostalProvince(e.target.value)}
                          options={PROVINCES.map((p) => ({ label: p, value: p }))}
                        />
                        <Input
                          label="Postal Code"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* TAB 3: EMERGENCY CONTACT */}
          {activeTab === 'emergency' && (
            <div className="space-y-6">
              <Card
                title="Emergency Contact Details"
                subtitle="Designated primary contact in the event of medical emergencies or urgent policy claims"
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Emergency Contact Full Name"
                      value={emName}
                      onChange={(e) => setEmName(e.target.value)}
                      placeholder="e.g. Nomvula Dlamini"
                      required
                    />

                    <Select
                      label="Relationship to You"
                      value={emRelationship}
                      onChange={(e) => setEmRelationship(e.target.value)}
                      options={[
                        { label: 'Spouse / Partner', value: 'Spouse' },
                        { label: 'Parent', value: 'Parent' },
                        { label: 'Sibling', value: 'Sibling' },
                        { label: 'Adult Child', value: 'Child' },
                        { label: 'Legal Guardian', value: 'Legal Guardian' },
                        { label: 'Business Partner', value: 'Business Partner' },
                        { label: 'Close Relative / Friend', value: 'Friend' },
                      ]}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="Primary Mobile Phone"
                      value={emPhone}
                      onChange={(e) => setEmPhone(e.target.value)}
                      placeholder="+27 82 000 0000"
                      required
                    />

                    <Input
                      label="Alternative Phone (Work / Landline)"
                      value={emAltPhone}
                      onChange={(e) => setEmAltPhone(e.target.value)}
                      placeholder="+27 11 000 0000"
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      value={emEmail}
                      onChange={(e) => setEmEmail(e.target.value)}
                      placeholder="contact@domain.co.za"
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 4: BANKING DETAILS */}
          {activeTab === 'banking' && (
            <div className="space-y-6">
              <Card
                title="Disbursement & Debit Order Banking Details"
                subtitle="Verified bank account for insurance claim payouts, investment withdrawals, and debit order premiums"
              >
                <div className="space-y-4">
                  {/* Security Notice Banner */}
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg text-xs space-y-1">
                    <div className="flex items-center gap-2 text-amber-900 font-bold">
                      <Lock className="w-4 h-4 text-amber-700" />
                      Banking Details Security & FICA Validation Notice
                    </div>
                    <p className="text-amber-800">
                      Under South African Financial Advisory and Intermediary Services (FAIS) regulations, changes to your banking details require formal compliance verification. Changing these details will temporarily place payouts in <strong>Pending Verification</strong> status until authenticated via OTP or certified bank confirmation letter.
                    </p>
                  </div>

                  {/* Verification Status Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#F8F9FA] rounded-lg border border-[#D9D9D9] gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B]">Account Verification Status:</span>
                        {verificationStatus === 'verified' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Verified & Active
                          </span>
                        ) : verificationStatus === 'pending_verification' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                            Pending Compliance Verification
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                            Unverified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6B6B6B] mt-1">
                        {verificationRequiredNote ||
                          'Account is verified for automated debit orders and direct claim settlements.'}
                      </p>
                    </div>

                    {verificationStatus === 'pending_verification' && (
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => setIsVerifyModalOpen(true)}
                      >
                        Verify Now via OTP
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Financial Institution / Bank"
                      value={bankName}
                      onChange={(e) => handleBankSelectionChange(e.target.value)}
                      options={SA_BANKS.map((b) => ({ label: b.name, value: b.name }))}
                    />

                    <Input
                      label="Registered Account Holder Name"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder="e.g. S Dlamini"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-semibold text-[#111111] mb-1">
                        Account Number
                      </label>
                      <div className="relative">
                        <input
                          type={showAccountNumber ? 'text' : 'password'}
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 10148920491"
                          required
                          className="w-full text-xs font-mono border border-[#D9D9D9] rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-1 focus:ring-[#C62828] bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAccountNumber(!showAccountNumber)}
                          className="absolute right-2.5 top-2.5 text-[#6B6B6B] hover:text-[#111111] cursor-pointer"
                          title={showAccountNumber ? 'Mask account number' : 'Show account number'}
                        >
                          {showAccountNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <span className="text-[10px] text-[#6B6B6B] mt-1 block">
                        Current Mask: <span className="font-mono">{maskedAccountNumber}</span>
                      </span>
                    </div>

                    <Select
                      label="Account Type"
                      value={accountType}
                      onChange={(e) => setAccountType(e.target.value as any)}
                      options={[
                        { label: 'Cheque / Current Account', value: 'Cheque / Current' },
                        { label: 'Savings Account', value: 'Savings' },
                        { label: 'Transmission Account', value: 'Transmission' },
                      ]}
                    />

                    <Input
                      label="Universal Branch Code"
                      value={branchCode}
                      onChange={(e) => setBranchCode(e.target.value)}
                      placeholder="e.g. 051001"
                      required
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 5: AUDIT & SECURITY LOG */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              {/* Security Credentials Card */}
              <Card title="Security & Authentication" subtitle="Two-factor authentication and login credentials">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-lg border border-[#D9D9D9]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-white border border-[#D9D9D9] flex items-center justify-center text-[#C62828]">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-[#111111] block">Two-Factor Authentication (SMS / App OTP)</span>
                        <span className="text-xs text-[#6B6B6B]">
                          Required for authorizing portfolio withdrawals, banking details amendments, and claim settlements.
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
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
                      <span className="text-sm font-bold text-[#111111] block">Portal Access Password</span>
                      <span className="text-xs text-[#6B6B6B]">
                        Protected by 12+ character complexity and PBKDF2 cryptographic hashing.
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => alert('Password reset link sent to your verified email address: ' + email)}
                    >
                      Change Password
                    </Button>
                  </div>
                </div>
              </Card>

              {/* FICA & Profile Audit Trail */}
              <Card
                title="Client Profile & FICA Audit Trail"
                subtitle="Immutable compliance log of all profile amendments, banking updates, and security events"
              >
                {auditLogs.length === 0 ? (
                  <div className="text-center py-6 text-xs text-[#6B6B6B]">
                    No historical profile changes recorded yet.
                  </div>
                ) : (
                  <div className="divide-y divide-[#E5E5E5]">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="py-3 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#111111]">{log.action}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                log.status === 'SUCCESS'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : log.status === 'FLAGGED_FOR_VERIFICATION'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {log.status}
                            </span>
                            <span className="text-[10px] uppercase font-semibold text-[#6B6B6B] px-1.5 py-0.5 bg-[#F2F2F2] rounded">
                              {log.category}
                            </span>
                          </div>
                          <span className="text-[#6B6B6B] font-mono text-[11px]">
                            {new Date(log.timestamp).toLocaleString('en-ZA', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-[#333333]">{log.description}</p>
                        {log.changes && log.changes.length > 0 && (
                          <div className="mt-1 p-2 bg-[#F9F9F9] rounded border border-[#E5E5E5] space-y-0.5 font-mono text-[11px]">
                            {log.changes.map((c, i) => (
                              <div key={i} className="text-[#555555]">
                                <span className="font-semibold text-[#111111]">{c.label}:</span>{' '}
                                <span className="line-through text-red-600">{String(c.oldValue)}</span>{' '}
                                &rarr; <span className="text-emerald-700 font-bold">{String(c.newValue)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="text-[10px] text-[#888888] flex items-center gap-3">
                          <span>User: {log.userName} ({log.userRole})</span>
                          <span>IP: {log.ipAddress || '197.185.102.44'}</span>
                          <span>Log Ref: {log.id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Action Bar */}
          {activeTab !== 'audit' && (
            <div className="pt-4 border-t border-[#D9D9D9] flex items-center justify-between">
              <div className="text-xs text-[#6B6B6B] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#C62828]" />
                Changes are validated and recorded in your compliance audit log.
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={fetchProfile}
                  disabled={saving}
                >
                  Discard Changes
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={saving}
                  className="min-w-[140px]"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin mr-1.5" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1.5" />
                      Save & Validate
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      )}

      {/* Dedicated Wealth Adviser Card */}
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
            onClick={() => alert('Direct advisory line: +27 83 912 4001 • Advisory Office: Sandton, Johannesburg')}
          >
            Direct Advisory Line
          </Button>
        </div>
      </Card>

      {/* Verification Modal for Banking Details */}
      <Modal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        title="Two-Factor Banking Verification"
        subtitle="Confirm disbursement account details via SMS One-Time PIN"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#333333]">
            A one-time verification code has been dispatched to your verified mobile number (
            <span className="font-mono font-bold">{phone}</span>) to confirm update to{' '}
            <strong>{bankName}</strong> account ending <strong>{accountNumber.slice(-4)}</strong>.
          </p>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
            <strong>Demo Simulation Code:</strong> Enter <strong>849201</strong> (or any 6-digit number) to complete FICA banking authentication.
          </div>

          <Input
            label="Enter 6-Digit SMS PIN"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="849201"
            className="font-mono text-center tracking-widest text-base"
            autoFocus
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-[#D9D9D9]">
            <Button variant="outline" size="sm" onClick={() => setIsVerifyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleVerifyBankingSubmit}
              disabled={verifyingBanking}
            >
              {verifyingBanking ? 'Verifying...' : 'Authenticate & Activate Account'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
