import React, { useEffect, useState } from 'react';

const ProductGallery = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    setSelectedImage(0);
  }, [product.name]);

  const rawImages = Array.isArray(product?.images) ? product.images : [];
  const images = rawImages
    .filter((x) => x !== null && x !== undefined && x !== false && x !== '')
    .map((x) => String(x))
    .filter(Boolean);

  const finalImages = images.length > 0 ? images : ['/img/home/default.jpg'];

  return (
    <div className="flex flex-col space-y-3 lg:space-y-4 lg:sticky lg:top-24 lg:self-start">
      {/* Main Image Container */}
      <div className="group relative aspect-square w-full max-h-175 overflow-hidden rounded-xs border border-white/10 bg-linear-to-b from-navy2/50 to-navy2 shadow-2xl">
        <img
          src={images[selectedImage]}
          alt={product.name}
          className="h-full w-full object-cover p-6 transition-all duration-700 group-hover:scale-105 sm:p-10"
        />

        {/* Discount Badge */}
        {Number(product.off) > 0 && (
          <div className="bg-red absolute left-3 top-3 lg:left-4 lg:top-4 rounded-xs px-2 py-0.5 text-[0.65rem] lg:text-[0.7rem] font-black text-white shadow-lg shadow-red/20 uppercase tracking-wider">
            -{product.off}%
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="no-scrollbar flex gap-3 lg:gap-4 overflow-x-auto pb-2 lg:pb-4">
        {finalImages.map((img, idx) => (
          <button
            key={`${img}-${idx}`}
            type="button"
            onClick={() => setSelectedImage(idx)}
            className={`h-16 w-16 lg:h-20 lg:w-20 shrink-0 overflow-hidden rounded-xs border bg-navy2/60 transition-all ${
              selectedImage === idx ? 'border-teal ring-1 ring-teal/20' : 'border-white/10 hover:border-white/30'
            }`}
          >
            <img src={img} alt={product.name || ''} className="h-full w-full object-cover p-1.5 lg:p-2 transition-transform duration-500 group-hover:scale-110" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
