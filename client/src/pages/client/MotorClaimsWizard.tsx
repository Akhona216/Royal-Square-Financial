import React, { useState, useEffect } from 'react';
import {
  CarFront,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Shield,
  Camera,
  MapPin,
  Clock,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Send,
  HelpCircle,
} from 'lucide-react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { Timeline } from '../../components/common/Timeline.js';
import { Input, Select, DatePicker } from '../../components/common/Input.js';
import { Modal } from '../../components/common/Modal.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { api } from '../../services/api.js';
import { Claim, ClaimTimelineStage } from '../../types/index.js';

export const MotorClaimsWizard: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [activeClaimId, setActiveClaimId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);

  // Wizard Steps (1 to 5)
  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form state
  // Step 1: Incident details
  const [policyNumber, setPolicyNumber] = useState('POL-ST-884920');
  const [insurer, setInsurer] = useState('Santam');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [incidentLocation, setIncidentLocation] = useState('');
  const [weatherConditions, setWeatherConditions] = useState('Dry & Clear');
  const [description, setDescription] = useState('');
  const [estimatedAmount, setEstimatedAmount] = useState('');

  // Step 2: Evidence checklist
  const [driverLicenseUploaded, setDriverLicenseUploaded] = useState(true);
  const [damagePhotosCount, setDamagePhotosCount] = useState(4);
  const [dashcamAvailable, setDashcamAvailable] = useState(false);
  const [policeReportUploaded, setPoliceReportUploaded] = useState(false);

  // Step 3: Police Information
  const [policeStation, setPoliceStation] = useState('');
  const [policeCaseNumber, setPoliceCaseNumber] = useState('');
  const [officerName, setOfficerName] = useState('');
  const [policeReportDate, setPoliceReportDate] = useState('');

  // Step 4: Third party details
  const [thirdPartyInvolved, setThirdPartyInvolved] = useState(false);
  const [tpName, setTpName] = useState('');
  const [tpContact, setTpContact] = useState('');
  const [tpVehicleReg, setTpVehicleReg] = useState('');
  const [tpVehicleMake, setTpVehicleMake] = useState('');
  const [tpInsurer, setTpInsurer] = useState('');

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    setLoading(true);
    try {
      const data = await api.claims.getAll();
      setClaims(data || []);
      if (data && data.length > 0 && !activeClaimId) {
        setActiveClaimId(data[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeClaim = claims.find((c) => c.id === activeClaimId) || claims[0];

  const handleOpenWizard = () => {
    setStep(1);
    setIncidentLocation('N1 Northbound near Rivonia Road Off-ramp, Sandton');
    setDescription('Rear-end collision during heavy evening congestion. Another vehicle failed to brake in time.');
    setEstimatedAmount('35000');
    setPoliceStation('Sandton SAPS');
    setPoliceCaseNumber('CAS 342/09/2026');
    setOfficerName('Constable Ndlovu');
    setPoliceReportDate(new Date().toISOString().split('T')[0]);
    setIsWizardOpen(true);
  };

  const handleSubmitClaim = async () => {
    setSubmitting(true);
    try {
      const payload = {
        policyNumber,
        insurer,
        type: 'Motor',
        incidentDate,
        incidentLocation,
        weatherConditions,
        description,
        estimatedAmount: estimatedAmount ? Number(estimatedAmount) : 25000,
        evidence: {
          driverLicenseUploaded,
          damagePhotosCount,
          dashcamAvailable,
          scenePhotosCount: 3,
          policeReportUploaded,
        },
        policeInfo: policeCaseNumber
          ? {
              stationName: policeStation,
              caseNumber: policeCaseNumber,
              officerName: officerName,
              reportedDate: policeReportDate || incidentDate,
            }
          : undefined,
        thirdParty: thirdPartyInvolved
          ? {
              involved: true,
              name: tpName,
              contactNumber: tpContact,
              vehicleReg: tpVehicleReg,
              vehicleMake: tpVehicleMake,
              insuranceCompany: tpInsurer,
            }
          : { involved: false },
      };

      const newClaim = await api.claims.create(payload);
      setIsWizardOpen(false);
      await loadClaims();
      setActiveClaimId(newClaim.id);
    } catch (err: any) {
      alert(err.message || 'Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  const formatZAR = (amount?: number) => {
    if (!amount) return 'R 0';
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9D9D9] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Motor Claims Assessment Wizard</h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Standardized South African digital claims dispatch with end-to-end stage tracking.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={handleOpenWizard}
        >
          Lodge Motor Accident Claim
        </Button>
      </div>

      {/* Active Claim Timeline Tracker Section */}
      {loading ? (
        <div className="h-64 bg-white border border-[#D9D9D9] rounded-lg animate-pulse p-6" />
      ) : activeClaim ? (
        <Card
          title={
            <div className="flex items-center gap-3">
              <CarFront className="w-5 h-5 text-[#C62828]" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-[#111111]">{activeClaim.claimNumber}</span>
                  <StatusBadge status={activeClaim.status} size="sm" />
                </div>
                <p className="text-xs text-[#6B6B6B]">
                  Underwriting Insurer: <strong className="text-[#111111]">{activeClaim.insurer}</strong> • Policy: {activeClaim.policyNumber}
                </p>
              </div>
            </div>
          }
          headerAction={
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6B6B6B]">Select Claim:</span>
              <select
                value={activeClaim.id}
                onChange={(e) => setActiveClaimId(e.target.value)}
                className="text-xs border border-[#D9D9D9] rounded px-2 py-1 bg-white font-medium cursor-pointer"
              >
                {claims.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.claimNumber} - {c.description.slice(0, 24)}...
                  </option>
                ))}
              </select>
            </div>
          }
        >
          <div className="space-y-6">
            {/* 7-Stage Visual Timeline Tracker */}
            <div className="bg-[#F8F9FA] p-6 rounded-lg border border-[#D9D9D9]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B]">
                  Claims Processing Pipeline
                </span>
                <span className="text-xs font-bold text-[#C62828] bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                  Active Stage: {activeClaim.currentStage}
                </span>
              </div>
              <Timeline events={activeClaim.timeline} currentStage={activeClaim.currentStage} />
            </div>

            {/* Claim Particulars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg border border-[#D9D9D9] space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] block">Incident Information</span>
                <div className="text-xs space-y-1">
                  <div><strong>Date:</strong> {new Date(activeClaim.incidentDate).toLocaleDateString('en-ZA')}</div>
                  <div><strong>Location:</strong> {activeClaim.incidentLocation}</div>
                  <div><strong>Conditions:</strong> {activeClaim.weatherConditions || 'Clear'}</div>
                  <div className="text-[#6B6B6B] pt-1">{activeClaim.description}</div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-[#D9D9D9] space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] block">SAPS Police Information</span>
                {activeClaim.policeInfo ? (
                  <div className="text-xs space-y-1">
                    <div><strong>Station:</strong> {activeClaim.policeInfo.stationName}</div>
                    <div><strong>Case Number:</strong> <span className="font-mono">{activeClaim.policeInfo.caseNumber}</span></div>
                    <div><strong>Officer:</strong> {activeClaim.policeInfo.officerName}</div>
                    <div><strong>Reported:</strong> {new Date(activeClaim.policeInfo.reportedDate).toLocaleDateString('en-ZA')}</div>
                  </div>
                ) : (
                  <div className="text-xs text-[#6B6B6B]">No police docket recorded for this claim.</div>
                )}
              </div>

              <div className="p-4 bg-white rounded-lg border border-[#D9D9D9] space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] block">Settlement & Assessment</span>
                <div className="text-xs space-y-1">
                  <div><strong>Estimated Loss:</strong> <span className="font-mono font-bold text-[#111111]">{formatZAR(activeClaim.estimatedAmount)}</span></div>
                  <div>
                    <strong>Settled Amount:</strong>{' '}
                    <span className="font-mono font-bold text-emerald-700">
                      {activeClaim.settlementAmount ? formatZAR(activeClaim.settlementAmount) : 'Pending Assessment'}
                    </span>
                  </div>
                  <div><strong>Damage Photos:</strong> {activeClaim.evidence?.damagePhotosCount || 0} uploaded</div>
                  <div><strong>Driver License:</strong> {activeClaim.evidence?.driverLicenseUploaded ? 'Verified' : 'Pending'}</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <EmptyState
          title="No claims history found"
          description="If you were involved in a motor vehicle accident, launch the wizard to record incident details and dispatch to underwriters."
          actionLabel="Launch Claims Wizard"
          onAction={handleOpenWizard}
        />
      )}

      {/* Claims History Table */}
      <Card title="Submitted Insurance Claims History" subtitle="Full audit log of motor, property, and risk claims">
        <div className="divide-y divide-[#D9D9D9]">
          {claims.map((claim) => (
            <div
              key={claim.id}
              onClick={() => setActiveClaimId(claim.id)}
              className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer transition-colors ${
                claim.id === activeClaimId ? 'bg-red-50/40 border-l-4 border-l-[#C62828]' : 'hover:bg-[#F8F9FA]'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-[#111111]">{claim.claimNumber}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#F2F2F2] border border-[#D9D9D9]">
                    {claim.insurer}
                  </span>
                  <StatusBadge status={claim.status} size="sm" />
                </div>
                <div className="text-sm font-semibold text-[#111111] mt-1">{claim.description}</div>
                <div className="text-xs text-[#6B6B6B] mt-0.5">
                  Location: {claim.incidentLocation} • Date: {new Date(claim.incidentDate).toLocaleDateString('en-ZA')}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs text-[#6B6B6B] block">Current Stage</span>
                  <span className="text-xs font-bold text-[#C62828] uppercase">{claim.currentStage}</span>
                </div>
                <Button variant="outline" size="sm">
                  View Timeline
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Multi-Step Wizard Modal */}
      <Modal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title="Motor Accident Claims Wizard"
        subtitle={`Step ${step} of 5: ${
          step === 1
            ? 'Incident Details'
            : step === 2
            ? 'Evidence & Photos'
            : step === 3
            ? 'Police Case Docket'
            : step === 4
            ? 'Third-Party Information'
            : 'Review & Underwriter Submission'
        }`}
        maxWidth="2xl"
      >
        <div className="space-y-6">
          {/* Step Progress Indicators */}
          <div className="flex items-center justify-between border-b border-[#D9D9D9] pb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    s === step
                      ? 'bg-[#C62828] text-white'
                      : s < step
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#F2F2F2] text-[#6B6B6B] border border-[#D9D9D9]'
                  }`}
                >
                  {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                <span className="text-xs font-medium hidden sm:inline text-[#111111]">
                  {s === 1 ? 'Incident' : s === 2 ? 'Evidence' : s === 3 ? 'SAPS' : s === 4 ? 'Third Party' : 'Review'}
                </span>
              </div>
            ))}
          </div>

          {/* Step 1: Incident details */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Associated Motor Policy"
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  options={[
                    { label: 'POL-ST-884920 (Santam Comprehensive Motor)', value: 'POL-ST-884920' },
                    { label: 'POL-DISC-90123 (Discovery Insure Motor)', value: 'POL-DISC-90123' },
                  ]}
                />
                <Select
                  label="Underwriting Insurer"
                  value={insurer}
                  onChange={(e) => setInsurer(e.target.value)}
                  options={[
                    { label: 'Santam Insurance Ltd', value: 'Santam' },
                    { label: 'Discovery Insure', value: 'Discovery' },
                    { label: 'Old Mutual Insure', value: 'Old Mutual' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DatePicker
                  label="Date of Incident"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  required
                />
                <Select
                  label="Weather / Road Conditions"
                  value={weatherConditions}
                  onChange={(e) => setWeatherConditions(e.target.value)}
                  options={[
                    { label: 'Dry & Clear', value: 'Dry & Clear' },
                    { label: 'Wet Road / Heavy Rain', value: 'Wet Road / Heavy Rain' },
                    { label: 'Night / Poor Visibility', value: 'Night / Poor Visibility' },
                    { label: 'Fog / Mist', value: 'Fog / Mist' },
                  ]}
                />
              </div>

              <Input
                label="Exact Incident Location"
                placeholder="Street address, highway marker, intersection, or city"
                value={incidentLocation}
                onChange={(e) => setIncidentLocation(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-[#1F1F1F] mb-1.5 uppercase tracking-wider">
                  Accident Narrative & Description
                </label>
                <textarea
                  className="w-full px-3 py-2 text-sm text-[#111111] bg-white border border-[#D9D9D9] rounded-md focus:outline-none focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828]"
                  rows={3}
                  placeholder="Explain how the incident occurred, lane positioning, impact angle, and driver actions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Estimated Vehicle Damage / Repair Cost (ZAR)"
                type="number"
                prefixText="R"
                placeholder="e.g. 35000"
                value={estimatedAmount}
                onChange={(e) => setEstimatedAmount(e.target.value)}
              />
            </div>
          )}

          {/* Step 2: Evidence Checklist */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-[#6B6B6B]">
                Upload or confirm digital evidence required by underwriters for immediate claims authorization.
              </p>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3.5 bg-[#F8F9FA] rounded-md border border-[#D9D9D9] cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={driverLicenseUploaded}
                      onChange={(e) => setDriverLicenseUploaded(e.target.checked)}
                      className="w-4 h-4 text-[#C62828] rounded border-gray-300 focus:ring-[#C62828]"
                    />
                    <div>
                      <span className="text-sm font-semibold text-[#111111] block">Driver's License Verified</span>
                      <span className="text-xs text-[#6B6B6B]">Valid South African Driver's License Card (Code B/EB)</span>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-700 font-semibold">Attached from Vault</span>
                </label>

                <label className="flex items-center justify-between p-3.5 bg-[#F8F9FA] rounded-md border border-[#D9D9D9] cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={dashcamAvailable}
                      onChange={(e) => setDashcamAvailable(e.target.checked)}
                      className="w-4 h-4 text-[#C62828] rounded border-gray-300 focus:ring-[#C62828]"
                    />
                    <div>
                      <span className="text-sm font-semibold text-[#111111] block">Dashcam Video Footage Available</span>
                      <span className="text-xs text-[#6B6B6B]">Telematics or forward collision dashcam video file</span>
                    </div>
                  </div>
                  <span className="text-xs text-[#6B6B6B]">{dashcamAvailable ? 'Included' : 'Optional'}</span>
                </label>

                <div className="p-3.5 bg-[#F8F9FA] rounded-md border border-[#D9D9D9]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-[#111111]">Vehicle Damage Photos</span>
                    <span className="text-xs font-bold text-[#C62828]">{damagePhotosCount} Photos Attached</span>
                  </div>
                  <p className="text-xs text-[#6B6B6B] mb-3">
                    Include wide scene photos, bumper impact point, license disc, and vehicle odometer reading.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      leftIcon={<Camera className="w-3.5 h-3.5" />}
                      onClick={() => setDamagePhotosCount((prev) => prev + 1)}
                    >
                      Add Photo (+1)
                    </Button>
                    {damagePhotosCount > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setDamagePhotosCount(0)}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Police Information */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 leading-relaxed">
                <strong>South African Law (National Road Traffic Act):</strong> Accidents involving third parties or public infrastructure must be reported to the South African Police Service (SAPS) within 24 hours.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="SAPS Police Station"
                  placeholder="e.g. Sandton SAPS / Cape Town Central"
                  value={policeStation}
                  onChange={(e) => setPoliceStation(e.target.value)}
                  required
                />
                <Input
                  label="Police Case Number (O.B. / CAS Number)"
                  placeholder="e.g. CAS 342/09/2026"
                  value={policeCaseNumber}
                  onChange={(e) => setPoliceCaseNumber(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Investigating Officer Name / Badge #"
                  placeholder="e.g. Constable Ndlovu"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                />
                <DatePicker
                  label="Date Reported to SAPS"
                  value={policeReportDate}
                  onChange={(e) => setPoliceReportDate(e.target.value)}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={policeReportUploaded}
                  onChange={(e) => setPoliceReportUploaded(e.target.checked)}
                  className="w-4 h-4 text-[#C62828] rounded border-gray-300"
                />
                <span className="text-xs font-semibold text-[#111111]">
                  I have a stamped copy of the SAPS Accident Report form (AR Form)
                </span>
              </label>
            </div>
          )}

          {/* Step 4: Third Party Information */}
          {step === 4 && (
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer pb-2 border-b border-[#D9D9D9]">
                <input
                  type="checkbox"
                  checked={thirdPartyInvolved}
                  onChange={(e) => setThirdPartyInvolved(e.target.checked)}
                  className="w-4 h-4 text-[#C62828] rounded border-gray-300"
                />
                <span className="text-sm font-bold text-[#111111]">
                  Another vehicle, pedestrian, or third party was involved
                </span>
              </label>

              {thirdPartyInvolved ? (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Third Party Driver Name"
                      placeholder="Full Name"
                      value={tpName}
                      onChange={(e) => setTpName(e.target.value)}
                    />
                    <Input
                      label="Contact Number"
                      placeholder="+27 82 000 0000"
                      value={tpContact}
                      onChange={(e) => setTpContact(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="Vehicle Registration"
                      placeholder="e.g. CA 829-102"
                      value={tpVehicleReg}
                      onChange={(e) => setTpVehicleReg(e.target.value)}
                    />
                    <Input
                      label="Vehicle Make & Model"
                      placeholder="e.g. Toyota Hilux"
                      value={tpVehicleMake}
                      onChange={(e) => setTpVehicleMake(e.target.value)}
                    />
                    <Input
                      label="Third Party Insurer"
                      placeholder="e.g. Discovery / OUTsurance"
                      value={tpInsurer}
                      onChange={(e) => setTpInsurer(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#F8F9FA] rounded-md border border-[#D9D9D9] text-xs text-[#6B6B6B]">
                  Single vehicle incident selected (e.g. stationary object, windscreen chip, or hail damage).
                </div>
              )}
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="p-4 bg-[#F8F9FA] rounded-lg border border-[#D9D9D9] space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#6B6B6B]">Underwriting Insurer:</span>
                  <span className="font-bold text-[#111111]">{insurer} ({policyNumber})</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#6B6B6B]">Incident Date & Location:</span>
                  <span className="font-bold text-[#111111]">{incidentDate} • {incidentLocation}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#6B6B6B]">SAPS Docket:</span>
                  <span className="font-bold text-[#111111]">{policeStation} • {policeCaseNumber || 'None'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#6B6B6B]">Evidence Attached:</span>
                  <span className="font-bold text-emerald-700">
                    {damagePhotosCount} Photos • Driver License {driverLicenseUploaded ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#6B6B6B]">Estimated Claim Value:</span>
                  <span className="font-bold text-[#C62828] font-mono">{formatZAR(Number(estimatedAmount))}</span>
                </div>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-900 leading-relaxed">
                By submitting, you declare that all information provided is true and complete in terms of the Short-Term Insurance Act and Policy Contract.
              </div>
            </div>
          )}

          {/* Step Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-[#D9D9D9]">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="md"
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                onClick={() => setStep((s) => s - 1)}
              >
                Previous Step
              </Button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => setStep((s) => s + 1)}
              >
                Proceed to Step {step + 1}
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="md"
                isLoading={submitting}
                leftIcon={<Send className="w-3.5 h-3.5" />}
                onClick={handleSubmitClaim}
              >
                Submit Claim to Underwriters
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
