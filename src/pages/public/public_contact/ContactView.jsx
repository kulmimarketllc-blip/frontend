import React from 'react';
import { Mail, Phone, MessageSquare } from 'lucide-react';

const ContactView = () => {
  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white py-20 px-4 sm:px-6 lg:px-8 font-['Inter'] flex flex-col items-center justify-center">
      <div className="max-w-6xl w-full mx-auto">
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-teal/20 blur-[120px] rounded-full pointer-events-none"></div>
          <h1 className="font-['Syne'] text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-teal to-blue-500 bg-clip-text text-transparent">
            Contact Support
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Our dedicated support team is available to assist you with inquiries, technical issues, and marketplace support. Select the most convenient way to reach us below.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Phone,
              title: 'Telephone Support',
              description: 'Direct assistance for urgent matters during business hours.',
              detail: '+1 (800) 123-4567',
              action: 'tel:+18001234567'
            },
            {
              icon: Mail,
              title: 'Email Inquiries',
              description: 'Comprehensive support for detailed requests or account inquiries.',
              detail: 'support@kulmi.com',
              action: 'mailto:support@kulmi.com'
            },
            {
              icon: MessageSquare,
              title: 'Live Assistance',
              description: 'Instant messaging with our online representatives for quick resolutions.',
              detail: 'Available 24/7',
              action: '#'
            }
          ].map((method, idx) => (
            <a 
              href={method.action}
              key={idx} 
              className="bg-navy2/50 border border-white/10 rounded-3xl p-10 text-center backdrop-blur-md hover:bg-white/5 hover:border-teal/50 transition-all duration-300 group block"
            >
              <div className="w-16 h-16 mx-auto bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <method.icon className="w-8 h-8 text-teal" />
              </div>
              <h3 className="font-['Syne'] text-2xl font-bold mb-4">{method.title}</h3>
              <p className="text-gray-400 mb-8 leading-relaxed">{method.description}</p>
              <div className="pt-6 border-t border-white/10">
                <span className="text-teal font-semibold text-lg">{method.detail}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactView;
