import React, { useState } from 'react';
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { addToCart, isWishlisted, toggleWishlistItem } from '../../services/shopStorageService';

const ProductCard = ({ product, inScroll = false }) => {
  const productKey = product.id || product.slug || product.name;
  const ratingValue = Math.max(0, Math.min(5, Number(product.rating ?? 0)));
  const filledStars = Math.round(ratingValue);
  const [isWishlistedState, setIsWishlistedState] = useState(
    () => (productKey ? isWishlisted(String(productKey)) : !!product.wishlist)
  );
  const [isAdded, setIsAdded] = useState(false);

  const slug = product.slug || product.id ||
    product.name
      ?.toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '') || 'product';

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const result = toggleWishlistItem(product);
    setIsWishlistedState(result.wishlisted);
  };

  const getBadgeClass = (badge) => {
    switch (badge) {
      case 'NEW':
        return 'bg-teal text-navy';
      case 'HOT':
        return 'bg-yellow text-navy';
      default:
        return 'bg-red text-white';
    }
  };

  return (
    <Link
      to={`/product/${slug}`}
      className={`bg-card hover:border-teal/50 group block overflow-hidden rounded border border-white/10 no-underline transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_30px_rgb(0,201,167,0.1)] ${
        inScroll ? 'w-52 shrink-0' : 'w-full'
      }`}
    >
      {/* IMAGE SECTION */}
      <div className="relative flex h-48 items-center justify-center overflow-hidden bg-[#0F172A]">
        {/* PRODUCT IMAGE */}
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <span className="transform-gpu text-6xl transition-transform duration-500 group-hover:scale-110">
            {product.icon}
          </span>
        )}

        {/* OVERLAY ON HOVER */}
        <div className="bg-navy/40 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="translate-y-4 transform rounded-full border border-white/20 bg-white/10 p-2 backdrop-blur-md transition-transform duration-300 group-hover:translate-y-0">
            <Eye size={20} className="text-white" />
          </div>
        </div>

        {/* BADGE */}
        {product.badge && (
          <span
            className={`absolute top-3 left-3 rounded px-2 py-1 text-[0.6rem] font-black tracking-widest uppercase shadow-lg ${getBadgeClass(
              product.badge
            )}`}
          >
            {product.badge}
          </span>
        )}

        {/* WISHLIST BUTTON */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-lg transition-all duration-300 ${
            isWishlistedState
              ? 'bg-red text-white shadow-lg'
              : 'text-gray2 bg-navy/60 hover:text-red border border-white/5 backdrop-blur-md hover:bg-white'
          }`}
          aria-pressed={isWishlistedState}
          aria-label={isWishlistedState ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={16}
            className={isWishlistedState ? 'text-white' : 'text-white'}
            fill={isWishlistedState ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      {/* INFO SECTION */}
      <div className="bg-card p-4">
        {/* STORE NAME */}
        <div className="text-teal mb-1.5 text-[0.65rem] font-bold tracking-widest uppercase">
          {product.store}
        </div>

        {/* PRODUCT NAME */}
        <h3 className="group-hover:text-teal mb-2 line-clamp-1 text-[0.9rem] font-bold text-white transition-colors">
          {product.name}
        </h3>

        {/* RATING */}
        <div className="mb-3 flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < filledStars ? 'fill-yellow text-yellow' : 'text-gray/30'}
              />
            ))}
          </div>
          <span className="text-[0.7rem] font-bold text-white/90">{ratingValue.toFixed(1)}</span>
          <span className="text-gray/60 text-[0.75rem]">({product.reviews ?? 0})</span>
        </div>

        {/* PRICE */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-lg font-black text-white">{product.price}</span>
          <span className="text-gray/50 text-[0.8rem] line-through">{product.old}</span>
        </div>

        {/* ADD TO CART BUTTON */}
        <button
          onClick={handleAddToCart}
          className={`group/btn relative w-full overflow-hidden rounded py-2.5 text-[0.75rem] font-black tracking-widest uppercase transition-all duration-300 ${
            isAdded
              ? 'bg-teal text-navy border-teal -translate-y-0.5'
              : 'bg-navy3/50 hover:border-teal hover:text-teal border border-white/10 text-white'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            {isAdded ? (
              <>✓ Added to Bag</>
            ) : (
              <>
                <ShoppingCart size={14} className="group-hover/btn:animate-bounce" /> Add to Cart
              </>
            )}
          </span>
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
