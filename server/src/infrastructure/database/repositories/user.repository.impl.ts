import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { User, CreateUserDTO, UpdateUserDTO, UserWithoutPassword } from '../../../domain/entities/user.entity';
import { randomUUID } from 'crypto';

export class UserRepositoryImpl implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateUserDTO): Promise<User> {
    const userId = randomUUID();
    const accountId = randomUUID();

    // Create user and credential account in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id: userId,
          email: data.email,
          name: data.name,
          role: data.role || 'STUDENT',
          image: data.image,
          emailVerified: false,
          banned: false,
        },
      });

      // Create credential account with password
      await tx.account.create({
        data: {
          id: accountId,
          accountId: data.email,
          providerId: 'credential',
          userId: userId,
          password: data.password,
        },
      });

      return user;
    });

    return result;
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByEmailWithPassword(email: string): Promise<{ user: User; password: string | null } | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        accounts: {
          where: { providerId: 'credential' },
          select: { password: true },
        },
      },
    });

    if (!user) return null;

    const password = user.accounts[0]?.password || null;
    const { accounts, ...userWithoutAccounts } = user;

    return { user: userWithoutAccounts, password };
  }

  async findAll(page: number, limit: number): Promise<{ users: UserWithoutPassword[]; total: number }> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          image: true,
          emailVerified: true,
          banned: true,
          bannedAt: true,
          bannedReason: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return { users: users as UserWithoutPassword[], total };
  }

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.prisma.account.updateMany({
      where: {
        userId: id,
        providerId: 'credential',
      },
      data: { password: hashedPassword },
    });
  }
}
