import React from 'react';
import { Truck, Lock, RotateCcw, Headphones } from 'lucide-react';

const TrustStrip = () => {
  const trustItems = [
    { Icon: Truck, title: 'Free Delivery', subtitle: 'On orders over $50' },
    { Icon: Lock, title: 'Secure Payments', subtitle: 'Stripe-powered checkout' },
    { Icon: RotateCcw, title: 'Easy Returns', subtitle: '30-day return policy' },
    { Icon: Headphones, title: '24/7 Support', subtitle: 'Chat, email & phone' },
  ];

  return (
    <div className="bg-navy2 border-y border-white/10 py-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {trustItems.map((item, index) => {
          const { Icon, title, subtitle } = item;
          return (
            <div key={index} className="flex items-center gap-3">
              <Icon size={28} className="text-teal shrink-0" />
              <div>
                <p className="text-sm lg:text-base font-semibold text-white">{title}</p>
                <p className="text-xs lg:text-sm text-gray">{subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrustStrip;
