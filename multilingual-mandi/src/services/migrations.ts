// Database migration service for handling schema changes and data transformations
// Supports versioning and backward compatibility

import { databaseService, STORES } from './database';

export interface Migration {
  version: number;
  description: string;
  up: (db: IDBDatabase, transaction: IDBTransaction) => Promise<void>;
  down?: (db: IDBDatabase, transaction: IDBTransaction) => Promise<void>;
}

// Migration definitions
const MIGRATIONS: Migration[] = [
  {
    version: 1,
    description: 'Initial database schema',
    up: async (_db: IDBDatabase, _transaction: IDBTransaction) => {
      // Initial schema is handled by the database service
      // This migration is mainly for documentation
      console.log('Initial schema created');
    }
  },

  // Example future migration
  {
    version: 2,
    description: 'Add user preferences for AI assistant',
    up: async (_db: IDBDatabase, transaction: IDBTransaction) => {
      // This would be used in a future version
      // Example: Add new fields to user profiles
      const userStore = transaction.objectStore(STORES.USERS);

      // Add new index for AI preferences
      if (!userStore.indexNames.contains('aiPreferences')) {
        userStore.createIndex('aiPreferences', 'preferences.aiAssistant', { unique: false });
      }

      // Update existing user records to include AI preferences
      const users = await new Promise<any[]>((resolve, reject) => {
        const request = userStore.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      for (const user of users) {
        if (!user.preferences.aiAssistant) {
          user.preferences.aiAssistant = {
            enabled: true,
            negotiationHelp: true,
            priceAlerts: true,
            languageSupport: true
          };

          await new Promise<void>((resolve, reject) => {
            const updateRequest = userStore.put(user);
            updateRequest.onsuccess = () => resolve();
            updateRequest.onerror = () => reject(updateRequest.error);
          });
        }
      }
    },
    down: async (_db: IDBDatabase, transaction: IDBTransaction) => {
      // Rollback: Remove AI preferences
      const userStore = transaction.objectStore(STORES.USERS);

      if (userStore.indexNames.contains('aiPreferences')) {
        userStore.deleteIndex('aiPreferences');
      }

      const users = await new Promise<any[]>((resolve, reject) => {
        const request = userStore.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      for (const user of users) {
        if (user.preferences.aiAssistant) {
          delete user.preferences.aiAssistant;

          await new Promise<void>((resolve, reject) => {
            const updateRequest = userStore.put(user);
            updateRequest.onsuccess = () => resolve();
            updateRequest.onerror = () => reject(updateRequest.error);
          });
        }
      }
    }
  }
];

class MigrationService {
  /**
   * Get the current database version
   */
  async getCurrentVersion(): Promise<number> {
    try {
      const metadata = await databaseService.getById<{ key: string; value: number }>(
        STORES.METADATA,
        'schema_version'
      );
      return metadata?.value || 0;
    } catch (error) {
      console.warn('Could not get current version, assuming 0:', error);
      return 0;
    }
  }

  /**
   * Get the target version (latest migration)
   */
  getTargetVersion(): number {
    return Math.max(...MIGRATIONS.map(m => m.version));
  }

  /**
   * Check if migrations are needed
   */
  async needsMigration(): Promise<boolean> {
    const currentVersion = await this.getCurrentVersion();
    const targetVersion = this.getTargetVersion();
    return currentVersion < targetVersion;
  }

  /**
   * Run all pending migrations
   */
  async runMigrations(): Promise<void> {
    const currentVersion = await this.getCurrentVersion();
    const targetVersion = this.getTargetVersion();

    if (currentVersion >= targetVersion) {
      console.log('Database is up to date');
      return;
    }

    console.log(`Running migrations from version ${currentVersion} to ${targetVersion}`);

    // Get migrations to run
    const migrationsToRun = MIGRATIONS
      .filter(m => m.version > currentVersion)
      .sort((a, b) => a.version - b.version);

    for (const migration of migrationsToRun) {
      await this.runMigration(migration);
    }

    console.log('All migrations completed successfully');
  }

  /**
   * Run a single migration
   */
  private async runMigration(migration: Migration): Promise<void> {
    console.log(`Running migration ${migration.version}: ${migration.description}`);

    try {
      // Create a transaction for the migration
      const db = await (databaseService as any).ensureInitialized();
      const storeNames = Array.from(db.objectStoreNames);
      const transaction = db.transaction(storeNames, 'readwrite');

      // Run the migration
      await migration.up(db, transaction);

      // Update the version in metadata
      const metadataStore = transaction.objectStore(STORES.METADATA);
      await new Promise<void>((resolve, reject) => {
        const request = metadataStore.put({
          key: 'schema_version',
          value: migration.version,
          timestamp: new Date()
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      // Wait for transaction to complete
      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });

      console.log(`Migration ${migration.version} completed successfully`);
    } catch (error) {
      console.error(`Migration ${migration.version} failed:`, error);
      throw new Error(`Migration ${migration.version} failed: ${error}`);
    }
  }

  /**
   * Rollback to a specific version
   */
  async rollbackTo(targetVersion: number): Promise<void> {
    const currentVersion = await this.getCurrentVersion();

    if (targetVersion >= currentVersion) {
      console.log('No rollback needed');
      return;
    }

    console.log(`Rolling back from version ${currentVersion} to ${targetVersion}`);

    // Get migrations to rollback (in reverse order)
    const migrationsToRollback = MIGRATIONS
      .filter(m => m.version > targetVersion && m.version <= currentVersion)
      .sort((a, b) => b.version - a.version);

    for (const migration of migrationsToRollback) {
      if (migration.down) {
        await this.rollbackMigration(migration, targetVersion);
      } else {
        throw new Error(`Migration ${migration.version} does not support rollback`);
      }
    }

    console.log(`Rollback to version ${targetVersion} completed successfully`);
  }

  /**
   * Rollback a single migration
   */
  private async rollbackMigration(migration: Migration, _targetVersion: number): Promise<void> {
    if (!migration.down) {
      throw new Error(`Migration ${migration.version} does not support rollback`);
    }

    console.log(`Rolling back migration ${migration.version}: ${migration.description}`);

    try {
      const db = await (databaseService as any).ensureInitialized();
      const storeNames = Array.from(db.objectStoreNames);
      const transaction = db.transaction(storeNames, 'readwrite');

      // Run the rollback
      await migration.down(db, transaction);

      // Update the version in metadata
      const metadataStore = transaction.objectStore(STORES.METADATA);
      await new Promise<void>((resolve, reject) => {
        const request = metadataStore.put({
          key: 'schema_version',
          value: migration.version - 1,
          timestamp: new Date()
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      // Wait for transaction to complete
      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });

      console.log(`Migration ${migration.version} rolled back successfully`);
    } catch (error) {
      console.error(`Rollback of migration ${migration.version} failed:`, error);
      throw new Error(`Rollback of migration ${migration.version} failed: ${error}`);
    }
  }

  /**
   * Get migration history
   */
  async getMigrationHistory(): Promise<{ version: number; description: string; applied: boolean }[]> {
    const currentVersion = await this.getCurrentVersion();

    return MIGRATIONS.map(migration => ({
      version: migration.version,
      description: migration.description,
      applied: migration.version <= currentVersion
    }));
  }

  /**
   * Backup data before migrations
   */
  async createBackup(): Promise<{ [storeName: string]: any[] }> {
    console.log('Creating database backup...');

    const backup: { [storeName: string]: any[] } = {};
    const storeNames = Object.values(STORES);

    for (const storeName of storeNames) {
      try {
        backup[storeName] = await databaseService.getAll(storeName);
      } catch (error) {
        console.warn(`Could not backup store ${storeName}:`, error);
        backup[storeName] = [];
      }
    }

    console.log('Database backup created');
    return backup;
  }

  /**
   * Restore data from backup
   */
  async restoreFromBackup(backup: { [storeName: string]: any[] }): Promise<void> {
    console.log('Restoring database from backup...');

    // Clear existing data
    await databaseService.clearAllData();

    // Restore data
    for (const [storeName, data] of Object.entries(backup)) {
      for (const item of data) {
        try {
          await databaseService.create(storeName, item);
        } catch (error) {
          console.warn(`Could not restore item in ${storeName}:`, error);
        }
      }
    }

    console.log('Database restored from backup');
  }

  /**
   * Validate database integrity after migrations
   */
  async validateIntegrity(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Check if all required stores exist
      const db = await (databaseService as any).ensureInitialized();
      const requiredStores = Object.values(STORES);

      for (const storeName of requiredStores) {
        if (!db.objectStoreNames.contains(storeName)) {
          errors.push(`Missing required store: ${storeName}`);
        }
      }

      // Check if version metadata exists
      const versionMetadata = await databaseService.getById(STORES.METADATA, 'schema_version');
      if (!versionMetadata) {
        errors.push('Missing schema version metadata');
      }

      // Get basic statistics to ensure stores are accessible
      const stats = await databaseService.getStats();
      console.log('Database statistics:', stats);

    } catch (error) {
      errors.push(`Database integrity check failed: ${error}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const migrationService = new MigrationService();
export default migrationService;