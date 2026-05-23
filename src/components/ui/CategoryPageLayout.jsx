import React, { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../marketplace/ProductCard';
import CategoryFilter from './CategoryFilter';
import CategoryHeader from './CategoryHeader';
import { browseCategory, mapProductToCard } from '../../services/productService';

const toApiSort = (value) => {
  if (value === 'price-low') return 'price_asc';
  if (value === 'price-high') return 'price_desc';
  if (value === 'rating') return 'rating';
  if (value === 'newest') return 'newest';
  return 'popular';
};

const priceRangeToBounds = (label) => {
  if (label === 'Under $25') return { minPrice: 0, maxPrice: 25 };
  if (label === '$25 - $50') return { minPrice: 25, maxPrice: 50 };
  if (label === '$50 - $100') return { minPrice: 50, maxPrice: 100 };
  if (label === '$100 - $200') return { minPrice: 100, maxPrice: 200 };
  if (label === 'Over $200') return { minPrice: 200, maxPrice: undefined };
  return { minPrice: undefined, maxPrice: undefined };
};

const CategoryPageLayout = ({ title, description, products = [] }) => {
  const location = useLocation();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [items, setItems] = useState(products);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    priceRange: '',
    rating: null,
    discount: null,
    sort: 'popular',
  });

  const slug = useMemo(
    () => (location.pathname || '').replace(/^\//, '').trim() || 'electronics',
    [location.pathname]
  );

  useEffect(() => {
    let active = true;

    const loadCategory = async () => {
      try {
        setLoading(true);
        setError('');

        const params = {
          page: 1,
          limit: 32,
          ...priceRangeToBounds(filters.priceRange),
          minRating: filters.rating || undefined,
          minDiscount: filters.discount || undefined,
        };

        // Only include sort param when it's not the default 'popular'
        if (filters.sort && filters.sort !== 'popular') {
          params.sort = toApiSort(filters.sort);
        }

        const result = await browseCategory(slug, params);

        if (!active) return;
        setItems((result?.products || []).map(mapProductToCard));
      } catch (err) {
        if (!active) return;
        setError(err?.response?.data?.message || err.message || 'Could not load category products.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCategory();
    return () => {
      active = false;
    };
  }, [slug, filters.sort, filters.rating, filters.priceRange, filters.discount]);

  const handleFilterChange = (key, value) => {
    if (key === 'reset') {
      setFilters({ priceRange: '', rating: null, discount: null, sort: 'popular' });
      return;
    }
    setFilters((prev) => ({
      ...prev,
      [key]:
        prev[key] === value
          ? key === 'sort'
            ? 'popular'
            : key === 'rating' || key === 'discount'
              ? null
              : ''
          : value,
    }));
  };

  return (
    <section className="px-3 py-6 min-[640px]:px-4 min-[900px]:px-8 min-[900px]:py-8">
      <div className="container mx-auto">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CategoryHeader title={title} description={description} />
          <div className="flex items-center gap-3">
            <span className="text-gray text-[0.8rem] md:hidden lg:block">{items.length} products</span>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="bg-card focus:border-teal text-gray2 hover:border-teal/50 cursor-pointer rounded border border-white/10 px-3 py-2 text-[0.75rem] font-medium transition-colors outline-none min-[640px]:text-[0.8rem]"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="bg-card text-gray2 hover:border-teal/50 hover:text-teal flex items-center gap-1.5 rounded border border-white/10 px-3 py-2 text-[0.8rem] transition-colors min-[900px]:hidden"
            >
              <SlidersHorizontal size={14} />
              Filters
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="hidden min-[900px]:block">
            <CategoryFilter filters={filters} onFilterChange={handleFilterChange} />
          </div>

          {mobileFilterOpen && (
            <>
              <div
                className="fixed inset-0 z-50 bg-black/60 min-[900px]:hidden"
                onClick={() => setMobileFilterOpen(false)}
              />
              <div className="bg-navy2 fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto p-4 min-[900px]:hidden">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-['Syne'] text-sm font-bold text-white">Filters</span>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="text-gray2 transition-colors hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
                <CategoryFilter filters={filters} onFilterChange={handleFilterChange} />
              </div>
            </>
          )}

          <div className="flex-1">
            {loading ? <div className="text-gray2 py-4 text-sm">Loading category products...</div> : null}
            {error ? <div className="text-red py-4 text-sm">{error}</div> : null}
            <div className="grid grid-cols-1 gap-2 min-[375px]:grid-cols-2 min-[375px]:gap-2 min-[640px]:gap-3 min-[768px]:gap-4 min-[1024px]:grid-cols-3 min-[1280px]:grid-cols-4">
              {items.map((product) => (
                <ProductCard key={product.id || product.slug || product.name} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryPageLayout;
