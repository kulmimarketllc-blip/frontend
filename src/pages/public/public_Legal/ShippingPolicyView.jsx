import React from 'react';
import { Truck, Clock, Globe, ShieldAlert, Zap } from 'lucide-react';

const ShippingPolicyView = () => {
  return (
    <div className="min-h-screen bg-[#0a0f1c] px-4 py-20 font-['Inter'] text-white sm:px-6 lg:px-8">
      <div className="mx-auto mt-10 max-w-4xl">
        <div className="mb-16 text-center">
          <h1 className="from-teal mb-6 bg-linear-to-r to-blue-500 bg-clip-text font-['Syne'] text-4xl font-bold text-transparent md:text-6xl">
            Shipping Policy
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Everything you need to know about our shipping methods, delivery times, and rates.
          </p>
        </div>

        <div className="mb-16 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <Truck className="text-teal mb-4 h-8 w-8" />
            <h3 className="mb-2 text-xl font-bold">Standard Shipping</h3>
            <p className="text-sm text-gray-400">3-5 business days. Free for orders over $50.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <Zap className="mb-4 h-8 w-8 text-blue-400" />
            <h3 className="mb-2 text-xl font-bold">Express Shipping</h3>
            <p className="text-sm text-gray-400">1-2 business days. Calculated at checkout.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <Globe className="mb-4 h-8 w-8 text-purple-400" />
            <h3 className="mb-2 text-xl font-bold">International</h3>
            <p className="text-sm text-gray-400">7-14 business days. Duties and taxes may apply.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <ShieldAlert className="mb-4 h-8 w-8 text-red-400" />
            <h3 className="mb-2 text-xl font-bold">Order Tracking</h3>
            <p className="text-sm text-gray-400">
              Real-time tracking available for all shipped orders.
            </p>
          </div>
        </div>

        <div className="bg-navy2/50 rounded-3xl border border-white/10 p-8 backdrop-blur-md md:p-12">
          <div className="space-y-8 leading-relaxed text-gray-300">
            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">Processing Time</h2>
              <p>
                All orders are processed within 1 to 2 business days (excluding weekends and
                holidays) after receiving your order confirmation email. You will receive another
                notification when your order has shipped.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">Shipping Rates</h2>
              <p>
                Shipping charges for your order will be calculated and displayed at checkout. We
                periodically offer free shipping promotions which will be automatically applied to
                qualifying orders.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">
                P.O. Boxes and APO/FPO Addresses
              </h2>
              <p>
                Kulmi Market ships to addresses within the U.S., U.S. Territories, and APO/FPO/DPO
                addresses. However, certain items may have shipping restrictions.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicyView;
