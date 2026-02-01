// User Management Component
// Provides user search, filtering, verification, and bulk operations
// Displays user profiles with trust indicators and actions

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,

  Shield,
  ShieldCheck,
  ShieldX,
  UserX,
  Trash2,
  Eye,
  CheckSquare,
  Square,
  AlertTriangle
} from 'lucide-react';
import { adminService, type UserManagementFilters, type BulkOperation } from '../services/adminService';
import type { UserProfile, UserRole, VerificationStatus } from '../types';

interface UserManagementProps {
  onUserSelect?: (user: UserProfile) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onUserSelect }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<UserManagementFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await adminService.getUsers(filters, 50);
      setUsers(result.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setFilters(prev => ({ ...prev, searchTerm: term }));
  };

  const handleFilterChange = (key: keyof UserManagementFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const selectAllUsers = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(user => user.uid)));
    }
  };

  const handleBulkAction = async (action: 'verify' | 'suspend' | 'delete', data?: any) => {
    if (selectedUsers.size === 0) return;

    try {
      setBulkActionLoading(true);

      const bulkOperation: BulkOperation = {
        type: action,
        userIds: Array.from(selectedUsers),
        data
      };

      const result = await adminService.performBulkOperation(bulkOperation);

      if (result.success) {
        alert(`Successfully processed ${result.processedCount} users`);
        setSelectedUsers(new Set());
        loadUsers();
      } else {
        alert(`Processed ${result.processedCount} users, ${result.failedCount} failed`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bulk operation failed');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: string, data?: any) => {
    try {
      switch (action) {
        case 'verify':
          await adminService.updateUserVerification(userId, 'verified');
          break;
        case 'reject':
          await adminService.updateUserVerification(userId, 'rejected', data?.reason);
          break;
        case 'suspend':
          await adminService.suspendUser(userId, true, data?.reason || 'Admin action');
          break;
        case 'unsuspend':
          await adminService.suspendUser(userId, false, 'Admin action');
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            await adminService.deleteUser(userId, data?.reason || 'Admin action');
          }
          break;
      }

      loadUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const getVerificationBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'verified':
        return <ShieldCheck className="text-green-500" size={16} />;
      case 'pending':
        return <Shield className="text-yellow-500" size={16} />;
      case 'rejected':
        return <ShieldX className="text-red-500" size={16} />;
      default:
        return <Shield className="text-gray-400" size={16} />;
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'vendor':
        return 'bg-green-100 text-green-800';
      case 'buyer':
        return 'bg-blue-100 text-blue-800';
      case 'agent':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Users</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadUsers}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={filters.role || ''}
                onChange={(e) => handleFilterChange('role', e.target.value || undefined)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Roles</option>
                <option value="vendor">Vendor</option>
                <option value="buyer">Buyer</option>
                <option value="agent">Agent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verification Status</label>
              <select
                value={filters.verificationStatus || ''}
                onChange={(e) => handleFilterChange('verificationStatus', e.target.value || undefined)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Statuses</option>
                <option value="unverified">Unverified</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({})}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
          <span className="text-sm text-blue-800">
            {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('verify')}
              disabled={bulkActionLoading}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
            >
              Verify
            </button>
            <button
              onClick={() => handleBulkAction('suspend', { reason: 'Bulk suspension' })}
              disabled={bulkActionLoading}
              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 disabled:opacity-50"
            >
              Suspend
            </button>
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${selectedUsers.size} users? This cannot be undone.`)) {
                  handleBulkAction('delete', { reason: 'Bulk deletion' });
                }
              }}
              disabled={bulkActionLoading}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={selectAllUsers}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {selectedUsers.size === users.length && users.length > 0 ? (
                      <CheckSquare size={18} />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trust Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.uid} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleUserSelection(user.uid)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {selectedUsers.has(user.uid) ? (
                        <CheckSquare size={18} />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.personalInfo.name.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.personalInfo.name || 'No name'}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.personalInfo.phone && (
                          <div className="text-sm text-gray-500">{user.personalInfo.phone}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getVerificationBadge(user.trustData.verificationStatus)}
                      <span className="text-sm text-gray-900 capitalize">
                        {user.trustData.verificationStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {user.trustData.trustScore.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.trustData.transactionHistory.length} transactions
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUserSelect?.(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>

                      {user.trustData.verificationStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUserAction(user.uid, 'verify')}
                            className="text-green-600 hover:text-green-900"
                            title="Verify User"
                          >
                            <ShieldCheck size={16} />
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Reason for rejection:');
                              if (reason) {
                                handleUserAction(user.uid, 'reject', { reason });
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Reject Verification"
                          >
                            <ShieldX size={16} />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
                          const reason = prompt('Reason for suspension:');
                          if (reason) {
                            handleUserAction(user.uid, 'suspend', { reason });
                          }
                        }}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Suspend User"
                      >
                        <UserX size={16} />
                      </button>

                      <button
                        onClick={() => {
                          const reason = prompt('Reason for deletion:');
                          if (reason) {
                            handleUserAction(user.uid, 'delete', { reason });
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;