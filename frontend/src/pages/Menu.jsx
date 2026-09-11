import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, SearchX } from 'lucide-react';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useLocalStorage';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';
import { ErrorState, EmptyState } from '../components/EmptyState';
import { userService } from '../services/userService';

const sortOptions = [
  { value: '', label: 'Popularity' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

export const Menu = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(category || 'all');
  const [searchTerm, setSearchTerm] = useState(q);
  const [sort, setSort] = useState('');
  const [filters, setFilters] = useState({
    vegetarian: false,
    spicy: false,
    deals: false,
  });
  const [favorites, setFavorites] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 30000]);

  const debouncedSearch = useDebounce(searchTerm, 300);
  const { addToCart } = useCart();
  const { user } = useAuth();

  const loadedCategories = useRef(false);

  useEffect(() => {
    if (!loadedCategories.current) {
      loadedCategories.current = true;
      productService
        .getCategories()
        .then((res) => setCategories(res.categories))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (category) setActiveCategory(category);
  }, [category]);

  const fetchProducts = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const res = await productService.getProducts(params);
      setProducts(res.products);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = {
      ...(activeCategory !== 'all' ? { category: activeCategory } : {}),
      ...(debouncedSearch ? { q: debouncedSearch } : {}),
      ...(sort ? { sort } : {}),
      ...(filters.vegetarian ? { vegetarian: 'true' } : {}),
      ...(filters.spicy ? { spicy: 'true' } : {}),
      ...(filters.deals ? { deals: 'true' } : {}),
      ...(priceRange[0] > 0 || priceRange[1] < 30000
        ? { minPrice: priceRange[0], maxPrice: priceRange[1] }
        : {}),
      limit: 40,
    };
    fetchProducts(params);
  }, [activeCategory, debouncedSearch, sort, filters, priceRange, fetchProducts]);

  useEffect(() => {
    if (user) {
      userService
        .getFavorites()
        .then((res) => {
          if (res.favorites) setFavorites(res.favorites.map((f) => f._id));
        })
        .catch(() => {});
    }
  }, [user]);

  const handleAdd = (product) => {
    addToCart({
      id: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      options: [],
    });
  };

  const noResults = !loading && !error && products.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 font-heading mb-2">
          Explore Our Menu
        </h1>
        <p className="text-stone-500">Fresh, delicious, and made to order</p>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search meals..."
            className="w-full rounded-full border border-stone-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Search meals"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700"
          aria-expanded={showFilters}
        >
          <SlidersHorizontal size={16} /> Filters
        </button>
        <div className="hidden lg:block">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-full border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-700"
            aria-label="Sort products"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 lg:mx-0 lg:px-0">
        <button
          onClick={() => setActiveCategory('all')}
          className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            activeCategory === 'all'
              ? 'bg-primary text-white'
              : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === cat.name
                ? 'bg-primary text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="lg:flex gap-8">
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="font-semibold text-stone-800 mb-3">Sort</h3>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
                aria-label="Sort products"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <h3 className="font-semibold text-stone-800 mb-3">Price Range (RWF)</h3>
              <div className="flex items-center gap-2 text-sm text-stone-500">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                  className="w-20 rounded-lg border border-stone-200 px-2 py-1.5 text-sm"
                  aria-label="Minimum price"
                />
                <span>-</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 30000])}
                  className="w-24 rounded-lg border border-stone-200 px-2 py-1.5 text-sm"
                  aria-label="Maximum price"
                />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-stone-800 mb-3">Filters</h3>
              <label className="flex items-center gap-2.5 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.vegetarian}
                  onChange={(e) => setFilters({ ...filters, vegetarian: e.target.checked })}
                  className="h-4 w-4 rounded accent-primary"
                />
                <span className="text-sm text-stone-700">Vegetarian</span>
              </label>
              <label className="flex items-center gap-2.5 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.spicy}
                  onChange={(e) => setFilters({ ...filters, spicy: e.target.checked })}
                  className="h-4 w-4 rounded accent-primary"
                />
                <span className="text-sm text-stone-700">Spicy</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.deals}
                  onChange={(e) => setFilters({ ...filters, deals: e.target.checked })}
                  className="h-4 w-4 rounded accent-primary"
                />
                <span className="text-sm text-stone-700">Deals</span>
              </label>
              {(Object.values(filters).some(Boolean) || sort || priceRange[0] > 0 || priceRange[1] < 30000) && (
                <button
                  onClick={() => {
                    setFilters({ vegetarian: false, spicy: false, deals: false });
                    setSort('');
                    setPriceRange([0, 30000]);
                  }}
                  className="mt-3 text-sm text-primary font-medium hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : error ? (
            <ErrorState onRetry={() => fetchProducts({})} />
          ) : noResults ? (
            <EmptyState
              icon={SearchX}
              title={`No meals found${debouncedSearch ? ` for '${debouncedSearch}'` : ''}`}
              description="Try a different search or filter."
              action
              actionLabel="Browse All Menu"
              onAction={() => {
                setSearchTerm('');
                setActiveCategory('all');
                setFilters({ vegetarian: false, spicy: false, deals: false });
              }}
            />
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAdd={handleAdd}
                  compact
                  favorites={favorites}
                  onToggleFavorite={(id) =>
                    setFavorites((prev) =>
                      prev.includes(id)
                        ? prev.filter((f) => f !== id)
                        : [...prev, id]
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setShowFilters(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-stone-800">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-500"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-stone-700 mb-2">Sort</h4>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <h4 className="font-semibold text-stone-700 mb-2">Price Range</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                    className="w-20 rounded-lg border border-stone-200 px-2 py-1.5 text-sm"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 30000])}
                    className="w-24 rounded-lg border border-stone-200 px-2 py-1.5 text-sm"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.vegetarian}
                  onChange={(e) => setFilters({ ...filters, vegetarian: e.target.checked })}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-sm text-stone-700">Vegetarian</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.spicy}
                  onChange={(e) => setFilters({ ...filters, spicy: e.target.checked })}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-sm text-stone-700">Spicy</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.deals}
                  onChange={(e) => setFilters({ ...filters, deals: e.target.checked })}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-sm text-stone-700">Deals</span>
              </label>
              <button
                onClick={() => setShowFilters(false)}
                className="w-full rounded-full bg-primary text-white py-3 font-semibold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
