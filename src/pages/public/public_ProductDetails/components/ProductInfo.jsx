import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Share2,
  Shield,
  ShoppingCart,
  Star,
  Truck,
  MoreVertical,
  AlertTriangle,
} from 'lucide-react';
import { addToCart, isWishlisted, toggleWishlistItem } from '../../../../services/shopStorageService';
import { flagProduct } from '../../../../services/productService';
import ReportModal from '../../../../components/ui/modals/ReportModal';

const ProductInfo = ({ product }) => {
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [added, setAdded] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [wishlisted, setWishlisted] = useState(() => {
    const key = product?.id || product?.slug || product?.name;
    return key ? isWishlisted(String(key)) : false;
  });

  useEffect(() => {
    const key = product?.id || product?.slug || product?.name;
    setWishlisted(key ? isWishlisted(String(key)) : false);
  }, [product?.id, product?.slug, product?.name]);

  useEffect(() => {
    setSelectedColor(0);
    setSelectedSize(0);
  }, [product?.id, product?.slug, product?.name]);

  const colors = Array.isArray(product.colors) ? product.colors : [];
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const selectedColorValue = colors[selectedColor] || '';
  const selectedSizeValue = sizes[selectedSize] || '';

  const savings = useMemo(() => {
    const current = Number(product.price) || 0;
    const old = Number(product.oldPrice) || 0;
    if (!old || old <= current) {
      return 0;
    }
    return old - current;
  }, [product.oldPrice, product.price]);

  const handleAddToCart = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleWishlist = () => {
    const result = toggleWishlistItem(product);
    setWishlisted(result.wishlisted);
  };

  const handleShare = async () => {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1800);
    } catch {
      try {
        if (navigator.share) {
          await navigator.share({
            title: product?.name || 'Product',
            text: product?.name || 'Check out this product',
            url,
          });
          return;
        }

        const fallbackInput = document.createElement('input');
        fallbackInput.value = url;
        document.body.appendChild(fallbackInput);
        fallbackInput.select();
        document.execCommand('copy');
        document.body.removeChild(fallbackInput);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 1800);
      } catch {
        // No-op: copying failed, but the button should still be safe to click.
      }
    }
  };

  return (
    <div className="flex flex-col space-y-5">
      {/* Product Title and Rating */}
      <div className="space-y-1.5">
        <h1 className="font-['Syne'] text-2xl font-bold tracking-tight text-white lg:text-3xl">
          {product.name}
        </h1>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < 4 ? 'fill-yellow text-yellow' : 'text-white/10'}
              />
            ))}
          </div>
          <span className="text-gray2 text-xs lg:text-sm font-medium">({product.reviews} reviews)</span>
        </div>
      </div>

      {/* Price Section */}
      <div className="space-y-3.5">
        <div className="flex items-baseline gap-3.5">
          <span className="font-['Syne'] text-2xl font-bold text-white lg:text-3xl">
            ${Number(product.price).toLocaleString()}
          </span>
          <span className="text-gray text-base line-through lg:text-lg">
            ${Number(product.oldPrice).toLocaleString()}
          </span>
          <span className="bg-teal/10 text-teal px-2 py-0.5 text-xs lg:text-sm font-bold leading-none">
            Save ${savings.toLocaleString()}
          </span>
        </div>

        {/* Color Selection - Circles */}
        {colors.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="text-gray/70 text-xs lg:text-sm font-bold uppercase tracking-wider">
              Color:{' '}
              <span className="text-white ml-0.5 normal-case font-normal">{selectedColorValue || 'N/A'}</span>
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {colors.map((color, idx) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(idx)}
                  className={`group relative h-7 w-7 overflow-hidden rounded-full border ring-2 ring-offset-2 ring-offset-navy transition-all lg:h-8 lg:w-8 ${
                    selectedColor === idx
                      ? 'border-teal ring-teal'
                      : 'border-white/10 ring-transparent hover:border-white/30'
                  }`}
                  title={color}
                >
                  <span
                    className="absolute inset-0"
                    style={{ backgroundColor: color.toLowerCase() === 'gray' ? '#666' : color.toLowerCase() }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Size Selection - Boxes */}
        {sizes.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="text-gray/70 text-xs lg:text-sm font-bold uppercase tracking-wider">
              Size:{' '}
              <span className="text-white ml-0.5 normal-case font-normal">{selectedSizeValue || 'N/A'}</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size, idx) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(idx)}
                  className={`flex h-9 w-11 items-center justify-center rounded-xs border text-xs lg:text-sm font-bold transition-all lg:h-10 lg:w-12 ${
                    selectedSize === idx
                      ? 'border-teal bg-teal/10 text-white'
                      : 'border-white/10 text-gray2 hover:border-white/30'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Buttons and Actions */}
      <div className="space-y-5 pt-1.5">
        {/* Row 1: Qty + Add to Cart + icon buttons all on one row */}
        <div className="flex items-center gap-2">
          {/* Quantity */}
          <div className="bg-navy2/50 flex shrink-0 items-center rounded-xs border border-white/10 p-0.5">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-9 w-8 items-center justify-center text-gray hover:text-white lg:h-10 lg:w-9"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-sm lg:text-base font-bold text-white">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="flex h-9 w-8 items-center justify-center text-gray hover:text-white lg:h-10 lg:w-9"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Add to Cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-xs bg-teal px-3 text-xs font-bold uppercase tracking-widest text-navy transition-all active:scale-95 lg:h-12 lg:px-8 lg:text-sm"
          >
            <ShoppingCart size={16} className="shrink-0" />
            <span className="truncate">{added ? 'Added to Cart' : 'Add to Cart'}</span>
          </button>

          {/* Icon buttons */}
          <button
            type="button"
            onClick={handleWishlist}
            className="bg-navy2/50 hover:bg-navy2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xs border border-white/10 text-gray2 transition-colors hover:text-white lg:h-12 lg:w-12"
          >
            <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} className={wishlisted ? 'text-red' : ''} />
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="bg-navy2/50 hover:bg-navy2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xs border border-white/10 text-gray2 transition-colors hover:text-white lg:h-12 lg:w-12"
            aria-label="Share product link"
            title={shareCopied ? 'Link copied' : 'Share product'}
          >
            <Share2 size={18} />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="bg-navy2/50 hover:bg-navy2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xs border border-white/10 text-gray2 transition-colors hover:text-white lg:h-12 lg:w-12"
              aria-label="More options"
            >
              <MoreVertical size={18} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 bottom-full mb-2 w-48 bg-navy2 border border-white/10 rounded-xs shadow-xl z-10 animate-in fade-in slide-in-from-bottom-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowReportModal(true);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-red/80 hover:text-red hover:bg-white/5 transition-colors text-left"
                >
                  <AlertTriangle size={14} />
                  Report Product
                </button>
              </div>
            )}
          </div>
        </div>

        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          onSubmit={(data) => flagProduct(product.id, data)}
          targetType="Product"
          targetId={product.id}
        />

        <div className="flex items-center gap-2 text-xs lg:text-sm font-bold text-teal">
          <CheckCircle2 size={16} /> In Stock ({product.stock} available)
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-navy2/30 grid grid-cols-1 gap-3.5 rounded-xs border border-white/5 p-4 sm:grid-cols-3">
        {[
          { icon: Truck, title: 'Free Delivery', text: 'Orders over $2000', color: 'text-blue-400' },
          { icon: RotateCcw, title: 'Easy Returns', text: '7-day return policy', color: 'text-green-500' },
          { icon: Shield, title: 'Authentic', text: '100% genuine product', color: 'text-purple-400' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <item.icon size={18} className={item.color} />
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-white leading-tight mb-0.5 uppercase tracking-wide">{item.title}</span>
              <span className="text-[14px] font-medium text-gray2 leading-tight">{item.text}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Delivery & Return Policy - Two Column with Bullet Points */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-6">
        {/* Delivery Information */}
        <div>
          <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Delivery Information</h3>
          <ul className="space-y-2.5">
            <li className="flex items-start gap-3">
              <span className="text-teal text-lg leading-none mt-0.5">•</span>
              <span className="text-gray2 text-sm">Processing Time: 1-2 Business Days</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal text-lg leading-none mt-0.5">•</span>
              <span className="text-gray2 text-sm">Shipping: {product?.shipping?.dhaka || '24-48 hours'} (Dhaka)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal text-lg leading-none mt-0.5">•</span>
              <span className="text-gray2 text-sm">{product?.shipping?.outside || '2-5 days'} (Outside Dhaka)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal text-lg leading-none mt-0.5">•</span>
              <span className="text-gray2 text-sm">Free Shipping on orders over ${product?.shipping?.free_threshold || 2000}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal text-lg leading-none mt-0.5">•</span>
              <span className="text-gray2 text-sm">Real-time Tracking Available</span>
            </li>
          </ul>
        </div>

        {/* Return Policy */}
        <div>
          <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Return Policy</h3>
          <ul className="space-y-2.5">
            <li className="flex items-start gap-3">
              <span className="text-teal text-lg leading-none mt-0.5">•</span>
              <span className="text-gray2 text-sm">7 Days Return Window from Delivery</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal text-lg leading-none mt-0.5">•</span>
              <span className="text-gray2 text-sm">Product Must Be Unused & Original</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal text-lg leading-none mt-0.5">•</span>
              <span className="text-gray2 text-sm">Packaging Must Be Intact</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal text-lg leading-none mt-0.5">•</span>
              <span className="text-gray2 text-sm">Full Refund Within 5-7 Business Days</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal text-lg leading-none mt-0.5">•</span>
              <span className="text-gray2 text-sm">Free Return Shipping for Defective Items</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
