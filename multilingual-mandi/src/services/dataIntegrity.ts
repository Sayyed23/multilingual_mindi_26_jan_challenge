// Data Integrity and Recovery Service
// Implements data corruption detection and error logging
// Provides recovery mechanisms for corrupted data
// Handles conflict resolution for offline synchronization

import { offlineSyncService } from './offlineSync';
import { dataSerializer } from './dataSerializer';
import type {
  CacheEntry,
  User,
  Message,
  PriceData,
  Deal
} from '../types';

interface BackupData {
  originalKey: string;
  data: any;
  checksum: string;
  timestamp: Date;
  version: string;
}

// Data integrity error types
export const IntegrityErrorType = {
  CORRUPTION_DETECTED: 'CORRUPTION_DETECTED',
  CHECKSUM_MISMATCH: 'CHECKSUM_MISMATCH',
  SCHEMA_VIOLATION: 'SCHEMA_VIOLATION',
  SYNC_CONFLICT: 'SYNC_CONFLICT',
  RECOVERY_FAILED: 'RECOVERY_FAILED',
  BACKUP_CORRUPTED: 'BACKUP_CORRUPTED',
  VERSION_MISMATCH: 'VERSION_MISMATCH',
} as const;

export type IntegrityErrorTypeValue = typeof IntegrityErrorType[keyof typeof IntegrityErrorType];

export class DataIntegrityError extends Error {
  public readonly type: IntegrityErrorTypeValue;
  public readonly dataKey?: string;
  public readonly corruptedData?: any;
  public readonly expectedChecksum?: string;
  public readonly actualChecksum?: string;
  public readonly recoverable: boolean;

  constructor(
    type: IntegrityErrorTypeValue,
    message: string,
    options: {
      dataKey?: string;
      corruptedData?: any;
      expectedChecksum?: string;
      actualChecksum?: string;
      recoverable?: boolean;
    } = {}
  ) {
    super(message);
    this.name = 'DataIntegrityError';
    this.type = type;
    this.dataKey = options.dataKey;
    this.corruptedData = options.corruptedData;
    this.expectedChecksum = options.expectedChecksum;
    this.actualChecksum = options.actualChecksum;
    this.recoverable = options.recoverable ?? true;
  }
}

// Conflict resolution strategies
export type ConflictResolutionStrategy =
  | 'server_wins'
  | 'client_wins'
  | 'merge'
  | 'manual'
  | 'timestamp_based'
  | 'user_choice';

// Conflict resolution result
export interface ConflictResolution {
  strategy: ConflictResolutionStrategy;
  resolvedData: any;
  conflictDetails: {
    serverData: any;
    clientData: any;
    conflictFields: string[];
    timestamp: Date;
  };
  requiresUserInput?: boolean;
}

// Recovery options
export interface RecoveryOptions {
  useBackup?: boolean;
  validateRecovered?: boolean;
  logRecovery?: boolean;
  maxRetries?: number;
}

// Data integrity check result
export interface IntegrityCheckResult {
  isValid: boolean;
  errors: DataIntegrityError[];
  warnings: string[];
  corruptedKeys: string[];
  recoveredKeys: string[];
  checksumMismatches: Array<{
    key: string;
    expected: string;
    actual: string;
  }>;
}

class DataIntegrityService {
  private readonly BACKUP_PREFIX = 'backup_';
  private readonly INTEGRITY_LOG_KEY = 'integrity_log';
  private readonly MAX_RECOVERY_ATTEMPTS = 3;

