import React from 'react';
import { useSelector } from 'react-redux';
import ProductCard from '../../../../components/marketplace/ProductCard';
import CountdownTimer from '../../../../components/marketplace/CountdownTimer';
import { mapProductToCard } from '../../../../services/productService';

const FlashDealsSection = () => {
  const list = useSelector((state) => state.products.list);
  const loading = useSelector((state) => state.products.loading);
  const products = list.map(mapProductToCard).slice(0, 6);

  return (
    <section id="featured" className="px-3 py-8 min-[640px]:px-4 min-[900px]:px-8 min-[900px]:py-12">
      <div className="container mx-auto">
      <div className="mb-6 flex flex-col gap-3 rounded-sm border border-[rgba(255,77,77,0.25)] bg-[linear-gradient(90deg,#FF4D4D22,#FF4D4D11)] px-4 py-2.5 lg:py-4 min-[640px]:flex-row min-[640px]:items-center min-[640px]:gap-4">
        <span className="font-['Syne'] text-[0.7rem] font-bold uppercase tracking-widest text-[#FF6B6B] min-[640px]:text-[0.8rem]">{'\u26A1'} Flash Deals</span>
        {/* <CountdownTimer /> */}
        <span className="text-[0.7rem] text-gray min-[640px]:ml-auto min-[640px]:text-[0.78rem]">Hurry! Limited stock</span>
      </div>

      <div className="mb-6 flex justify-between items-center gap-2 min-[640px]:flex-row min-[640px]:items-baseline min-[640px]:justify-between min-[640px]:gap-4">
        <h2 className="font-['Syne'] text-[1.1rem] font-bold text-white min-[640px]:text-[1.3rem]">Today's <span className="text-teal">Best Deals</span></h2>
        <span className="text-[0.8rem] font-medium text-gray2 min-[640px]:text-[0.8rem]">Updated live</span>
      </div>

      {loading ? (
        <div className="text-gray2 py-6 text-sm">Loading live deals...</div>
      ) : (
        <div className="grid grid-cols-1 gap-2 min-[375px]:grid-cols-2 min-[375px]:gap-2 min-[640px]:gap-3 min-[768px]:grid-cols-3 min-[768px]:gap-4 min-[1024px]:grid-cols-4 min-[1280px]:grid-cols-5 min-[1580px]:grid-cols-6">
          {products.map((product) => (
            <ProductCard key={product.id || product.slug || product.name} product={product} />
          ))}
        </div>
      )}
      </div>
    </section>
  );
};

export default FlashDealsSection;
