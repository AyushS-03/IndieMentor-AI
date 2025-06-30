import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Users, UserCheck, Crown, Settings, BarChart3, Database } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user, hasPermission, hasRole, isAdmin, isPremium, authMode } = useAuth();

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have admin privileges to access this page.</p>
          <p className="text-sm text-gray-500">Current role: {user?.role || 'Unknown'}</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Users', value: '1,247', icon: Users, color: 'bg-blue-500' },
    { label: 'Active Mentors', value: '89', icon: UserCheck, color: 'bg-green-500' },
    { label: 'Premium Members', value: '234', icon: Crown, color: 'bg-purple-500' },
    { label: 'Total Sessions', value: '5,678', icon: BarChart3, color: 'bg-orange-500' },
  ];

  const permissions = [
    { name: 'Read Access', key: 'read', description: 'View data and content' },
    { name: 'Write Access', key: 'write', description: 'Create and edit content' },
    { name: 'Admin Access', key: 'admin', description: 'Full administrative privileges' },
    { name: 'User Management', key: 'manage_users', description: 'Manage user accounts' },
    { name: 'Create Mentors', key: 'create_mentor', description: 'Create AI mentors' },
    { name: 'Delete Content', key: 'delete', description: 'Delete any content' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Manage your IndieMentor AI platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                authMode === 'jwt' ? 'bg-green-100 text-green-800' :
                authMode === 'supabase' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {authMode.toUpperCase()} Mode
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current User Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user?.role === 'admin' ? 'bg-red-100 text-red-800' :
                  user?.role === 'creator' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user?.role?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Role ID:</span>
                <span className="font-medium">{user?.roleId}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subscription:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user?.subscriptionTier === 'enterprise' ? 'bg-gold-100 text-gold-800' :
                  user?.subscriptionTier === 'premium' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user?.subscriptionTier?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Is Creator:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user?.isCreator ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {user?.isCreator ? 'YES' : 'NO'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Is Premium:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isPremium() ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {isPremium() ? 'YES' : 'NO'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Auth Mode:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  authMode === 'jwt' ? 'bg-green-100 text-green-800' :
                  authMode === 'supabase' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {authMode.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Permissions Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Permission Matrix
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {permissions.map((permission) => (
              <div
                key={permission.key}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  hasPermission(permission.key)
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{permission.name}</h3>
                  <div className={`w-3 h-3 rounded-full ${
                    hasPermission(permission.key) ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                </div>
                <p className="text-sm text-gray-600">{permission.description}</p>
                <div className="mt-2 text-xs">
                  <span className={`px-2 py-1 rounded-full font-medium ${
                    hasPermission(permission.key)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {hasPermission(permission.key) ? 'GRANTED' : 'DENIED'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Testing Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Role Testing
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 border">
              <h3 className="font-medium text-gray-900 mb-2">Admin Role</h3>
              <p className="text-sm text-gray-600 mb-3">hasRole('admin')</p>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                hasRole('admin') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {hasRole('admin') ? 'TRUE' : 'FALSE'}
              </span>
            </div>
            
            <div className="p-4 rounded-lg bg-gray-50 border">
              <h3 className="font-medium text-gray-900 mb-2">Creator Role</h3>
              <p className="text-sm text-gray-600 mb-3">hasRole('creator')</p>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                hasRole('creator') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {hasRole('creator') ? 'TRUE' : 'FALSE'}
              </span>
            </div>
            
            <div className="p-4 rounded-lg bg-gray-50 border">
              <h3 className="font-medium text-gray-900 mb-2">User Role</h3>
              <p className="text-sm text-gray-600 mb-3">hasRole('user')</p>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                hasRole('user') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {hasRole('user') ? 'TRUE' : 'FALSE'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
