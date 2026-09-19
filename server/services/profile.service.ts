import { profileRepository } from '../repositories/profile.repository.js';
import { auditRepository } from '../repositories/audit.repository.js';
import { ClientProfile, AuditLogChange, AuditLogEntry } from '../repositories/types.js';

export interface ProfileUpdateActor {
  id: string;
  role: 'client' | 'adviser';
  name?: string;
  ipAddress?: string;
}

export class ProfileService {
  async getProfile(userId: string, actor: ProfileUpdateActor): Promise<{
    profile: ClientProfile;
    recentAuditLogs: AuditLogEntry[];
  }> {
    // Security check: Clients may only access their own profile
    if (actor.role === 'client' && actor.id !== userId) {
      const err: any = new Error('Access denied: Clients may only view their own profile');
      err.statusCode = 403;
      throw err;
    }

    const profile = await profileRepository.getProfileByUserId(userId);
    if (!profile) {
      const err: any = new Error('Client profile not found');
      err.statusCode = 404;
      throw err;
    }

    const recentAuditLogs = await auditRepository.getLogs({
      userId,
      limit: 10,
    });

    return { profile, recentAuditLogs };
  }

  async updateProfile(
    userId: string,
    updates: Partial<ClientProfile>,
    actor: ProfileUpdateActor
  ): Promise<{
    profile: ClientProfile;
    auditEntry: AuditLogEntry;
    sensitiveChangesFlagged: boolean;
  }> {
    // Security check 1: Clients may only update their own information
    if (actor.role === 'client' && actor.id !== userId) {
      const err: any = new Error('Security violation: Clients may only update their own personal information');
      err.statusCode = 403;
      throw err;
    }

    // Load existing profile for validation and diff calculation
    const existing = await profileRepository.getProfileByUserId(userId);
    if (!existing) {
      const err: any = new Error('Client profile not found');
      err.statusCode = 404;
      throw err;
    }

    // Security check 2: Backend validation
    this.validateProfileUpdates(updates);

    // Calculate diff for audit log
    const changes: AuditLogChange[] = [];
    let bankingChanged = false;

    if (updates.name && updates.name.trim() !== existing.name) {
      changes.push({
        field: 'name',
        label: 'Full Legal Name',
        oldValue: existing.name,
        newValue: updates.name.trim(),
      });
    }

    if (updates.phone && updates.phone.trim() !== existing.phone) {
      changes.push({
        field: 'phone',
        label: 'Phone Number',
        oldValue: existing.phone,
        newValue: updates.phone.trim(),
      });
    }

    if (updates.email && updates.email.trim().toLowerCase() !== existing.email.toLowerCase()) {
      changes.push({
        field: 'email',
        label: 'Email Address',
        oldValue: existing.email,
        newValue: updates.email.trim().toLowerCase(),
      });
    }

    if (updates.residentialAddress) {
      const r = updates.residentialAddress;
      const exR = existing.residentialAddress;
      if (
        r.street !== exR.street ||
        r.suburb !== exR.suburb ||
        r.city !== exR.city ||
        r.province !== exR.province ||
        r.postalCode !== exR.postalCode
      ) {
        changes.push({
          field: 'residentialAddress',
          label: 'Residential Address',
          oldValue: `${exR.street}, ${exR.suburb}, ${exR.city} ${exR.postalCode}`,
          newValue: `${r.street || exR.street}, ${r.suburb || exR.suburb}, ${r.city || exR.city} ${r.postalCode || exR.postalCode}`,
        });
      }
    }

    if (updates.postalAddress) {
      const p = updates.postalAddress;
      const exP = existing.postalAddress;
      if (p.sameAsResidential !== exP.sameAsResidential || p.street !== exP.street || p.postalCode !== exP.postalCode) {
        changes.push({
          field: 'postalAddress',
          label: 'Postal Address',
          oldValue: exP.sameAsResidential ? 'Same as residential' : `${exP.street}, ${exP.city}`,
          newValue: p.sameAsResidential ? 'Same as residential' : `${p.street || ''}, ${p.city || ''}`,
        });
      }
    }

    if (updates.emergencyContact) {
      const ec = updates.emergencyContact;
      const exEc = existing.emergencyContact;
      if (ec.name !== exEc.name || ec.phone !== exEc.phone || ec.relationship !== exEc.relationship) {
        changes.push({
          field: 'emergencyContact',
          label: 'Emergency Contact',
          oldValue: `${exEc.name} (${exEc.relationship}) - ${exEc.phone}`,
          newValue: `${ec.name} (${ec.relationship}) - ${ec.phone}`,
        });
      }
    }

    if (updates.bankingDetails) {
      const bd = updates.bankingDetails;
      const exBd = existing.bankingDetails;

      // Clean account number
      const cleanNewAcc = (bd.accountNumber || '').replace(/\s+/g, '');
      const cleanOldAcc = (exBd.accountNumber || '').replace(/\s+/g, '');

      if (
        bd.bankName !== exBd.bankName ||
        cleanNewAcc !== cleanOldAcc ||
        bd.branchCode !== exBd.branchCode ||
        bd.accountType !== exBd.accountType
      ) {
        bankingChanged = true;
        changes.push({
          field: 'bankingDetails',
          label: 'Banking Details',
          oldValue: `${exBd.bankName} (Acc ending ${cleanOldAcc.slice(-4)})`,
          newValue: `${bd.bankName} (Acc ending ${cleanNewAcc.slice(-4)})`,
          sensitive: true,
        });

        // Security feature: For highly sensitive changes like banking details,
        // set status to pending_verification and flag for compliance verification
        updates.bankingDetails = {
          ...exBd,
          ...bd,
          accountNumber: cleanNewAcc,
          verificationStatus: 'pending_verification',
          verifiedAt: undefined,
          verificationRequiredNote:
            'Pending FICA verification: Debit order / disbursement updates require bank confirmation letter or two-factor OTP verification.',
        };
      }
    }

    if (updates.maritalStatus && updates.maritalStatus !== existing.maritalStatus) {
      changes.push({
        field: 'maritalStatus',
        label: 'Marital Status',
        oldValue: existing.maritalStatus,
        newValue: updates.maritalStatus,
      });
    }

    if (updates.occupation && updates.occupation !== existing.occupation) {
      changes.push({
        field: 'occupation',
        label: 'Occupation & Employer',
        oldValue: existing.occupation,
        newValue: updates.occupation,
      });
    }

    if (updates.preferredCommunication && updates.preferredCommunication !== existing.preferredCommunication) {
      changes.push({
        field: 'preferredCommunication',
        label: 'Preferred Communication Channel',
        oldValue: existing.preferredCommunication,
        newValue: updates.preferredCommunication,
      });
    }

    // Save updates in repository
    const updatedProfile = await profileRepository.updateProfile(userId, updates);

    // Record important profile changes in the audit log
    const auditAction = bankingChanged ? 'BANKING_DETAILS_CHANGED' : 'PROFILE_UPDATED';
    const auditStatus = bankingChanged ? 'FLAGGED_FOR_VERIFICATION' : 'SUCCESS';
    const description = bankingChanged
      ? `Client updated banking details to ${updates.bankingDetails?.bankName} (Ending ••••${(updates.bankingDetails?.accountNumber || '').slice(-4)}). Flagged for FICA bank letter verification.`
      : `Client updated personal profile information (${changes.map((c) => c.label).join(', ') || 'No critical fields changed'}).`;

    const auditEntry = await auditRepository.log({
      userId,
      userName: updatedProfile.name,
      userRole: actor.role,
      action: auditAction,
      category: bankingChanged ? 'banking' : 'profile',
      entityId: userId,
      entityType: 'user',
      description,
      changes,
      status: auditStatus,
      ipAddress: actor.ipAddress || '197.185.102.44',
    });

    return {
      profile: updatedProfile,
      auditEntry,
      sensitiveChangesFlagged: bankingChanged,
    };
  }