  /**
   * Detects data corruption in cached data
   */
  async detectCorruption(): Promise<IntegrityCheckResult> {
    const result: IntegrityCheckResult = {
      isValid: true,
      errors: [],
      warnings: [],
      corruptedKeys: [],
      recoveredKeys: [],
      checksumMismatches: []
    };

    try {
      // Get all cached entries for integrity check
      const cacheKeys = await this.getAllCacheKeys();

      for (const key of cacheKeys) {
        try {
          const entry = await offlineSyncService.getCachedEntry(key);
          if (!entry) continue;

          // Check data integrity
          const integrityCheck = await this.checkDataIntegrity(key, entry);

          if (!integrityCheck.isValid) {
            result.isValid = false;
            result.errors.push(...integrityCheck.errors);
            result.corruptedKeys.push(key);

            // Attempt automatic recovery
            const recovered = await this.attemptRecovery(key, entry);
            if (recovered) {
              result.recoveredKeys.push(key);
              result.warnings.push(`Data recovered for key: ${key}`);
            }
          }

          // Check for checksum mismatches
          if (integrityCheck.checksumMismatch) {
            result.checksumMismatches.push(integrityCheck.checksumMismatch);
          }

        } catch (error) {
          const integrityError = new DataIntegrityError(
            IntegrityErrorType.CORRUPTION_DETECTED,
            `Failed to check integrity for key: ${key}`,
            { dataKey: key, recoverable: true }
          );
          result.errors.push(integrityError);
          result.corruptedKeys.push(key);
        }
      }

      // Log integrity check results
      await this.logIntegrityCheck(result);

      return result;
    } catch (error) {
      console.error('Error during corruption detection:', error);
      result.isValid = false;
      result.errors.push(new DataIntegrityError(
        IntegrityErrorType.CORRUPTION_DETECTED,
        'Failed to complete corruption detection',
        { recoverable: false }
      ));
      return result;
    }
  }

  /**
   * Recovers corrupted data using various strategies
   */
  async recoverCorruptedData(
    dataKey: string,
    options: RecoveryOptions = {}
  ): Promise<{ success: boolean; recoveredData?: any; error?: DataIntegrityError }> {
    const mergedOptions: RecoveryOptions = {
      useBackup: true,
      validateRecovered: true,
      logRecovery: true,
      maxRetries: this.MAX_RECOVERY_ATTEMPTS,
      ...options
    };

    let lastError: DataIntegrityError | undefined;

    for (let attempt = 1; attempt <= (mergedOptions.maxRetries || this.MAX_RECOVERY_ATTEMPTS); attempt++) {
      try {
        console.log(`Recovery attempt ${attempt} for key: ${dataKey}`);

        // Strategy 1: Try backup data
        if (mergedOptions.useBackup) {
          const backupResult = await this.recoverFromBackup(dataKey);
          if (backupResult.success) {
            if (mergedOptions.validateRecovered) {
              const isValid = await this.validateRecoveredData(dataKey, backupResult.data);
              if (isValid) {
                if (mergedOptions.logRecovery) {
                  await this.logRecovery(dataKey, 'backup', attempt);
                }
                return { success: true, recoveredData: backupResult.data };
              }
            } else {
              return { success: true, recoveredData: backupResult.data };
            }
          }
        }

        // Strategy 2: Try reconstructing from related data
        const reconstructResult = await this.reconstructFromRelatedData(dataKey);
        if (reconstructResult.success) {
          if (mergedOptions.validateRecovered) {
            const isValid = await this.validateRecoveredData(dataKey, reconstructResult.data);
            if (isValid) {
              if (mergedOptions.logRecovery) {
                await this.logRecovery(dataKey, 'reconstruction', attempt);
              }
              return { success: true, recoveredData: reconstructResult.data };
            }
          } else {
            return { success: true, recoveredData: reconstructResult.data };
          }
        }

        // Strategy 3: Try default/empty data structure
        const defaultResult = await this.createDefaultData(dataKey);
        if (defaultResult.success) {
          if (mergedOptions.logRecovery) {
            await this.logRecovery(dataKey, 'default', attempt);
          }
          return { success: true, recoveredData: defaultResult.data };
        }

      } catch (error) {
        lastError = new DataIntegrityError(
          IntegrityErrorType.RECOVERY_FAILED,
          `Recovery attempt ${attempt} failed for key: ${dataKey}`,
          { dataKey, recoverable: attempt < (mergedOptions.maxRetries || this.MAX_RECOVERY_ATTEMPTS) }
        );
        console.error(`Recovery attempt ${attempt} failed:`, error);
      }
    }

    // All recovery attempts failed
    const finalError = lastError || new DataIntegrityError(
      IntegrityErrorType.RECOVERY_FAILED,
      `All recovery attempts failed for key: ${dataKey}`,
      { dataKey, recoverable: false }
    );

    await this.logRecoveryFailure(dataKey, finalError);
    return { success: false, error: finalError };
  }

