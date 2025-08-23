type LogLevel = "debug" | "info" | "warn" | "error";

interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  enabledInProduction: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

let config: LoggerConfig = {
  enabled: import.meta.env.DEV,
  level: "info",
  enabledInProduction: false,
};

const shouldLog = (level: LogLevel): boolean => {
  return config.enabled && LOG_LEVELS[level] >= LOG_LEVELS[config.level];
};

const formatMessage = (level: LogLevel, message: string, context?: any): string => {
  const timestamp = new Date().toISOString();
  const contextStr = context ? `\nContext: ${JSON.stringify(context, null, 2)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
};

const getConsoleMethod = (level: LogLevel): "debug" | "info" | "warn" | "error" | "log" => {
  switch (level) {
    case "debug":
      return "debug";
    case "info":
      return "info";
    case "warn":
      return "warn";
    case "error":
      return "error";
    default:
      return "log";
  }
};

export const logger = {
  setConfig: (newConfig: Partial<LoggerConfig>): void => {
    config = { ...config, ...newConfig };
  },

  debug: (message: string, context?: any): void => {
    if (shouldLog("debug")) {
      const method = getConsoleMethod("debug");
      console[method](formatMessage("debug", message, context));
    }
  },

  info: (message: string, context?: any): void => {
    if (shouldLog("info")) {
      const method = getConsoleMethod("info");
      console[method](formatMessage("info", message, context));
    }
  },

  warn: (message: string, context?: any): void => {
    if (shouldLog("warn")) {
      const method = getConsoleMethod("warn");
      console[method](formatMessage("warn", message, context));
    }
  },

  error: (message: string, error?: Error | any): void => {
    if (shouldLog("error")) {
      const context =
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error;

      const method = getConsoleMethod("error");
      console[method](formatMessage("error", message, context));
    }
  },

  group: (label: string): void => {
    if (config.enabled) {
      console.group(label);
    }
  },

  groupEnd: (): void => {
    if (config.enabled) {
      console.groupEnd();
    }
  },
};

// Example usage:
// logger.setConfig({ level: 'debug', enabledInProduction: false });
// logger.debug('Debug message');
// logger.info('Info message', { user: 'John' });
// logger.warn('Warning message');
// logger.error('Error occurred', new Error('Something went wrong'));
