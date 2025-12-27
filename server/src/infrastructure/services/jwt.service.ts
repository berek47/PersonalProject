import jwt from 'jsonwebtoken';
import { config } from '../../config';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export class JwtService {
  static sign(payload: JwtPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);
  }

  static verify(token: string): JwtPayload {
    return jwt.verify(token, config.jwt.secret) as JwtPayload;
  }

  static decode(token: string): JwtPayload | null {
    return jwt.decode(token) as JwtPayload | null;
  }
}
