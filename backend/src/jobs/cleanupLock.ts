import { userService } from '../dependencyHandlers/user.dependencies';

export function startLockCleanupJob() {
  async function cleanup() {
    try {
      await userService.cleanupExpiredLocks();
      console.log('Periodic cleanup of expired locks completed');
    } catch (error) {
      console.error('Error during periodic cleanup:', error);
    } finally {
      setTimeout(cleanup, 5 * 60 * 1000);
    }
  }

  cleanup();
}