  /**
   * Resolves conflicts during offline synchronization
   */
  async resolveConflict(
    dataKey: string,
    serverData: any,
    clientData: any,
    strategy: ConflictResolutionStrategy = 'timestamp_based'
  ): Promise<ConflictResolution> {
    try {
      const conflictFields = this.identifyConflictFields(serverData, clientData);

      const conflictDetails = {
        serverData,
        clientData,
        conflictFields,
        timestamp: new Date()
      };

      let resolvedData: any;
      let requiresUserInput = false;

      switch (strategy) {
        case 'server_wins':
          resolvedData = serverData;
          break;

        case 'client_wins':
          resolvedData = clientData;
          break;

        case 'timestamp_based':
          resolvedData = this.resolveByTimestamp(serverData, clientData);
          break;

        case 'merge':
          resolvedData = this.mergeData(serverData, clientData);
          break;

        case 'manual':
        case 'user_choice':
          requiresUserInput = true;
          resolvedData = serverData; // Default to server data until user decides
          break;

        default:
          throw new DataIntegrityError(
            IntegrityErrorType.SYNC_CONFLICT,
            `Unknown conflict resolution strategy: ${strategy}`,
            { dataKey }
          );
      }

      const resolution: ConflictResolution = {
        strategy,
        resolvedData,
        conflictDetails,
        requiresUserInput
      };

      // Log conflict resolution
      await this.logConflictResolution(dataKey, resolution);

      return resolution;
    } catch (error) {
      throw new DataIntegrityError(
        IntegrityErrorType.SYNC_CONFLICT,
        `Failed to resolve conflict for key: ${dataKey}`,
        { dataKey, recoverable: true }
      );
    }
  }

  /**
   * Creates backup of critical data
   */
  async createBackup(dataKey: string, data: any): Promise<void> {
    try {
      const backupKey = this.getBackupKey(dataKey);
      const backupData = {
        originalKey: dataKey,
        data,
        checksum: await this.calculateChecksum(data),
        timestamp: new Date(),
        version: '1.0'
      };

      await offlineSyncService.cacheData(backupKey, backupData);
      console.log(`Backup created for key: ${dataKey}`);
    } catch (error) {
      console.error(`Failed to create backup for key: ${dataKey}`, error);
      throw new DataIntegrityError(
        IntegrityErrorType.BACKUP_CORRUPTED,
        `Failed to create backup for key: ${dataKey}`,
        { dataKey }
      );
    }
  }

  /**
   * Validates data integrity with checksum verification
   */
  async validateDataIntegrity(dataKey: string, data: any): Promise<boolean> {
    try {
      // Calculate current checksum
      const currentChecksum = await this.calculateChecksum(data);

      // Get stored checksum
      const storedChecksum = await this.getStoredChecksum(dataKey);

      if (!storedChecksum) {
        // No stored checksum, store current one
        await this.storeChecksum(dataKey, currentChecksum);
        return true;
      }

      return currentChecksum === storedChecksum;
    } catch (error) {
      console.error(`Failed to validate data integrity for key: ${dataKey}`, error);
      return false;
    }
  }

  /**
   * Repairs data structure inconsistencies
   */
  async repairDataStructure(dataKey: string, data: any): Promise<{ success: boolean; repairedData?: any }> {
    try {
      // Determine data type from key
      const dataType = this.getDataTypeFromKey(dataKey);

      // Apply type-specific repairs
      let repairedData: any;

      switch (dataType) {
        case 'user':
          repairedData = this.repairUserData(data);
          break;
        case 'message':
          repairedData = this.repairMessageData(data);
          break;
        case 'price':
          repairedData = this.repairPriceData(data);
          break;
        case 'deal':
          repairedData = this.repairDealData(data);
          break;
        default:
          repairedData = this.repairGenericData(data);
      }

      // Validate repaired data
      const validation = dataSerializer.validateData(repairedData);
      if (!validation.isValid) {
        return { success: false };
      }

      return { success: true, repairedData };
    } catch (error) {
      console.error(`Failed to repair data structure for key: ${dataKey}`, error);
      return { success: false };
    }
  }

