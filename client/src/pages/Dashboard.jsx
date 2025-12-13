import { useState } from 'react';
import { useAuth } from '../authContext';
import { api } from '../api';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [protectedData, setProtectedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTestProtected = async () => {
    setLoading(true);
    setError('');
    setProtectedData(null);

    try {
      const data = await api.protected();
      setProtectedData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-600 hover:border-slate-500 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900 rounded-md p-4 border border-slate-700">
              <p className="text-sm text-slate-400 mb-1">Logged in as</p>
              <p className="text-white font-medium">{user?.email}</p>
            </div>

            <div className="bg-slate-900 rounded-md p-4 border border-slate-700">
              <p className="text-sm text-slate-400 mb-3">Test protected endpoint</p>
              <button
                onClick={handleTestProtected}
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
              >
                {loading ? 'Loading...' : 'Call /api/protected'}
              </button>

              {protectedData && (
                <div className="mt-4 p-3 bg-emerald-900/30 border border-emerald-700 rounded-md">
                  <pre className="text-emerald-400 text-sm overflow-auto">
                    {JSON.stringify(protectedData, null, 2)}
                  </pre>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-md">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

