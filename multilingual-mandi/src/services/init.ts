// Database initialization service
// Handles database setup, migrations, and seeding for the Multilingual Mandi PWA

import { databaseService } from './database';
import { migrationService } from './migrations';
import { seedDataService } from './seedData';

export interface InitializationOptions {
  runMigrations?: boolean;
  seedData?: boolean;
  clearExistingData?: boolean;
  validateIntegrity?: boolean;
}

export interface InitializationResult {
  success: boolean;
  message: string;
  stats?: Record<string, number>;
  errors?: string[];
  duration: number;
}

class DatabaseInitService {
  private isInitialized = false;
  private initPromise: Promise<InitializationResult> | null = null;

  /**
   * Initialize the database with all necessary setup
   */
  async initialize(options: InitializationOptions = {}): Promise<InitializationResult> {
    // Return existing promise if initialization is already in progress
    if (this.initPromise) {
      return this.initPromise;
    }

    // Return success if already initialized
    if (this.isInitialized) {
      return {
        success: true,
        message: 'Database already initialized',
        duration: 0
      };
    }

    const startTime = Date.now();
    const {
      runMigrations = true,
      seedData = false,
      clearExistingData = false,
      validateIntegrity = true
    } = options;

    this.initPromise = this.performInitialization({
      runMigrations,
      seedData,
      clearExistingData,
      validateIntegrity,
      startTime
    });

    const result = await this.initPromise;
    
    if (result.success) {
      this.isInitialized = true;
    }
    
    this.initPromise = null;
    return result;
  }

  /**
   * Perform the actual initialization steps
   */
  private async performInitialization(params: {
    runMigrations: boolean;
    seedData: boolean;
    clearExistingData: boolean;
    validateIntegrity: boolean;
    startTime: number;
  }): Promise<InitializationResult> {
    const { runMigrations, seedData, clearExistingData, validateIntegrity, startTime } = params;
    const errors: string[] = [];

    try {
      console.log('🚀 Starting database initialization...');

      // Step 1: Initialize database connection
      console.log('📊 Initializing database connection...');
      await databaseService.init();
      console.log('✅ Database connection established');

      // Step 2: Clear existing data if requested
      if (clearExistingData) {
        console.log('🗑️ Clearing existing data...');
        await databaseService.clearAllData();
        console.log('✅ Existing data cleared');
      }

      // Step 3: Run migrations if needed
      if (runMigrations) {
        console.log('🔄 Checking for database migrations...');
        const needsMigration = await migrationService.needsMigration();
        
        if (needsMigration) {
          console.log('📈 Running database migrations...');
          await migrationService.runMigrations();
          console.log('✅ Database migrations completed');
        } else {
          console.log('✅ Database is up to date');
        }
      }

      // Step 4: Seed data if requested
      if (seedData) {
        console.log('🌱 Checking if data seeding is needed...');
        const isSeeded = await seedDataService.isSeeded();
        
        if (!isSeeded || clearExistingData) {
          console.log('📝 Seeding database with sample data...');
          await seedDataService.seedAll();
          console.log('✅ Database seeding completed');
        } else {
          console.log('✅ Database already contains data');
        }
      }

      // Step 5: Validate database integrity
      if (validateIntegrity) {
        console.log('🔍 Validating database integrity...');
        const validation = await migrationService.validateIntegrity();
        
        if (!validation.valid) {
          errors.push(...validation.errors);
          console.warn('⚠️ Database integrity issues found:', validation.errors);
        } else {
          console.log('✅ Database integrity validated');
        }
      }

      // Step 6: Get final statistics
      const stats = await databaseService.getStats();
      const duration = Date.now() - startTime;

      console.log('🎉 Database initialization completed successfully!');
      console.log('📊 Final statistics:', stats);
      console.log(`⏱️ Total time: ${duration}ms`);

      return {
        success: errors.length === 0,
        message: errors.length === 0 
          ? 'Database initialized successfully' 
          : `Database initialized with ${errors.length} warnings`,
        stats,
        errors: errors.length > 0 ? errors : undefined,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error('❌ Database initialization failed:', error);
      
      return {
        success: false,
        message: `Database initialization failed: ${errorMessage}`,
        errors: [errorMessage, ...errors],
        duration
      };
    }
  }

  /**
   * Reset the database to initial state
   */
  async reset(options: { seedData?: boolean } = {}): Promise<InitializationResult> {
    console.log('🔄 Resetting database...');
    
    this.isInitialized = false;
    this.initPromise = null;
    
    return this.initialize({
      runMigrations: true,
      seedData: options.seedData || false,
      clearExistingData: true,
      validateIntegrity: true
    });
  }

  /**
   * Get current database status
   */
  async getStatus(): Promise<{
    initialized: boolean;
    version: number;
    stats: Record<string, number>;
    integrity: { valid: boolean; errors: string[] };
  }> {
    try {
      const version = await migrationService.getCurrentVersion();
      const stats = await databaseService.getStats();
      const integrity = await migrationService.validateIntegrity();
      
      return {
        initialized: this.isInitialized,
        version,
        stats,
        integrity
      };
    } catch (error) {
      return {
        initialized: false,
        version: 0,
        stats: {},
        integrity: { valid: false, errors: [error instanceof Error ? error.message : 'Unknown error'] }
      };
    }
  }

  /**
   * Check if the database is ready for use
   */
  async isReady(): Promise<boolean> {
    try {
      const status = await this.getStatus();
      return status.initialized && status.integrity.valid;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get migration history
   */
  async getMigrationHistory(): Promise<{ version: number; description: string; applied: boolean }[]> {
    return migrationService.getMigrationHistory();
  }

  /**
   * Create a backup of the current database
   */
  async createBackup(): Promise<{ [storeName: string]: any[] }> {
    console.log('💾 Creating database backup...');
    const backup = await migrationService.createBackup();
    console.log('✅ Database backup created');
    return backup;
  }

  /**
   * Restore database from backup
   */
  async restoreFromBackup(backup: { [storeName: string]: any[] }): Promise<void> {
    console.log('📥 Restoring database from backup...');
    await migrationService.restoreFromBackup(backup);
    console.log('✅ Database restored from backup');
  }

  /**
   * Force re-initialization (useful for development)
   */
  forceReinit(): void {
    this.isInitialized = false;
    this.initPromise = null;
    console.log('🔄 Forced re-initialization flag set');
  }

  /**
   * Close database connections
   */
  close(): void {
    databaseService.close();
    this.isInitialized = false;
    this.initPromise = null;
    console.log('🔌 Database connections closed');
  }
}

// Export singleton instance
export const dbInitService = new DatabaseInitService();

// Convenience function for quick initialization
export async function initializeDatabase(options?: InitializationOptions): Promise<InitializationResult> {
  return dbInitService.initialize(options);
}

// Development helper functions
export const devHelpers = {
  /**
   * Quick setup for development with sample data
   */
  async setupDev(): Promise<InitializationResult> {
    return dbInitService.initialize({
      runMigrations: true,
      seedData: true,
      clearExistingData: false,
      validateIntegrity: true
    });
  },

  /**
   * Reset and seed for testing
   */
  async resetAndSeed(): Promise<InitializationResult> {
    return dbInitService.reset({ seedData: true });
  },

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    await databaseService.clearAllData();
    console.log('🗑️ All data cleared');
  },

  /**
   * Get detailed status
   */
  async status(): Promise<void> {
    const status = await dbInitService.getStatus();
    console.log('📊 Database Status:', {
      initialized: status.initialized,
      version: status.version,
      recordCounts: status.stats,
      integrityValid: status.integrity.valid,
      integrityErrors: status.integrity.errors
    });
  }
};

export default dbInitService;