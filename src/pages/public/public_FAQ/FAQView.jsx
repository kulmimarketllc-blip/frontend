import React, { useState } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';

const faqData = [
  {
    category: 'Ordering & Shipping',
    questions: [
      {
        q: 'How long does shipping take?',
        a: 'Standard shipping takes 3-5 business days. Express options are available at checkout.',
      },
      {
        q: 'Do you ship internationally?',
        a: 'Yes, we ship to over 45 countries worldwide. Shipping times vary by destination.',
      },
      {
        q: 'How can I track my order?',
        a: 'Once your order ships, you will receive a tracking number via email. You can also view it in your account dashboard.',
      },
    ],
  },
  {
    category: 'Returns & Refunds',
    questions: [
      {
        q: 'What is your return policy?',
        a: 'We offer a 30-day return policy for most unused items in their original packaging.',
      },
      {
        q: 'How do I initiate a return?',
        a: "Log into your account, go to 'Orders', select the item you wish to return, and click 'Initiate Return'.",
      },
      {
        q: 'When will I get my refund?',
        a: 'Refunds are processed within 5-7 business days after we receive and inspect your returned item.',
      },
    ],
  },
  {
    category: 'Account & Security',
    questions: [
      {
        q: 'Is my payment information secure?',
        a: 'Absolutely. We use bank-grade SSL encryption and do not store full credit card details on our servers.',
      },
      {
        q: 'How do I reset my password?',
        a: "Click 'Forgot Password' on the login screen, enter your email, and follow the instructions sent to you.",
      },
    ],
  },
];

const FAQView = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] px-4 py-20 font-['Inter'] text-white sm:px-6 lg:px-8">
      <div className="mx-auto mt-10 max-w-4xl">
        <div className="relative mb-16 text-center">
          <div className="bg-teal/10 pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"></div>
          <h1 className="from-teal mb-6 bg-linear-to-r to-blue-500 bg-clip-text font-['Syne'] text-4xl font-bold text-transparent md:text-6xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Find answers to common questions about our marketplace, shipping, returns, and more.
          </p>
        </div>

        <div className="space-y-12">
          {faqData.map((section, sIdx) => (
            <div key={sIdx}>
              <h2 className="mb-6 border-b border-white/10 pb-4 text-2xl font-bold text-white">
                {section.category}
              </h2>
              <div className="space-y-4">
                {section.questions.map((item, qIdx) => {
                  const globalIndex = `${sIdx}-${qIdx}`;
                  const isOpen = openIndex === globalIndex;
                  return (
                    <div
                      key={qIdx}
                      className={`overflow-hidden rounded-2xl border border-white/10 transition-all duration-300 ${isOpen ? 'bg-white/10 backdrop-blur-md' : 'bg-white/5 backdrop-blur-sm hover:bg-white/[0.07]'}`}
                    >
                      <button
                        onClick={() => toggleQuestion(globalIndex)}
                        className="flex w-full items-center justify-between px-6 py-5 text-left focus:outline-none"
                      >
                        <span className="text-lg font-semibold">{item.q}</span>
                        <ChevronDown
                          className={`text-teal h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>

                      <div
                        className={`overflow-hidden px-6 transition-all duration-300 ${isOpen ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
                      >
                        <p className="mt-2 leading-relaxed text-gray-400">{item.a}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="from-navy2 group relative mt-20 overflow-hidden rounded-3xl border border-white/10 bg-linear-to-r to-[#0a0f1c] p-10 text-center">
          <div className="absolute -top-10 -right-10 h-40 w-40 bg-blue-500/10 blur-[50px] transition-all duration-500 group-hover:bg-blue-500/20"></div>
          <MessageCircle className="mx-auto mb-6 h-12 w-12 text-blue-400" />
          <h3 className="mb-4 font-['Syne'] text-2xl font-bold">Still have questions?</h3>
          <p className="mx-auto mb-8 max-w-md text-gray-400">
            Can't find the answer you're looking for? Please chat to our friendly team.
          </p>
          <a
            href="/support/contact"
            className="bg-teal text-navy2 inline-block rounded-full px-8 py-3 font-bold transition-colors duration-300 hover:bg-teal-400"
          >
            Get in touch
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQView;
