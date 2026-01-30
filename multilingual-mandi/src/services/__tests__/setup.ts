import { vi } from 'vitest';

// Mock navigator and window objects for testing if they don't exist in the environment
if (typeof globalThis.navigator === 'undefined') {
    (globalThis as any).navigator = {
        serviceWorker: {
            register: vi.fn(),
            getRegistration: vi.fn(),
        },
        onLine: true,
    };
}

if (typeof globalThis.window === 'undefined') {
    (globalThis as any).window = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
        localStorage: {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
        },
        caches: {
            keys: vi.fn(),
            open: vi.fn(),
            delete: vi.fn(),
        },
    };
}

if (typeof globalThis.caches === 'undefined') {
    (globalThis as any).caches = (globalThis.window as any).caches;
}
