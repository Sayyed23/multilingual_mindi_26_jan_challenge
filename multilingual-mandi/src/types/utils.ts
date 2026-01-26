/**
 * Utility types and helper functions for the Multilingual Mandi platform
 * Provides common type patterns and transformations
 */

// Utility type helpers
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type Nullable<T> = T | null;
export type Maybe<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// API response wrapper types
export type AsyncData<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
};

export type CachedData<T> = {
  data: T;
  timestamp: Date;
  expiresAt: Date;
  version: number;
};

// Form state types
export type FormField<T> = {
  value: T;
  error: string | null;
  touched: boolean;
  dirty: boolean;
};

export type FormState<T extends Record<string, any>> = {
  [K in keyof T]: FormField<T[K]>;
} & {
  isValid: boolean;
  isSubmitting: boolean;
  submitCount: number;
  errors: Record<string, string>;
};

// Event handler types
export type EventHandler<T = void> = (event: T) => void;
export type AsyncEventHandler<T = void> = (event: T) => Promise<void>;

// Component prop types
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ComponentVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type ComponentState = 'default' | 'hover' | 'active' | 'disabled' | 'loading';

// Data transformation types
export type Mapper<T, U> = (item: T) => U;
export type Filter<T> = (item: T) => boolean;
export type Reducer<T, U> = (accumulator: U, current: T) => U;
export type Comparator<T> = (a: T, b: T) => number;

// Time-related types
export type TimeUnit = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
export type Duration = {
  value: number;
  unit: TimeUnit;
};

export type DateRange = {
  start: Date;
  end: Date;
};

export type TimeWindow = {
  start: Date;
  end: Date;
  duration: Duration;
};

// Geolocation types
export type Coordinates = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
};

export type BoundingBox = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export type GeofenceRegion = {
  center: Coordinates;
  radius: number; // in meters
  name: string;
};

// File and media types
export type FileType = 'image' | 'audio' | 'video' | 'document' | 'archive' | 'other';

export type FileInfo = {
  name: string;
  size: number;
  type: string;
  lastModified: Date;
  extension: string;
  category: FileType;
};

export type MediaDimensions = {
  width: number;
  height: number;
  aspectRatio: number;
};

export type AudioMetadata = {
  duration: number;
  bitrate?: number;
  sampleRate?: number;
  channels?: number;
};

export type VideoMetadata = AudioMetadata & MediaDimensions & {
  frameRate?: number;
  codec?: string;
};

export type ImageMetadata = MediaDimensions & {
  format: string;
  colorSpace?: string;
  hasAlpha?: boolean;
};

// Network and connectivity types
export type NetworkQuality = 'poor' | 'fair' | 'good' | 'excellent';
export type ConnectionType = 'cellular' | 'wifi' | 'ethernet' | 'bluetooth' | 'unknown';

export type NetworkInfo = {
  isOnline: boolean;
  connectionType: ConnectionType;
  quality: NetworkQuality;
  bandwidth?: number; // in Mbps
  latency?: number; // in ms
  isMetered?: boolean;
};

// Storage types
export type StorageType = 'localStorage' | 'sessionStorage' | 'indexedDB' | 'memory';

export type StorageItem<T> = {
  key: string;
  value: T;
  timestamp: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
};

export type StorageQuota = {
  used: number;
  available: number;
  total: number;
  percentage: number;
};

// Permission types
export type PermissionName = 
  | 'camera' 
  | 'microphone' 
  | 'location' 
  | 'notifications' 
  | 'storage' 
  | 'contacts'
  | 'calendar';

export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unknown';

export type Permission = {
  name: PermissionName;
  state: PermissionState;
  requestedAt?: Date;
  grantedAt?: Date;
  deniedAt?: Date;
};

// Internationalization types
export type LocaleCode = string; // e.g., 'en-US', 'hi-IN'
export type TranslationKey = string;
export type TranslationValues = Record<string, string | number>;

