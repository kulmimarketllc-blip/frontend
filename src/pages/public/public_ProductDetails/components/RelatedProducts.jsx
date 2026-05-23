import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../../../../components/marketplace/ProductCard';

const toCardProduct = (item) => {
  const old = Number(item.oldPrice || item.comparePrice || 0);
  const current = Number(item.price || 0);
  const off = old > current && old > 0 ? Math.round(((old - current) / old) * 100) : 0;

  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    store: item.merchant?.storeName || item.store || 'Marketplace Store',
    price: `$${current.toFixed(2)}`,
    old: old > 0 ? `$${old.toFixed(2)}` : '',
    image: item.images?.[0] || '/img/products/sneaker-black.png',
    rating: item.rating ?? item.avgRating ?? 0,
    reviews: item.reviews ?? item.reviewCount ?? 0,
    badge: off >= 30 ? 'SALE' : item.isFeatured ? 'HOT' : '',
  };
};

const RelatedProducts = ({ items = [] }) => {
  return (
    <section className="mt-16 sm:mt-24">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="font-['Syne'] text-2xl font-bold text-white sm:text-3xl">Related Products</h2>
        <Link
          to="/"
          className="text-gray2 hover:text-teal transition-colors text-[0.8rem] font-bold uppercase tracking-widest flex items-center gap-1"
        >
          View All <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {items.map((item) => (
          <ProductCard key={item.id} product={toCardProduct(item)} />
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
