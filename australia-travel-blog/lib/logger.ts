type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, any>;
}

/**
 * Simple logger utility for the Australia Travel Blog
 * In a production environment, this would be replaced with a more robust
 * logging solution like Winston, Pino, or a third-party service
 */
class Logger {
  private isDevelopment: boolean;
  private logs: LogEntry[] = [];
  private maxLogsInMemory: number = 100;
  
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }
  
  /**
   * Log an informational message
   */
  info(message: string, metadata?: Record<string, any>) {
    this.log('info', message, metadata);
  }
  
  /**
   * Log a warning message
   */
  warn(message: string, metadata?: Record<string, any>) {
    this.log('warn', message, metadata);
  }
  
  /**
   * Log an error message
   */
  error(message: string, error?: Error, metadata?: Record<string, any>) {
    const errorMetadata = error ? {
      ...metadata,
      errorName: error.name,
      errorMessage: error.message,
      stackTrace: error.stack
    } : metadata;
    
    this.log('error', message, errorMetadata);
  }
  
  /**
   * Log a debug message (only in development)
   */
  debug(message: string, metadata?: Record<string, any>) {
    if (this.isDevelopment) {
      this.log('debug', message, metadata);
    }
  }
  
  /**
   * Get all logs stored in memory
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }
  
  /**
   * Clear all logs from memory
   */
  clearLogs(): void {
    this.logs = [];
  }
  
  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, metadata?: Record<string, any>) {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      metadata
    };
    
    // Store log in memory (with limit)
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogsInMemory) {
      this.logs.shift(); // Remove oldest log
    }
    
    // Log to console in development
    if (this.isDevelopment) {
      const consoleMethod = level === 'error' ? 'error' 
        : level === 'warn' ? 'warn'
        : level === 'debug' ? 'debug'
        : 'log';
      
      // Format for better readability in console
      const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
      
      if (metadata) {
        console[consoleMethod](formattedMessage, metadata);
      } else {
        console[consoleMethod](formattedMessage);
      }
    }
    
    // In production, you would likely send logs to a service like:
    // - Application Insights
    // - LogRocket
    // - Sentry
    // - Datadog
    // etc.
  }
}

// Export a singleton instance
export const logger = new Logger(); 