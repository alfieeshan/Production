import React, { useState } from 'react';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { Lock, Mail, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface LoginProps {
  onLoginSuccess: (session: any) => void;
  onBypassDev?: () => void; // Support fallback/dev bypass if they haven't setup database users yet
}

export function Login({ onLoginSuccess, onBypassDev }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    if (!isSupabaseConfigured()) {
      toast.error('Supabase is not configured yet. Configure variables in settings.');
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        toast.success('Admin login successful!');
        onLoginSuccess(data.session);
      } else {
        throw new Error('Access denied. No active session established.');
      }
    } catch (err: any) {
      console.error('Authentication Error:', err);
      toast.error(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const isConfigured = isSupabaseConfigured();

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA] relative">
      <div className="absolute top-4 right-4 max-w-sm">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-950 px-3 py-1.5 rounded-lg border border-gray-200 bg-white transition-all cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" /> Supabase User Setup Guide
        </button>
      </div>

      <div className="sm:mx-auto w-full max-w-md">
        {/* App Title / Logo */}
        <div className="flex flex-col items-center justify-center">
          <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-gray-900 font-sans">
            Showcase Admin Panel
          </h2>
          <p className="mt-1.5 text-center text-xs font-medium text-gray-500 max-w-xs leading-relaxed">
            Authorized admin credentials required to access the mobile phone catalog database.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md">
        <div className="bg-white py-8 px-6 border border-gray-200 rounded-2xl shadow-sm sm:px-10">
          {!isConfigured ? (
            <div className="space-y-4 text-center">
              <div className="p-3 bg-amber-50 rounded-lg text-amber-800 border border-amber-100 text-xs text-left leading-relaxed">
                <p className="font-semibold mb-1">⚠️ Setup Required</p>
                Your Supabase API environment variables are not connected yet. Click <strong>Settings</strong> in AI Studio to inject:
                <code className="block mt-1 p-1 bg-amber-100/50 rounded text-[10px] font-mono">
                  VITE_SUPABASE_URL<br />
                  VITE_SUPABASE_ANON_KEY
                </code>
              </div>
              <p className="text-xs text-gray-400">
                Configure credentials to enable authenticated login.
              </p>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleLogin}>
              {/* Email Address */}
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Admin Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    id="login-email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@showcase.com"
                    className="block w-full pl-9 pr-3 py-2 border border-gray-250 rounded-lg text-sm bg-white placeholder-gray-400 text-gray-950 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    id="login-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-3 py-2 border border-gray-250 rounded-lg text-sm bg-white placeholder-gray-400 text-gray-950 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
                  />
                </div>
              </div>

              {/* Submit button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  id="login-submit-btn"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-950 hover:bg-gray-900 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Sign In to Dashboard'}{' '}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {onBypassDev && (
                <div className="border-t border-gray-150 pt-4 text-center">
                  <button
                    type="button"
                    onClick={onBypassDev}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
                  >
                    Bypass to Offline Preview Mode (Demo)
                  </button>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Dynamic setup guide container */}
        {showGuide && (
          <div className="mt-4 bg-white p-5 border border-gray-200 rounded-xl text-xs space-y-3 shadow-xs max-w-md mx-auto leading-relaxed text-gray-650 animate-fade-in">
            <h4 className="font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" /> Supabase Admin User Setup
            </h4>
            <p>
              To authenticate using Supabase Auth in this Admin Panel, you must create an admin account in your existing Supabase dashboard:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-gray-700">
              <li>Open your <strong>Supabase Dashboard</strong>.</li>
              <li>Navigate to <strong>Authentication</strong> &gt; <strong>Users</strong>.</li>
              <li>Click <strong>Add User</strong> &gt; <strong>Create User</strong>.</li>
              <li>Fill in the admin email &amp; password.</li>
              <li>Disable "Auto-confirm user" or make sure to verify the user state as active.</li>
              <li>Now log in here with those exact credentials!</li>
            </ol>
            <p className="text-[10px] text-gray-400 italic">
              * Note: If you do not have Supabase credentials connected yet, click the 'Bypass' button below the form to inspect the handcrafted visual dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
