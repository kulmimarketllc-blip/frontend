import React from 'react';

const TermsOfServiceView = () => {
  return (
    <div className="min-h-screen bg-[#0a0f1c] px-4 py-20 font-['Inter'] text-white sm:px-6 lg:px-8">
      <div className="bg-navy2/50 relative mx-auto mt-10 max-w-4xl overflow-hidden rounded-3xl border border-white/10 p-8 backdrop-blur-md md:p-16">
        <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-blue-500/10 blur-[100px]"></div>

        <h1 className="to-teal mb-6 bg-linear-to-r from-blue-400 bg-clip-text font-['Syne'] text-4xl font-bold text-transparent md:text-5xl">
          Terms of Service
        </h1>
        <p className="mb-10 border-b border-white/10 pb-6 text-gray-400">
          Effective Date: June 15, 2026
        </p>

        <div className="space-y-8 leading-relaxed text-gray-300">
          <section>
            <h2 className="mb-4 text-2xl font-bold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the Kulmi Market platform, you agree to be bound by these Terms of
              Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-white">2. User Accounts</h2>
            <p className="mb-4">
              To use certain features of the platform, you must register for an account. You agree
              to:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-gray-400">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain the security of your password and identification</li>
              <li>Accept all responsibility for all activities that occur under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-white">3. Prohibited Activities</h2>
            <p className="mb-4">
              You may not access or use the platform for any purpose other than that for which we
              make the platform available. Prohibited activity includes:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-gray-400">
              <li>Engaging in unauthorized framing of or linking to the platform</li>
              <li>Defrauding, or misleading us and other users</li>
              <li>Interfering with, disrupting, or creating an undue burden on the platform</li>
              <li>Selling counterfeit or illegal items</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-white">4. Limitation of Liability</h2>
            <p>
              Kulmi Market shall not be liable for any indirect, incidental, special, consequential, or
              punitive damages, or any loss of profits or revenues, whether incurred directly or
              indirectly, or any loss of data, use, goodwill, or other intangible losses resulting
              from your access to or use of or inability to access or use the services.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServiceView;
