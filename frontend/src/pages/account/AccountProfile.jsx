import { useState } from 'react';
import { Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { getErrorMessage } from '../../utils/format';
import Button from '../../components/Button';
import Input from '../../components/Input';

export const AccountProfile = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: {
      province: user?.address?.province || '',
      district: user?.address?.district || '',
      sector: user?.address?.sector || '',
      street: user?.address?.street || '',
      landmark: user?.address?.landmark || '',
    },
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await userService.updateProfile(form);
      updateUser(res.user);
      toast('Profile updated successfully');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleAddress = (field) => (e) =>
    setForm({ ...form, address: { ...form.address, [field]: e.target.value } });

  return (
    <form onSubmit={handleSubmit} className="max-w-xl">
      <h2 className="text-lg font-semibold text-stone-800 mb-4">Profile Settings</h2>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-600 px-4 py-3 text-sm">{error}</div>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-stone-700 mb-3">Personal Information</h3>
          <div className="space-y-4 bg-white rounded-2xl border border-stone-100 p-5">
            <Input
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-stone-700 mb-3">Saved Address</h3>
          <div className="space-y-4 bg-white rounded-2xl border border-stone-100 p-5">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Province" value={form.address.province} onChange={handleAddress('province')} />
              <Input label="District" value={form.address.district} onChange={handleAddress('district')} />
            </div>
            <Input label="Sector" value={form.address.sector} onChange={handleAddress('sector')} />
            <Input
              label="Street / Landmark"
              value={form.address.street}
              onChange={handleAddress('street')}
              placeholder="e.g. KG 5 Ave, next to the supermarket"
            />
            <Input
              label="Landmark / Notes"
              value={form.address.landmark}
              onChange={handleAddress('landmark')}
              placeholder="A short description to help the rider find you"
            />
          </div>
        </div>

        <Button type="submit" loading={saving}>
          <Save size={16} /> Save Changes
        </Button>
      </div>
    </form>
  );
};

export default AccountProfile;