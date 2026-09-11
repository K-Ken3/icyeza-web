import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { userService } from '../../services/userService';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import ProductCard from '../../components/ProductCard';
import { ProductGridSkeleton } from '../../components/Skeleton';
import { ErrorState, EmptyState } from '../../components/EmptyState';

export const AccountFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const load = async () => {
    try {
      const res = await userService.getFavorites();
      setFavorites(res.favorites || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRemove = async (productId) => {
    setFavorites((prev) => prev.filter((f) => f._id !== productId));
    try {
      await userService.removeFavorite(productId);
      toast('Removed from favorites');
    } catch {
      setFavorites(favorites);
    }
  };

  if (loading) return <ProductGridSkeleton count={4} />;
  if (error) return <ErrorState onRetry={load} />;

  return (
    <div>
      <h2 className="text-lg font-semibold text-stone-800 mb-4">Your Favorites</h2>
      {favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="Tap the heart on any meal to save it here for quick ordering."
          action
          actionLabel="Browse Menu"
          onAction={() => (window.location.href = '/menu')}
        />
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
          {favorites.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              compact
              onAdd={(p) =>
                addToCart({
                  id: p._id,
                  name: p.name,
                  image: p.image,
                  price: p.price,
                  options: [],
                })
              }
              favorites={favorites.map((f) => f._id)}
              onToggleFavorite={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountFavorites;