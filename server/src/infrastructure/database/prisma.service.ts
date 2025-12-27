import { PrismaClient } from '@prisma/client';
import { logger } from '../../shared/utils/logger';

class PrismaService {
  private static instance: PrismaClient;

  private constructor() {}

  static getInstance(): PrismaClient {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaClient({
        log: [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'event' },
          { level: 'warn', emit: 'event' },
        ],
      });

      // Log queries in development
      if (process.env.NODE_ENV === 'development') {
        PrismaService.instance.$on('query' as never, (e: any) => {
          logger.debug({ query: e.query, params: e.params, duration: e.duration }, 'Prisma Query');
        });
      }

      PrismaService.instance.$on('error' as never, (e: any) => {
        logger.error({ error: e }, 'Prisma Error');
      });

      PrismaService.instance.$on('warn' as never, (e: any) => {
        logger.warn({ warning: e }, 'Prisma Warning');
      });
    }

    return PrismaService.instance;
  }

  static async connect(): Promise<void> {
    try {
      await this.getInstance().$connect();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error({ error }, 'Failed to connect to database');
      throw error;
    }
  }

  static async disconnect(): Promise<void> {
    try {
      await this.getInstance().$disconnect();
      logger.info('Database disconnected successfully');
    } catch (error) {
      logger.error({ error }, 'Failed to disconnect from database');
      throw error;
    }
  }
}

export const prisma = PrismaService.getInstance();
export { PrismaService };