  // Private helper methods

  private async checkDataIntegrity(
    key: string,
    entry: CacheEntry<any>
  ): Promise<{
    isValid: boolean;
    errors: DataIntegrityError[];
    checksumMismatch?: { key: string; expected: string; actual: string };
  }> {
    const errors: DataIntegrityError[] = [];
    let checksumMismatch: { key: string; expected: string; actual: string } | undefined;

    try {
      // Check data structure
      if (!entry.data) {
        errors.push(new DataIntegrityError(
          IntegrityErrorType.CORRUPTION_DETECTED,
          'Entry data is null or undefined',
          { dataKey: key }
        ));
      }

      // Check timestamp validity
      if (!entry.timestamp || !(entry.timestamp instanceof Date)) {
        errors.push(new DataIntegrityError(
          IntegrityErrorType.SCHEMA_VIOLATION,
          'Invalid timestamp in cache entry',
          { dataKey: key }
        ));
      }

      // Check checksum if available
      const storedChecksum = await this.getStoredChecksum(key);
      if (storedChecksum && entry.data) {
        const actualChecksum = await this.calculateChecksum(entry.data);
        if (actualChecksum !== storedChecksum) {
          checksumMismatch = {
            key,
            expected: storedChecksum,
            actual: actualChecksum
          };
          errors.push(new DataIntegrityError(
            IntegrityErrorType.CHECKSUM_MISMATCH,
            'Data checksum mismatch detected',
            { dataKey: key, expectedChecksum: storedChecksum, actualChecksum }
          ));
        }
      }

      // Validate data serialization
      try {
        const serialized = dataSerializer.serialize(entry.data);
        dataSerializer.deserialize(serialized);
      } catch (serializationError) {
        errors.push(new DataIntegrityError(
          IntegrityErrorType.CORRUPTION_DETECTED,
          'Data serialization/deserialization failed',
          { dataKey: key, corruptedData: entry.data }
        ));
      }

      return {
        isValid: errors.length === 0,
        errors,
        checksumMismatch
      };
    } catch (error) {
      errors.push(new DataIntegrityError(
        IntegrityErrorType.CORRUPTION_DETECTED,
        'Failed to check data integrity',
        { dataKey: key }
      ));
      return { isValid: false, errors };
    }
  }

