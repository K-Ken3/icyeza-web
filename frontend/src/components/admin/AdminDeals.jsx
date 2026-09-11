import { useEffect, useState } from 'react';
import {
  BadgePercent,
  Save,
  Loader2,
  Plus,
  Trash2,
  Flame,
  CalendarX2,
} from 'lucide-react';
import { contentService } from '../../services/contentService';
import { productService } from '../../services/productService';
import { useToast } from '../../context/ToastContext';
import { Input } from '../Input';
import { ImageUpload } from './ImageUpload';
import { formatRWF } from '../../utils/format';

const inputCls =
  'w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary';

const DEFAULT_BANNER = {
  title: 'Hot Deals & Promotions',
  subtitle: 'Limited-time combos and family meals at unbeatable prices',
};

const toDateInput = (d) => {
  if (!d) return '';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
};

const newDraft = (p) => ({
  name: p.name || '',
  description: p.description || '',
  price: String(p.price ?? ''),
  originalPrice: p.originalPrice ? String(p.originalPrice) : '',
  image: p.image || '',
  dealEnds: toDateInput(p.dealEnds),
  available: !!p.available,
});

export const AdminDeals = () => {
  const [deals, setDeals] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [banner, setBanner] = useState(DEFAULT_BANNER);
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [bannerSaving, setBannerSaving] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [newDealId, setNewDealId] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [drafts, setDrafts] = useState({});
  const { success, error, confirm } = useToast();

  const setDraft = (id, patch) =>
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const load = async () => {
    try {
      const [dealRes, allRes, cfg] = await Promise.all([
        productService.getProducts({ deals: 'true', limit: 100 }),
        productService.getProducts({ limit: 100 }),
        contentService.getSetting('deals_page').catch(() => null),
      ]);
      setDeals(dealRes.products);
      setAllProducts(allRes.products);
      setBanner({
        title: cfg?.title || DEFAULT_BANNER.title,
        subtitle: cfg?.subtitle || DEFAULT_BANNER.subtitle,
      });
      setBannerLoaded(true);
      const next = {};
      dealRes.products.forEach((p) => {
        next[p._id] = newDraft(p);
      });
      setDrafts(next);
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

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    setBannerSaving(true);
    try {
      await contentService.updateSetting('deals_page', {
        title: banner.title.trim(),
        subtitle: banner.subtitle.trim(),
      });
      success('Deals page banner updated');
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Could not save banner');
    } finally {
      setBannerSaving(false);
    }
  };

  const handleSaveCard = async (dealId) => {
    const d = drafts[dealId];
    if (!d || !d.price) {
      error('Deal price is required');
      return;
    }
    setSavingId(dealId);
    try {
      await productService.updateProduct(dealId, {
        name: d.name.trim(),
        description: d.description.trim(),
        price: Number(d.price),
        originalPrice: d.originalPrice ? Number(d.originalPrice) : null,
        image: d.image,
        dealEnds: d.dealEnds || null,
        available: d.available,
        isDeal: true,
      });
      success('Deal card saved');
      await load();
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Could not save deal');
    } finally {
      setSavingId(null);
    }
  };

  const handleRemoveDeal = async (deal) => {
    const confirmed = await confirm(
      `"${deal.name}" will no longer appear on the Deals & Promotions page.`,
      { title: 'Remove from deals?', confirmText: 'Remove deal' }
    );
    if (!confirmed) return;
    setRemovingId(deal._id);
    try {
      await productService.updateProduct(deal._id, { isDeal: false });
      success('Removed from deals');
      await load();
    } catch {
      error('Could not remove deal');
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddDeal = async () => {
    if (!newDealId) return;
    setAddingId(newDealId);
    try {
      const p = allProducts.find((x) => x._id === newDealId);
      await productService.updateProduct(newDealId, {
        isDeal: true,
        originalPrice: p.originalPrice || Math.round(((p.price * 1.2) / 100)) * 100,
      });
      success(`"${p.name}" added to deals`);
      setNewDealId('');
      setShowAdd(false);
      await load();
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Could not add deal');
    } finally {
      setAddingId(null);
    }
  };

  const nonDealProducts = allProducts.filter((p) => !p.isDeal);

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-semibold text-stone-800 flex items-center gap-2">
          <BadgePercent size={18} /> Deals & Promotions
        </h2>
        <p className="text-sm text-stone-500 mt-1">
          Edit the deals page banner and manage the deal cards shown to customers.
        </p>
      </div>

      <form
        onSubmit={handleSaveBanner}
        className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm mb-6 space-y-4"
      >
        <h3 className="font-semibold text-stone-800 flex items-center gap-2 text-base">
          <Flame size={16} className="text-primary" /> Page banner
        </h3>
        {!bannerLoaded ? (
          <div className="skeleton h-10 rounded-lg" />
        ) : (
          <>
            <Input
              label="Page title"
              value={banner.title}
              onChange={(e) => setBanner((b) => ({ ...b, title: e.target.value }))}
              placeholder="Hot Deals & Promotions"
            />
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Subtitle</label>
              <textarea
                value={banner.subtitle}
                onChange={(e) => setBanner((b) => ({ ...b, subtitle: e.target.value }))}
                rows={2}
                className={inputCls}
                placeholder="Limited-time combos and family meals at unbeatable prices"
              />
            </div>
            <button
              type="submit"
              disabled={bannerSaving}
              className="inline-flex items-center gap-2 rounded-full bg-primary text-white px-5 py-2.5 text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              {bannerSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Save banner
            </button>
          </>
        )}
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="font-semibold text-stone-800 text-base">Deal cards ({deals.length})</h3>
        <button
          onClick={() => setShowAdd((s) => !s)}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary text-white px-4 py-2.5 text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          <Plus size={16} /> Add Deal
        </button>
      </div>

      {showAdd && (
        <div className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm mb-5 flex flex-col sm:flex-row gap-3">
          <select
            value={newDealId}
            onChange={(e) => setNewDealId(e.target.value)}
            className={`${inputCls} sm:flex-1`}
            aria-label="Choose product to feature as a deal"
          >
            <option value="" disabled>Choose a product to feature as a deal</option>
            {nonDealProducts.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} — {formatRWF(p.price)}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddDeal}
            disabled={!newDealId || addingId}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary text-white px-5 py-2.5 text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
          >
            {addingId ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            Add as Deal
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-2xl" />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="text-center py-14 text-stone-500">
          <p className="font-semibold text-stone-700 mb-1">No deals yet</p>
          <p className="text-sm">Use “Add Deal” to feature a product with a discount on this page.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deals.map((deal) => {
            const d = drafts[deal._id] || newDraft(deal);
            const saved = Number(d.price) || 0;
            const orig = Number(d.originalPrice) || 0;
            const pct = orig > saved ? Math.round(((orig - saved) / orig) * 100) : 0;
            return (
              <div key={deal._id} className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="w-full lg:w-44 flex-shrink-0">
                    <ImageUpload
                      value={d.image}
                      onChange={(url) => setDraft(deal._id, { image: url })}
                      label="Card photo"
                    />
                  </div>
                  <div className="flex-1 grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Input
                        label="Name"
                        value={d.name}
                        onChange={(e) => setDraft(deal._id, { name: e.target.value })}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
                      <textarea
                        value={d.description}
                        onChange={(e) => setDraft(deal._id, { description: e.target.value })}
                        rows={2}
                        className={inputCls}
                      />
                    </div>
                    <Input
                      label="Deal price (RWF) *"
                      type="number"
                      min="0"
                      value={d.price}
                      onChange={(e) => setDraft(deal._id, { price: e.target.value })}
                    />
                    <Input
                      label="Original price (RWF)"
                      type="number"
                      min="0"
                      value={d.originalPrice}
                      onChange={(e) => setDraft(deal._id, { originalPrice: e.target.value })}
                    />
                    <Input
                      label="Offer ends (optional)"
                      type="date"
                      value={d.dealEnds}
                      onChange={(e) => setDraft(deal._id, { dealEnds: e.target.value })}
                      hint={d.dealEnds ? 'Show “Ends in limited time” on the card' : ''}
                    />
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 text-sm text-stone-700 pb-2.5">
                        <input
                          type="checkbox"
                          checked={d.available}
                          onChange={(e) => setDraft(deal._id, { available: e.target.checked })}
                          className="h-4 w-4 rounded accent-primary"
                        />{' '}
                        Available
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-stone-100">
                  <span className="text-xs text-stone-500">
                    {saved > 0 && (
                      <>
                        <span className="font-semibold text-stone-700">{formatRWF(saved)}</span>
                        {orig > saved && (
                          <>
                            {' '}
                            <span className="line-through text-stone-400">{formatRWF(orig)}</span>{' '}
                            <span className="text-green-600 font-semibold">{pct}% OFF</span>
                          </>
                        )}
                      </>
                    )}
                    {!saved && 'Enter a price to preview the discount'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRemoveDeal(deal)}
                      disabled={removingId === deal._id}
                      className="inline-flex items-center gap-1 rounded-full border border-red-100 px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {removingId === deal._id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Trash2 size={12} />
                      )}
                      Remove deal
                    </button>
                    <button
                      onClick={() => handleSaveCard(deal._id)}
                      disabled={savingId === deal._id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary text-white px-5 py-2 text-xs font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
                    >
                      {savingId === deal._id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Save size={12} />
                      )}
                      Save card
                    </button>
                  </div>
                </div>
                {d.dealEnds && (
                  <p className="text-[11px] text-stone-400 mt-2 inline-flex items-center gap-1">
                    <CalendarX2 size={11} /> Deal ends {new Date(`${d.dealEnds}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminDeals;