import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ProductGallery from '../components/ProductGallery';
import ProductInfo from '../components/ProductInfo';
import ProductTabs from '../components/ProductTabs';
import RelatedProducts from '../components/RelatedProducts';
import {
  getProductById,
  getProductBySlug,
  getRelatedProducts,
  normalizeProductRatings,
} from '../../../../services/productService';

const toSlug = (value = '') =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

const toUiProduct = (item = {}) => {
  const price = Number(item.price || 0);
  const oldPrice = Number(item.comparePrice || 0);
  const off =
    oldPrice > price && oldPrice > 0 ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  const variants = Array.isArray(item.variants) ? item.variants : [];
  const colors = variants.find((variant) => variant?.type === 'color')?.values || [];
  const sizes = variants.find((variant) => variant?.type === 'size')?.values || [];
  const { avgRating, reviewCount } = normalizeProductRatings(item);

  return {
    ...item,
    category: item.category?.name || 'Category',
    reviews: reviewCount,
    rating: avgRating,
    oldPrice,
    price,
    off,
    colors: colors
      .map((variant) => (typeof variant === 'string' ? variant : variant.value || variant.label))
      .filter(Boolean),
    sizes: sizes
      .map((variant) => (typeof variant === 'string' ? variant : variant.value || variant.label))
      .filter(Boolean),
    materials: item.metadata?.materials || '',
    care: item.metadata?.care || '',
    shipping: item.metadata?.shipping || null,
    key_features: item.key_features || item.metadata?.key_features || [],
  };
};

const ProductDetailsSection = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');

        let result;
        try {
          result = await getProductBySlug(id);
        } catch {
          result = await getProductById(id);
        }

        if (!active) return;

        const uiProduct = toUiProduct(result);
        setProduct(uiProduct);

        const related = await getRelatedProducts(result.id, 4);
        if (!active) return;
        setRelatedProducts((related || []).map(toUiProduct));
      } catch (err) {
        if (!active) return;
        setError(err?.response?.data?.message || 'Unable to load product details right now.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);

    return () => {
      active = false;
    };
  }, [id]);

  const categoryLink = useMemo(
    () => `/${toSlug(product?.category || 'category')}`,
    [product?.category]
  );

  const handleReviewsLoaded = useCallback(({ total, average }) => {
    setProduct((prev) => (prev ? { ...prev, reviews: total, rating: average } : prev));
  }, []);

  if (loading) {
    return (
      <div className="bg-navy flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-teal mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-t-transparent" />
          <p className="text-gray2 text-sm">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-navy flex min-h-screen items-center justify-center p-6">
        <div className="bg-card border-red/30 w-full max-w-md rounded-md border p-6 text-center">
          <h2 className="mb-2 text-xl font-semibold text-white">Something went wrong</h2>
          <p className="text-gray2 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-navy flex min-h-screen items-center justify-center p-6">
        <div className="bg-card w-full max-w-md rounded-md border border-white/10 p-6 text-center">
          <h2 className="mb-2 text-xl font-semibold text-white">Product not found</h2>
          <p className="text-gray2 text-sm">
            The item you are looking for is currently unavailable.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-navy selection:bg-teal selection:text-navy min-h-screen pb-12">
      <div className="bg-navy2/40 border-b border-white/10">
        <div className="text-gray2 container mx-auto flex items-center gap-2 overflow-x-auto px-4 py-3 text-[0.65rem] font-bold tracking-widest uppercase sm:px-6 lg:px-8 lg:text-xs">
          <Link to="/" className="hover:text-teal font-black whitespace-nowrap transition-colors">
            Marketplace
          </Link>
          <ChevronRight size={10} className="shrink-0 text-white/20" />
          <Link
            to={categoryLink}
            className="hover:text-teal font-black whitespace-nowrap transition-colors"
          >
            {product.category}
          </Link>
          <ChevronRight size={10} className="shrink-0 text-white/20" />
          <span className="text-teal truncate">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12 xl:grid-cols-[1.1fr_1fr] xl:gap-16">
          <ProductGallery
            product={product}
            wishlisted={wishlisted}
            onWishlistToggle={() => setWishlisted((prev) => !prev)}
          />
          <ProductInfo product={product} />
        </div>

        <ProductTabs product={product} onReviewsLoaded={handleReviewsLoaded} />

        <RelatedProducts items={relatedProducts} />
      </div>
    </div>
  );
};

export default ProductDetailsSection;
