import { useEffect, useState } from 'react';
import { CalendarDays, Save, Loader2, Trash2, UtensilsCrossed } from 'lucide-react';
import { contentService } from '../../services/contentService';
import { productService } from '../../services/productService';
import { useToast } from '../../context/ToastContext';
import { Input } from '../Input';
import { formatDate } from '../../utils/format';

const inputCls =
  'w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary';

const toDateInput = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const AdminKitchen = () => {
  const [products, setProducts] = useState([]);
  const [meals, setMeals] = useState([]);
  const [date, setDate] = useState(toDateInput());
  const [productId, setProductId] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { success, error, confirm } = useToast();

  const load = async () => {
    try {
      const [prodRes, mealRes] = await Promise.all([
        productService.getProducts({ limit: 100 }),
        contentService.listMeals(),
      ]);
      setProducts(prodRes.products);
      setMeals(mealRes.meals);
      if (!productId && prodRes.products.length) setProductId(prodRes.products[0]._id);
    } catch (e) {
      error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!date || !productId) return;
    setSaving(true);
    try {
      await contentService.upsertMeal({ date, productId, note });
      success('Today’s Kitchen meal saved for this date');
      await load();
      setNote('');
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Could not save meal');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (meal) => {
    const confirmed = await confirm(
      `Remove this meal from ${formatDate(meal.date)}?`,
      { title: 'Remove meal entry?', confirmText: 'Remove' }
    );
    if (!confirmed) return;
    setDeletingId(meal._id);
    try {
      await contentService.deleteMeal(meal._id);
      setMeals((prev) => prev.filter((m) => m._id !== meal._id));
      success('Meal entry removed');
    } catch {
      error('Could not remove meal entry');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-semibold text-stone-800 flex items-center gap-2">
          <UtensilsCrossed size={18} /> Today’s Kitchen
        </h2>
        <p className="text-sm text-stone-500 mt-1">
          Set a specific meal for a given day — the homepage hero will show that day’s meal instead of a static photo.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm mb-6 space-y-4"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Date *</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Meal for the day *</label>
            <select value={productId} onChange={(e) => setProductId(e.target.value)} className={inputCls} required>
              <option value="" disabled>Select a meal</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} — {p.category}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Input
          label="Short note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Chef’s pick of the day"
        />
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-primary text-white px-5 py-2.5 text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save for {new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </button>
      </form>

      <div>
        <h3 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
          <CalendarDays size={16} /> Scheduled meals
        </h3>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : meals.length === 0 ? (
          <div className="text-center py-10 text-stone-500 text-sm">
            No meals scheduled yet. Set one above for today.
          </div>
        ) : (
          <ul className="space-y-2">
            {meals.map((meal) => (
              <li
                key={meal._id}
                className="flex items-center gap-3 rounded-xl border border-stone-100 bg-white p-3 shadow-sm"
              >
                <img
                  src={meal.productId?.image}
                  alt={meal.productId?.name}
                  className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-stone-900 truncate">
                    {meal.productId?.name}
                  </p>
                  <p className="text-xs text-stone-500 truncate">
                    {formatDate(meal.date)}
                    {meal.note ? ` · ${meal.note}` : ''}
                  </p>
                </div>
                {meal.date && new Date(meal.date).toDateString() === new Date().toDateString() && (
                  <span className="flex-shrink-0 rounded-full bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5">
                    TODAY
                  </span>
                )}
                <button
                  onClick={() => handleDelete(meal)}
                  disabled={deletingId === meal._id}
                  className="flex-shrink-0 inline-flex items-center justify-center rounded-lg border border-red-100 px-2.5 py-1.5 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  aria-label={`Remove meal for ${formatDate(meal.date)}`}
                >
                  {deletingId === meal._id ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminKitchen;