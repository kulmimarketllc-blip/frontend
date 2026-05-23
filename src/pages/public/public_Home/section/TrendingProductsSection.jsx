import React, { useEffect, useState } from 'react';
import ProductCard from '../../../../components/marketplace/ProductCard';
import { mapProductToCard, getTrendingProducts } from '../../../../services/productService';

const TrendingProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTrending = async () => {
      try {
        setLoading(true);
        const data = await getTrendingProducts(12);
        setProducts(Array.isArray(data) ? data.map(mapProductToCard) : []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadTrending();
  }, []);

  return (
    <section className="px-3 py-8 min-[640px]:px-4 min-[900px]:px-8 min-[900px]:py-12">
      <div className="container mx-auto">
        <div className="mb-6 flex items-baseline justify-between gap-2 min-[640px]:mb-7 min-[640px]:gap-4">
          <h2 className="font-['Syne'] text-[1.1rem] font-bold text-white min-[640px]:text-[1.3rem]">Trending <span className="text-teal">Now</span></h2>
          <span className="text-[0.8rem] font-medium text-gray2 min-[640px]:text-[0.8rem]">{products.length} loaded</span>
        </div>
        {loading ? (
          <div className="text-gray2 py-6 text-sm">Loading trending products...</div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 min-[375px]:grid-cols-2 min-[375px]:gap-2 min-[640px]:gap-3 min-[768px]:grid-cols-3 min-[768px]:gap-4 min-[1024px]:grid-cols-4 min-[1280px]:grid-cols-5 min-[1580px]:grid-cols-6">
            {products.map((product) => <ProductCard key={product.id || product.slug || product.name} product={product} />)}
          </div>
        ) : (
          <div className="text-gray2 py-6 text-sm">No trending products available.</div>
        )}
      </div>
    </section>
  );
};

export default TrendingProductsSection;
