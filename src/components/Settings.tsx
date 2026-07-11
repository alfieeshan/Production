import React, { useState } from 'react';
import { getSupabase } from '../lib/supabase';
import { KeyRound, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

interface SettingsProps {
  userSession: any;
  columnMapping: any;
  onUpdateColumnMapping: (mapping: any) => void;
  onLogout: () => void;
}

export function Settings({
  userSession,
}: SettingsProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const isDemoMode = !userSession;

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
      if (isDemoMode) {
        // Simulated update for Demo Mode
        await new Promise((resolve) => setTimeout(resolve, 800));
        toast.success('Admin password updated successfully (Demo Mode Simulated)!');
        setNewPassword('');
        setConfirmPassword('');
        return;
      }

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
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden min-h-[400px] flex flex-col justify-between p-6 md:p-8">
      <div className="space-y-6 max-w-md">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Account Security</span>
          </div>
          <h3 className="text-xl font-bold text-gray-950">Security & Password</h3>
          <p className="text-xs text-gray-500 mt-1">
            Update your administrator credentials to keep your dashboard secure.
          </p>
        </div>

        {isDemoMode && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg">
            <strong>Demo Mode Active:</strong> You are currently using the offline developer preview. Password updates will be simulated.
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <label htmlFor="new-password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
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

          <div className="space-y-1.5">
            <label htmlFor="confirm-password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
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
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {updatingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
