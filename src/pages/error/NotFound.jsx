import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <main className="min-h-screen bg-[#0A0F1E]">
      <section className="mx-auto flex min-h-screen w-full max-w-300 items-start justify-center px-6 pt-24 pb-10 sm:pt-28 lg:px-12 lg:pt-62">
        <div className="text-center">
          <p className="mb-3 font-['Syne'] text-[2.2rem] font-extrabold tracking-[0.18em] text-white sm:text-[2.8rem]">
            404-error
          </p>
          <h1 className="mb-2 font-['Syne'] text-[1.5rem] font-bold text-white sm:text-[1.9rem]">
            PAGE NOT FOUND
          </h1>
          <p className="text-gray2 mb-6 text-[0.92rem]">
            Your search has ventured beyond the known universe.
          </p>

          <Link
            to="/"
            className="border-teal/40 text-gray2 hover:border-teal hover:text-teal inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2 text-[0.82rem] font-medium transition-colors"
          >
            <Home size={15} />
            Back To Home
          </Link>
        </div>
      </section>
    </main>
  );
};

export default NotFound;
