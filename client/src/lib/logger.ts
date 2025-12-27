// Simple logger that works with Next.js Turbopack
// Using console instead of pino to avoid worker thread issues

const isProduction = process.env.NODE_ENV === "production";
const logLevel = process.env.LOG_LEVEL || (isProduction ? "info" : "debug");

const levels = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = levels[logLevel as keyof typeof levels] ?? 1;

function formatLog(level: string, message: string, data?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` ${JSON.stringify(data)}` : "";
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${dataStr}`;
}

export const logger = {
  debug: (data: Record<string, unknown>, message: string) => {
    if (currentLevel <= levels.debug) {
      console.debug(formatLog("debug", message, data));
    }
  },
  info: (data: Record<string, unknown>, message: string) => {
    if (currentLevel <= levels.info) {
      console.info(formatLog("info", message, data));
    }
  },
  warn: (data: Record<string, unknown>, message: string) => {
    if (currentLevel <= levels.warn) {
      console.warn(formatLog("warn", message, data));
    }
  },
  error: (data: Record<string, unknown>, message: string) => {
    if (currentLevel <= levels.error) {
      console.error(formatLog("error", message, data));
    }
  },
};

// Structured logging helpers
export const log = {
  info: (message: string, data?: Record<string, unknown>) => {
    logger.info({ ...data }, message);
  },

  error: (message: string, error?: Error, data?: Record<string, unknown>) => {
    logger.error(
      {
        err: error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : undefined,
        ...data,
      },
      message
    );
  },

  warn: (message: string, data?: Record<string, unknown>) => {
    logger.warn({ ...data }, message);
  },

  debug: (message: string, data?: Record<string, unknown>) => {
    logger.debug({ ...data }, message);
  },

  // Specific event loggers
  auth: (
    event: "login" | "logout" | "signup" | "password_reset" | "email_verified",
    userId?: string,
    data?: Record<string, unknown>
  ) => {
    logger.info({ event, userId, type: "auth", ...data }, `Auth: ${event}`);
  },

  enrollment: (
    event: "enrolled" | "progress_updated" | "completed",
    userId: string,
    courseId: string,
    data?: Record<string, unknown>
  ) => {
    logger.info(
      { event, userId, courseId, type: "enrollment", ...data },
      `Enrollment: ${event}`
    );
  },

  course: (
    event: "created" | "updated" | "published" | "archived" | "deleted",
    courseId: string,
    userId?: string,
    data?: Record<string, unknown>
  ) => {
    logger.info(
      { event, courseId, userId, type: "course", ...data },
      `Course: ${event}`
    );
  },

  lesson: (
    event: "created" | "updated" | "published" | "deleted" | "completed",
    lessonId: string,
    userId?: string,
    data?: Record<string, unknown>
  ) => {
    logger.info(
      { event, lessonId, userId, type: "lesson", ...data },
      `Lesson: ${event}`
    );
  },

  review: (
    event: "created" | "updated" | "deleted",
    reviewId: string,
    userId: string,
    courseId: string,
    data?: Record<string, unknown>
  ) => {
    logger.info(
      { event, reviewId, userId, courseId, type: "review", ...data },
      `Review: ${event}`
    );
  },

  admin: (
    event: string,
    adminId: string,
    targetId?: string,
    data?: Record<string, unknown>
  ) => {
    logger.info(
      { event, adminId, targetId, type: "admin", ...data },
      `Admin: ${event}`
    );
  },

  payment: (
    event: "checkout_created" | "payment_success" | "payment_failed" | "refund",
    userId: string,
    courseId: string,
    data?: Record<string, unknown>
  ) => {
    logger.info(
      { event, userId, courseId, type: "payment", ...data },
      `Payment: ${event}`
    );
  },
};
