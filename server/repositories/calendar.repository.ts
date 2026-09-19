import { CalendarAppointment } from './types.js';

export class CalendarRepository {
  private appointments: CalendarAppointment[] = [
    {
      id: 'apt_001',
      adviserId: 'usr_adv_001',
      clientId: 'usr_client_001',
      clientName: 'Sipho Dlamini',
      title: 'Annual Financial Review & Portfolio Realignment',
      type: 'Financial Review',
      date: '2026-09-25',
      time: '10:00',
      durationMinutes: 60,
      location: 'Royal Square Boardroom A, Sandton / Teams',
      notes: 'Focus on Regulation 28 offshore allocation and capital gains tax planning.',
      status: 'Scheduled',
    },
    {
      id: 'apt_002',
      adviserId: 'usr_adv_001',
      clientId: 'usr_client_002',
      clientName: 'Thandiwe Sithole',
      title: 'Discovery Life & Severe Illness Benefit Audit',
      type: 'Policy Renewal',
      date: '2026-09-22',
      time: '14:30',
      durationMinutes: 45,
      location: 'Microsoft Teams Video Call',
      notes: 'Review updated smoking declaration and premium discount tier.',
      status: 'Scheduled',
    },
    {
      id: 'apt_003',
      adviserId: 'usr_adv_001',
      clientId: 'usr_client_003',
      clientName: 'Pieter Erasmus',
      title: 'Offshore Trust Structure & Family Governance',
      type: 'Client Consultation',
      date: '2026-09-28',
      time: '11:00',
      durationMinutes: 90,
      location: 'Sandton Office & Counsel',
      status: 'Scheduled',
    },
    {
      id: 'apt_004',
      adviserId: 'usr_adv_001',
      clientId: 'usr_client_001',
      clientName: 'Sipho Dlamini',
      title: 'Santam Motor Claim Follow-up & Repair Sign-off',
      type: 'Claim Follow-up',
      date: '2026-09-18',
      time: '16:00',
      durationMinutes: 30,
      location: 'Phone Consultation',
      notes: 'Confirmed repair authorization at approved auto body center.',
      status: 'Completed',
    }
  ];

  async getAppointments(adviserId: string): Promise<CalendarAppointment[]> {
    return [...this.appointments];
  }

  async createAppointment(data: Omit<CalendarAppointment, 'id'>): Promise<CalendarAppointment> {
    const apt: CalendarAppointment = {
      id: `apt_${Date.now()}`,
      ...data,
    };
    this.appointments.push(apt);
    return { ...apt };
  }

  async updateAppointment(id: string, updates: Partial<CalendarAppointment>): Promise<CalendarAppointment | null> {
    const apt = this.appointments.find(a => a.id === id);
    if (!apt) return null;
    Object.assign(apt, updates);
    return { ...apt };
  }
}

export const calendarRepository = new CalendarRepository();
