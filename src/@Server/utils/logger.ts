export const createLogger = (context: string) => {
  return {
    info: (message: string, ...args: any[]) => {
      console.log(`[${context}] INFO:`, message, ...args);
    },
    error: (message: string, ...args: any[]) => {
      console.error(`[${context}] ERROR:`, message, ...args);
    },
    warn: (message: string, ...args: any[]) => {
      console.warn(`[${context}] WARN:`, message, ...args);
    },
    debug: (message: string, ...args: any[]) => {
      console.debug(`[${context}] DEBUG:`, message, ...args);
    }
  };
};