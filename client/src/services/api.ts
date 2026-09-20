const API_BASE = '/api/v1';

class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('rsf_token');
  const role = localStorage.getItem('rsf_role') || 'client';
  const clientId = localStorage.getItem('rsf_client_id') || 'usr_client_001';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-user-role': role,
    'x-client-id': clientId,
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(json.message || `Request failed with status ${response.status}`, response.status);
  }

  return json.data !== undefined ? json.data : json;
}

export const api = {
  // Auth
  auth: {
    login: (email: string, role: 'client' | 'adviser') => 
      request<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, role }),
      }),
    register: (data: any) => 
      request<{ user: any; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: () => request<{ user: any }>('/auth/me'),
  },

  // Finances
  finances: {
    get: (clientId?: string) => 
      request<any>(clientId ? `/finances?clientId=${encodeURIComponent(clientId)}` : '/finances'),
    addAsset: (data: any) => 
      request<any>('/finances/assets', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    addLiability: (data: any) => 
      request<any>('/finances/liabilities', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    deleteAsset: (id: string, clientId?: string) => 
      request<any>(`/finances/assets/${id}${clientId ? `?clientId=${clientId}` : ''}`, {
        method: 'DELETE',
      }),
    deleteLiability: (id: string, clientId?: string) => 
      request<any>(`/finances/liabilities/${id}${clientId ? `?clientId=${clientId}` : ''}`, {
        method: 'DELETE',
      }),
  },

  // Goals
  goals: {
    getAll: (clientId?: string) => 
      request<{ goals: any[]; totalTarget: number; totalSaved: number; overallProgress: number }>(
        clientId ? `/goals?clientId=${encodeURIComponent(clientId)}` : '/goals'
      ),
    create: (data: any) => 
      request<any>('/goals', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) => 
      request<any>(`/goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) => 
      request<any>(`/goals/${id}`, {
        method: 'DELETE',
      }),
  },

  // Claims
  claims: {
    getAll: (params?: { clientId?: string; status?: string; all?: boolean }) => {
      const q = new URLSearchParams();
      if (params?.clientId) q.set('clientId', params.clientId);
      if (params?.status) q.set('status', params.status);
      if (params?.all) q.set('all', 'true');
      const qs = q.toString();
      return request<any[]>(`/claims${qs ? `?${qs}` : ''}`);
    },
    getById: (id: string) => request<any>(`/claims/${id}`),
    create: (data: any) => 
      request<any>('/claims', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, status: string, stage?: string, note?: string) => 
      request<any>(`/claims/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, stage, note }),
      }),
  },

  // Service Requests
  serviceRequests: {
    getAll: (params?: { clientId?: string; status?: string; all?: boolean }) => {
      const q = new URLSearchParams();
      if (params?.clientId) q.set('clientId', params.clientId);
      if (params?.status) q.set('status', params.status);
      if (params?.all) q.set('all', 'true');
      const qs = q.toString();
      return request<any[]>(`/service-requests${qs ? `?${qs}` : ''}`);
    },
    create: (data: any) => 
      request<any>('/service-requests', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) => 
      request<any>(`/service-requests/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // Integrations
  integrations: {
    getAll: () => request<any[]>('/integrations'),
    sync: (providerId: string) => 
      request<any>(`/integrations/${providerId}/sync`, {
        method: 'POST',
      }),
    updateStatus: (providerId: string, status: string) => 
      request<any>(`/integrations/${providerId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
  },

  // Adviser specifics
  adviser: {
    getDashboard: () => request<any>('/adviser/dashboard'),
    getActions: () => request<any[]>('/adviser/actions'),
    getClients: (q?: string) => request<any[]>(`/adviser/clients${q ? `?q=${encodeURIComponent(q)}` : ''}`),
    getClientDeepDive: (id: string) => request<any>(`/adviser/clients/${id}`),
    getTasks: (filter?: string) => request<any[]>(`/adviser/tasks${filter ? `?filter=${encodeURIComponent(filter)}` : ''}`),
    createTask: (data: any) => 
      request<any>('/adviser/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateTask: (id: string, data: any) => 
      request<any>(`/adviser/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    getCalendar: () => request<any[]>('/adviser/calendar'),
    createAppointment: (data: any) => 
      request<any>('/adviser/calendar', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Policies and documents
  policies: {
    getAll: (clientId?: string) => request<any[]>(`/policies${clientId ? `?clientId=${clientId}` : ''}`),
  },
  documents: {
    getAll: (clientId?: string, category?: string) => {
      const q = new URLSearchParams();
      if (clientId) q.set('clientId', clientId);
      if (category) q.set('category', category);
      const qs = q.toString();
      return request<any[]>(`/documents${qs ? `?${qs}` : ''}`);
    },
    upload: (data: any) => 
      request<any>('/documents', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Notifications
  notifications: {
    getAll: () => request<{ notifications: any[]; stats: any }>('/notifications'),
    markAsRead: (id: string) => 
      request<{ success: boolean; message: string }>(`/notifications/${id}/read`, {
        method: 'POST',
      }),
    markAllAsRead: () => 
      request<{ success: boolean; message: string }>('/notifications/read-all', {
        method: 'POST',
      }),
    dismiss: (id: string) => 
      request<{ success: boolean; message: string }>(`/notifications/${id}`, {
        method: 'DELETE',
      }),
    sendGreeting: (data: { clientId: string; clientName: string; message?: string }) => 
      request<{ success: boolean; message: string; data: any }>('/notifications/send-greeting', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Profile (Client Personal Information)
  profile: {
    get: (clientId?: string) => 
      request<{ success: boolean; data: any; recentAuditLogs: any[] }>(`/profile${clientId ? `?clientId=${clientId}` : ''}`),
    update: (data: any, clientId?: string) => 
      request<{ success: boolean; data: any; auditEntry: any; sensitiveChangesFlagged: boolean; message: string }>(`/profile${clientId ? `?clientId=${clientId}` : ''}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    verifyBanking: (verificationMethod?: string, clientId?: string) => 
      request<{ success: boolean; data: any; message: string }>(`/profile/verify-banking${clientId ? `?clientId=${clientId}` : ''}`, {
        method: 'POST',
        body: JSON.stringify({ verificationMethod }),
      }),
    getAuditLogs: (clientId?: string) => 
      request<{ success: boolean; data: any[] }>(`/profile/audit-logs${clientId ? `?clientId=${clientId}` : ''}`),
  },

  // Insurer B2B Telemetry & Repair updates
  providers: {
    sendRepairUpdate: (provider: string, claimNumber: string, data: {
      stage: string;
      status?: string;
      notes?: string;
      repairer?: {
        name?: string;
        contact?: string;
        assessorName?: string;
        workshopAddress?: string;
      };
      estimatedCompletionDate?: string;
      partsStatus?: string;
      authorizedAmount?: number;
      excessPayable?: number;
    }) => 
      request<{ success: boolean; message: string; data: any; notifications: any; auditEntry: any }>(`/providers/${provider}/claims/${claimNumber}/updates`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};
