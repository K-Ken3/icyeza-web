import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Clock, UtensilsCrossed, ShoppingBag, Phone, MapPin, ChefHat, Truck, PackageCheck, Handshake } from 'lucide-react';
import { productService } from '../services/productService';
import { locationService } from '../services/locationService';
import { contentService } from '../services/contentService';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';
import { ErrorState } from '../components/EmptyState';
import { formatRWF } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import PartnersCarousel from '../components/PartnersCarousel';

const heroImage = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80';

const steps = [
  {
    num: '01',
    title: 'Choose Your Meal',
    desc: 'Browse the menu and pick your favourites, with options to customize.',
    icon: UtensilsCrossed,
  },
  {
    num: '02',
    title: 'Place Your Order',
    desc: 'Checkout in seconds with mobile money. Pay instantly via MTN MoMo.',
    icon: ShoppingBag,
  },
  {
    num: '03',
    title: 'Enjoy Your Food',
    desc: 'We prepare fresh and deliver hot to your door, ready for sharing.',
    icon: ArrowRight,
  },
];

export const Home = () => {
  const [favorites, setFavorites] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState([]);
  const [partners, setPartners] = useState([]);
  const [todaysMeal, setTodaysMeal] = useState(null);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [productRes, locationRes, partnerRes, mealRes] = await Promise.all([
          productService.getProducts({ limit: 12 }),
          locationService.getLocations(),
          contentService.getPartners().catch(() => ({ partners: [] })),
          contentService.getTodaysMeal().catch(() => ({ meal: null })),
        ]);
        setProducts(productRes.products);
        setLocations(locationRes.locations);
        setPartners(partnerRes.partners || []);
        setTodaysMeal(mealRes.meal || null);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (user) {
      userService
        .getFavorites()
        .then((res) => {
          if (res.favorites) {
            const ids = res.favorites.map((f) => f._id);
            setFavorites(ids);
          }
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

  const deals = products.filter((p) => p.isDeal).slice(0, 3);
  const favoritesProducts = products.slice(0, 8);

  return (
    <div>
      <section className="bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 pt-4 lg:pt-8 pb-12 lg:pb-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold mb-4">
                <Star size={14} className="fill-accent text-accent" /> Rated 4.8 by our customers
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 font-heading leading-tight mb-4">
                Fire-kissed comfort.
                <br />
                Built for <span className="text-primary">every table.</span>
              </h1>
              <p className="text-lg text-stone-600 mb-8 max-w-xl">
                Freshly prepared comfort meals, fast checkout, and warm Kigali hospitality delivered right to your door.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/menu"
                  className="inline-flex items-center gap-2 rounded-full bg-primary text-white px-7 py-3.5 font-semibold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
                >
                  Order Now <ArrowRight size={18} />
                </Link>
                <Link
                  to="/menu"
                  className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-7 py-3.5 font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  View Menu
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
                <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                  <div className="flex items-center gap-2 text-primary"><Truck size={18} /> <span className="text-xs font-bold">Delivery</span></div>
                  <div className="text-xs text-stone-500 mt-1">30-45 min</div>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                  <div className="flex items-center gap-2 text-primary"><ChefHat size={18} /> <span className="text-xs font-bold">Fresh</span></div>
                  <div className="text-xs text-stone-500 mt-1">Made daily</div>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                  <div className="flex items-center gap-2 text-primary"><MapPin size={18} /> <span className="text-xs font-bold">Local</span></div>
                  <div className="text-xs text-stone-500 mt-1">Kigali</div>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                  <div className="flex items-center gap-2 text-primary"><PackageCheck size={18} /> <span className="text-xs font-bold">Pickup</span></div>
                  <div className="text-xs text-stone-500 mt-1">Fast ready</div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              {todaysMeal?.product ? (
                <Link to={`/product/${todaysMeal.product._id}`} className="block relative">
                  <img
                    src={todaysMeal.product.image}
                    alt={`Today's Kitchen \u2014 ${todaysMeal.product.name}`}
                    className="rounded-[2rem] shadow-xl object-cover w-full h-72 sm:h-96 lg:h-[480px] border-4 border-white"
                  />
                </Link>
              ) : (
                <>
                  <div className="absolute -left-4 -top-4 bg-white rounded-2xl shadow-xl px-4 py-3 z-10">
                    <span className="flex items-center gap-2 text-sm font-semibold text-stone-900"><Star size={14} className="fill-accent text-accent" /> 4.8</span>
                  </div>
                  <img
                    src={heroImage}
                    alt="A delicious crispy chicken burger"
                    className="rounded-[2rem] shadow-xl object-cover w-full h-72 sm:h-96 lg:h-[480px] border-4 border-white"
                  />
                </>
              )}
              <div className="absolute right-2 sm:right-3 bottom-5 rounded-2xl bg-white shadow-xl px-4 py-3">
                <div className="text-[11px] font-bold uppercase text-stone-500">Today's Kitchen</div>
                <div className="text-sm font-bold text-primary">
                  {todaysMeal?.product?.name || 'House Specials'}
                </div>
                {todaysMeal?.product?.price && (
                  <div className="text-xs text-stone-600 font-semibold mt-0.5">
                    {formatRWF(todaysMeal.product.price)}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-heading">
              Customer Favorites
            </h2>
            <p className="text-stone-500 mt-1">The most loved meals on our menu</p>
          </div>
          <Link
            to="/menu"
            className="hidden sm:flex items-center gap-1 text-primary font-semibold text-sm hover:underline"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : error ? (
          <ErrorState onRetry={() => window.location.reload()} />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            {favoritesProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAdd={handleAdd}
                compact
                favorites={favorites}
                onToggleFavorite={(id) => {
                  setFavorites((prev) =>
                    prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
                  );
                }}
              />
            ))}
          </div>
        )}
      </section>

      {deals.length > 0 && (
        <section className="bg-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
                  Family Feast Deals
                </h2>
                <p className="text-white/80 mt-1">Feed the whole family with our best-value combos</p>
              </div>
              <Link
                to="/deals"
                className="hidden sm:flex items-center gap-1 text-white font-semibold text-sm hover:underline"
              >
                View deals <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {deals.map((deal) => (
                <Link
                  key={deal._id}
                  to={`/product/${deal._id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="relative h-28 sm:h-48 overflow-hidden">
                    <img
                      src={deal.image}
                      alt={deal.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-accent text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      {Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100)}% OFF
                    </span>
                  </div>
                  <div className="p-3 sm:p-5">
                    <h3 className="font-semibold text-stone-900 text-sm sm:text-lg leading-tight">{deal.name}</h3>
                    <p className="text-sm text-stone-500 mb-3 line-clamp-2 hidden sm:block">{deal.description}</p>
                    <div className="flex items-center justify-between gap-1 mt-1">
                      <div className="min-w-0">
                        <span className="text-base sm:text-lg font-bold text-stone-900">{formatRWF(deal.price)}</span>
                        {deal.originalPrice && (
                          <span className="text-xs sm:text-sm text-stone-400 line-through ml-1">
                            {formatRWF(deal.originalPrice)}
                          </span>
                        )}
                      </div>
                      <span className="hidden xl:inline text-primary font-semibold text-sm group-hover:underline shrink-0">
                        Order Deal
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-heading text-center mb-10">
          How It Works
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex h-16 w-16 rounded-2xl bg-primary/10 text-primary items-center justify-center mb-4">
                <step.icon size={28} />
              </div>
              <div className="text-4xl font-black text-stone-200 font-heading mb-2">{step.num}</div>
              <h3 className="text-lg font-semibold text-stone-800 mb-1">{step.title}</h3>
              <p className="text-sm text-stone-500 max-w-xs mx-auto">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {partners.length > 0 && (
        <section className="bg-stone-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold mb-3">
                <Handshake size={14} /> Trusted brands
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-heading">
                Our Partners
              </h2>
              <p className="text-stone-500 mt-1 max-w-md mx-auto">
                Working with the best to bring you fresh ingredients and reliable service
              </p>
            </div>
            <PartnersCarousel partners={partners} />
          </div>
        </section>
      )}

      {locations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-heading">
                Find Us
              </h2>
              <p className="text-stone-500 mt-1">Visit one of our branches across Kigali</p>
            </div>
            <Link
              to="/locations"
              className="hidden sm:flex items-center gap-1 text-primary font-semibold text-sm hover:underline"
            >
              All locations <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {locations.slice(0, 3).map((loc) => (
              <Link
                key={loc._id}
                to="/locations"
                className="rounded-2xl border border-stone-100 bg-white p-5 hover:shadow-lg transition-shadow"
              >
                <h3 className="font-semibold text-stone-900 mb-1">{loc.name}</h3>
                <p className="text-sm text-stone-500 mb-3">{loc.address}</p>
                <div className="flex items-center gap-4 text-sm text-stone-600">
                  <span className="flex items-center gap-1.5">
                    <Clock size={15} /> {loc.openingHours}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone size={15} /> {loc.phone}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
