import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, CreditCard } from 'lucide-react';
import Logo from '../../components/Logo';

const FooterLayout = () => {
  return (
    <footer className="bg-navy2 mt-12 border-t border-white/10 px-4 pt-12 pb-2.5 min-[900px]:px-8 min-[900px]:py-12 sm:pb-6">
      <div className="container mx-auto">
        <div className="mb-10 grid grid-cols-1 gap-8 min-[450px]:grid-cols-2 min-[900px]:grid-cols-4">
          <div>
            <Logo className="h-10 min-[900px]:h-12 w-fit mb-2" textClassName="text-white" />
            <p className="text-gray mt-3 max-w-65 text-[0.85rem] lg:text-[1rem]">
              Your one-stop marketplace for everything you need - delivered fast, securely, and at
              the best prices.
            </p>
            <div className="mt-5 flex gap-2.5">
              <a href="#" className="social-btn text-xs lg:text-sm" title="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" className="social-btn text-xs lg:text-sm" title="Twitter">
                <Twitter size={18} />
              </a>
              <a href="#" className="social-btn text-xs lg:text-sm" title="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="social-btn text-xs lg:text-sm" title="LinkedIn">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mt-4 mb-4 font-['Syne'] text-[0.85rem] font-bold tracking-[0.08em] text-white uppercase lg:mt-0">
              Shop
            </h4>
            <ul className="space-y-2 text-xs lg:text-sm">
              <li>
                <a href="/search?q=deals" className="footer-link">
                  Today's Deals
                </a>
              </li>
              <li>
                <a href="/search?q=new" className="footer-link">
                  New Arrivals
                </a>
              </li>
              <li>
                <a href="/search?q=bestseller" className="footer-link">
                  Best Sellers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-['Syne'] text-[0.85rem] font-bold tracking-[0.08em] text-white uppercase">
              Sell
            </h4>
            <ul className="space-y-2 text-xs lg:text-sm">
              <li>
                <a href="/merchant-register" className="footer-link">
                  Start Selling
                </a>
              </li>
              <li>
                <a href="/merchant" className="footer-link">
                  Merchant Portal
                </a>
              </li>
              <li>
                <a href="/merchant/commission" className="footer-link">
                  Commission Info
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-['Syne'] text-[0.85rem] font-bold tracking-[0.08em] text-white uppercase md:text-[0.875rem] xl:text-[1rem]">
              Help
            </h4>
            <ul className="space-y-2 text-xs lg:text-sm">
              <li><a href="/dashboard/track" className="footer-link">Track Order</a></li>
              <li><a href="/help/faq" className="footer-link">FAQ</a></li>
              <li><a href="/contact" className="footer-link">Contact Us</a></li>
              <li>
                <a href="/about-us" className="footer-link">
                  About Us
                </a>
              </li>
              <li>
                <a href="/legal/privacy" className="footer-link">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/legal/terms" className="footer-link">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/legal/shipping" className="footer-link">
                  Shipping Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap-reverse items-center justify-center gap-3 border-t border-white/10 pt-5 md:justify-between">
          <p className="text-gray text-[0.75rem]">
            @copyright 2026 Kulmi Market Marketplace. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-gray mr-1.5 flex items-center gap-1 text-[0.72rem]">
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
