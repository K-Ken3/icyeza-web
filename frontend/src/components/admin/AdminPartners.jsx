import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Handshake } from 'lucide-react';
import { contentService } from '../../services/contentService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../Modal';
import { Input } from '../Input';
import { ImageUpload } from './ImageUpload';

const emptyForm = {
  name: '',
  tagline: '',
  website: '',
  logo: '',
  sortOrder: 0,
  active: true,
};

export const AdminPartners = () => {
  const [partners, setPartners] = useState([]);
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
      const res = await contentService.getAdminPartners();
      setPartners(res.partners);
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
    setForm({ ...emptyForm, sortOrder: partners.length + 1 });
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || '',
      tagline: p.tagline || '',
      website: p.website || '',
      logo: p.logo || '',
      sortOrder: p.sortOrder ?? 0,
      active: !!p.active,
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
        tagline: form.tagline.trim(),
        website: form.website.trim(),
        logo: form.logo,
        sortOrder: Number(form.sortOrder) || 0,
        active: form.active,
      };
      if (editing) {
        await contentService.updatePartner(editing._id, payload);
        success('Partner updated');
      } else {
        await contentService.createPartner(payload);
        success('Partner added');
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Could not save partner');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (p) => {
    setTogglingId(p._id);
    try {
      await contentService.updatePartner(p._id, { active: !p.active });
      setPartners((prev) => prev.map((x) => (x._id === p._id ? { ...x, active: !p.active } : x)));
      success(p.active ? 'Partner hidden from homepage' : 'Partner is now visible on homepage');
    } catch {
      error('Could not update partner');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (p) => {
    const confirmed = await confirm(`Remove "${p.name}" from the partners slideshow?`, {
      title: 'Delete partner?',
      confirmText: 'Delete',
    });
    if (!confirmed) return;
    setDeletingId(p._id);
    try {
      await contentService.deletePartner(p._id);
      setPartners((prev) => prev.filter((x) => x._id !== p._id));
      success('Partner deleted');
    } catch {
      error('Could not delete partner');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-semibold text-stone-800 flex items-center gap-2">
            <Handshake size={18} /> Our Partners ({partners.length})
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            These appear in the homepage slideshow, three partners per slide.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary text-white px-4 py-2.5 text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          <Plus size={16} /> Add Partner
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-2xl" />
          ))}
        </div>
      ) : partners.length === 0 ? (
        <div className="text-center py-12 text-stone-500 text-sm rounded-2xl border border-dashed border-stone-200">
          No partners yet. Add your first partner to display them on the homepage.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {partners.map((p) => (
            <div
              key={p._id}
              className={`rounded-2xl border border-stone-100 bg-white p-4 shadow-sm ${!p.active ? 'opacity-50' : ''}`}
            >
              <div className="h-20 flex items-center justify-center rounded-xl bg-stone-50 overflow-hidden mb-3">
                {p.logo ? (
                  <img src={p.logo} alt={`${p.name} logo`} className="max-h-16 max-w-full object-contain" />
                ) : (
                  <span className="text-3xl font-black text-stone-300">{p.name.charAt(0)}</span>
                )}
              </div>
              <p className="text-sm font-semibold text-stone-900 truncate">{p.name}</p>
              <p className="text-xs text-stone-500 truncate">{p.tagline}</p>
              <p className="text-xs text-stone-400 mb-3 truncate">{p.website}</p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEdit(p)}
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-stone-200 px-2 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  <Pencil size={12} /> Edit
                </button>
                <button
                  onClick={() => handleToggle(p)}
                  disabled={togglingId === p._id}
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-stone-200 px-2 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors disabled:opacity-50"
                >
                  {togglingId === p._id ? <Loader2 size={12} className="animate-spin" /> : p.active ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => handleDelete(p)}
                  disabled={deletingId === p._id}
                  className="inline-flex items-center justify-center rounded-lg border border-red-100 px-2 py-1.5 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  aria-label={`Delete ${p.name}`}
                >
                  {deletingId === p._id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Partner' : 'Add Partner'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <ImageUpload value={form.logo} onChange={(url) => setForm((f) => ({ ...f, logo: url }))} label="Partner logo" />
          <Input label="Company name *" value={form.name} onChange={set('name')} required placeholder="e.g. Kurema Delivery" />
          <Input label="Tagline" value={form.tagline} onChange={set('tagline')} placeholder="e.g. Swift delivery across Kigali" />
          <Input label="Website" type="url" value={form.website} onChange={set('website')} placeholder="https://..." />
          <div className="grid grid-cols-2 gap-3 items-end">
            <Input label="Slide order" type="number" min="0" value={form.sortOrder} onChange={set('sortOrder')} />
            <label className="flex items-center gap-2 text-sm text-stone-700 pb-2.5">
              <input type="checkbox" checked={form.active} onChange={set('active')} className="h-4 w-4 rounded accent-primary" /> Active on homepage
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
              {editing ? 'Save Changes' : 'Add Partner'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminPartners;