/**
 * LoadingFallback Component
 *
 * Displays a loading spinner while lazy-loaded routes are being fetched.
 * Used with React.Suspense for code splitting.
 */

const LoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-center">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      <p className="mt-4 text-sm text-gray-600">Loading...</p>
    </div>
  </div>
);

export default LoadingFallback;
