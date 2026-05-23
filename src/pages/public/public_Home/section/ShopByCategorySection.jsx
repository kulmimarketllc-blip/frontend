import React, { useState, useEffect } from 'react';
import CategoryCard from '../../../../components/marketplace/CategoryCard';
import { getCategoryCounts } from '../../../../services/productService';
import { Smartphone, Shirt, Home, Palette, Apple, Trophy, BookOpen, Gamepad2, Wrench, Package, Heart, Car } from 'lucide-react';

const ShopByCategorySection = () => {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    getCategoryCounts()
      .then((data) => setCounts(data || {}))
      .catch(() => setCounts({}));
  }, []);

  const formatCount = (slug) => {
    const n = counts[slug];
    if (n === undefined) return '—';
    return n.toLocaleString();
  };

  const categories = [
    { icon: Smartphone, name: 'Electronics',  slug: 'electronics',  path: '/electronics' },
    { icon: Shirt, name: 'Fashion',       slug: 'fashion',       path: '/fashion' },
    { icon: Home, name: 'Home & Garden', slug: 'home-garden',   path: '/home-garden' },
    { icon: Palette, name: 'Beauty',        slug: 'beauty',        path: '/beauty' },
    { icon: Apple, name: 'Grocery',       slug: 'food-grocery',  path: '/food-grocery' },
    { icon: Trophy, name: 'Sports',        slug: 'sports',        path: '/sports' },
    { icon: BookOpen, name: 'Books',         slug: 'books',         path: '/books' },
    { icon: Gamepad2, name: 'Toys & Kids',   slug: 'toys-kids',     path: '/toys-kids' },
    { icon: Wrench, name: 'Tools & DIY',   slug: 'tools-diy',     path: '/tools-diy' },
    { icon: Package, name: 'Pet Supplies',  slug: 'pet-supplies',  path: '/pet-supplies' },
    { icon: Heart, name: 'Health',        slug: 'health',        path: '/health' },
    { icon: Car, name: 'Automotive',    slug: 'automotive' },
  ];

  return (
    <section className="px-3 py-8 min-[640px]:px-4 min-[900px]:px-8 min-[900px]:py-12">
      <div className="container mx-auto">
        <div className="mb-6 flex items-baseline justify-between gap-2 min-[640px]:mb-7 min-[640px]:gap-4">
          <h2 className="font-['Syne'] text-[1.1rem] font-bold text-white min-[640px]:text-[1.3rem]">
            Shop by <span className="text-teal">Category</span>
          </h2>
          <a
            href="#"
            className="text-teal text-[0.8rem] font-medium whitespace-nowrap hover:opacity-70 min-[640px]:text-[0.8rem]"
          >
            All categories {'\u2192'}
          </a>
        </div>
        <div className="grid grid-cols-2 gap-2 min-[640px]:gap-3 min-[768px]:gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {categories.map((cat, index) => (
            <CategoryCard
              key={index}
              icon={cat.icon}
              name={cat.name}
              itemCount={formatCount(cat.slug)}
              path={cat.path}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByCategorySection;
