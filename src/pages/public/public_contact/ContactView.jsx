import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MessageSquare, Ticket, Headphones } from 'lucide-react';
import { getCurrentUser } from '../../../services/authService';

const ContactView = () => {
  const [user, setUser] = useState(() => getCurrentUser());

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0f1c] px-4 py-20 font-['Inter'] text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="relative mb-16 text-center">
          <div className="bg-teal/20 pointer-events-none absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" />
          <h1 className="from-teal mb-6 bg-linear-to-r to-blue-500 bg-clip-text font-['Syne'] text-4xl font-bold tracking-tight text-transparent md:text-6xl">
            Contact Support
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-400">
            Our dedicated support team is available to assist you with inquiries, technical issues,
            and marketplace support.
          </p>
        </div>

        {user ? (
          <div className="bg-teal/5 border-teal/30 mx-auto mb-10 flex max-w-3xl flex-col items-center gap-4 rounded-2xl border p-8 text-center sm:flex-row sm:text-left">
            <div className="bg-teal/10 text-teal flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
              <Ticket size={28} />
            </div>
            <div className="flex-1">
              <h2 className="font-['Syne'] text-xl font-bold text-white">Signed in as {user.firstName || 'Customer'}</h2>
              <p className="text-gray mt-1 text-sm">
                Open a support ticket from your dashboard to track replies and order-related issues in one place.
              </p>
            </div>
            <Link
              to="/dashboard/support?new=1"
              className="bg-teal text-navy hover:bg-teal2 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold no-underline"
            >
              <Headphones size={16} /> Open Support Ticket
            </Link>
          </div>
        ) : null}

        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: Phone,
              title: 'Telephone Support',
              description: 'Direct assistance for urgent matters during business hours.',
              detail: '+1 (800) 123-4567',
              action: 'tel:+18001234567',
            },
            {
              icon: Mail,
              title: 'Email Inquiries',
              description: 'Comprehensive support for detailed requests or account inquiries.',
              detail: 'support@kulmi.com',
              action: 'mailto:support@kulmi.com',
            },
            {
              icon: MessageSquare,
              title: user ? 'Support Tickets' : 'Live Assistance',
              description: user
                ? 'Track your open tickets and chat with our support team.'
                : 'Instant messaging with our online representatives for quick resolutions.',
              detail: user ? 'Manage in your dashboard' : 'Available 24/7',
              action: user ? '/dashboard/support' : '#',
              isInternal: !!user,
            },
          ].map((method) => {
            const className = 'bg-navy2/50 hover:border-teal/50 group block rounded-3xl border border-white/10 p-10 text-center backdrop-blur-md transition-all duration-300 hover:bg-white/5';
            const inner = (
              <>
                <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 transition-transform duration-300 group-hover:scale-110">
                  <method.icon className="text-teal h-8 w-8" />
                </div>
                <h3 className="mb-4 font-['Syne'] text-2xl font-bold">{method.title}</h3>
                <p className="mb-8 leading-relaxed text-gray-400">{method.description}</p>
                <div className="border-t border-white/10 pt-6">
                  <span className="text-teal text-lg font-semibold">{method.detail}</span>
                </div>
              </>
            );

            if (method.isInternal) {
              return (
                <Link key={method.title} to={method.action} className={className}>
                  {inner}
                </Link>
              );
            }

            return (
              <a href={method.action} key={method.title} className={className}>
                {inner}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContactView;
