import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Star, ArrowLeft, ShoppingCart, Check, Leaf, Flame, AlertTriangle } from 'lucide-react';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatRWF } from '../utils/format';
import { Skeleton } from '../components/Skeleton';
import { ErrorState } from '../components/EmptyState';
import { userService } from '../services/userService';
import QuantitySelector from '../components/QuantitySelector';

export const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isFavorite, setIsFavorite] = useState(false);
  const [added, setAdded] = useState(false);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await productService.getProduct(id);
        setProduct(res.product);
        const defaults = {};
        res.product.options?.forEach((opt) => {
          if (opt.choices?.length) defaults[opt.name] = opt.choices[0].label;
        });
        setSelectedOptions(defaults);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (user) {
      userService
        .getFavorites()
        .then((res) => {
          if (res.favorites) {
            setIsFavorite(res.favorites.some((f) => f._id === id));
          }
        })
        .catch(() => {});
    }
  }, [user, id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-10">
          <Skeleton variant="rect" className="h-96 rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="w-2/3 h-8" />
            <Skeleton className="w-1/3" />
            <Skeleton className="w-full" />
            <Skeleton className="w-full" />
            <Skeleton className="w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (!product) return null;

  const optionPrice = (optName) => {
    const choices = product.options?.find((o) => o.name === optName)?.choices || [];
    const selected = choices.find((c) => c.label === selectedOptions[optName]);
    return selected?.price || 0;
  };

  const addOnTotal = (product.options || []).reduce((sum, opt) => sum + optionPrice(opt.name), 0);
  const unitPrice = product.price + addOnTotal;
  const total = unitPrice * quantity;

  const discount = product.originalPrice && product.originalPrice > product.price;

  const handleAdd = () => {
    const options = Object.entries(selectedOptions).map(([name, label]) => ({
      name,
      label,
      price: optionPrice(name),
    }));
    addToCart({
      id: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      addOnCurrentPrice: addOnTotal,
      options,
    });
    setAdded(true);
    toast('Added to cart');
    setTimeout(() => setAdded(false), 1200);
  };

  const handleFavorite = async () => {
    if (!user) {
      toast('Please login to save favorites', 'info');
      navigate('/login');
      return;
    }
    try {
      if (isFavorite) {
        await userService.removeFavorite(id);
        setIsFavorite(false);
        toast('Removed from favorites');
      } else {
        await userService.addFavorite(id);
        setIsFavorite(true);
        toast('Added to favorites');
      }
    } catch {
      toast('Could not update favorites', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/menu"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Menu
      </Link>

      <div className="grid lg:grid-cols-2 gap-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          {!product.available && (
            <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center z-10">
              <span className="bg-white/90 backdrop-blur rounded-full px-5 py-2 text-sm font-semibold text-stone-800">
                Currently unavailable
              </span>
            </div>
          )}
          {discount && (
            <span className="absolute top-4 left-4 z-10 inline-flex rounded-full bg-accent text-white text-xs font-bold px-3 py-1">
              Save {formatRWF(product.originalPrice - product.price)}
            </span>
          )}
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-72 sm:h-96 lg:h-[520px] object-cover rounded-2xl shadow-lg"
          />
        </motion.div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary bg-primary/5 rounded-full px-3 py-1">
              {product.category}
            </span>
            <button
              onClick={handleFavorite}
              className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-stone-200 hover:bg-stone-50 transition-colors"
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart size={19} className={isFavorite ? 'text-red-500' : 'text-stone-400'} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 font-heading mb-2">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center gap-1 text-stone-600">
              <Star size={18} className="text-accent fill-accent" />
              <span className="font-semibold">{product.rating?.toFixed(1) || 'New'}</span>
            </span>
            {product.reviews > 0 && <span className="text-sm text-stone-500">({product.reviews} reviews)</span>}
            {product.spicy && (
              <span className="flex items-center gap-1 text-sm text-red-500 font-medium">
                <Flame size={14} /> Spicy
              </span>
            )}
            {product.vegetarian && (
              <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                <Leaf size={14} /> Vegetarian
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-primary">{formatRWF(product.price)}</span>
            {discount && (
              <span className="text-lg text-stone-400 line-through">
                {formatRWF(product.originalPrice)}
              </span>
            )}
          </div>

          <p className="text-stone-600 mb-6 leading-relaxed">{product.description}</p>

          {product.options?.length > 0 && (
            <div className="space-y-5 mb-6">
              {product.options.map((opt) => (
                <div key={opt.name}>
                  <h3 className="font-semibold text-stone-800 mb-2">
                    {opt.name}
                    {opt.required && <span className="text-primary ml-0.5">*</span>}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {opt.choices.map((choice) => {
                      const isSelected = selectedOptions[opt.name] === choice.label;
                      return (
                        <button
                          key={choice.label}
                          onClick={() =>
                            setSelectedOptions({ ...selectedOptions, [opt.name]: choice.label })
                          }
                          className={`rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
                            isSelected
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white border-stone-200 text-stone-700 hover:border-primary'
                          }`}
                        >
                          {choice.label}
                          {choice.price > 0 && (
                            <span className={isSelected ? 'text-white/80 ml-1' : 'text-stone-400 ml-1'}>
                              +{formatRWF(choice.price)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {product.ingredients?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-stone-800 mb-2">Ingredients</h3>
              <div className="flex flex-wrap gap-1.5">
                {product.ingredients.map((ing) => (
                  <span
                    key={ing}
                    className="bg-stone-100 text-stone-700 rounded-full px-3 py-1 text-xs font-medium"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.allergens?.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-sm text-amber-800">
                <AlertTriangle size={15} className="inline mr-1" />
                <strong>Allergen information:</strong> {product.allergens.join(', ')}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 border-t border-stone-100 pt-6">
            <QuantitySelector
              quantity={quantity}
              onChange={setQuantity}
              size="lg"
            />
            <button
              onClick={handleAdd}
              disabled={!product.available}
              className={`flex-1 flex items-center justify-center gap-2 rounded-full py-3.5 text-base font-semibold transition-all ${
                added
                  ? 'bg-green-500 text-white'
                  : 'bg-primary text-white hover:bg-primary-dark'
              } disabled:bg-stone-200 disabled:text-stone-400`}
            >
              {added ? (
                <>
                  <Check size={20} /> Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart size={20} /> Add to Cart
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-stone-500 mt-3 text-center sm:text-left">
            Total: <span className="font-semibold text-stone-800">{formatRWF(total)}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
