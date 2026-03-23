/**
 * Production-ready logger for StreamFlix
 * Provides structured logging with different levels based on environment
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

const isProduction = process.env.NODE_ENV === "production";

function formatLogEntry(entry: LogEntry): string {
  if (isProduction) {
    // JSON format for production (easier to parse in log aggregators)
    return JSON.stringify(entry);
  }
  
  // Human-readable format for development
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
  const context = entry.context ? ` [${entry.context}]` : "";
  let output = `${prefix}${context} ${entry.message}`;
  
  if (entry.data) {
    output += `\n  Data: ${JSON.stringify(entry.data, null, 2)}`;
  }
  
  if (entry.error) {
    output += `\n  Error: ${entry.error.message}`;
    if (entry.error.stack && !isProduction) {
      output += `\n  Stack: ${entry.error.stack}`;
    }
  }
  
  return output;
}

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: string,
  data?: unknown,
  error?: Error
): LogEntry {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };
  
  if (context) entry.context = context;
  if (data) entry.data = data;
  if (error) {
    entry.error = {
      message: error.message,
      stack: error.stack,
      code: (error as any).code,
    };
  }
  
  return entry;
}

function shouldLog(level: LogLevel): boolean {
  if (!isProduction) return true;
  
  // In production, only log info, warn, and error
  return level !== "debug";
}

export const logger = {
  debug(message: string, context?: string, data?: unknown) {
    if (!shouldLog("debug")) return;
    const entry = createLogEntry("debug", message, context, data);
    console.log(formatLogEntry(entry));
  },

  info(message: string, context?: string, data?: unknown) {
    if (!shouldLog("info")) return;
    const entry = createLogEntry("info", message, context, data);
    console.log(formatLogEntry(entry));
  },

  warn(message: string, context?: string, data?: unknown, error?: Error) {
    if (!shouldLog("warn")) return;
    const entry = createLogEntry("warn", message, context, data, error);
    console.warn(formatLogEntry(entry));
  },

  error(message: string, context?: string, data?: unknown, error?: Error) {
    if (!shouldLog("error")) return;
    const entry = createLogEntry("error", message, context, data, error);
    console.error(formatLogEntry(entry));
  },

  // Utility method for logging API requests
  apiRequest(method: string, path: string, userId?: number | string, statusCode?: number) {
    const data = { method, path, userId, statusCode };
    this.info(`${method} ${path} - ${statusCode || "pending"}`, "API", data);
  },

  // Utility method for logging database operations
  dbOperation(operation: string, table: string, success: boolean, error?: Error) {
    const context = "Database";
    if (success) {
      this.debug(`${operation} on ${table} succeeded`, context);
    } else {
      this.error(`${operation} on ${table} failed`, context, undefined, error);
    }
  },

  // Utility method for logging authentication events
  authEvent(event: string, userId?: string, success?: boolean, error?: Error) {
    const context = "Auth";
    const data = { userId, success };
    if (success === false && error) {
      this.warn(`Auth event: ${event}`, context, data, error);
    } else {
      this.info(`Auth event: ${event}`, context, data);
    }
  },

  // Utility method for logging PayPal events
  paypal(event: string, data?: unknown, error?: Error) {
    const context = "PayPal";
    if (error) {
      this.error(`PayPal: ${event}`, context, data, error);
    } else {
      this.info(`PayPal: ${event}`, context, data);
    }
  },
};

// Error wrapper for async functions
export async function withErrorLogging<T>(
  fn: () => Promise<T>,
  context: string,
  errorMessage: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    logger.error(errorMessage, context, undefined, error as Error);
    throw error;
  }
}

export default logger;
