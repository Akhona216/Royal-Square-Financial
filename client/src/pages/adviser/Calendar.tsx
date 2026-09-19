import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  Video,
  Building,
  UserCheck,
} from 'lucide-react';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { Modal } from '../../components/common/Modal.js';
import { Input, Select, DatePicker } from '../../components/common/Input.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { api } from '../../services/api.js';
import { CalendarAppointment } from '../../types/index.js';

export const CalendarPage: React.FC = () => {
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [clientName, setClientName] = useState('Sipho Dlamini');
  const [title, setTitle] = useState('Comprehensive Annual Financial Review');
  const [type, setType] = useState<any>('Financial Review');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [location, setLocation] = useState('Royal Square Executive Boardroom / Sandton');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCalendar();
  }, []);

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const data = await api.adviser.getCalendar();
      setAppointments(data || []);
    } catch (err: any) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.adviser.createAppointment({
        clientName,
        title,
        type,
        date,
        time,
        durationMinutes: Number(durationMinutes),
        location,
      });
      setIsModalOpen(false);
      fetchCalendar();
    } catch (err: any) {
      alert(err.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9D9D9] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] tracking-tight">Calendar & Client Review Schedule</h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Coordinate mandatory annual FAIS suitability reviews, renewal consultations, and claim conferences.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsModalOpen(true)}
        >
          Schedule Client Consultation
        </Button>
      </div>

      {/* Appointment Grid */}
      <Card
        title="Scheduled Client Engagements"
        subtitle="Mandated advisory consultations and underwriting assessments"
      >
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-50 animate-pulse rounded" />
            ))}
          </div>
        ) : appointments.length > 0 ? (
          <div className="divide-y divide-[#D9D9D9]">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-lg bg-[#F8F9FA] border border-[#D9D9D9] flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-[#C62828] leading-none">{apt.time}</span>
                    <span className="text-[10px] text-[#6B6B6B] mt-1">{apt.durationMinutes} min</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#111111]">{apt.title}</h4>
                      <StatusBadge status={apt.status} size="sm" />
                    </div>
                    <div className="text-xs text-[#111111] mt-0.5">
                      Client: <strong>{apt.clientName}</strong> • Type: {apt.type}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#6B6B6B] mt-1">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {new Date(apt.date).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#C62828]" />
                        {apt.location}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => alert(`Opening meeting agenda notes for ${apt.clientName}`)}
                  >
                    View Agenda
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No appointments scheduled"
            description="Book consultations for comprehensive balance sheet reviews or policy renewals."
            actionLabel="Schedule Review"
            onAction={() => setIsModalOpen(true)}
          />
        )}
      </Card>

      {/* Booking Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Client Consultation"
        subtitle="Reserve an executive boardroom session, Teams call, or on-site review"
      >
        <form onSubmit={handleCreateAppointment} className="space-y-4">
          <Input
            label="Consultation Title"
            placeholder="e.g. Annual FAIS Portfolio & Solvency Review"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Client Name"
              placeholder="e.g. Sipho Dlamini"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
            />
            <Select
              label="Consultation Category"
              value={type}
              onChange={(e) => setType(e.target.value)}
              options={[
                { label: 'Annual Financial Review', value: 'Financial Review' },
                { label: 'Client Consultation (General)', value: 'Client Consultation' },
                { label: 'Policy Renewal & Premium Audit', value: 'Policy Renewal' },
                { label: 'Claim Assessment Follow-up', value: 'Claim Follow-up' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DatePicker
              label="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <Input
              label="Time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
            <Select
              label="Duration"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              options={[
                { label: '30 Minutes', value: '30' },
                { label: '45 Minutes', value: '45' },
                { label: '60 Minutes', value: '60' },
                { label: '90 Minutes', value: '90' },
              ]}
            />
          </div>

          <Input
            label="Meeting Location / Video Conference Link"
            placeholder="e.g. Royal Square Sandton Boardroom or Microsoft Teams"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />

          <div className="pt-4 flex justify-end gap-2 border-t border-[#D9D9D9]">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={submitting}
            >
              Confirm Appointment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
