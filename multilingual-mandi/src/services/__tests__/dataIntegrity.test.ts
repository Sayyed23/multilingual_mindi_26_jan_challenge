// Data Integrity Service Tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dataIntegrityService, DataIntegrityError, IntegrityErrorType } from '../dataIntegrity';
import { dataSerializer } from '../dataSerializer';
import { offlineSyncService } from '../offlineSync';
import type { CacheEntry } from '../../types';

// Mock the offline sync service
vi.mock('../offlineSync', () => ({
  offlineSyncService: {
    getCachedEntry: vi.fn(),
    getCachedData: vi.fn(),
    cacheData: vi.fn(),
    getLastSyncTime: vi.fn(),
    isOnline: vi.fn(() => true)
  }
}));

describe('DataIntegrityService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('detectCorruption', () => {
    it('should detect no corruption in valid data', async () => {
      const mockCacheEntry: CacheEntry<any> = {
        key: 'test-key',
        data: { id: 'test', name: 'Test Data' },
        timestamp: new Date(),
        version: 1
      };

      // Mock getAllCacheKeys to return empty array for this test
      vi.spyOn(dataIntegrityService as any, 'getAllCacheKeys').mockResolvedValue(['test-key']);
      vi.mocked(offlineSyncService.getCachedEntry).mockResolvedValue(mockCacheEntry);

      const result = await dataIntegrityService.detectCorruption();

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.corruptedKeys).toHaveLength(0);
    });

    it('should detect corruption in invalid data', async () => {
      const corruptedEntry: CacheEntry<any> = {
        key: 'corrupted-key',
        data: null, // Corrupted data
        timestamp: new Date(),
        version: 1
      };

      vi.spyOn(dataIntegrityService as any, 'getAllCacheKeys').mockResolvedValue(['corrupted-key']);
      vi.mocked(offlineSyncService.getCachedEntry).mockResolvedValue(corruptedEntry);

      const result = await dataIntegrityService.detectCorruption();

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.corruptedKeys).toContain('corrupted-key');
    });

    it('should handle cache access errors gracefully', async () => {
      vi.spyOn(dataIntegrityService as any, 'getAllCacheKeys').mockRejectedValue(new Error('Cache error'));

      const result = await dataIntegrityService.detectCorruption();

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].type).toBe(IntegrityErrorType.CORRUPTION_DETECTED);
    });
  });

  describe('recoverCorruptedData', () => {
    it('should recover data from backup successfully', async () => {
      const originalData = { id: 'test', name: 'Test Data' };
      const backupData = {
        originalKey: 'test-key',
        data: originalData,
        checksum: 'valid-checksum',
        timestamp: new Date(),
        version: '1.0'
      };

      const backupEntry: CacheEntry<any> = {
        key: 'backup_test-key',
        data: backupData,
        timestamp: new Date(),
        version: 1
      };

      vi.mocked(offlineSyncService.getCachedEntry).mockResolvedValue(backupEntry);
      vi.spyOn(dataIntegrityService as any, 'calculateChecksum').mockResolvedValue('valid-checksum');

      const result = await dataIntegrityService.recoverCorruptedData('test-key');

      expect(result.success).toBe(true);
      expect(result.recoveredData).toEqual(originalData);
    });

    it('should fail recovery when backup is corrupted', async () => {
      const backupData = {
        originalKey: 'test-key',
        data: { id: 'test', name: 'Test Data' },
        checksum: 'expected-checksum',
        timestamp: new Date(),
        version: '1.0'
      };

      const backupEntry: CacheEntry<any> = {
        key: 'backup_test-key',
        data: backupData,
        timestamp: new Date(),
        version: 1
      };

      vi.mocked(offlineSyncService.getCachedEntry).mockResolvedValue(backupEntry);
      vi.spyOn(dataIntegrityService as any, 'calculateChecksum').mockResolvedValue('different-checksum');

      const result = await dataIntegrityService.recoverCorruptedData('test-key');

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(DataIntegrityError);
      expect(result.error?.type).toBe(IntegrityErrorType.RECOVERY_FAILED);
    });

    it('should create default data when backup fails', async () => {
      vi.mocked(offlineSyncService.getCachedEntry).mockResolvedValue(null);
      vi.spyOn(dataIntegrityService as any, 'createDefaultData').mockResolvedValue({
        success: true,
        data: { id: '', name: '', email: '' }
      });

      const result = await dataIntegrityService.recoverCorruptedData('user_test-key');

      expect(result.success).toBe(true);
      expect(result.recoveredData).toBeDefined();
    });

    it('should respect maxRetries option', async () => {
      vi.mocked(offlineSyncService.getCachedEntry).mockResolvedValue(null);
      vi.spyOn(dataIntegrityService as any, 'createDefaultData').mockResolvedValue({ success: false });

      const result = await dataIntegrityService.recoverCorruptedData('test-key', { maxRetries: 1 });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(IntegrityErrorType.RECOVERY_FAILED);
    });
  });

  describe('resolveConflict', () => {
    const serverData = {
      id: 'test-1',
      name: 'Server Name',
      updatedAt: new Date('2024-01-02T00:00:00.000Z')
    };

    const clientData = {
      id: 'test-1',
      name: 'Client Name',
      updatedAt: new Date('2024-01-01T00:00:00.000Z')
    };

    it('should resolve conflict with server_wins strategy', async () => {
      const result = await dataIntegrityService.resolveConflict(
        'test-key',
        serverData,
        clientData,
        'server_wins'
      );

      expect(result.strategy).toBe('server_wins');
      expect(result.resolvedData).toEqual(serverData);
      expect(result.requiresUserInput).toBe(false);
    });

    it('should resolve conflict with client_wins strategy', async () => {
      const result = await dataIntegrityService.resolveConflict(
        'test-key',
        serverData,
        clientData,
        'client_wins'
      );

      expect(result.strategy).toBe('client_wins');
      expect(result.resolvedData).toEqual(clientData);
      expect(result.requiresUserInput).toBe(false);
    });

    it('should resolve conflict with timestamp_based strategy', async () => {
      const result = await dataIntegrityService.resolveConflict(
        'test-key',
        serverData,
        clientData,
        'timestamp_based'
      );

      expect(result.strategy).toBe('timestamp_based');
      expect(result.resolvedData).toEqual(serverData); // Server has newer timestamp
      expect(result.requiresUserInput).toBe(false);
    });

    it('should merge data with merge strategy', async () => {
      const serverDataWithExtra = { ...serverData, serverField: 'server-value' };
      const clientDataWithExtra = { ...clientData, clientField: 'client-value' };

      const result = await dataIntegrityService.resolveConflict(
        'test-key',
        serverDataWithExtra,
        clientDataWithExtra,
        'merge'
      );

      expect(result.strategy).toBe('merge');
      expect(result.resolvedData.serverField).toBe('server-value');
      expect(result.resolvedData.clientField).toBe('client-value');
      expect(result.requiresUserInput).toBe(false);
    });

    it('should require user input for manual strategy', async () => {
      const result = await dataIntegrityService.resolveConflict(
        'test-key',
        serverData,
        clientData,
        'manual'
      );

      expect(result.strategy).toBe('manual');
      expect(result.requiresUserInput).toBe(true);
    });

    it('should identify conflict fields correctly', async () => {
      const result = await dataIntegrityService.resolveConflict(
        'test-key',
        serverData,
        clientData,
        'server_wins'
      );

      expect(result.conflictDetails.conflictFields).toContain('name');
      expect(result.conflictDetails.conflictFields).not.toContain('id');
    });

    it('should throw error for unknown strategy', async () => {
      await expect(
        dataIntegrityService.resolveConflict(
          'test-key',
          serverData,
          clientData,
          'unknown_strategy' as any
        )
      ).rejects.toThrow(DataIntegrityError);
    });
  });

  describe('createBackup', () => {
    it('should create backup successfully', async () => {
      const testData = { id: 'test', name: 'Test Data' };
      vi.spyOn(dataIntegrityService as any, 'calculateChecksum').mockResolvedValue('test-checksum');
      vi.mocked(offlineSyncService.cacheData).mockResolvedValue(undefined);

      await expect(dataIntegrityService.createBackup('test-key', testData)).resolves.not.toThrow();

      expect(offlineSyncService.cacheData).toHaveBeenCalledWith(
        'backup_test-key',
        expect.objectContaining({
          originalKey: 'test-key',
          data: testData,
          checksum: 'test-checksum'
        })
      );
    });

    it('should throw error when backup creation fails', async () => {
      const testData = { id: 'test', name: 'Test Data' };
      vi.mocked(offlineSyncService.cacheData).mockRejectedValue(new Error('Cache error'));

      await expect(dataIntegrityService.createBackup('test-key', testData)).rejects.toThrow(DataIntegrityError);
    });
  });

  describe('validateDataIntegrity', () => {
    it('should validate data with matching checksum', async () => {
      const testData = { id: 'test', name: 'Test Data' };
      const testChecksum = 'test-checksum';

      vi.spyOn(dataIntegrityService as any, 'calculateChecksum').mockResolvedValue(testChecksum);
      vi.spyOn(dataIntegrityService as any, 'getStoredChecksum').mockResolvedValue(testChecksum);

      const result = await dataIntegrityService.validateDataIntegrity('test-key', testData);

      expect(result).toBe(true);
    });

    it('should fail validation with mismatched checksum', async () => {
      const testData = { id: 'test', name: 'Test Data' };

      vi.spyOn(dataIntegrityService as any, 'calculateChecksum').mockResolvedValue('current-checksum');
      vi.spyOn(dataIntegrityService as any, 'getStoredChecksum').mockResolvedValue('stored-checksum');

      const result = await dataIntegrityService.validateDataIntegrity('test-key', testData);

      expect(result).toBe(false);
    });

    it('should store checksum when none exists', async () => {
      const testData = { id: 'test', name: 'Test Data' };
      const testChecksum = 'test-checksum';

      vi.spyOn(dataIntegrityService as any, 'calculateChecksum').mockResolvedValue(testChecksum);
      vi.spyOn(dataIntegrityService as any, 'getStoredChecksum').mockResolvedValue(null);
      vi.spyOn(dataIntegrityService as any, 'storeChecksum').mockResolvedValue(undefined);

      const result = await dataIntegrityService.validateDataIntegrity('test-key', testData);

      expect(result).toBe(true);
      expect(dataIntegrityService['storeChecksum']).toHaveBeenCalledWith('test-key', testChecksum);
    });
  });

  describe('repairDataStructure', () => {
    it('should repair user data structure', async () => {
      const corruptedUserData = {
        uid: 'test-uid',
        email: 'test@example.com'
        // Missing required fields
      };

      const result = await dataIntegrityService.repairDataStructure('user_test-key', corruptedUserData);

      expect(result.success).toBe(true);
      expect(result.repairedData).toBeDefined();
      expect(result.repairedData.role).toBeDefined();
      expect(result.repairedData.language).toBeDefined();
      expect(result.repairedData.location).toBeDefined();
    });

    it('should repair message data structure', async () => {
      const corruptedMessageData = {
        id: 'msg-1',
        senderId: 'sender-1'
        // Missing required fields
      };

      const result = await dataIntegrityService.repairDataStructure('message_test-key', corruptedMessageData);

      expect(result.success).toBe(true);
      expect(result.repairedData).toBeDefined();
      expect(result.repairedData.receiverId).toBeDefined();
      expect(result.repairedData.content).toBeDefined();
    });

    it('should repair price data structure', async () => {
      const corruptedPriceData = {
        commodity: 'Rice',
        price: 2500
        // Missing required fields
      };

      const result = await dataIntegrityService.repairDataStructure('price_test-key', corruptedPriceData);

      expect(result.success).toBe(true);
      expect(result.repairedData).toBeDefined();
      expect(result.repairedData.mandi).toBeDefined();
      expect(result.repairedData.unit).toBeDefined();
      expect(result.repairedData.quality).toBeDefined();
    });

    it('should repair generic data structure', async () => {
      const corruptedData = {
        id: 'test-1',
        createdAt: '2024-01-01T00:00:00.000Z', // String instead of Date
        updatedAt: 1704067200000 // Timestamp instead of Date
      };

      const result = await dataIntegrityService.repairDataStructure('generic_test-key', corruptedData);

      expect(result.success).toBe(true);
      expect(result.repairedData.createdAt).toBeInstanceOf(Date);
      expect(result.repairedData.updatedAt).toBeInstanceOf(Date);
    });

    it('should fail repair for severely corrupted data', async () => {
      const severelyCorruptedData = null;

      // Mock the validation to fail
      vi.spyOn(dataSerializer, 'validateData').mockReturnValue({
        isValid: false,
        errors: ['Data is severely corrupted']
      });

      const result = await dataIntegrityService.repairDataStructure('test-key', severelyCorruptedData);

      expect(result.success).toBe(false);
    });
  });

  describe('integrity logging', () => {
    it('should get integrity log entries', async () => {
      const mockLog = [
        { timestamp: new Date(), type: 'integrity_check', result: { isValid: true } },
        { timestamp: new Date(), type: 'recovery_success', dataKey: 'test-key' }
      ];

      vi.mocked(offlineSyncService.getCachedData).mockResolvedValue(mockLog);

      const result = await dataIntegrityService.getIntegrityLog();

      expect(result).toEqual(mockLog);
    });

    it('should limit log entries when requested', async () => {
      const mockLog = Array.from({ length: 10 }, (_, i) => ({
        timestamp: new Date(),
        type: 'test_entry',
        index: i
      }));

      vi.mocked(offlineSyncService.getCachedData).mockResolvedValue(mockLog);

      const result = await dataIntegrityService.getIntegrityLog(5);

      expect(result).toHaveLength(5);
      expect(result[0].index).toBe(5); // Should get last 5 entries
    });

    it('should clear integrity log', async () => {
      vi.mocked(offlineSyncService.cacheData).mockResolvedValue(undefined);

      await expect(dataIntegrityService.clearIntegrityLog()).resolves.not.toThrow();

      expect(offlineSyncService.cacheData).toHaveBeenCalledWith('integrity_log', []);
    });

    it('should handle log access errors gracefully', async () => {
      vi.mocked(offlineSyncService.getCachedData).mockRejectedValue(new Error('Cache error'));

      const result = await dataIntegrityService.getIntegrityLog();

      expect(result).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should create DataIntegrityError with correct properties', () => {
      const error = new DataIntegrityError(
        IntegrityErrorType.CORRUPTION_DETECTED,
        'Test error message',
        {
          dataKey: 'test-key',
          corruptedData: { invalid: 'data' },
          recoverable: true
        }
      );

      expect(error.name).toBe('DataIntegrityError');
      expect(error.type).toBe(IntegrityErrorType.CORRUPTION_DETECTED);
      expect(error.message).toBe('Test error message');
      expect(error.dataKey).toBe('test-key');
      expect(error.recoverable).toBe(true);
    });

    it('should handle checksum calculation errors', async () => {
      const testData = { id: 'test' };
      vi.spyOn(dataIntegrityService as any, 'calculateChecksum').mockRejectedValue(new Error('Crypto error'));

      const result = await dataIntegrityService.validateDataIntegrity('test-key', testData);

      expect(result).toBe(false);
    });
  });
});