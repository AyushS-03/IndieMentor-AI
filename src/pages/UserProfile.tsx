import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../lib/authService';
import { User, Settings, Key, Shield, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

const UserProfile: React.FC = () => {
  const { user, authMode } = useAuth();
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);

  const token = authService.getToken();
  const decodedToken = authService.getTokenPayload();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Logged In</h2>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
              <p className="text-gray-600">JWT Token Information & User Details</p>
            </div>
            <div className="ml-auto">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                authMode === 'jwt' ? 'bg-green-100 text-green-800' :
                authMode === 'supabase' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {authMode.toUpperCase()} Auth
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* User Information */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              User Information
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Name:</span>
                <span className="text-gray-900">{user.name}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Email:</span>
                <span className="text-gray-900">{user.email}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Role:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.role === 'admin' ? 'bg-red-100 text-red-800' :
                  user.role === 'creator' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user.role?.toUpperCase() || 'USER'}
                </span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Subscription:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.subscriptionTier === 'enterprise' ? 'bg-gold-100 text-gold-800' :
                  user.subscriptionTier === 'premium' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user.subscriptionTier?.toUpperCase() || 'FREE'}
                </span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Is Creator:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.isCreator ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.isCreator ? 'YES' : 'NO'}
                </span>
              </div>

              <div className="pt-4">
                <span className="text-gray-600 font-medium">Permissions:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(user.permissions || ['read']).map((permission, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* JWT Token Information */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Key className="h-5 w-5 mr-2" />
              JWT Token Details
            </h2>

            {token && decodedToken ? (
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Token Status:</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    VALID
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">User ID:</span>
                  <span className="text-gray-900 font-mono text-sm">{decodedToken.userId}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Issued At:</span>
                  <span className="text-gray-900 text-sm">{formatTimestamp(decodedToken.iat!)}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Expires At:</span>
                  <span className="text-gray-900 text-sm">{formatTimestamp(decodedToken.exp!)}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Role ID:</span>
                  <span className="text-gray-900">{decodedToken.roleId}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Active Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    decodedToken.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {decodedToken.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                {/* Raw Token Display */}
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 font-medium">Raw JWT Token:</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(token)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Copy token"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-600" />
                        )}
                      </button>
                      <button
                        onClick={() => setShowToken(!showToken)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title={showToken ? "Hide token" : "Show token"}
                      >
                        {showToken ? (
                          <EyeOff className="h-4 w-4 text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 border">
                    <code className="text-xs text-gray-800 break-all font-mono">
                      {showToken ? token : '•'.repeat(50) + '...' + '•'.repeat(20)}
                    </code>
                  </div>
                  
                  {copied && (
                    <p className="text-green-600 text-sm mt-2">Token copied to clipboard!</p>
                  )}
                </div>

                {/* Decoded Payload */}
                <div className="pt-4">
                  <span className="text-gray-600 font-medium">Decoded Payload:</span>
                  <div className="bg-gray-50 rounded-lg p-3 border mt-2">
                    <pre className="text-xs text-gray-800 overflow-x-auto">
                      {JSON.stringify(decodedToken, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No JWT token found</p>
                <p className="text-sm text-gray-500">Login to generate a token</p>
              </div>
            )}
          </div>
        </div>

        {/* Developer Information */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Developer Information
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Backend Endpoints:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Login:</strong> POST /api/auth/login</p>
                <p><strong>Register:</strong> POST /api/auth/register</p>
                <p><strong>Validate:</strong> POST /api/auth/validate</p>
                <p><strong>Refresh:</strong> POST /api/auth/refresh</p>
                <p><strong>Profile:</strong> GET /api/auth/me</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">JWT Configuration:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Algorithm:</strong> HS256</p>
                <p><strong>Expiration:</strong> 7 days</p>
                <p><strong>Auto Refresh:</strong> 30 minutes before expiry</p>
                <p><strong>Storage:</strong> localStorage (authToken)</p>
                <p><strong>Header:</strong> Authorization: Bearer &lt;token&gt;</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
