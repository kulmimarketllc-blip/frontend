import React from 'react';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';

const CategoryFilter = ({ filters, onFilterChange }) => {
  const [openSections, setOpenSections] = React.useState({
    price: true,
    rating: true,
    brand: false,
    discount: false,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const priceRanges = [
    { label: 'Under $25', min: 0, max: 25 },
    { label: '$25 - $50', min: 25, max: 50 },
    { label: '$50 - $100', min: 50, max: 100 },
    { label: '$100 - $200', min: 100, max: 200 },
    { label: 'Over $200', min: 200, max: Infinity },
  ];

  const ratings = [4, 3, 2, 1];

  const discountOptions = [
    { label: '10% or more', value: 10 },
    { label: '25% or more', value: 25 },
    { label: '50% or more', value: 50 },
    { label: '70% or more', value: 70 },
  ];

  return (
    <aside className="w-full shrink-0 min-[900px]:w-60 min-[1100px]:w-64">
      <div className="sticky top-34 space-y-3">
        {/* Price Range */}
        <div className="bg-card overflow-hidden rounded border border-white/10">
          <button
            onClick={() => toggleSection('price')}
            className="flex w-full items-center justify-between px-4 py-3 text-[18px] font-semibold text-white"
          >
            Price Range
            {openSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {openSections.price && (
            <div className="space-y-2 px-4 pb-4">
              {priceRanges.map((range) => (
                <label
                  key={range.label}
                  className="text-gray flex cursor-pointer items-center gap-2 text-[16px] transition-colors hover:text-white"
                >
                  <input
                    type="radio"
                    name="priceRange"
                    checked={filters.priceRange === range.label}
                    onChange={() => onFilterChange('priceRange', range.label)}
                    className="accent-teal"
                  />
                  {range.label}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Rating
        <div className="bg-card overflow-hidden rounded border border-white/10">
          <button
            onClick={() => toggleSection('rating')}
            className="flex w-full items-center justify-between px-4 py-3 text-[18px] font-semibold text-white"
          >
            Customer Rating
            {openSections.rating ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {openSections.rating && (
            <div className="space-y-2 px-4 pb-4">
              {ratings.map((r) => (
                <label
                  key={r}
                  className="text-gray flex cursor-pointer items-center gap-2 text-[16px] transition-colors hover:text-white"
                >
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.rating === r}
                    onChange={() => onFilterChange('rating', r)}
                    className="accent-teal"
                  />
                  <span className="flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < r ? 'fill-yellow text-yellow' : 'text-gray/40'}
                        />
                      ))}
                    </div>
                    <span className="text-gray2 text-[16px]">& Up</span>
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
        */}

        {/* Discount */}
        <div className="bg-card overflow-hidden rounded border border-white/10">
          <button
            onClick={() => toggleSection('discount')}
            className="flex w-full items-center justify-between px-4 py-3 text-[18px] font-semibold text-white"
          >
            Discount
            {openSections.discount ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {openSections.discount && (
            <div className="space-y-2 px-4 pb-4">
              {discountOptions.map((d) => (
                <label
                  key={d.value}
                  className="text-gray flex cursor-pointer items-center gap-2 text-[16px] transition-colors hover:text-white"
                >
                  <input
                    type="radio"
                    name="discount"
                    checked={filters.discount === d.value}
                    onChange={() => onFilterChange('discount', d.value)}
                    className="accent-teal"
                  />
                  {d.label}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Sort removed per request */}

        {/* Clear Filters */}
        <button
          onClick={() => onFilterChange('reset', null)}
          className="bg-card text-gray hover:border-teal/50 hover:text-teal w-full rounded border border-white/10 px-4 py-2.5 text-[0.8rem] transition-colors"
        >
          Clear All Filters
        </button>
      </div>
    </aside>
  );
};

export default CategoryFilter;