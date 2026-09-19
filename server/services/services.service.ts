import { servicesRepository } from '../repositories/services.repository.js';
import { ServiceRequest, ServiceRequestType } from '../repositories/types.js';

export class ServicesService {
  async getServiceRequests(filter?: { clientId?: string; status?: string; type?: string }): Promise<ServiceRequest[]> {
    return servicesRepository.getServiceRequests(filter);
  }

  async getServiceRequestById(id: string): Promise<ServiceRequest | null> {
    return servicesRepository.getServiceRequestById(id);
  }

  async createServiceRequest(data: {
    clientId: string;
    clientName: string;
    type: ServiceRequestType;
    details: string;
    urgency?: 'Low' | 'Medium' | 'High';
    supportingDocuments?: string[];
  }): Promise<ServiceRequest> {
    if (!data.type || !data.details) {
      throw new Error('Request type and details are required');
    }

    return servicesRepository.createServiceRequest({
      clientId: data.clientId,
      clientName: data.clientName,
      type: data.type,
      details: data.details,
      urgency: data.urgency || 'Medium',
      status: 'Submitted',
      supportingDocuments: data.supportingDocuments || [],
      assignedAdviser: 'Johan van der Merwe, CFP®',
    });
  }

  async updateServiceRequest(id: string, updates: Partial<ServiceRequest>): Promise<ServiceRequest | null> {
    return servicesRepository.updateServiceRequest(id, updates);
  }
}

export const servicesService = new ServicesService();
