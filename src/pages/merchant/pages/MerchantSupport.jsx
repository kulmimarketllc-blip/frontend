import React from 'react';
import { HelpCircle, Mail, MessageCircle, Book, ExternalLink, Send, Plus, Phone, Minus } from 'lucide-react';
import MerchantPageHeader from '../components/MerchantPageHeader';
import { getMyMerchantStore } from '../../../services/merchantService';

const faqs = [
  { q: 'How long do payouts take?', a: 'Standard payouts are processed daily and typically arrive in your connected bank account within 2-3 business days. You can also request instant payouts for a 1% fee.' },
  { q: 'How are commissions calculated?', a: 'Commissions are a percentage of the total order value, including shipping. Standard rates are 8% for most categories, though specialized categories may vary.' },
  { q: 'Can I sell outside the US?', a: 'Currently, the Kulmi Market merchant platform supports sellers with registered businesses and bank accounts in the United States, Canada, and the United Kingdom.' },
  { q: 'What documents do I need for approval?', a: 'You will need a valid government-issued ID, proof of business registration (LLC, Corp, etc.), and a bank statement matching your business name for direct deposits.' }
];

const MerchantSupport = () => {
  const [openFaq, setOpenFaq] = React.useState(null);
  const [store, setStore] = React.useState(null);
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const payload = await getMyMerchantStore();
        if (active) setStore(payload || null);
      } catch {
        if (active) setStore(null);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const supportPhone = store?.businessInfo?.phone || '+1-612-555-0199';
  const supportEmail = store?.businessInfo?.email || 'support@kulmi.com';

  const sendMessage = () => {
    const text = message.trim();
    if (!text) return;
    const subject = encodeURIComponent(`Merchant Support: ${store?.storeName || 'Store'}`);
    const body = encodeURIComponent(text);
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <div className="mb-6">
        <MerchantPageHeader
          title={
            <>
              Help & <span className="text-teal">Support</span>
            </>
          }
          subtitle="Need assistance? We are here to help your business grow"
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="bg-card hover:border-teal/20 transition-colors rounded-lg border border-white/[0.07] p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="bg-teal/10 text-teal mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full shadow-[0_0_25px_rgba(0,201,167,0.15)]">
                <Phone size={36} />
              </div>
              <h3 className="mb-3 font-syne text-[1.4rem] font-bold text-white">Contact Support</h3>
              <p className="text-gray mb-6 text-[0.88rem] max-w-sm mx-auto leading-relaxed">
                Call our merchant support team at{' '}
                <span className="text-teal font-bold">{supportPhone}</span> or send an email.
              </p>
              <a
                href={`tel:${supportPhone}`}
                className="bg-teal text-navy hover:bg-teal2 rounded-full px-8 py-3.5 text-[0.88rem] font-bold inline-flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,201,167,0.3)]"
              >
                <Phone size={16} /> Call Now
              </a>
          </div>
          
          <div>
            <h3 className="mb-4 font-syne text-[1.1rem] font-bold text-white">
              Frequently Asked Questions
            </h3>
            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={faq.q}
                    className={`bg-card cursor-pointer rounded-md border transition-colors overflow-hidden ${isOpen ? 'border-teal/50' : 'border-white/[0.07] hover:border-teal/20'}`}
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                  >
                    <div className="flex items-center justify-between px-6 py-4">
                      <span className={`text-[0.88rem] font-bold transition-colors ${isOpen ? 'text-teal' : 'text-white'}`}>{faq.q}</span>
                      {isOpen ? <Minus size={18} className="text-teal" /> : <Plus size={18} className="text-gray" />}
                    </div>
                    {isOpen && (
                      <div className="px-6 pb-4 pt-1 text-[0.88rem] text-gray2 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      
      <div className="space-y-6">
        <div className="bg-card hover:border-teal/20 transition-colors rounded-lg border border-white/[0.07] p-6 lg:p-8">
          <h3 className="mb-4 flex items-center gap-2 font-syne text-[1.1rem] font-bold text-white">
            <Mail size={18} className="text-teal" /> Email Support
          </h3>
          <p className="text-gray mb-6 text-[0.88rem] leading-relaxed">
            Send us an email and we will get back to you within 24 hours.
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-navy3 focus:border-teal mb-4 h-32 w-full rounded border border-white/[0.07] px-4 py-3 text-[0.88rem] text-white outline-none transition-colors resize-none"
            placeholder="Explain your issue..."
          />
          <button onClick={sendMessage} className="bg-navy3 hover:border-teal hover:text-teal flex w-full items-center justify-center gap-2 rounded border border-white/10 py-3 text-[0.8rem] font-bold tracking-wider uppercase text-white transition-all">
            <Send size={16} /> Send Message
          </button>
        </div>
        
        <div className="bg-card hover:border-teal/20 transition-colors rounded-lg border border-white/[0.07] p-6 lg:p-8">
          <h3 className="mb-5 flex items-center gap-2 font-syne text-[1.1rem] font-bold text-white">
            <Book size={18} className="text-teal" /> Seller Resources
          </h3>
          <div className="space-y-1">
            {['Merchant Handbook', 'Selling Policies', 'Growth Guide', 'API Documentation'].map(
              (r) => (
                <a
                  key={r}
                  href="#"
                  className="text-gray hover:text-teal hover:pl-2 flex items-center justify-between py-2.5 text-[0.88rem] font-medium no-underline transition-all"
                >
                  <span>{r}</span>
                  <ExternalLink size={14} />
                </a>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
export default MerchantSupport;
