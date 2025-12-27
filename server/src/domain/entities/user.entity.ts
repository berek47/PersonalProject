// User role is now a string in the database
export type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: string;
  banned: boolean;
  bannedAt?: Date | null;
  bannedReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string; // Password will be stored in Account table
  name: string;
  role?: UserRole;
  image?: string;
}

export interface UpdateUserDTO {
  email?: string;
  name?: string;
  image?: string;
}

export interface UserWithoutPassword extends User {}

// Account model for credential authentication
export interface Account {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  idToken?: string | null;
  accessTokenExpiresAt?: Date | null;
  refreshTokenExpiresAt?: Date | null;
  scope?: string | null;
  password?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
