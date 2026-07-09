import React, { useState, useEffect } from 'react';
import { getSupabase, isSupabaseConfigured, DEFAULT_COLUMN_MAPPING, autoDetectColumns } from '../lib/supabase';
import { User, ShieldAlert, Key, Database, RefreshCw, CheckCircle, AlertTriangle, KeyRound } from 'lucide-react';
import { ColumnMapping } from '../types';
import toast from 'react-hot-toast';

interface SettingsProps {
  userSession: any;
  columnMapping: ColumnMapping;
  onUpdateColumnMapping: (mapping: ColumnMapping) => void;
  onLogout: () => void;
}

export function Settings({
  userSession,
  columnMapping,
  onUpdateColumnMapping,
  onLogout,
}: SettingsProps) {
  // Tabs
  const [activeTab, setActiveTab] = useState<'profile' | 'schema' | 'security'>('profile');

  // Schema properties
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const [errorDetails, setErrorDetails] = useState('');
  const [localMapping, setLocalMapping] = useState<ColumnMapping>({ ...columnMapping });

  // Security properties
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Fetch schema columns
  useEffect(() => {
    if (isSupabaseConfigured() && activeTab === 'schema') {
      fetchSchema();
    }
  }, [activeTab]);

  const fetchSchema = async () => {
    setDbStatus('checking');
    try {
      const supabase = getSupabase();
      // Fetch a single row to inspect columns
      const { data, error } = await supabase.from('products').select('*').limit(1);

      if (error) {
        throw error;
      }

      setDbStatus('connected');
      if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        setDetectedColumns(columns);

        // Offer to auto-detect mappings if localMapping is default
        const autoDetected = autoDetectColumns(data[0]);
        setLocalMapping(autoDetected);
      } else {
        // If table is empty, we can try to fetch table structure or explain standard columns
        setDetectedColumns(Object.values(DEFAULT_COLUMN_MAPPING));
        toast.error('The products table is empty. Dynamic column detection may be limited.');
      }
    } catch (err: any) {
      console.error('Schema fetch error:', err);
      setDbStatus('error');
      setErrorDetails(err.message || 'Failed to select from table "products". Does the table exist?');
    }
  };

  const handleSaveMapping = () => {
    onUpdateColumnMapping(localMapping);
    toast.success('Column mappings updated successfully!');
  };

  const handleResetMapping = () => {
    setLocalMapping({ ...DEFAULT_COLUMN_MAPPING });
    onUpdateColumnMapping(DEFAULT_COLUMN_MAPPING);
    toast.success('Column mappings reset to default.');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    setUpdatingPassword(true);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success('Admin password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Password change error:', err);
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden flex flex-col md:flex-row min-h-[500px]">
      {/* Settings Navigation Sidebar */}
      <div className="w-full md:w-64 bg-gray-50/50 border-b md:border-b-0 md:border-r border-gray-200 p-4 space-y-1 shrink-0">
        <button
          onClick={() => setActiveTab('profile')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-white text-gray-950 border border-gray-200/50 shadow-xs'
              : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <User className="w-4 h-4 text-gray-400" /> Admin Profile
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors cursor-pointer ${
            activeTab === 'schema'
              ? 'bg-white text-gray-950 border border-gray-200/50 shadow-xs'
              : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <Database className="w-4 h-4 text-gray-400" /> Database & Schema Mapping
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors cursor-pointer ${
            activeTab === 'security'
              ? 'bg-white text-gray-950 border border-gray-200/50 shadow-xs'
              : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <Key className="w-4 h-4 text-gray-400" /> Security & Password
        </button>
      </div>

      {/* Settings Content Area */}
      <div className="flex-1 p-6 md:p-8">
        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-950">Admin Profile</h3>
              <p className="text-xs text-gray-500 mt-1">Review active authenticated administrator settings.</p>
            </div>

            <div className="border-t border-gray-150 pt-5 space-y-4">
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Administrator Email</span>
                <span className="block text-sm font-mono text-gray-800 mt-1">
                  {userSession?.user?.email || 'Demo Mode Account'}
                </span>
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Access Tier</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded bg-emerald-50 text-emerald-800 border border-emerald-100 mt-1">
                  Owner / Root Administrator
                </span>
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Session Token Issued</span>
                <span className="block text-xs text-gray-500 font-mono mt-1">
                  {userSession?.expires_at
                    ? new Date(userSession.expires_at * 1000).toLocaleString()
                    : 'Transient Demo Session (No Expiry)'}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-150 pt-6">
              <button
                onClick={onLogout}
                type="button"
                className="px-4 py-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-100 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
              >
                Sign Out from Dashboard
              </button>
            </div>
          </div>
        )}

        {/* SCHEMA TAB */}
        {activeTab === 'schema' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-950">Database & Schema Column Mapping</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Inspect columns of table <strong>products</strong> and map them dynamically.
                </p>
              </div>
              <button
                onClick={fetchSchema}
                type="button"
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-gray-950 transition-colors cursor-pointer"
                title="Refresh Database Schema Check"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Connection Status Panel */}
            <div className="border-t border-gray-150 pt-5">
              {dbStatus === 'checking' && (
                <div className="p-3 bg-gray-50 border border-gray-150 text-gray-500 text-xs rounded-lg flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying products database columns...
                </div>
              )}
              {dbStatus === 'connected' && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Active connection established. Found {detectedColumns.length} columns in table "products".
                </div>
              )}
              {dbStatus === 'error' && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-800 text-xs rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="font-semibold">Table connection diagnostics failed</span>
                  </div>
                  <p className="text-[11px] font-mono leading-relaxed text-red-700">
                    {errorDetails}
                  </p>
                  <p className="text-[10px] text-gray-400 italic">
                    Verify that your Supabase connection credentials are correct, and that a table named <strong>products</strong> is declared in your public schema.
                  </p>
                </div>
              )}
            </div>

            {/* Mappings Form */}
            <div className="space-y-4">
              <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Active Column Maps
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(DEFAULT_COLUMN_MAPPING).map((appField) => {
                  const val = localMapping[appField as keyof ColumnMapping];
                  return (
                    <div key={appField} className="space-y-1.5">
                      <label htmlFor={`map-${appField}`} className="block text-xs font-semibold capitalize text-gray-600">
                        {appField.replace('_', ' ')}
                      </label>
                      <input
                        type="text"
                        id={`map-${appField}`}
                        value={val}
                        onChange={(e) =>
                          setLocalMapping({ ...localMapping, [appField]: e.target.value })
                        }
                        className="block w-full px-3 py-1.5 border border-gray-250 rounded-lg text-xs bg-white font-mono text-gray-850 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder={appField}
                      />
                    </div>
                  );
                })}
              </div>

              {detectedColumns.length > 0 && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Detected Database columns (Selectable)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {detectedColumns.map((col) => (
                      <span
                        key={col}
                        className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-600 shadow-xs cursor-help"
                        title="Clicking doesn't change fields directly, type in mapping inputs above"
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={handleSaveMapping}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-colors cursor-pointer"
                >
                  Save Schema Mappings
                </button>
                <button
                  type="button"
                  onClick={handleResetMapping}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  Reset to Defaults
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-950">Security & Password</h3>
              <p className="text-xs text-gray-500 mt-1">Change administrator account password.</p>
            </div>

            <form onSubmit={handleChangePassword} className="border-t border-gray-150 pt-5 space-y-4 max-w-sm">
              <div>
                <label htmlFor="new-password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  New Admin Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    id="new-password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-3 py-2 border border-gray-250 rounded-lg text-xs bg-white text-gray-950 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    id="confirm-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-3 py-2 border border-gray-250 rounded-lg text-xs bg-white text-gray-950 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gray-950 hover:bg-gray-900 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {updatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
