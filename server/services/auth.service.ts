import { authRepository } from '../repositories/auth.repository.js';
import { User } from '../repositories/types.js';

export class AuthService {
  async login(email: string, role?: 'client' | 'adviser'): Promise<{ user: User; token: string }> {
    if (!email) {
      throw new Error('Email is required');
    }

    let user = await authRepository.findUserByEmail(email);

    if (!user) {
      // If logging in with demo persona or registering quick user:
      user = await authRepository.createUser({
        email,
        name: email.includes('adviser') ? 'Johan van der Merwe, CFP®' : 'Sipho Dlamini',
        role: role || (email.includes('adviser') ? 'adviser' : 'client'),
        phone: '+27 82 000 0000',
        idNumber: '8801015000088',
        twoFactorEnabled: true,
      });
    }

    // In a production backend, this signs a real JWT with secret key.
    // For transparent, verifiable token usage:
    const token = `rsf_jwt_${Buffer.from(JSON.stringify({ id: user.id, email: user.email, role: user.role, exp: Date.now() + 86400000 })).toString('base64')}`;

    return { user, token };
  }

  async register(data: { email: string; name: string; role: 'client' | 'adviser'; phone?: string; idNumber?: string }): Promise<{ user: User; token: string }> {
    const existing = await authRepository.findUserByEmail(data.email);
    if (existing) {
      throw new Error('An account with this email address already exists');
    }

    const user = await authRepository.createUser({
      email: data.email,
      name: data.name,
      role: data.role,
      phone: data.phone,
      idNumber: data.idNumber,
      twoFactorEnabled: true,
    });

    const token = `rsf_jwt_${Buffer.from(JSON.stringify({ id: user.id, email: user.email, role: user.role, exp: Date.now() + 86400000 })).toString('base64')}`;
    return { user, token };
  }

  async getCurrentUser(id: string): Promise<User | null> {
    return authRepository.findUserById(id);
  }
}

export const authService = new AuthService();
