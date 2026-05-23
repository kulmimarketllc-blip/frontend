import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../../components/marketplace/ProductCard';
import { mapProductToCard, searchProducts } from '../../../services/productService';

const SearchView = () => {
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState({ products: [], meta: null, suggestions: [] });

  const q = useMemo(() => params.get('q') || '', [params]);

  useEffect(() => {
    let active = true;

    const runSearch = async () => {
      try {
        setLoading(true);
        setError('');

        const payload = await searchProducts({ q, page: 1, limit: 30, sort: q ? 'relevance' : 'popular' });

        if (!active) return;
        setResult({
          products: Array.isArray(payload?.products) ? payload.products : [],
          meta: payload?.meta || null,
          suggestions: Array.isArray(payload?.suggestions) ? payload.suggestions : [],
        });
      } catch (err) {
        if (!active) return;
        setError(err?.response?.data?.message || err.message || 'Search failed.');
      } finally {
        if (active) setLoading(false);
      }
    };

    runSearch();
    return () => {
      active = false;
    };
  }, [q]);

  return (
    <section className="px-3 py-8 min-[640px]:px-4 min-[900px]:px-8">
      <div className="container mx-auto">
        <div className="mb-6">
          <h1 className="font-['Syne'] text-xl font-bold text-white min-[640px]:text-2xl">
            Search Results <span className="text-teal">{q ? `for "${q}"` : ''}</span>
          </h1>
          <p className="text-gray2 mt-2 text-sm">
            {result.meta?.total ?? result.products.length} product(s) found
          </p>
        </div>

        {loading ? <div className="text-gray2 text-sm">Searching products...</div> : null}
        {error ? <div className="text-red text-sm">{error}</div> : null}

        {!!result.suggestions.length && !loading && (
          <div className="mb-4 text-sm text-gray2">
            Suggestions: {result.suggestions.join(', ')}
          </div>
        )}

        <div className="grid grid-cols-1 gap-2 min-[375px]:grid-cols-2 min-[375px]:gap-2 min-[640px]:gap-3 min-[768px]:grid-cols-3 min-[768px]:gap-4 min-[1024px]:grid-cols-4">
          {result.products.map((item) => {
            const card = mapProductToCard(item);
            return <ProductCard key={card.id || card.slug || card.name} product={card} />;
          })}
        </div>
      </div>
    </section>
  );
};

export default SearchView;