  async verifyBankingDetails(userId: string, verificationMethod: string, actor: ProfileUpdateActor) {
    const profile = await profileRepository.getProfileByUserId(userId);
    if (!profile) throw new Error('Profile not found');

    const updated = await profileRepository.updateProfile(userId, {
      bankingDetails: {
        ...profile.bankingDetails,
        verificationStatus: 'verified',
        verifiedAt: new Date().toISOString(),
        verificationRequiredNote: `Verified via ${verificationMethod} on ${new Date().toLocaleDateString('en-ZA')}`,
      },
    });

    await auditRepository.log({
      userId,
      userName: profile.name,
      userRole: actor.role,
      action: 'BANKING_DETAILS_VERIFIED',
      category: 'banking',
      entityId: userId,
      entityType: 'user',
      description: `Banking details verified via ${verificationMethod}. Status changed to Verified.`,
      status: 'SUCCESS',
      ipAddress: actor.ipAddress,
    });

    return updated;
  }

  private validateProfileUpdates(updates: Partial<ClientProfile>) {
    if (updates.name !== undefined) {
      if (!updates.name || updates.name.trim().length < 2) {
        throw new Error('Full legal name must contain at least 2 characters.');
      }
    }

    if (updates.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!updates.email || !emailRegex.test(updates.email.trim())) {
        throw new Error('Please enter a valid email address.');
      }
    }

    if (updates.phone !== undefined) {
      const phoneClean = (updates.phone || '').replace(/[\s\-()]/g, '');
      if (!phoneClean || phoneClean.length < 9) {
        throw new Error('Please enter a valid contact phone number.');
      }
    }

    if (updates.residentialAddress !== undefined) {
      const { street, suburb, city, province, postalCode } = updates.residentialAddress;
      if (!street || !city || !postalCode) {
        throw new Error('Residential address requires street, city, and postal code.');
      }
    }

    if (updates.emergencyContact !== undefined) {
      const { name, phone, relationship } = updates.emergencyContact;
      if (!name || !phone || !relationship) {
        throw new Error('Emergency contact requires full name, phone number, and relationship.');
      }
    }

    if (updates.bankingDetails !== undefined) {
      const { bankName, accountHolder, accountNumber, branchCode } = updates.bankingDetails;
      if (!bankName || !accountHolder || !accountNumber || !branchCode) {
        throw new Error('All banking details (Bank name, Account holder, Account number, Branch code) are required.');
      }
      const cleanAcc = accountNumber.replace(/\s+/g, '');
      if (!/^\d{6,14}$/.test(cleanAcc)) {
        throw new Error('Account number must contain between 6 and 14 numeric digits.');
      }
      const cleanBranch = branchCode.replace(/\s+/g, '');
      if (!/^\d{4,8}$/.test(cleanBranch)) {
        throw new Error('Branch code must contain valid numeric digits.');
      }
    }
  }
}

export const profileService = new ProfileService();
