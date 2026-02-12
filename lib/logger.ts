/**
 * Structured logging utility
 * Provides consistent logging with levels and optional metadata
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  service?: string
  metadata?: Record<string, any>
  error?: Error
}

class Logger {
  private service: string
  private minLevel: LogLevel

  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  }

  constructor(service: string, minLevel: LogLevel = 'info') {
    this.service = service
    this.minLevel = minLevel
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.minLevel]
  }

  private formatEntry(level: LogLevel, message: string, metadata?: Record<string, any>, error?: Error): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      service: this.service,
      metadata,
      error,
    }
  }

  private output(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.service}] [${entry.level.toUpperCase()}]`
    
    switch (entry.level) {
      case 'debug':
        if (typeof window === 'undefined' || process.env.NODE_ENV === 'development') {
          console.debug(prefix, entry.message, entry.metadata || '')
        }
        break
      case 'info':
        console.info(prefix, entry.message, entry.metadata || '')
        break
      case 'warn':
        console.warn(prefix, entry.message, entry.metadata || '')
        break
      case 'error':
        console.error(prefix, entry.message, entry.error || '', entry.metadata || '')
        break
    }
  }

  debug(message: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('debug')) {
      this.output(this.formatEntry('debug', message, metadata))
    }
  }

  info(message: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('info')) {
      this.output(this.formatEntry('info', message, metadata))
    }
  }

  warn(message: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('warn')) {
      this.output(this.formatEntry('warn', message, metadata))
    }
  }

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    if (this.shouldLog('error')) {
      this.output(this.formatEntry('error', message, metadata, error))
    }
  }
}

// Export singleton instances for common services
export const deploymentLogger = new Logger('DeploymentService', process.env.NODE_ENV === 'production' ? 'warn' : 'info')
export const simulationLogger = new Logger('SimulationService', process.env.NODE_ENV === 'production' ? 'warn' : 'info')
export const walletLogger = new Logger('WalletService', process.env.NODE_ENV === 'production' ? 'warn' : 'info')
export const compilationLogger = new Logger('CompilationService', process.env.NODE_ENV === 'production' ? 'warn' : 'info')

export function createLogger(service: string, minLevel?: LogLevel): Logger {
  return new Logger(service, minLevel)
}

export default Logger
