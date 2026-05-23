import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, CreditCard } from 'lucide-react';

const FooterLayout = () => {
  return (
    <footer className="mt-12 border-t border-white/10 bg-navy2 px-4 pt-12 pb-2.5 sm:pb-6 min-[900px]:px-8 min-[900px]:py-12">
      <div className="container mx-auto">
        <div className="mb-10 grid grid-cols-1 min-[450px]:grid-cols-2 gap-8  min-[900px]:grid-cols-4">
          <div>
            <a href="#" className="font-['Syne'] text-[1.4rem] lg:text-[1.625rem] font-extrabold tracking-[-0.02em] text-white no-underline">
              ES<span className="text-teal">UUQ</span>
            </a>
            <p className="mt-3 max-w-65 text-[0.85rem] lg:text-[1rem] text-gray">
              Your one-stop marketplace for everything you need - delivered fast, securely, and at the best prices.
            </p>
            <div className="mt-5 flex gap-2.5 ">
              <a href="#" className="social-btn lg:text-sm text-xs" title="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" className="social-btn lg:text-sm text-xs" title="Twitter">
                <Twitter size={18} />
              </a>
              <a href="#" className="social-btn lg:text-sm text-xs" title="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="social-btn lg:text-sm text-xs" title="LinkedIn">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mt-4 lg:mt-0 mb-4 font-['Syne'] text-[0.85rem] font-bold uppercase tracking-[0.08em] text-white">Shop</h4>
            <ul className="space-y-2 lg:text-sm text-xs">
              <li><a href="/search?q=deals" className="footer-link">Today's Deals</a></li>
              <li><a href="/search?q=new" className="footer-link">New Arrivals</a></li>
              <li><a href="/search?q=bestseller" className="footer-link">Best Sellers</a></li>
              <li><a href="/coupons" className="footer-link">Coupons</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-['Syne'] text-[0.85rem] font-bold uppercase tracking-[0.08em] text-white">Sell</h4>
            <ul className="space-y-2 lg:text-sm text-xs">
              <li><a href="/merchant-register" className="footer-link">Start Selling</a></li>
              <li><a href="/merchant/dashboard" className="footer-link">Merchant Portal</a></li>
              <li><a href="/merchant/app" className="footer-link">Merchant App</a></li>
              <li><a href="/merchant/commission" className="footer-link">Commission Info</a></li>
              <li><a href="/support" className="footer-link">Seller Support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-['Syne'] text-[0.85rem] md:text-[0.875rem] xl:text-[1rem] font-bold uppercase tracking-[0.08em] text-white">Help</h4>
            <ul className="space-y-2 lg:text-sm text-xs">
              <li><a href="/account/orders" className="footer-link">Track Order</a></li>
              <li><a href="/support/returns" className="footer-link">Returns</a></li>
              <li><a href="/help/faq" className="footer-link">FAQ</a></li>
              <li><a href="/support/contact" className="footer-link">Contact Us</a></li>
              <li><a href="/legal/privacy" className="footer-link">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap-reverse items-center justify-center md:justify-between gap-3 border-t border-white/10 pt-5">
          <p className="text-[0.75rem] text-gray ">@copyright 2026 ESUUQ Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="mr-1.5 flex items-center gap-1 text-[0.72rem] text-gray">
              <CreditCard size={14} />
              We accept:
            </span>
            <span className="pay-icon">VISA</span>
            <span className="pay-icon">MC</span>
            <span className="pay-icon">Amex</span>
            <span className="pay-icon">Discover</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterLayout;
