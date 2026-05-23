import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCurrentUser } from '../../services/authService';
import { setToken } from '../../utils/storage';

const OAuthCallbackView = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const routeByRole = (role) => {
    if (role === 'merchant') return '/merchant';
    if (role === 'admin' || role === 'sub_admin') return '/admin';
    return '/dashboard';
  };

  useEffect(() => {
    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (!token) {
          throw new Error('Missing OAuth token in callback URL.');
        }

        setToken(token);
        const user = await fetchCurrentUser();
        navigate(routeByRole(user?.role), { replace: true });
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'OAuth sign-in failed.');
      }
    };

    run();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy px-6 text-center">
        <div className="rounded-md border border-red/40 bg-red/10 p-6">
          <h1 className="mb-2 text-lg font-semibold text-red">Google Login Failed</h1>
          <p className="text-gray2 mb-4 text-sm">{error}</p>
          <button
            type="button"
            onClick={() => navigate('/auth/login')}
            className="rounded-md border border-teal px-4 py-2 text-sm font-semibold text-teal"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-6 text-center">
      <div className="rounded-md border border-white/10 bg-navy2 p-6">
        <h1 className="mb-2 text-lg font-semibold text-white">Completing Sign In</h1>
        <p className="text-gray2 text-sm">Please wait while we finish your Google login.</p>
      </div>
    </div>
  );
};

export default OAuthCallbackView;
