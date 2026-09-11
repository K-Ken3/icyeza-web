import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Star, Plus, Check, Flame as FlameIcon, Leaf } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatRWF } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userService } from '../services/userService';
import { Badge } from './Badge';

export const ProductCard = ({ product, onAdd, favorites = [], onToggleFavorite, compact = false }) => {
  const [added, setAdded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (favorites?.length && product._id) {
      setIsFavorite(favorites.includes(product._id));
    }
  }, [favorites, product._id]);

  const discount = product.originalPrice && product.originalPrice > product.price;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof onAdd === 'function') {
      onAdd(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
    }
  };

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast('Please login to save favorites', 'info');
      return;
    }
    try {
      if (isFavorite) {
        await userService.removeFavorite(product._id);
        setIsFavorite(false);
        toast('Removed from favorites');
      } else {
        await userService.addFavorite(product._id);
        setIsFavorite(true);
        toast('Added to favorites');
      }
      onToggleFavorite?.(product._id);
    } catch {
      toast('Could not update favorites', 'error');
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`group relative bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow ${
        !product.available ? 'opacity-60' : ''
      }`}
    >
      <button
        onClick={handleFavorite}
        className={`absolute top-2.5 right-2.5 z-10 h-8 w-8 flex items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors ${
          isFavorite ? 'text-red-500' : 'text-stone-400 hover:text-red-400'
        }`}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart size={17} fill={isFavorite ? 'currentColor' : 'none'} />
      </button>

      {discount && (
        <Badge variant="discount" className="absolute top-2.5 left-2.5 z-10">
          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
        </Badge>
      )}

      <Link to={`/product/${product._id}`} className="block">
        <div className="overflow-hidden relative">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              compact ? 'h-32 sm:h-52' : 'h-48 sm:h-52'
            }`}
          />
          <div className="absolute bottom-2 left-2 flex gap-1">
            {product.spicy && (
              <span className="flex items-center gap-0.5 rounded-full bg-red-500/90 text-white text-[11px] px-2 py-0.5 font-semibold">
                <FlameIcon size={11} /> Spicy
              </span>
            )}
            {product.vegetarian && (
              <span className="flex items-center gap-0.5 rounded-full bg-green-500/90 text-white text-[11px] px-2 py-0.5 font-semibold">
                <Leaf size={11} /> Veg
              </span>
            )}
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[11px] sm:text-xs font-medium text-primary bg-primary/5 rounded-full px-2 py-0.5 truncate max-w-[60%]">
              {product.category}
            </span>
            <span className="flex items-center gap-0.5 text-xs text-stone-500">
              <Star size={13} className="text-accent fill-accent" />
              {product.rating?.toFixed(1) || 'New'}
            </span>
          </div>
          <h3 className="font-semibold text-stone-900 text-sm sm:text-base mb-1 line-clamp-1">
            {product.name}
          </h3>
          <p
            className={`text-sm text-stone-500 line-clamp-2 mb-3 ${
              compact ? 'hidden sm:block' : ''
            }`}
          >
            {product.description}
          </p>
          <div className="flex items-center justify-between mt-2">
            <div className="min-w-0">
              <span className={`font-bold text-stone-900 ${compact ? 'text-base' : 'text-lg'}`}>
                {formatRWF(product.price)}
              </span>
              {discount && (
                <span className="text-xs text-stone-400 line-through ml-1.5 align-baseline">
                  {formatRWF(product.originalPrice)}
                </span>
              )}
            </div>
            <button
              onClick={handleAdd}
              disabled={!product.available}
              className={`shrink-0 flex items-center justify-center rounded-full font-semibold transition-all ${
                compact ? 'h-8 w-8 sm:h-9 sm:px-3.5 sm:w-auto sm:gap-1.5' : 'px-3.5 py-2 sm:gap-1'
              } ${
                added
                  ? 'bg-green-500 text-white'
                  : 'bg-primary text-white hover:bg-primary-dark'
              } disabled:bg-stone-200 disabled:text-stone-400`}
              aria-label={`Add ${product.name} to cart`}
            >
              {added ? (
                <>
                  <Check size={16} />
                  <span className="hidden sm:inline">Added</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span className="hidden sm:inline">Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;