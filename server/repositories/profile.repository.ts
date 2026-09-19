import { ClientProfile } from './types.js';

const mockProfiles: Record<string, ClientProfile> = {
  usr_client_001: {
    id: 'usr_client_001',
    name: 'Sipho Dlamini',
    email: 'client@royalsquare.co.za',
    phone: '+27 82 459 8920',
    idNumber: '8803155123088',
    taxNumber: '9482103492',
    role: 'client',
    adviserId: 'usr_adv_001',
    twoFactorEnabled: true,
    residentialAddress: {
      street: '14 Wilton Avenue',
      suburb: 'Bryanston',
      city: 'Johannesburg',
      province: 'Gauteng',
      postalCode: '2191',
      country: 'South Africa',
    },
    postalAddress: {
      sameAsResidential: true,
      street: 'PostNet Suite 412, Private Bag X1',
      suburb: 'Bryanston',
      city: 'Johannesburg',
      province: 'Gauteng',
      postalCode: '2021',
      country: 'South Africa',
    },
    emergencyContact: {
      name: 'Nomvula Dlamini',
      relationship: 'Spouse',
      phone: '+27 82 910 4412',
      alternativePhone: '+27 11 706 8800',
      email: 'nomvula.d@dlamini-holdings.co.za',
    },
    bankingDetails: {
      bankName: 'Standard Bank of South Africa',
      accountHolder: 'S Dlamini',
      accountNumber: '10148920491',
      accountType: 'Cheque / Current',
      branchCode: '051001',
      verificationStatus: 'verified',
      verifiedAt: '2026-07-10T10:00:00Z',
      verificationRequiredNote: 'FICA bank confirmation letter verified with Standard Bank Sandton branch.',
    },
    maritalStatus: 'Married in Community of Property',
    occupation: 'Managing Director & Infrastructure Consultant',
    employer: 'Dlamini Engineering & Infrastructure Ltd',
    preferredCommunication: 'Email',
    preferredLanguage: 'English',
    lastUpdated: '2026-08-15T09:12:00Z',
  },
  usr_client_002: {
    id: 'usr_client_002',
    name: 'Thandiwe Sithole',
    email: 'thandiwe.s@mweb.co.za',
    phone: '+27 83 719 5541',
    idNumber: '9107220194082',
    taxNumber: '9840192841',
    role: 'client',
    adviserId: 'usr_adv_001',
    twoFactorEnabled: true,
    residentialAddress: {
      street: '48 Boundary Road',
      suburb: 'Houghton Estate',
      city: 'Johannesburg',
      province: 'Gauteng',
      postalCode: '2198',
      country: 'South Africa',
    },
    postalAddress: {
      sameAsResidential: true,
      street: '48 Boundary Road',
      suburb: 'Houghton Estate',
      city: 'Johannesburg',
      province: 'Gauteng',
      postalCode: '2198',
      country: 'South Africa',
    },
    emergencyContact: {
      name: 'Bongani Sithole',
      relationship: 'Brother',
      phone: '+27 83 401 9283',
      email: 'bongani@sithole.co.za',
    },
    bankingDetails: {
      bankName: 'First National Bank (FNB)',
      accountHolder: 'T Sithole',
      accountNumber: '62849102841',
      accountType: 'Cheque / Current',
      branchCode: '250655',
      verificationStatus: 'verified',
      verifiedAt: '2026-05-18T14:20:00Z',
    },
    maritalStatus: 'Single',
    occupation: 'Commercial Actuary',
    employer: 'Liberty Group South Africa',
    preferredCommunication: 'Email',
    preferredLanguage: 'English',
    lastUpdated: '2026-05-18T14:20:00Z',
  },
};

export class ProfileRepository {
  async getProfileByUserId(userId: string): Promise<ClientProfile | null> {
    const profile = mockProfiles[userId];
    if (profile) return JSON.parse(JSON.stringify(profile));

    // Fallback template for any new user
    return {
      id: userId,
      name: 'Sipho Dlamini',
      email: 'client@royalsquare.co.za',
      phone: '+27 82 459 8920',
      idNumber: '8803155123088',
      taxNumber: '9482103492',
      role: 'client',
      adviserId: 'usr_adv_001',
      twoFactorEnabled: true,
      residentialAddress: {
        street: '14 Wilton Avenue',
        suburb: 'Bryanston',
        city: 'Johannesburg',
        province: 'Gauteng',
        postalCode: '2191',
        country: 'South Africa',
      },
      postalAddress: {
        sameAsResidential: true,
        street: '14 Wilton Avenue',
        suburb: 'Bryanston',
        city: 'Johannesburg',
        province: 'Gauteng',
        postalCode: '2191',
        country: 'South Africa',
      },
      emergencyContact: {
        name: 'Nomvula Dlamini',
        relationship: 'Spouse',
        phone: '+27 82 910 4412',
        email: 'nomvula.d@dlamini-holdings.co.za',
      },
      bankingDetails: {
        bankName: 'Standard Bank of South Africa',
        accountHolder: 'S Dlamini',
        accountNumber: '10148920491',
        accountType: 'Cheque / Current',
        branchCode: '051001',
        verificationStatus: 'verified',
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  async updateProfile(userId: string, updates: Partial<ClientProfile>): Promise<ClientProfile> {
    let profile = mockProfiles[userId];
    if (!profile) {
      profile = (await this.getProfileByUserId(userId))!;
    }

    // Merge nested addresses and banking details safely
    const updated: ClientProfile = {
      ...profile,
      ...updates,
      id: userId, // immutable id protection
      residentialAddress: {
        ...profile.residentialAddress,
        ...(updates.residentialAddress || {}),
      },
      postalAddress: {
        ...profile.postalAddress,
        ...(updates.postalAddress || {}),
      },
      emergencyContact: {
        ...profile.emergencyContact,
        ...(updates.emergencyContact || {}),
      },
      bankingDetails: {
        ...profile.bankingDetails,
        ...(updates.bankingDetails || {}),
      },
      lastUpdated: new Date().toISOString(),
    };

    mockProfiles[userId] = updated;
    return JSON.parse(JSON.stringify(updated));
  }
}

export const profileRepository = new ProfileRepository();
