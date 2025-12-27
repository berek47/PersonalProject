import { forbidden, unauthorized } from "next/navigation";
import { getServerSession } from "./get-session";

// Role constants
export const ROLES = {
  ADMIN: "ADMIN",
  INSTRUCTOR: "INSTRUCTOR",
  STUDENT: "STUDENT",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

/**
 * Require authentication - throws unauthorized if not logged in
 * @returns The authenticated user
 */
export async function requireAuth() {
  const session = await getServerSession();

  if (!session?.user) {
    unauthorized();
  }

  return session.user;
}

/**
 * Require specific role(s) - throws forbidden if user doesn't have required role
 * @param allowedRoles - Array of roles that are allowed
 * @returns The authenticated user with verified role
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth();

  const userRole = (user.role || ROLES.STUDENT) as UserRole;

  if (!allowedRoles.includes(userRole)) {
    forbidden();
  }

  return user;
}

/**
 * Require admin role
 */
export async function requireAdmin() {
  return requireRole([ROLES.ADMIN]);
}

/**
 * Require instructor or admin role
 */
export async function requireInstructor() {
  return requireRole([ROLES.ADMIN, ROLES.INSTRUCTOR]);
}

/**
 * Require any authenticated user (student, instructor, or admin)
 */
export async function requireStudent() {
  return requireRole([ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.STUDENT]);
}

/**
 * Check if user has a specific role (without throwing)
 * @param role - The role to check
 * @returns boolean indicating if user has the role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const session = await getServerSession();

  if (!session?.user) {
    return false;
  }

  const userRole = (session.user.role || ROLES.STUDENT) as UserRole;
  return userRole === role;
}

/**
 * Check if user has any of the specified roles (without throwing)
 * @param roles - Array of roles to check
 * @returns boolean indicating if user has any of the roles
 */
export async function hasAnyRole(roles: UserRole[]): Promise<boolean> {
  const session = await getServerSession();

  if (!session?.user) {
    return false;
  }

  const userRole = (session.user.role || ROLES.STUDENT) as UserRole;
  return roles.includes(userRole);
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole(ROLES.ADMIN);
}

/**
 * Check if user is instructor (or admin)
 */
export async function isInstructor(): Promise<boolean> {
  return hasAnyRole([ROLES.ADMIN, ROLES.INSTRUCTOR]);
}

/**
 * Get current user's role
 * @returns The user's role or null if not authenticated
 */
export async function getCurrentRole(): Promise<UserRole | null> {
  const session = await getServerSession();

  if (!session?.user) {
    return null;
  }

  return (session.user.role || ROLES.STUDENT) as UserRole;
}

/**
 * Check if user owns a resource
 * @param resourceOwnerId - The ID of the resource owner
 * @returns boolean indicating if the current user owns the resource
 */
export async function isResourceOwner(resourceOwnerId: string): Promise<boolean> {
  const session = await getServerSession();

  if (!session?.user) {
    return false;
  }

  return session.user.id === resourceOwnerId;
}

/**
 * Check if user can access a resource (owner or admin)
 * @param resourceOwnerId - The ID of the resource owner
 * @returns boolean indicating if the current user can access the resource
 */
export async function canAccessResource(resourceOwnerId: string): Promise<boolean> {
  const session = await getServerSession();

  if (!session?.user) {
    return false;
  }

  const userRole = (session.user.role || ROLES.STUDENT) as UserRole;

  return session.user.id === resourceOwnerId || userRole === ROLES.ADMIN;
}

/**
 * Require resource ownership or admin role
 * @param resourceOwnerId - The ID of the resource owner
 * @returns The authenticated user
 */
export async function requireResourceAccess(resourceOwnerId: string) {
  const user = await requireAuth();

  const userRole = (user.role || ROLES.STUDENT) as UserRole;

  if (user.id !== resourceOwnerId && userRole !== ROLES.ADMIN) {
    forbidden();
  }

  return user;
}
