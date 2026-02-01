// Intelligent Cache Management Service
// Handles storage limits, cache optimization, and cleanup strategies

interface CacheStats {
  totalSize: number;
  entryCount: number;
  lastCleanup: Date;
  storageQuota: number;
  storageUsage: number;
}

interface CachePolicy {
  maxSize: number;
  maxAge: number;
  priority: 'high' | 'medium' | 'low';
  cleanupStrategy: 'lru' | 'fifo' | 'size-based';
}

interface CacheEntry {
  key: string;
  size: number;
  lastAccessed: Date;
  created: Date;
  priority: number;
  hitCount: number;
}

class CacheManager {
  private readonly STORAGE_QUOTA_THRESHOLD = 0.8; // 80% of available storage
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
  
  private cachePolicies: Map<string, CachePolicy> = new Map();
  private cacheStats: Map<string, CacheStats> = new Map();
  private cleanupTimer: number | null = null;

  constructor() {
    this.initializeCachePolicies();
    this.startPeriodicCleanup();
    this.monitorStorageQuota();
  }

  private initializeCachePolicies(): void {
    // Define cache policies for different data types
    this.cachePolicies.set('prices', {
      maxSize: 50 * 1024 * 1024, // 50MB
      maxAge: 5 * 60 * 1000, // 5 minutes
      priority: 'high',
      cleanupStrategy: 'lru'
    });

    this.cachePolicies.set('deals', {
      maxSize: 20 * 1024 * 1024, // 20MB
      maxAge: 10 * 60 * 1000, // 10 minutes
      priority: 'high',
      cleanupStrategy: 'lru'
    });

    this.cachePolicies.set('messages', {
      maxSize: 30 * 1024 * 1024, // 30MB
      maxAge: 60 * 60 * 1000, // 1 hour
      priority: 'medium',
      cleanupStrategy: 'fifo'
    });

    this.cachePolicies.set('users', {
      maxSize: 10 * 1024 * 1024, // 10MB
      maxAge: 30 * 60 * 1000, // 30 minutes
      priority: 'medium',
      cleanupStrategy: 'lru'
    });

    this.cachePolicies.set('notifications', {
      maxSize: 5 * 1024 * 1024, // 5MB
      maxAge: 15 * 60 * 1000, // 15 minutes
      priority: 'low',
      cleanupStrategy: 'size-based'
    });

    this.cachePolicies.set('static', {
      maxSize: 100 * 1024 * 1024, // 100MB
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      priority: 'high',
      cleanupStrategy: 'lru'
    });
  }

  private startPeriodicCleanup(): void {
    this.cleanupTimer = window.setInterval(() => {
      this.performIntelligentCleanup();
    }, this.CLEANUP_INTERVAL);
  }

  private async monitorStorageQuota(): Promise<void> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const quota = estimate.quota || 0;
        const usage = estimate.usage || 0;
        const usageRatio = quota > 0 ? usage / quota : 0;

        if (usageRatio > this.STORAGE_QUOTA_THRESHOLD) {
          console.warn(`Storage usage high: ${Math.round(usageRatio * 100)}%`);
          await this.performEmergencyCleanup();
        }

        // Update cache stats
        for (const [cacheName] of this.cachePolicies) {
          const stats = this.cacheStats.get(cacheName) || this.createDefaultStats();
          stats.storageQuota = quota;
          stats.storageUsage = usage;
          this.cacheStats.set(cacheName, stats);
        }
      } catch (error) {
        console.error('Failed to estimate storage:', error);
      }
    }
  }

  async shouldCache(cacheName: string, data: any): Promise<boolean> {
    const policy = this.cachePolicies.get(cacheName);
    if (!policy) return false;

    const dataSize = this.estimateDataSize(data);
    const stats = await this.getCacheStats(cacheName);

    // Check size limits
    if (stats.totalSize + dataSize > policy.maxSize) {
      // Try cleanup first
      await this.cleanupCache(cacheName);
      const updatedStats = await this.getCacheStats(cacheName);
      
      if (updatedStats.totalSize + dataSize > policy.maxSize) {
        return false;
      }
    }

    // Check storage quota
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const quota = estimate.quota || 0;
      const usage = estimate.usage || 0;
      
      if (quota > 0 && (usage + dataSize) / quota > this.STORAGE_QUOTA_THRESHOLD) {
        return false;
      }
    }

    return true;
  }

  async cleanupCache(cacheName: string): Promise<void> {
    const policy = this.cachePolicies.get(cacheName);
    if (!policy) return;

    try {
      switch (policy.cleanupStrategy) {
        case 'lru':
          await this.cleanupLRU(cacheName);
          break;
        case 'fifo':
          await this.cleanupFIFO(cacheName);
          break;
        case 'size-based':
          await this.cleanupSizeBased(cacheName);
          break;
      }

      await this.updateCacheStats(cacheName);
    } catch (error) {
      console.error(`Failed to cleanup cache ${cacheName}:`, error);
    }
  }

  private async cleanupLRU(cacheName: string): Promise<void> {
    // Cleanup Least Recently Used entries
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    // Sort by last accessed time (would need to be tracked separately)
    // For now, remove oldest 25% of entries
    const removeCount = Math.floor(keys.length * 0.25);
    const keysToRemove = keys.slice(0, removeCount);
    
    await Promise.all(keysToRemove.map(key => cache.delete(key)));
  }

  private async cleanupFIFO(cacheName: string): Promise<void> {
    // Cleanup First In, First Out
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    // Remove oldest 25% of entries
    const removeCount = Math.floor(keys.length * 0.25);
    const keysToRemove = keys.slice(0, removeCount);
    
    await Promise.all(keysToRemove.map(key => cache.delete(key)));
  }

  private async cleanupSizeBased(cacheName: string): Promise<void> {
    // Remove entries based on estimated size
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    // Remove 30% of entries to free up space
    const removeCount = Math.floor(keys.length * 0.3);
    const keysToRemove = keys.slice(0, removeCount);
    
    await Promise.all(keysToRemove.map(key => cache.delete(key)));
  }

  private async performIntelligentCleanup(): Promise<void> {
    try {
      // Check each cache against its policy
      for (const [cacheName, policy] of this.cachePolicies) {
        const stats = await this.getCacheStats(cacheName);
        
        // Check if cleanup is needed
        const needsCleanup = 
          stats.totalSize > policy.maxSize * 0.9 || // 90% of max size
          Date.now() - stats.lastCleanup.getTime() > policy.maxAge * 2; // 2x max age
        
        if (needsCleanup) {
          await this.cleanupCache(cacheName);
        }
      }

      // Global storage check
      await this.monitorStorageQuota();
    } catch (error) {
      console.error('Intelligent cleanup failed:', error);
    }
  }

  private async performEmergencyCleanup(): Promise<void> {
    console.log('Performing emergency cache cleanup...');
    
    // Prioritize cleanup by cache priority (low priority first)
    const sortedCaches = Array.from(this.cachePolicies.entries())
      .sort(([, a], [, b]) => {
        const priorityOrder = { low: 0, medium: 1, high: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

    for (const [cacheName] of sortedCaches) {
      await this.cleanupCache(cacheName);
      
      // Check if we've freed enough space
      const estimate = await navigator.storage.estimate();
      const quota = estimate.quota || 0;
      const usage = estimate.usage || 0;
      
      if (quota > 0 && usage / quota < this.STORAGE_QUOTA_THRESHOLD) {
        break;
      }
    }
  }

  private async getCacheStats(cacheName: string): Promise<CacheStats> {
    let stats = this.cacheStats.get(cacheName);
    
    if (!stats) {
      stats = this.createDefaultStats();
      await this.updateCacheStats(cacheName);
    }
    
    return stats;
  }

  private createDefaultStats(): CacheStats {
    return {
      totalSize: 0,
      entryCount: 0,
      lastCleanup: new Date(),
      storageQuota: 0,
      storageUsage: 0
    };
  }

  private async updateCacheStats(cacheName: string): Promise<void> {
    try {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      
      let totalSize = 0;
      for (const key of keys) {
        const response = await cache.match(key);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }

      const stats: CacheStats = {
        totalSize,
        entryCount: keys.length,
        lastCleanup: new Date(),
        storageQuota: 0,
        storageUsage: 0
      };

      this.cacheStats.set(cacheName, stats);
    } catch (error) {
      console.error(`Failed to update cache stats for ${cacheName}:`, error);
    }
  }

  private estimateDataSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      // Fallback estimation
      return JSON.stringify(data).length * 2; // Rough estimate
    }
  }

  // Public API methods

  async getCachePolicy(cacheName: string): Promise<CachePolicy | null> {
    return this.cachePolicies.get(cacheName) || null;
  }

  async setCachePolicy(cacheName: string, policy: CachePolicy): Promise<void> {
    this.cachePolicies.set(cacheName, policy);
  }

  async getAllCacheStats(): Promise<Map<string, CacheStats>> {
    // Update all stats before returning
    for (const cacheName of this.cachePolicies.keys()) {
      await this.updateCacheStats(cacheName);
    }
    
    return new Map(this.cacheStats);
  }

  async clearAllCaches(): Promise<void> {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    this.cacheStats.clear();
  }

  async getStorageInfo(): Promise<{
    quota: number;
    usage: number;
    available: number;
    usagePercentage: number;
  }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const quota = estimate.quota || 0;
      const usage = estimate.usage || 0;
      
      return {
        quota,
        usage,
        available: quota - usage,
        usagePercentage: quota > 0 ? (usage / quota) * 100 : 0
      };
    }
    
    return {
      quota: 0,
      usage: 0,
      available: 0,
      usagePercentage: 0
    };
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Export types
export type { CacheStats, CachePolicy, CacheEntry };