  private async attemptRecovery(key: string, _entry: CacheEntry<any>): Promise<boolean> {
    try {
      const recoveryResult = await this.recoverCorruptedData(key, {
        useBackup: true,
        validateRecovered: true,
        logRecovery: false // Avoid recursive logging
      });

      if (recoveryResult.success && recoveryResult.recoveredData) {
        // Replace corrupted data with recovered data
        await offlineSyncService.cacheData(key, recoveryResult.recoveredData);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Auto-recovery failed for key: ${key}`, error);
      return false;
    }
  }

  private async recoverFromBackup(dataKey: string): Promise<{ success: boolean; data?: any }> {
    try {
      const backupKey = this.getBackupKey(dataKey);
      const backupEntry = await offlineSyncService.getCachedEntry<BackupData>(backupKey);

      if (!backupEntry || !backupEntry.data) {
        return { success: false };
      }

      const backupData = backupEntry.data;

      // Validate backup integrity
      if (backupData.checksum) {
        const actualChecksum = await this.calculateChecksum(backupData.data);
        if (actualChecksum !== backupData.checksum) {
          throw new DataIntegrityError(
            IntegrityErrorType.BACKUP_CORRUPTED,
            'Backup data checksum mismatch',
            { dataKey }
          );
        }
      }

      return { success: true, data: backupData.data };
    } catch (error) {
      console.error(`Failed to recover from backup for key: ${dataKey}`, error);
      return { success: false };
    }
  }

  private async reconstructFromRelatedData(dataKey: string): Promise<{ success: boolean; data?: any }> {
    try {
      // This is a placeholder for more sophisticated reconstruction logic
      // In a real implementation, this would analyze related data to reconstruct missing/corrupted data

      const dataType = this.getDataTypeFromKey(dataKey);

      switch (dataType) {
        case 'user':
          // Could reconstruct user data from profile data, transaction history, etc.
          break;
        case 'message':
          // Could reconstruct message from conversation history
          break;
        case 'price':
          // Could reconstruct price from historical data or nearby market data
          break;
        default:
          return { success: false };
      }

      return { success: false };
    } catch (error) {
      console.error(`Failed to reconstruct data for key: ${dataKey}`, error);
      return { success: false };
    }
  }

  private async createDefaultData(dataKey: string): Promise<{ success: boolean; data?: any }> {
    try {
      const dataType = this.getDataTypeFromKey(dataKey);
      let defaultData: any;

      switch (dataType) {
        case 'user':
          defaultData = this.createDefaultUser();
          break;
        case 'message':
          defaultData = this.createDefaultMessage();
          break;
        case 'price':
          defaultData = this.createDefaultPrice();
          break;
        case 'deal':
          defaultData = this.createDefaultDeal();
          break;
        default:
          return { success: false };
      }

      return { success: true, data: defaultData };
    } catch (error) {
      console.error(`Failed to create default data for key: ${dataKey}`, error);
      return { success: false };
    }
  }

  private identifyConflictFields(serverData: any, clientData: any): string[] {
    const conflicts: string[] = [];

    if (!serverData || !clientData) {
      return conflicts;
    }

    const allKeys = new Set([...Object.keys(serverData), ...Object.keys(clientData)]);

    for (const key of allKeys) {
      if (serverData[key] !== clientData[key]) {
        // Skip timestamp fields as they're expected to differ
        if (!this.isTimestampField(key)) {
          conflicts.push(key);
        }
      }
    }

    return conflicts;
  }

  private resolveByTimestamp(serverData: any, clientData: any): any {
    const serverTimestamp = this.extractTimestamp(serverData);
    const clientTimestamp = this.extractTimestamp(clientData);

    if (!serverTimestamp && !clientTimestamp) {
      return serverData; // Default to server
    }

    if (!serverTimestamp) return clientData;
    if (!clientTimestamp) return serverData;

    return serverTimestamp > clientTimestamp ? serverData : clientData;
  }

  private mergeData(serverData: any, clientData: any): any {
    if (!serverData) return clientData;
    if (!clientData) return serverData;

    const merged = { ...serverData };

    // Merge non-conflicting fields from client
    for (const [key, value] of Object.entries(clientData)) {
      if (!(key in serverData)) {
        merged[key] = value;
      } else if (this.isTimestampField(key)) {
        // Use the more recent timestamp
        const serverTime = new Date(serverData[key]);
        const clientTime = new Date(value as any);
        merged[key] = serverTime > clientTime ? serverData[key] : value;
      }
    }

    return merged;
  }

  private async calculateChecksum(data: any): Promise<string> {
    try {
      const serialized = dataSerializer.serialize(data, { prettify: false });
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(serialized);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Failed to calculate checksum:', error);
      return '';
    }
  }

  private async getStoredChecksum(dataKey: string): Promise<string | null> {
    try {
      const checksumKey = `checksum_${dataKey}`;
      return await offlineSyncService.getCachedData<string>(checksumKey);
    } catch (error) {
      return null;
    }
  }

  private async storeChecksum(dataKey: string, checksum: string): Promise<void> {
    try {
      const checksumKey = `checksum_${dataKey}`;
      await offlineSyncService.cacheData(checksumKey, checksum);
    } catch (error) {
      console.error(`Failed to store checksum for key: ${dataKey}`, error);
    }
  }

  private getBackupKey(dataKey: string): string {
    return `${this.BACKUP_PREFIX}${dataKey}`;
  }

  private getDataTypeFromKey(dataKey: string): string {
    if (dataKey.includes('user')) return 'user';
    if (dataKey.includes('message')) return 'message';
    if (dataKey.includes('price')) return 'price';
    if (dataKey.includes('deal')) return 'deal';
    return 'unknown';
  }

  private isTimestampField(fieldName: string): boolean {
    const timestampFields = [
      'createdAt', 'updatedAt', 'timestamp', 'lastUpdated',
      'syncedAt', 'lastActivity', 'verifiedAt', 'resolvedAt'
    ];
    return timestampFields.includes(fieldName) || fieldName.endsWith('At') || fieldName.endsWith('Time');
  }

  private extractTimestamp(data: any): Date | null {
    if (!data) return null;

    const timestampFields = ['updatedAt', 'timestamp', 'lastUpdated', 'createdAt'];

    for (const field of timestampFields) {
      if (data[field]) {
        return new Date(data[field]);
      }
    }

    return null;
  }

  private async getAllCacheKeys(): Promise<string[]> {
    // This would need to be implemented based on the actual cache storage mechanism
    // For now, return an empty array as a placeholder
    return [];
  }

  private async validateRecoveredData(_dataKey: string, data: any): Promise<boolean> {
    try {
      const validation = dataSerializer.validateData(data);
      return validation.isValid;
    } catch (error) {
      return false;
    }
  }

  // Data repair methods
  private repairUserData(data: any): User {
    return {
      uid: data.uid || '',
      email: data.email || '',
      role: data.role || 'buyer',
      language: data.language || 'en',
      location: data.location || { state: '', district: '', city: '', pincode: '' },
      onboardingCompleted: data.onboardingCompleted || false,
      verificationStatus: data.verificationStatus || 'unverified',
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date()
    };
  }

  private repairMessageData(data: any): Partial<Message> {
    return {
      id: data.id || '',
      conversationId: data.conversationId || '',
      senderId: data.senderId || '',
      receiverId: data.receiverId || '',
      content: {
        originalText: data.content?.originalText || '',
        originalLanguage: data.content?.originalLanguage || 'en',
        translations: data.content?.translations || {},
        messageType: data.content?.messageType || 'text'
      },
      metadata: {
        timestamp: data.metadata?.timestamp || new Date(),
        readStatus: data.metadata?.readStatus || false
      }
    };
  }

  private repairPriceData(data: any): PriceData {
    return {
      commodity: data.commodity || '',
      mandi: data.mandi || '',
      price: data.price || 0,
      unit: data.unit || 'kg',
      quality: data.quality || 'standard',
      timestamp: data.timestamp || new Date(),
      source: data.source || 'unknown'
    };
  }

  private repairDealData(data: any): Partial<Deal> {
    return {
      id: data.id || '',
      buyerId: data.buyerId || '',
      sellerId: data.sellerId || '',
      commodity: data.commodity || '',
      quantity: data.quantity || 0,
      unit: data.unit || 'kg',
      agreedPrice: data.agreedPrice || 0,
      quality: data.quality || 'standard',
      status: data.status || 'draft',
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date()
    };
  }

  private repairGenericData(data: any): any {
    if (!data || typeof data !== 'object') {
      return {};
    }

    const repaired = { ...data };

    // Ensure timestamp fields are valid dates
    for (const [key, value] of Object.entries(repaired)) {
      if (this.isTimestampField(key) && value) {
        try {
          repaired[key] = new Date(value as any);
        } catch (error) {
          repaired[key] = new Date();
        }
      }
    }

    return repaired;
  }

  // Default data creators
  private createDefaultUser(): Partial<User> {
    return {
      uid: '',
      email: '',
      role: 'buyer',
      language: 'en',
      location: { state: '', district: '', city: '', pincode: '' },
      onboardingCompleted: false,
      verificationStatus: 'unverified',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private createDefaultMessage(): Partial<Message> {
    return {
      id: '',
      conversationId: '',
      senderId: '',
      receiverId: '',
      content: {
        originalText: '',
        originalLanguage: 'en',
        translations: {},
        messageType: 'text'
      },
      metadata: {
        timestamp: new Date(),
        readStatus: false
      }
    };
  }

  private createDefaultPrice(): PriceData {
    return {
      commodity: '',
      mandi: '',
      price: 0,
      unit: 'kg',
      quality: 'standard',
      timestamp: new Date(),
      source: 'unknown'
    };
  }

  private createDefaultDeal(): Partial<Deal> {
    return {
      id: '',
      buyerId: '',
      sellerId: '',
      commodity: '',
      quantity: 0,
      unit: 'kg',
      agreedPrice: 0,
      quality: 'standard',
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Logging methods
  private async logIntegrityCheck(result: IntegrityCheckResult): Promise<void> {
    try {
      const logEntry = {
        timestamp: new Date(),
        type: 'integrity_check',
        result: {
          isValid: result.isValid,
          errorCount: result.errors.length,
          warningCount: result.warnings.length,
          corruptedCount: result.corruptedKeys.length,
          recoveredCount: result.recoveredKeys.length
        }
      };

      await this.appendToIntegrityLog(logEntry);
    } catch (error) {
      console.error('Failed to log integrity check:', error);
    }
  }

  private async logRecovery(dataKey: string, method: string, attempt: number): Promise<void> {
    try {
      const logEntry = {
        timestamp: new Date(),
        type: 'recovery_success',
        dataKey,
        method,
        attempt
      };

      await this.appendToIntegrityLog(logEntry);
    } catch (error) {
      console.error('Failed to log recovery:', error);
    }
  }

  private async logRecoveryFailure(dataKey: string, error: DataIntegrityError): Promise<void> {
    try {
      const logEntry = {
        timestamp: new Date(),
        type: 'recovery_failure',
        dataKey,
        error: {
          type: error.type,
          message: error.message,
          recoverable: error.recoverable
        }
      };

      await this.appendToIntegrityLog(logEntry);
    } catch (logError) {
      console.error('Failed to log recovery failure:', logError);
    }
  }

  private async logConflictResolution(dataKey: string, resolution: ConflictResolution): Promise<void> {
    try {
      const logEntry = {
        timestamp: new Date(),
        type: 'conflict_resolution',
        dataKey,
        strategy: resolution.strategy,
        conflictFields: resolution.conflictDetails.conflictFields,
        requiresUserInput: resolution.requiresUserInput
      };

      await this.appendToIntegrityLog(logEntry);
    } catch (error) {
      console.error('Failed to log conflict resolution:', error);
    }
  }

  private async appendToIntegrityLog(entry: any): Promise<void> {
    try {
      const existingLog = await offlineSyncService.getCachedData<any[]>(this.INTEGRITY_LOG_KEY) || [];
      existingLog.push(entry);

      // Keep only the last 1000 entries
      if (existingLog.length > 1000) {
        existingLog.splice(0, existingLog.length - 1000);
      }

      await offlineSyncService.cacheData(this.INTEGRITY_LOG_KEY, existingLog);
    } catch (error) {
      console.error('Failed to append to integrity log:', error);
    }
  }

  /**
   * Gets integrity log entries
   */
  async getIntegrityLog(limit?: number): Promise<any[]> {
    try {
      const log = await offlineSyncService.getCachedData<any[]>(this.INTEGRITY_LOG_KEY) || [];
      return limit ? log.slice(-limit) : log;
    } catch (error) {
      console.error('Failed to get integrity log:', error);
      return [];
    }
  }

  /**
   * Clears integrity log
   */
  async clearIntegrityLog(): Promise<void> {
    try {
      await offlineSyncService.cacheData(this.INTEGRITY_LOG_KEY, []);
    } catch (error) {
      console.error('Failed to clear integrity log:', error);
    }
  }
}

// Export singleton instance
export const dataIntegrityService = new DataIntegrityService();
export default dataIntegrityService;