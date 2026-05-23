import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import UserPageHeader from '../components/UserPageHeader';
import { addToCart, getWishlistItems, removeFromWishlist } from '../../../services/shopStorageService';

const UserWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    setWishlistItems(getWishlistItems());
  }, []);

  const removeItem = (id) => {
    setWishlistItems(removeFromWishlist(id));
  };

  const addItemToCart = (item) => {
    addToCart(item, 1);
  };

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <div className="mb-5">
        <UserPageHeader
          title={
            <span>
              My <span className="text-teal">Wishlist</span>
            </span>
          }
          subtitle={`${wishlistItems.length} items saved · Share or add to cart`}
        />
      </div>

      {!wishlistItems.length ? (
        <div className="bg-card rounded-md border border-white/[0.07] p-8 text-center">
          <div className="text-white text-lg font-semibold">Your wishlist is empty</div>
          <div className="text-gray2 mt-2 text-sm">Browse products and tap the heart icon to save items.</div>
          <Link to="/" className="bg-teal text-navy hover:bg-teal2 mt-4 inline-block rounded px-4 py-2 text-sm font-medium no-underline">
            Continue Shopping
          </Link>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 min-[580px]:grid-cols-2 min-[900px]:grid-cols-3 min-[1200px]:grid-cols-4">
        {wishlistItems.map((item) => (
          <div
            key={item.id}
            className="group bg-card overflow-hidden rounded-md border border-white/[0.07] transition-all hover:-translate-y-0.5 hover:border-teal/30"
          >
            <div className="relative flex h-40 items-center justify-center overflow-hidden border-b border-white/[0.07] bg-[#0F172A]">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <span className="text-5xl">{item.icon || '🛍'}</span>
              )}
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red/80 hover:bg-red text-white text-[0.85rem] font-bold transition-all hover:scale-110"
              >
                ✕
              </button>
            </div>
            <div className="p-3">
              <div className="mb-1 text-[0.875rem] xl:text-[1rem] font-medium text-white">{item.name}</div>
              <div className="font-['Syne'] text-[0.875rem] font-bold text-white">${Number(item.price || 0).toFixed(2)}</div>
              <button
                type="button"
                onClick={() => addItemToCart(item)}
                className="bg-teal text-navy hover:bg-teal2 mt-2 w-full rounded px-3 py-1.5 text-[0.74rem] font-medium"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserWishlist;
