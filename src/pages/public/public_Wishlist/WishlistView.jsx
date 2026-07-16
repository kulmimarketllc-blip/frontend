import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { addToCart, getWishlistItems, removeFromWishlist } from '../../../services/shopStorageService';

const WishlistView = () => {
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    setWishlistItems(getWishlistItems());

    const refresh = () => setWishlistItems(getWishlistItems());
    window.addEventListener('storage', refresh);
    window.addEventListener('kulmi:shop-updated', refresh);

    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('kulmi:shop-updated', refresh);
    };
  }, []);

  const removeItem = (id) => {
    setWishlistItems(removeFromWishlist(id));
  };

  const addItemToCart = (item) => {
    addToCart(item, 1);
  };

  const clearAll = () => {
    wishlistItems.slice().forEach((item) => removeFromWishlist(item.id));
    setWishlistItems([]);
  };

  return (
    <section className="px-3 py-8 min-[640px]:px-4 min-[900px]:px-8">
      <div className="container mx-auto">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-teal/20 bg-teal/10 px-3 py-1 text-[0.68rem] font-bold tracking-[0.25em] text-teal uppercase">
              <Heart size={12} /> Public Wishlist
            </div>
            <h1 className="font-syne text-2xl font-bold text-white min-[640px]:text-3xl">
              Saved <span className="text-teal">Items</span>
            </h1>
            <p className="text-gray2 mt-2 text-sm">
              {wishlistItems.length} item(s) saved on this device. Browse, remove, or move them to cart anytime.
            </p>
          </div>

          {wishlistItems.length > 0 ? (
            <button
              type="button"
              onClick={clearAll}
              className="text-gray2 hover:border-red hover:text-red rounded border border-white/[0.07] px-4 py-2 text-[0.78rem] font-bold transition-colors"
            >
              Clear All
            </button>
          ) : null}
        </div>

        {!wishlistItems.length ? (
          <div className="bg-card rounded-md border border-white/[0.07] p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal/10 text-teal">
              <Heart size={24} />
            </div>
            <div className="text-white text-lg font-semibold">Your public wishlist is empty</div>
            <div className="text-gray2 mt-2 text-sm">Tap the heart icon on any product to save it here.</div>
            <Link
              to="/"
              className="bg-teal text-navy hover:bg-teal2 mt-5 inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-medium no-underline"
            >
              <ShoppingBag size={14} /> Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 min-[580px]:grid-cols-2 min-[900px]:grid-cols-3 min-[1200px]:grid-cols-4">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="group bg-card overflow-hidden rounded-md border border-white/[0.07] transition-all hover:-translate-y-0.5 hover:border-teal/30"
              >
                <Link to={item.slug || item.id ? `/product/${item.slug || item.id}` : '/'} className="block no-underline">
                  <div className="relative flex h-44 items-center justify-center overflow-hidden border-b border-white/[0.07] bg-[#0F172A]">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <span className="text-5xl">{item.icon || '🛍'}</span>
                    )}
                  </div>
                </Link>

                <div className="p-3">
                  <div className="mb-1 text-[0.875rem] font-medium text-white xl:text-[1rem]">
                    {item.name}
                  </div>
                  <div className="font-syne text-[0.875rem] font-bold text-white">
                    ${Number(item.price || 0).toFixed(2)}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => addItemToCart(item)}
                      className="bg-teal text-navy hover:bg-teal2 flex-1 rounded px-3 py-1.5 text-[0.74rem] font-medium"
                    >
                      Add to Cart
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-gray2 hover:border-red hover:text-red rounded border border-white/[0.07] px-3 py-1.5 text-[0.74rem] font-bold transition-colors"
                      aria-label={`Remove ${item.name} from wishlist`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default WishlistView;
