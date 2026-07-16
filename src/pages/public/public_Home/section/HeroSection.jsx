import React, { useEffect, useState } from 'react';
import { searchProducts } from '../../../../services/productService';
import { Smartphone, Shirt, Home, Palette, Trophy, Apple, BookOpen, Gamepad2, Zap } from 'lucide-react';

const categoryIcons = {
  'Electronics': Smartphone,
  'Fashion': Shirt,
  'Home & Garden': Home,
  'Beauty': Palette,
  'Sports': Trophy,
  'Food & Grocery': Apple,
  'Books': BookOpen,
  'Toys & Kids': Gamepad2,
};

const getIconForCategory = (name) => categoryIcons[name] || Smartphone;

const HeroSection = () => {
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    merchants: '500+',
    products: '10K+',
    rating: '4.8★',
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await searchProducts({ limit: 1 }); // limit must be >= 1
        
        if (result?.facets?.categories) {
          // Take top 4 categories
          const topCategories = result.facets.categories.slice(0, 4).map(c => ({
            icon: getIconForCategory(c.label),
            title: c.label,
            desc: `${c.count.toLocaleString()}+ items`
          }));
          
          if (topCategories.length > 0) {
            setCategories(topCategories);
          }
        }
        
        if (result?.meta?.total) {
          setStats(prev => ({
            ...prev,
            products: `${result.meta.total.toLocaleString()}+`
          }));
        }
      } catch (error) {
        console.error('Failed to fetch hero stats:', error);
      }
    };
    
    fetchStats();
  }, []);

  const displayCategories = categories.length > 0 ? categories : [
    { icon: Smartphone, title: 'Electronics', desc: 'Loading...' },
    { icon: Shirt, title: 'Fashion', desc: 'Loading...' },
    { icon: Home, title: 'Home & Garden', desc: 'Loading...' },
    { icon: Palette, title: 'Beauty', desc: 'Loading...' },
  ];

  return (
    <section className="relative min-h-105 overflow-hidden bg-[linear-gradient(120deg,#0A1628_0%,#0D2137_40%,#091520_100%)] px-3 py-8 min-[640px]:px-4 min-[900px]:px-8 min-[900px]:py-16">
      <div className="pointer-events-none absolute inset-0 opacity-8 bg-[radial-gradient(circle_at_20%_50%,var(--color-teal)_0%,transparent_40%),radial-gradient(circle_at_80%_20%,#3B82F6_0%,transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-4 bg-[radial-gradient(circle,var(--color-white)_1px,transparent_1px)] bg-size-[32px_32px]" />

      <div className="container relative z-10 mx-auto grid items-center gap-8 min-[900px]:grid-cols-2">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-xs border border-[rgba(0,201,167,0.3)] bg-[rgba(0,201,167,0.12)] px-4 py-1.5 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-teal">
            <Zap size={14} /> New Marketplace {'\u2014'} Now Open
          </div>
          <h1 className="font-['Syne'] text-[clamp(2.4rem,4vw,3.6rem)] font-extrabold leading-[1.1] text-white">
            Shop <span className="text-teal">Everything</span>
            <br />
            Delivered to
            <br />
            Your Door
          </h1>
          <p className="mt-4 max-w-105 text-base leading-[1.7] text-gray">
            Thousands of products from verified local and global merchants {'\u2014'} all in one place.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#featured" className="inline-block bg-teal px-8 py-3 text-[0.85rem] font-medium tracking-[0.06em] text-navy transition hover:bg-teal2">Shop Now</a>
            <a href="#merchants" className="inline-block border border-white/20 px-8 py-3 text-[0.85rem] text-white transition hover:border-teal hover:text-teal">Sell on Kulmi Market</a>
          </div>
          <div className="mt-8 flex gap-8">
            <div><div className="font-['Syne'] text-[1.4rem] font-bold text-white">{stats.merchants}</div><div className="text-[0.72rem] text-gray">Merchants</div></div>
            <div><div className="font-['Syne'] text-[1.4rem] font-bold text-white">{stats.products}</div><div className="text-[0.72rem] text-gray">Products</div></div>
            <div><div className="font-['Syne'] text-[1.4rem] font-bold text-white">{stats.rating}</div><div className="text-[0.72rem] text-gray">Avg Rating</div></div>
          </div>
        </div>

        <div className="hidden grid-cols-2 gap-4 min-[900px]:grid">
          <div className="col-span-2 flex items-center gap-4 rounded-sm border border-[rgba(0,201,167,0.2)] bg-[rgba(0,201,167,0.07)] p-5">
            <Zap size={32} className="animate-pulse text-teal" />
            <div className=''>
              <div className="text-[0.82rem] lg:text-[1rem] font-medium text-white">Flash Deals Today</div>
              <div className="text-[0.72rem] lg:text-[0.87rem] text-teal">Up to 60% off </div>
            </div>
          </div>
          {displayCategories.map((cat, idx) => {
            const IconComponent = cat.icon;
            return (
              <div key={idx} className="rounded-sm border border-white/10 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:border-teal">
                <IconComponent size={32} className="text-teal" />
                <div className="mt-2 text-[0.82rem] lg:text-[1rem] font-medium text-white">{cat.title}</div>
                <div className="text-[0.72rem] lg:text-[0.87rem] text-teal">{cat.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
