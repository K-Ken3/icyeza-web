import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { productService } from '../services/productService';
import { contentService } from '../services/contentService';
import { useCart } from '../context/CartContext';
import { ProductGridSkeleton } from '../components/Skeleton';
import { ErrorState } from '../components/EmptyState';
import { formatRWF } from '../utils/format';

export const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [page, setPage] = useState({ title: 'Hot Deals & Promotions', subtitle: 'Limited-time combos and family meals at unbeatable prices' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const load = async () => {
      try {
        const [res, cfg] = await Promise.all([
          productService.getProducts({ deals: 'true', limit: 30 }),
          contentService.getSetting('deals_page').catch(() => null),
        ]);
        setDeals(res.products);
        if (cfg) {
          setPage({
            title: cfg.title || 'Hot Deals & Promotions',
            subtitle: cfg.subtitle || 'Limited-time combos and family meals at unbeatable prices',
          });
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center text-white">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading mb-3">{page.title}</h1>
          <p className="text-white/80 max-w-md mx-auto">{page.subtitle}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <ProductGridSkeleton count={6} />
        ) : error ? (
          <ErrorState onRetry={() => window.location.reload()} />
        ) : deals.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-stone-800 mb-2">No deals right now</h2>
            <p className="text-stone-500 mb-4">Check back soon for new promotions.</p>
            <Link to="/menu" className="text-primary font-semibold">Browse Menu</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {deals.map((deal) => {
              const savings = deal.originalPrice ? deal.originalPrice - deal.price : 0;
              const pct = deal.originalPrice
                ? Math.round((savings / deal.originalPrice) * 100)
                : 0;
              return (
                <div
                  key={deal._id}
                  className="group bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                >
                  <Link to={`/product/${deal._id}`} className="block relative h-28 sm:h-52 overflow-hidden">
                    <img
                      src={deal.image}
                      alt={deal.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-accent text-white text-sm font-bold px-3 py-1 rounded-full">
                      {pct}% OFF
                    </span>
                    {deal.dealEnds && (
                      <span className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur rounded-full px-2.5 py-1 text-xs font-semibold text-stone-700">
                        <Clock size={12} /> Ends in limited time
                      </span>
                    )}
                  </Link>
                  <div className="p-3 sm:p-5">
                    <h2 className="font-semibold text-stone-900 text-sm sm:text-lg mb-1">{deal.name}</h2>
                    <p className="text-sm text-stone-500 mb-3 line-clamp-2 hidden sm:block">{deal.description}</p>
                    <div className="flex items-center justify-between gap-1">
                      <div className="min-w-0">
                        <span className="text-base sm:text-xl font-bold text-stone-900">{formatRWF(deal.price)}</span>
                        {deal.originalPrice && (
                          <span className="text-xs sm:text-sm text-stone-400 line-through ml-1">
                            {formatRWF(deal.originalPrice)}
                          </span>
                        )}
                        {savings > 0 && (
                          <p className="text-[10px] sm:text-xs text-green-600 font-medium">
                            Save {formatRWF(savings)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          addToCart({
                            id: deal._id,
                            name: deal.name,
                            image: deal.image,
                            price: deal.price,
                            options: [],
                          })
                        }
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary text-white px-4 py-2.5 text-sm font-semibold hover:bg-primary-dark transition-colors"
                      >
                        Order Deal <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Deals;