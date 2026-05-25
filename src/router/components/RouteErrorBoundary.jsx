import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

const RouteErrorBoundary = () => {
  const error = useRouteError();

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText || 'Route Error'}`
    : 'Application Error';

  const message = error instanceof Error
    ? error.message
    : isRouteErrorResponse(error)
      ? error.data || 'Unable to load this page.'
      : 'Unable to load this page. Please try again.';

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b1020] px-4 text-white">
      <div className="bg-card w-full max-w-xl rounded-2xl border border-white/10 p-6 shadow-2xl shadow-black/30">
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-teal">ESUUQ</div>
        <h1 className="font-['Syne'] mt-3 text-2xl font-bold">{title}</h1>
        <p className="text-gray2 mt-3 text-sm leading-6">{message}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-teal text-navy hover:bg-teal2 rounded px-4 py-2 text-sm font-semibold transition-colors"
          >
            Reload page
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="rounded border border-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-teal hover:text-teal"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteErrorBoundary;