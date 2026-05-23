import React, { useEffect, useState } from 'react';
import { Store, MapPin, Phone, Mail, Globe, Clock, Save } from 'lucide-react';
import MerchantPageHeader from '../components/MerchantPageHeader';
import {
  getMyMerchantStore,
  toggleMyMerchantOnline,
  updateMyMerchantStore,
} from '../../../services/merchantService';

const initialForm = {
  storeName: '',
  description: '',
  logoUrl: '',
  bannerUrl: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  country: 'United States',
};

const MerchantProfile = () => {
  const [store, setStore] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const merchant = await getMyMerchantStore();
      setStore(merchant || null);

      const info = merchant?.businessInfo || {};
      setForm({
        storeName: merchant?.storeName || '',
        description: merchant?.description || '',
        logoUrl: merchant?.logoUrl || '',
        bannerUrl: merchant?.bannerUrl || '',
        email: info.email || '',
        phone: info.phone || '',
        website: info.website || '',
        address: info.address || '',
        city: info.city || '',
        state: info.state || '',
        zip: info.zip || '',
        country: info.country || 'United States',
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load store profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      setError('');
      setMessage('');

      const payload = {
        storeName: form.storeName.trim(),
        description: form.description.trim(),
        logoUrl: form.logoUrl.trim() || undefined,
        bannerUrl: form.bannerUrl.trim() || undefined,
        businessInfo: {
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          website: form.website.trim() || undefined,
          address: form.address.trim() || undefined,
          city: form.city.trim() || undefined,
          state: form.state.trim() || undefined,
          zip: form.zip.trim() || undefined,
          country: form.country,
        },
      };

      const updated = await updateMyMerchantStore(payload);
      setStore(updated || store);
      setMessage('Store profile updated successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async () => {
    try {
      setError('');
      setMessage('');
      const result = await toggleMyMerchantOnline();
      setStore((prev) => ({ ...(prev || {}), isOnline: !!result?.isOnline }));
      setMessage(result?.isOnline ? 'Store is now online.' : 'Store is now offline.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not update store status.');
    }
  };

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <MerchantPageHeader
          title={
            <>
              Store <span className="text-teal">Profile</span>
            </>
          }
          subtitle="Customize your public store presence"
        />
        <div className="flex gap-2.5">
          <button onClick={save} disabled={saving || loading} className="bg-teal text-navy hover:bg-teal2 disabled:opacity-70 flex items-center gap-1.5 rounded border border-transparent px-4 py-1.5 text-[0.8rem] font-bold transition-colors">
            <Save size={14} strokeWidth={3} /> {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      {message ? <div className="mb-4 rounded border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-300">{message}</div> : null}
      {error ? <div className="mb-4 rounded border border-red/30 bg-red/10 px-4 py-2 text-sm text-red-300">{error}</div> : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Banner and logo preview removed per UX request */}

          <div className="space-y-6">
            <div className="bg-card hover:border-teal/20 transition-colors rounded-lg border border-white/[0.07] p-6 lg:p-8">
              <h3 className="mb-6 flex items-center gap-2 font-syne text-[1.1rem] font-bold text-white">
                <Store size={18} className="text-teal" /> General Info
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="text-gray mb-2 block text-[0.7rem] font-bold tracking-widest uppercase">Store Name</label>
                  <input value={form.storeName} onChange={(e) => update('storeName', e.target.value)} className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-4 py-3 text-[0.88rem] text-white outline-none transition-colors" />
                </div>

                <div>
                  <label className="text-gray mb-2 block text-[0.7rem] font-bold tracking-widest uppercase">Store Bio</label>
                  <textarea value={form.description} onChange={(e) => update('description', e.target.value)} className="bg-navy3 focus:border-teal h-28 w-full rounded border border-white/[0.07] px-4 py-3 text-[0.88rem] text-white outline-none transition-colors resize-none leading-relaxed" />
                </div>

                {/* Logo and Banner URL inputs removed per UX request */}
              </div>
            </div>

            <div className="bg-card hover:border-teal/20 transition-colors rounded-lg border border-white/[0.07] p-6 lg:p-8">
              <h3 className="mb-6 flex items-center gap-2 font-syne text-[1.1rem] font-bold text-white">
                <MapPin size={18} className="text-teal" /> Business Address
              </h3>

              <div className="grid grid-cols-1 gap-5 min-[580px]:grid-cols-2">
                <div className="col-span-full">
                  <label className="text-gray mb-2 block text-[0.7rem] font-bold tracking-widest uppercase">Street Address</label>
                  <input value={form.address} onChange={(e) => update('address', e.target.value)} className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-4 py-3 text-[0.88rem] text-white outline-none transition-colors" />
                </div>

                <div>
                  <label className="text-gray mb-2 block text-[0.7rem] font-bold tracking-widest uppercase">City</label>
                  <input value={form.city} onChange={(e) => update('city', e.target.value)} className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-4 py-3 text-[0.88rem] text-white outline-none transition-colors" />
                </div>

                <div>
                  <label className="text-gray mb-2 block text-[0.7rem] font-bold tracking-widest uppercase">State / ZIP</label>
                  <div className="flex gap-3">
                    <input value={form.state} onChange={(e) => update('state', e.target.value)} className="bg-navy3 focus:border-teal w-20 rounded border border-white/[0.07] px-4 py-3 text-[0.88rem] text-white outline-none text-center transition-colors" />
                    <input value={form.zip} onChange={(e) => update('zip', e.target.value)} className="bg-navy3 focus:border-teal flex-1 rounded border border-white/[0.07] px-4 py-3 text-[0.88rem] text-white outline-none transition-colors" />
                  </div>
                </div>

                <div className="col-span-full">
                  <label className="text-gray mb-2 block text-[0.7rem] font-bold tracking-widest uppercase">Country</label>
                  <select value={form.country} onChange={(e) => update('country', e.target.value)} className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-4 py-3 text-[0.88rem] text-white outline-none cursor-pointer transition-colors">
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card hover:border-teal/20 transition-colors rounded-lg border border-white/[0.07] p-6 lg:p-8">
            <h3 className="mb-6 font-syne text-[1.1rem] font-bold text-white">Contact & Social</h3>
            <div className="space-y-3">
              <label className="bg-navy3 flex items-center gap-3 rounded border border-white/[0.07] px-3 py-2">
                <Mail size={16} className="text-gray" />
                <input value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full bg-transparent text-[0.88rem] text-white outline-none" placeholder="support@store.com" />
              </label>
              <label className="bg-navy3 flex items-center gap-3 rounded border border-white/[0.07] px-3 py-2">
                <Phone size={16} className="text-gray" />
                <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="w-full bg-transparent text-[0.88rem] text-white outline-none" placeholder="+1..." />
              </label>
              <label className="bg-navy3 flex items-center gap-3 rounded border border-white/[0.07] px-3 py-2">
                <Globe size={16} className="text-gray" />
                <input value={form.website} onChange={(e) => update('website', e.target.value)} className="w-full bg-transparent text-[0.88rem] text-white outline-none" placeholder="https://..." />
              </label>
            </div>
          </div>

          <div className="bg-card hover:border-teal/20 transition-colors rounded-lg border border-white/[0.07] p-6 lg:p-8">
            <h3 className="mb-6 flex items-center gap-2 font-syne text-[1.1rem] font-bold text-white">
              <Clock size={16} className="text-teal" /> Store Status
            </h3>
            <div className="flex items-center justify-between p-4 bg-navy3 rounded-lg border border-white/[0.07]">
              <div>
                <div className="text-[0.88rem] font-bold text-white mb-1">{store?.isOnline ? 'Open for Orders' : 'Offline'}</div>
                <div className="text-[0.7rem] font-bold uppercase tracking-widest text-teal">{store?.isOnline ? 'Publicly visible' : 'Hidden from customers'}</div>
              </div>
              <button onClick={toggleStatus} className={`relative h-6 w-11 rounded-full cursor-pointer transition-colors ${store?.isOnline ? 'bg-teal shadow-[0_0_15px_rgba(0,201,167,0.3)]' : 'bg-white/20'}`}>
                <span className={`absolute top-[2px] h-5 w-5 rounded-full bg-navy shadow-sm transition-all ${store?.isOnline ? 'right-[2px]' : 'left-[2px]'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantProfile;