export type LocalizedString = {
  [locale: string]: string;
};

export type NumberFormat = {
  locale: LocaleCode;
  style: 'decimal' | 'currency' | 'percent';
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

export type DateFormat = {
  locale: LocaleCode;
  style: 'full' | 'long' | 'medium' | 'short';
  timeZone?: string;
};

// Performance monitoring types
export type PerformanceMetric = {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  context?: Record<string, any>;
};

export type PerformanceMark = {
  name: string;
  startTime: number;
  duration?: number;
  metadata?: Record<string, any>;
};

// Error boundary types
export type ErrorInfo = {
  componentStack: string;
  errorBoundary?: string;
  eventType?: string;
};

export type ErrorReport = {
  error: Error;
  errorInfo: ErrorInfo;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  url: string;
  userAgent: string;
  additionalContext?: Record<string, any>;
};

// Testing types
export type MockData<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? jest.MockedFunction<T[K]>
    : T[K] extends object
    ? MockData<T[K]>
    : T[K];
};

export type TestScenario<T> = {
  name: string;
  input: T;
  expected: any;
  setup?: () => void;
  teardown?: () => void;
};

// Utility functions for type checking and conversion
export const TypeUtils = {
  // Type checking utilities
  isNullOrUndefined: <T>(value: T | null | undefined): value is null | undefined => {
    return value === null || value === undefined;
  },

  isNotNullOrUndefined: <T>(value: T | null | undefined): value is T => {
    return value !== null && value !== undefined;
  },

  hasProperty: <T extends object, K extends string>(
    obj: T,
    key: K
  ): obj is T & Record<K, unknown> => {
    return key in obj;
  },

  // Array utilities
  isNonEmptyArray: <T>(arr: T[]): arr is [T, ...T[]] => {
    return Array.isArray(arr) && arr.length > 0;
  },

  // Object utilities
  pick: <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  },

  omit: <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach(key => {
      delete result[key];
    });
    return result;
  },

  // Deep cloning
  deepClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as T;
    if (obj instanceof Array) return obj.map(item => TypeUtils.deepClone(item)) as T;
    if (typeof obj === 'object') {
      const cloned = {} as T;
      Object.keys(obj).forEach(key => {
        (cloned as any)[key] = TypeUtils.deepClone((obj as any)[key]);
      });
      return cloned;
    }
    return obj;
  },

  // Type conversion utilities
  toNumber: (value: unknown): number | null => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? null : num;
    }
    return null;
  },

  toString: (value: unknown): string => {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return '';
    return String(value);
  },

  toBoolean: (value: unknown): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === '1';
    }
    if (typeof value === 'number') return value !== 0;
    return Boolean(value);
  },

  // Date utilities
  isValidDate: (date: unknown): date is Date => {
    return date instanceof Date && !isNaN(date.getTime());
  },

  formatDate: (date: Date, format: DateFormat): string => {
    return new Intl.DateTimeFormat(format.locale, {
      dateStyle: format.style,
      timeZone: format.timeZone,
    }).format(date);
  },

  // Number utilities
  formatNumber: (number: number, format: NumberFormat): string => {
    return new Intl.NumberFormat(format.locale, {
      style: format.style,
      currency: format.currency,
      minimumFractionDigits: format.minimumFractionDigits,
      maximumFractionDigits: format.maximumFractionDigits,
    }).format(number);
  },

  // Validation utilities
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPhoneNumber: (phone: string): boolean => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  },

  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Async utilities
  delay: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  timeout: <T>(promise: Promise<T>, ms: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), ms)
      ),
    ]);
  },

  retry: async <T>(
    fn: () => Promise<T>,
    attempts: number,
    delay: number = 1000
  ): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (attempts <= 1) throw error;
      await TypeUtils.delay(delay);
      return TypeUtils.retry(fn, attempts - 1, delay * 2);
    }
  },
};