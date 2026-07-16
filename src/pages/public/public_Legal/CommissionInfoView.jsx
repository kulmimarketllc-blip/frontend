import React from 'react';
import { DollarSign, Percent, TrendingUp, ShieldCheck } from 'lucide-react';

const CommissionInfoView = () => {
  return (
    <div className="min-h-screen bg-[#0a0f1c] px-4 py-20 font-['Inter'] text-white sm:px-6 lg:px-8">
      <div className="mx-auto mt-10 max-w-5xl">
        <div className="relative mb-16 text-center">
          <div className="bg-teal/10 pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"></div>
          <h1 className="from-teal mb-6 bg-linear-to-r to-blue-500 bg-clip-text font-['Syne'] text-4xl font-bold text-transparent md:text-6xl">
            Merchant Commission & Fees
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Transparent pricing designed to help your business grow. We only succeed when you succeed.
          </p>
        </div>

        <div className="mb-16 grid gap-6 md:grid-cols-4">
          {[
            { icon: Percent, title: "Low Rates", desc: "Starting from just 2% on successful sales." },
            { icon: DollarSign, title: "No Hidden Fees", desc: "Zero setup or monthly subscription fees." },
            { icon: TrendingUp, title: "Volume Discounts", desc: "Sell more, pay less with tiered rates." },
            { icon: ShieldCheck, title: "Secure Payouts", desc: "Guaranteed weekly disbursements." }
          ].map((item, idx) => (
            <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:bg-white/10">
              <item.icon className="mx-auto mb-4 h-10 w-10 text-teal" />
              <h3 className="mb-2 text-xl font-bold">{item.title}</h3>
              <p className="text-sm text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-navy2/50 rounded-3xl border border-white/10 p-8 backdrop-blur-md md:p-12">
          <h2 className="mb-8 font-['Syne'] text-3xl font-bold">Standard Commission Rates</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-4 font-bold text-gray-300">Category</th>
                  <th className="pb-4 font-bold text-gray-300">Commission Fee</th>
                  <th className="pb-4 font-bold text-gray-300">Transaction Fee</th>
                </tr>
              </thead>
              <tbody className="text-gray-400">
                <tr className="border-b border-white/5">
                  <td className="py-4">Electronics & Gadgets</td>
                  <td className="py-4 text-teal font-bold">3.5%</td>
                  <td className="py-4">$0.30</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4">Fashion & Apparel</td>
                  <td className="py-4 text-teal font-bold">5.0%</td>
                  <td className="py-4">$0.30</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4">Home & Garden</td>
                  <td className="py-4 text-teal font-bold">4.0%</td>
                  <td className="py-4">$0.30</td>
                </tr>
                <tr>
                  <td className="py-4">All Other Categories</td>
                  <td className="py-4 text-teal font-bold">4.5%</td>
                  <td className="py-4">$0.30</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-10 rounded-2xl bg-blue-500/10 p-6 border border-blue-500/20">
            <h3 className="mb-2 text-xl font-bold text-blue-400">Ready to start selling?</h3>
            <p className="mb-4 text-gray-300">Join thousands of merchants already growing their business on Kulmi Market.</p>
            <a href="/merchant-register" className="inline-block rounded-full bg-blue-500 px-6 py-2 font-bold text-white transition-colors duration-300 hover:bg-blue-600">
              Become a Merchant
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionInfoView;
