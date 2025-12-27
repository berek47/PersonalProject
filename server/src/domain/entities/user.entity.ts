// Use Prisma's UserRole directly to avoid type mismatches
import { UserRole } from '@prisma/client';
export { UserRole };

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string | null;
  bio?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  avatar?: string;
  bio?: string;
}

export interface UpdateUserDTO {
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
}

export interface UserWithoutPassword extends Omit<User, 'password'> {}
