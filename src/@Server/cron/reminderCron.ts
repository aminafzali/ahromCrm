import { CronJob } from 'cron';
import { ReminderService } from '../Http/Service/ReminderService';
import { createLogger } from '../utils/logger';

const logger = createLogger('reminderCron');
const reminderService = new ReminderService();

// Implement rate limiting
const BATCH_SIZE = 50;
const PROCESS_INTERVAL = 60000; // 1 minute
let isProcessing = false;

// Run every minute
export const reminderCron = new CronJob('* * * * *', async () => {
  if (isProcessing) {
    logger.info('Previous batch still processing, skipping...');
    return;
  }

  try {
    isProcessing = true;
    logger.info('Starting reminder check...');
    
    // Process reminders in batches
    let processed = 0;
    let hasMore = true;
    
    while (hasMore) {
      const result = await reminderService.checkDueReminders(BATCH_SIZE, processed);
      processed += result.processed;
      hasMore = result.hasMore;
      
      if (hasMore) {
        // Rate limiting between batches
        await new Promise(resolve => setTimeout(resolve, PROCESS_INTERVAL));
      }
    }

    logger.info(`Completed reminder check. Processed ${processed} reminders`);
  } catch (error) {
    logger.error('Error in reminder cron:', error);
  } finally {
    isProcessing = false;
  }
});