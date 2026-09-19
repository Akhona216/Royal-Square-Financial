import { User } from './types.js';

/**
 * Auth Repository Interface
 * Database-agnostic data-access functions for user authentication and profile management.
 */
export interface IAuthRepository {
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  createUser(userData: Omit<User, 'id'>): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | null>;
}

// In-Memory Data Store Placeholder (Ready to be swapped with direct SQL/ORM adapter)
const mockUsers: User[] = [
  {
    id: 'usr_client_001',
    email: 'client@royalsquare.co.za',
    name: 'Sipho Dlamini',
    role: 'client',
    phone: '+27 82 459 8920',
    idNumber: '8803155123088',
    taxNumber: '9482103492',
    adviserId: 'usr_adv_001',
    avatarUrl: '',
    twoFactorEnabled: true,
  },
  {
    id: 'usr_adv_001',
    email: 'adviser@royalsquare.co.za',
    name: 'Johan van der Merwe, CFP®',
    role: 'adviser',
    phone: '+27 83 912 4001',
    idNumber: '7506125021081',
    taxNumber: '9120485719',
    avatarUrl: '',
    twoFactorEnabled: true,
  },
];

export class AuthRepository implements IAuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user ? { ...user } : null;
  }

  async findUserById(id: string): Promise<User | null> {
    const user = mockUsers.find(u => u.id === id);
    return user ? { ...user } : null;
  }

  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const newUser: User = {
      id: `usr_${Date.now()}`,
      ...userData,
    };
    mockUsers.push(newUser);
    return { ...newUser };
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) return null;
    mockUsers[index] = { ...mockUsers[index], ...updates };
    return { ...mockUsers[index] };
  }
}

export const authRepository = new AuthRepository();
