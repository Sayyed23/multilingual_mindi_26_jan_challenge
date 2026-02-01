
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import OfflineIndicator from '../OfflineIndicator';
import { offlineSyncService } from '../../services/offlineSync';
import './setup';

// Mock the offline sync service
vi.mock('../../services/offlineSync', () => ({
  offlineSyncService: {
    getSyncStatus: vi.fn(),
    forceSyncNow: vi.fn(),
  }
}));

const mockSyncStatus = {
  isOnline: true,
  lastSyncTime: new Date('2024-01-15T10:00:00Z'),
  pendingActions: 0,
  cacheSize: 150,
  syncInProgress: false
};

describe('OfflineIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(offlineSyncService.getSyncStatus).mockResolvedValue(mockSyncStatus);

    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });
  });

  it('renders compact indicator by default', async () => {
    render(<OfflineIndicator />);

    await waitFor(() => {
      expect(screen.getByText('Online')).toBeInTheDocument();
    });
  });

  it('shows detailed status when clicked', async () => {
    render(<OfflineIndicator />);

    const indicator = screen.getByText('Online');
    fireEvent.click(indicator);

    await waitFor(() => {
      expect(screen.getByText('Connection')).toBeInTheDocument();
      expect(screen.getByText('Last Sync')).toBeInTheDocument();
      expect(screen.getByText('Cached Items')).toBeInTheDocument();
    });
  });

  it('displays offline status correctly', async () => {
    const offlineStatus = { ...mockSyncStatus, isOnline: false };
    vi.mocked(offlineSyncService.getSyncStatus).mockResolvedValue(offlineStatus);

    render(<OfflineIndicator />);

    await waitFor(() => {
      expect(screen.getByText('Offline')).toBeInTheDocument();
    });
  });

  it('displays pending actions count', async () => {
    const statusWithPending = { ...mockSyncStatus, pendingActions: 3 };
    vi.mocked(offlineSyncService.getSyncStatus).mockResolvedValue(statusWithPending);

    render(<OfflineIndicator />);

    await waitFor(() => {
      expect(screen.getByText('3 pending')).toBeInTheDocument();
    });
  });

  it('shows sync in progress state', async () => {
    const syncingStatus = { ...mockSyncStatus, syncInProgress: true };
    vi.mocked(offlineSyncService.getSyncStatus).mockResolvedValue(syncingStatus);

    render(<OfflineIndicator />);

    await waitFor(() => {
      expect(screen.getByText('Syncing...')).toBeInTheDocument();
    });
  });

  it('formats last sync time correctly', async () => {
    render(<OfflineIndicator showDetails={true} />);

    await waitFor(() => {
      // Should show relative time
      expect(screen.getByText(/ago/)).toBeInTheDocument();
    });
  });

  it('shows never synced when lastSyncTime is null', async () => {
    const statusNoSync = { ...mockSyncStatus, lastSyncTime: null };
    vi.mocked(offlineSyncService.getSyncStatus).mockResolvedValue(statusNoSync);

    render(<OfflineIndicator showDetails={true} />);

    await waitFor(() => {
      expect(screen.getByText('Never')).toBeInTheDocument();
    });
  });

  it('enables manual sync when online', async () => {
    render(<OfflineIndicator showDetails={true} />);

    await waitFor(() => {
      const syncButton = screen.getByText('Sync Now');
      expect(syncButton).toBeEnabled();
    });
  });

  it('performs manual sync when button clicked', async () => {
    vi.mocked(offlineSyncService.forceSyncNow).mockResolvedValue([]);

    render(<OfflineIndicator showDetails={true} />);

    await waitFor(() => {
      const syncButton = screen.getByText('Sync Now');
      fireEvent.click(syncButton);
    });

    expect(offlineSyncService.forceSyncNow).toHaveBeenCalled();
  });

  it('disables sync button when offline', async () => {
    const offlineStatus = { ...mockSyncStatus, isOnline: false };
    vi.mocked(offlineSyncService.getSyncStatus).mockResolvedValue(offlineStatus);

    render(<OfflineIndicator showDetails={true} />);

    await waitFor(() => {
      expect(screen.queryByText('Sync Now')).not.toBeInTheDocument();
      expect(screen.getByText('Working Offline')).toBeInTheDocument();
    });
  });

  it('shows offline message when disconnected', async () => {
    const offlineStatus = { ...mockSyncStatus, isOnline: false };
    vi.mocked(offlineSyncService.getSyncStatus).mockResolvedValue(offlineStatus);

    render(<OfflineIndicator showDetails={true} />);

    await waitFor(() => {
      expect(screen.getByText('Working Offline')).toBeInTheDocument();
      expect(screen.getByText('Your actions will be saved and synced when connection is restored.')).toBeInTheDocument();
    });
  });

  it('shows pending actions section when there are pending actions', async () => {
    const statusWithPending = { ...mockSyncStatus, pendingActions: 5 };
    vi.mocked(offlineSyncService.getSyncStatus).mockResolvedValue(statusWithPending);

    render(<OfflineIndicator showDetails={true} />);

    await waitFor(() => {
      expect(screen.getByText('Pending Actions')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  it('displays cache size information', async () => {
    render(<OfflineIndicator showDetails={true} />);

    await waitFor(() => {
      expect(screen.getByText('Cached Items')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
    });
  });

  it('shows sync in progress message', async () => {
    const syncingStatus = { ...mockSyncStatus, syncInProgress: true };
    vi.mocked(offlineSyncService.getSyncStatus).mockResolvedValue(syncingStatus);

    render(<OfflineIndicator showDetails={true} />);

    await waitFor(() => {
      expect(screen.getByText('Synchronizing data...')).toBeInTheDocument();
    });
  });

  it('handles sync status fetch error gracefully', async () => {
    vi.mocked(offlineSyncService.getSyncStatus).mockRejectedValue(new Error('Fetch failed'));

    render(<OfflineIndicator />);

    // Should still render without crashing
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  it.skip('updates status periodically', async () => {
    vi.useFakeTimers();

    render(<OfflineIndicator />);

    // Check initial call
    await waitFor(() => {
      expect(offlineSyncService.getSyncStatus).toHaveBeenCalledTimes(1);
    });

    // Fast-forward 30 seconds
    act(() => {
      vi.advanceTimersByTime(31000); // 30s + buffer
    });

    await waitFor(() => {
      expect(offlineSyncService.getSyncStatus).toHaveBeenCalledTimes(2); // Initial + periodic
    }, { timeout: 1000 });

    vi.useRealTimers();
  });
});