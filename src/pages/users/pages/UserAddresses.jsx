import React, { useEffect, useMemo, useState } from 'react';
import UserPageHeader from '../components/UserPageHeader';
import LoadingFallback from '../../../router/components/LoadingFallback';
import {
  createMyAddress,
  deleteMyAddress,
  getMyAddresses,
  setMyDefaultAddress,
  updateMyAddress,
} from '../../../services/userService';

const emptyForm = {
  type: 'home',
  fullName: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'United States',
  isDefault: false,
};

const COUNTRY_OPTIONS = ['United States', 'Canada', 'Mexico'];

const STATE_OPTIONS_BY_COUNTRY = {
  'United States': [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida',
    'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
    'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska',
    'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas',
    'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
  ],
  Canada: [
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Nova Scotia',
    'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan',
  ],
  Mexico: [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Coahuila',
    'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Mexico City', 'Mexico State',
    'Michoacan', 'Morelos', 'Nayarit', 'Nuevo Leon', 'Oaxaca', 'Puebla', 'Queretaro', 'Quintana Roo',
    'San Luis Potosi', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatan', 'Zacatecas',
  ],
};

const REQUIRED_ADDRESS_FIELDS = ['fullName', 'email', 'phone', 'addressLine1', 'city', 'state', 'zipCode', 'country'];

const REQUIRED_ADDRESS_LABELS = {
  fullName: 'Full Name',
  email: 'Email',
  phone: 'Phone',
  addressLine1: 'Address Line 1',
  city: 'City',
  state: 'State/Province',
  zipCode: 'ZIP Code',
  country: 'Country',
};

const UserAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const payload = await getMyAddresses();
        setAddresses(Array.isArray(payload) ? payload : []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load addresses.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const activeAddressCount = useMemo(() => addresses.length, [addresses]);
  const stateOptions = STATE_OPTIONS_BY_COUNTRY[form.country] || [];

  useEffect(() => {
    const options = STATE_OPTIONS_BY_COUNTRY[form.country] || [];
    if (form.state && !options.includes(form.state)) {
      setForm((current) => ({ ...current, state: '' }));
    }
  }, [form.country, form.state]);

  const handleChange = (field) => (event) => {
    const value = field === 'isDefault' ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const startEdit = (address) => {
    setEditingId(address.id);
    setMessage('');
    setError('');
    setForm({
      type: address.type || 'home',
      fullName: address.fullName || '',
      email: address.email || '',
      phone: address.phone || '',
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || '',
      country: address.country || 'United States',
      isDefault: Boolean(address.isDefault),
    });
  };

  const resetForm = () => {
    setEditingId('');
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const missingFields = REQUIRED_ADDRESS_FIELDS
      .filter((field) => !String(form[field] || '').trim())
      .map((field) => REQUIRED_ADDRESS_LABELS[field] || field);

    if (missingFields.length > 0) {
      setError(`Please fill required fields: ${missingFields.join(', ')}`);
      setMessage('');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');
      const payload = {
        ...form,
        type: form.type || 'home',
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zipCode: form.zipCode.trim(),
        country: form.country.trim(),
      };
      const saved = editingId ? await updateMyAddress(editingId, payload) : await createMyAddress(payload);
      setAddresses((current) => {
        if (editingId) {
          return current.map((address) => (address.id === saved.id ? saved : address));
        }
        return [saved, ...current.filter((address) => address.id !== saved.id)];
      });
      setMessage(editingId ? 'Address updated.' : 'Address added.');
      resetForm();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to save address.');
    } finally {
      setSaving(false);
    }
  };

  const handleDefault = async (addressId) => {
    try {
      setError('');
      setMessage('');
      const saved = await setMyDefaultAddress(addressId);
      setAddresses((current) => current.map((address) => ({
        ...address,
        isDefault: address.id === saved.id,
      })));
      setMessage('Default address updated.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to set default address.');
    }
  };

  const handleDelete = async (addressId) => {
    try {
      setError('');
      setMessage('');
      await deleteMyAddress(addressId);
      setAddresses((current) => current.filter((address) => address.id !== addressId));
      if (editingId === addressId) resetForm();
      setMessage('Address deleted.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to delete address.');
    }
  };

  if (loading) return <LoadingFallback />;

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <div className="mb-5">
        <UserPageHeader
          title={
            <span>
              My <span className="text-teal">Addresses</span>
            </span>
          }
          subtitle="Manage your delivery addresses"
        />
      </div>

      {error ? <div className="mb-4 rounded border border-red/30 bg-red/10 px-4 py-2 text-sm text-red-300">{error}</div> : null}
      {message ? <div className="mb-4 rounded border border-teal/30 bg-teal/10 px-4 py-2 text-sm text-teal">{message}</div> : null}

      <form onSubmit={handleSubmit} className="bg-card mb-4 rounded-md border border-white/[0.07] p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-['Syne'] text-[1rem] font-bold text-white">
            {editingId ? 'Edit Address' : 'Add New Address'}
          </h3>
          <div className="text-gray text-sm">{activeAddressCount}/10 saved addresses</div>
        </div>

        <div className="grid grid-cols-1 gap-4 min-[700px]:grid-cols-2">
          <div>
            <label className="text-gray mb-1 block text-[0.7rem] font-medium tracking-widest uppercase">Type</label>
            <select value={form.type} onChange={handleChange('type')} className="bg-navy3 w-full rounded border border-white/[0.07] px-3 py-2.5 text-[0.85rem] text-white outline-none">
              <option value="home">Home</option>
              <option value="work">Work</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-gray mb-1 block text-[0.7rem] font-medium tracking-widest uppercase">Full Name</label>
            <input value={form.fullName} onChange={handleChange('fullName')} className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-3 py-2.5 text-[0.875rem] text-white outline-none" />
          </div>
          <div>
            <label className="text-gray mb-1 block text-[0.7rem] font-medium tracking-widest uppercase">Phone</label>
            <input value={form.phone} onChange={handleChange('phone')} className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-3 py-2.5 text-[0.875rem] text-white outline-none" />
          </div>
          <div>
            <label className="text-gray mb-1 block text-[0.7rem] font-medium tracking-widest uppercase">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-3 py-2.5 text-[0.875rem] text-white outline-none"
            />
          </div>
          <div>
            <label className="text-gray mb-1 block text-[0.7rem] font-medium tracking-widest uppercase">Address Line 1</label>
            <input value={form.addressLine1} onChange={handleChange('addressLine1')} className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-3 py-2.5 text-[0.875rem] text-white outline-none" />
          </div>
          <div>
            <label className="text-gray mb-1 block text-[0.7rem] font-medium tracking-widest uppercase">Address Line 2</label>
            <input value={form.addressLine2} onChange={handleChange('addressLine2')} className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-3 py-2.5 text-[0.875rem] text-white outline-none" />
          </div>
          <div>
            <label className="text-gray mb-1 block text-[0.7rem] font-medium tracking-widest uppercase">City</label>
            <input value={form.city} onChange={handleChange('city')} className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-3 py-2.5 text-[0.875rem] text-white outline-none" />
          </div>
          <div>
            <label className="text-gray mb-1 block text-[0.7rem] font-medium tracking-widest uppercase">State</label>
            <select value={form.state} onChange={handleChange('state')} className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-3 py-2.5 text-[0.875rem] text-white outline-none">
              <option value="">Select state/province</option>
              {stateOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-gray mb-1 block text-[0.7rem] font-medium tracking-widest uppercase">ZIP Code</label>
            <input value={form.zipCode} onChange={handleChange('zipCode')} className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-3 py-2.5 text-[0.875rem] text-white outline-none" />
          </div>
          <div>
            <label className="text-gray mb-1 block text-[0.7rem] font-medium tracking-widest uppercase">Country</label>
            <select value={form.country} onChange={handleChange('country')} className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-3 py-2.5 text-[0.875rem] text-white outline-none">
              {COUNTRY_OPTIONS.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-white">
          <input type="checkbox" checked={form.isDefault} onChange={handleChange('isDefault')} />
          Set as default address
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="submit" disabled={saving} className="bg-teal text-navy hover:bg-teal2 rounded px-4 py-2 text-[0.8rem] font-medium disabled:opacity-70">
            {saving ? 'Saving...' : editingId ? 'Update Address' : '+ Add Address'}
          </button>
          {editingId ? (
            <button type="button" onClick={resetForm} className="text-gray2 hover:border-teal hover:text-teal rounded border border-white/[0.07] px-4 py-2 text-[0.8rem]">
              Cancel Edit
            </button>
          ) : null}
        </div>
      </form>

      <div className="space-y-3">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`bg-card relative flex flex-wrap items-start gap-3 rounded-md border p-4 ${
              address.isDefault ? 'border-teal/40' : 'border-white/[0.07]'
            }`}
          >
            <div className="bg-navy3 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/[0.07] text-[1.1rem]">
              {String(address.type || 'home').charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <div className="text-teal mb-1 text-[0.68rem] font-semibold tracking-widest uppercase">
                {address.type || 'home'}
              </div>
              <div className="text-[0.875rem] leading-relaxed text-white">
                <div>{address.addressLine1}</div>
                {address.addressLine2 ? <div>{address.addressLine2}</div> : null}
                <div>{address.city}, {address.state} {address.zipCode}</div>
                <div>{address.country}</div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(address)}
                  className="text-gray2 hover:border-teal hover:text-teal rounded border border-white/[0.07] px-3 py-1 text-[0.74rem]"
                >
                  Edit
                </button>
                {!address.isDefault ? (
                  <button
                    type="button"
                    onClick={() => handleDefault(address.id)}
                    className="text-gray2 hover:border-teal hover:text-teal rounded border border-white/[0.07] px-3 py-1 text-[0.74rem]"
                  >
                    Set Default
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => handleDelete(address.id)}
                  className="rounded border border-red/25 bg-red/10 px-3 py-1 text-[0.74rem] text-red"
                >
                  Delete
                </button>
              </div>
            </div>

            {address.isDefault ? (
              <div className="absolute top-3 right-3 rounded-full border border-teal/35 bg-teal/10 px-2 py-0.5 text-[0.62rem] font-semibold text-teal">
                Default
              </div>
            ) : null}
          </div>
        ))}

      </div>
    </div>
  );
};

export default UserAddresses;
