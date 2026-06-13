import React from 'react';

const PrivacyPolicyView = () => {
  return (
    <div className="min-h-screen bg-[#0a0f1c] px-4 py-20 font-['Inter'] text-white sm:px-6 lg:px-8">
      <div className="bg-navy2/50 relative mx-auto mt-10 max-w-4xl overflow-hidden rounded-3xl border border-white/10 p-8 backdrop-blur-md md:p-16">
        <div className="bg-teal/10 pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full blur-[100px]"></div>

        <h1 className="from-teal mb-6 bg-linear-to-r to-blue-500 bg-clip-text font-['Syne'] text-4xl font-bold text-transparent md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mb-10 border-b border-white/10 pb-6 text-gray-400">
          Last updated: June 15, 2026
        </p>

        <div className="space-y-8 leading-relaxed text-gray-300">
          <section>
            <h2 className="mb-4 text-2xl font-bold text-white">1. Information We Collect</h2>
            <p className="mb-4">
              At Kulmi Market, we collect information to provide better services to all our users. The
              types of personal information we obtain include:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-gray-400">
              <li>
                Contact details (such as name, email address, postal address, and phone number)
              </li>
              <li>Payment information (such as credit card details, billing address)</li>
              <li>Account login credentials</li>
              <li>Shopping history and preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-white">2. How We Use Information</h2>
            <p className="mb-4">
              We use the information we collect for various purposes, including:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-gray-400">
              <li>Processing your orders and delivering products</li>
              <li>Communicating with you about orders, products, and promotional offers</li>
              <li>Improving our platform, preventing fraud, and enhancing security</li>
              <li>Personalizing your shopping experience</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-white">3. Data Security</h2>
            <p>
              We implement a variety of security measures to maintain the safety of your personal
              information. Your personal data is contained behind secured networks and is only
              accessible by a limited number of persons who have special access rights, and are
              required to keep the information confidential. All sensitive/credit information you
              supply is encrypted via Secure Socket Layer (SSL) technology.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-white">4. Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal information. You can
              manage your account settings directly through the Kulmi Market dashboard or by contacting our
              support team.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyView;
