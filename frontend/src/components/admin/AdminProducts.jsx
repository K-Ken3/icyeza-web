import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Leaf, Flame as FlameIcon } from 'lucide-react';
import { productService } from '../../services/productService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../Modal';
import { Input } from '../Input';
import { ImageUpload } from './ImageUpload';
import { formatRWF } from '../../utils/format';

const emptyForm = {
  name: '',
  description: '',
  category: '',
  price: '',
  originalPrice: '',
  image: '',
  ingredients: '',
  available: true,
  isDeal: false,
  vegetarian: false,
  spicy: false,
};

const inputCls =
  'w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const { success, error, confirm } = useToast();

  const load = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        productService.getCategories(),
        productService.getProducts({ limit: 100 }),
      ]);
      setCategories(catRes.categories);
      setProducts(prodRes.products);
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

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      category: categories[0]?.name || '',
    });
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || '',
      description: p.description || '',
      category: p.category || '',
      price: String(p.price ?? ''),
      originalPrice: p.originalPrice ? String(p.originalPrice) : '',
      image: p.image || '',
      ingredients: (p.ingredients || []).join(', '),
      available: !!p.available,
      isDeal: !!p.isDeal,
      vegetarian: !!p.vegetarian,
      spicy: !!p.spicy,
    });
    setModalOpen(true);
  };

  const set = (key) => (e) =>
    setForm((prev) => ({
      ...prev,
      [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        image: form.image,
        ingredients: form.ingredients
          .split(',')
          .map((i) => i.trim())
          .filter(Boolean),
        available: form.available,
        isDeal: form.isDeal,
        vegetarian: form.vegetarian,
        spicy: form.spicy,
      };
      if (editing) {
        await productService.updateProduct(editing._id, payload);
        success('Product updated');
      } else {
        await productService.createProduct(payload);
        success('Product created');
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Could not save product');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailable = async (p) => {
    setTogglingId(p._id);
    try {
      await productService.updateProduct(p._id, { available: !p.available });
      setProducts((prev) => prev.map((x) => (x._id === p._id ? { ...x, available: !p.available } : x)));
      success(p.available ? 'Product marked unavailable' : 'Product is now available');
    } catch {
      error('Could not update availability');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (p) => {
    const confirmed = await confirm(`Delete "${p.name}" from the menu? This cannot be undone.`, {
      title: 'Delete product?',
      confirmText: 'Delete',
    });
    if (!confirmed) return;
    setDeletingId(p._id);
    try {
      await productService.deleteProduct(p._id);
      setProducts((prev) => prev.filter((x) => x._id !== p._id));
      success('Product deleted');
    } catch {
      error('Could not delete product');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-semibold text-stone-800">Menu Products ({products.length})</h2>
          <p className="text-sm text-stone-500">Add, edit and manage menu items and photos</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary text-white px-4 py-2.5 text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton h-52 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.map((p) => (
            <div
              key={p._id}
              className="group rounded-2xl border border-stone-100 bg-white overflow-hidden shadow-sm"
            >
              <div className="relative h-32 sm:h-40">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                {p.isDeal && (
                  <span className="absolute top-2 left-2 rounded-full bg-accent text-white text-[10px] font-bold px-2 py-0.5">
                    DEAL
                  </span>
                )}
                <span
                  className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    p.available ? 'bg-green-100 text-green-700' : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {p.available ? 'Available' : 'Hidden'}
                </span>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-1 mb-0.5 text-[11px] font-medium text-stone-400">
                  <span className="text-primary bg-primary/5 rounded-full px-2 py-0.5">{p.category}</span>
                  {p.vegetarian && <Leaf size={12} className="text-green-500" />}
                  {p.spicy && <FlameIcon size={12} className="text-red-500" />}
                </div>
                <p className="text-sm font-semibold text-stone-900 truncate">{p.name}</p>
                <p className="text-xs text-stone-500 truncate mb-2">{formatRWF(p.price)}</p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-stone-200 px-2 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleToggleAvailable(p)}
                    disabled={togglingId === p._id}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-stone-200 px-2 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors disabled:opacity-50"
                  >
                    {togglingId === p._id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : p.available ? (
                      'Hide'
                    ) : (
                      'Show'
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(p)}
                    disabled={deletingId === p._id}
                    className="inline-flex items-center justify-center rounded-lg border border-red-100 px-2 py-1.5 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                    aria-label={`Delete ${p.name}`}
                  >
                    {deletingId === p._id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Trash2 size={12} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <ImageUpload value={form.image} onChange={(url) => setForm((f) => ({ ...f, image: url }))} label="Product photo" />
          <Input label="Name" value={form.name} onChange={set('name')} required placeholder="e.g. Crispy Chicken Burger" />
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Category *</label>
            <select value={form.category} onChange={set('category')} required className={inputCls}>
              <option value="" disabled>Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Description *</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              required
              rows={3}
              className={inputCls}
              placeholder="Short, appetising description"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price (RWF) *" type="number" min="0" value={form.price} onChange={set('price')} required placeholder="5500" />
            <Input label="Original price (RWF)" type="number" min="0" value={form.originalPrice} onChange={set('originalPrice')} placeholder="6500 (leave empty for none)" />
          </div>
          <Input
            label="Ingredients"
            value={form.ingredients}
            onChange={set('ingredients')}
            placeholder="Chicken fillet, Lettuce, Brioche bun (comma separated)"
          />
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-stone-700">
              <input type="checkbox" checked={form.available} onChange={set('available')} className="h-4 w-4 rounded accent-primary" /> Available
            </label>
            <label className="flex items-center gap-2 text-sm text-stone-700">
              <input type="checkbox" checked={form.isDeal} onChange={set('isDeal')} className="h-4 w-4 rounded accent-primary" /> Deal
            </label>
            <label className="flex items-center gap-2 text-sm text-stone-700">
              <input type="checkbox" checked={form.vegetarian} onChange={set('vegetarian')} className="h-4 w-4 rounded accent-primary" /> Vegetarian
            </label>
            <label className="flex items-center gap-2 text-sm text-stone-700">
              <input type="checkbox" checked={form.spicy} onChange={set('spicy')} className="h-4 w-4 rounded accent-primary" /> Spicy
            </label>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 rounded-full border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary text-white px-4 py-2.5 text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              {editing ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminProducts;