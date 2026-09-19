import { Request, Response, NextFunction } from 'express';
import { authRepository } from '../repositories/auth.repository.js';
import { User } from '../repositories/types.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const roleHeader = req.headers['x-user-role'] as string;
    const clientHeader = req.headers['x-client-id'] as string;

    let targetUserId = 'usr_client_001';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token.startsWith('rsf_jwt_')) {
        try {
          const payloadJson = Buffer.from(token.replace('rsf_jwt_', ''), 'base64').toString('utf8');
          const payload = JSON.parse(payloadJson);
          if (payload.id) {
            targetUserId = payload.id;
          }
        } catch (e) {
          // Token parse issue fallback
        }
      }
    } else if (roleHeader === 'adviser') {
      targetUserId = 'usr_adv_001';
    } else if (clientHeader) {
      targetUserId = clientHeader;
    }

    const user = await authRepository.findUserById(targetUserId);
    if (user) {
      req.user = user;
    } else {
      // Default fallback to client
      req.user = {
        id: 'usr_client_001',
        email: 'client@royalsquare.co.za',
        name: 'Sipho Dlamini',
        role: (roleHeader === 'adviser' ? 'adviser' : 'client'),
      };
    }
    next();
  } catch (error) {
    next(error);
  }
}
