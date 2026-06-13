import React, { useEffect, useMemo, useState } from 'react';
import UserPageHeader from '../components/UserPageHeader';

const STORAGE_KEY = 'kulmi_saved_payment_methods';

const defaultMethods = [];

const readMethods = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : defaultMethods;
    return Array.isArray(parsed) ? parsed : defaultMethods;
  } catch {
    return defaultMethods;
  }
};

const writeMethods = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const brandLogo = {
  visa: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Visa_Inc._logo_%281999%E2%80%932005%29.svg',
  mastercard: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/MasterCard_Logo.svg/1280px-MasterCard_Logo.svg.png',
  amex: 'https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg',
  paypal: 'https://1000logos.net/wp-content/uploads/2017/05/Font-Paypal-Logo-500x326.jpg',
};

const UserPayments = () => {
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({
    brand: 'visa',
    holder: '',
    last4: '',
    expMonth: '',
    expYear: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    setPayments(readMethods());
  }, []);

  const defaultMethod = useMemo(() => payments.find((payment) => payment.isDefault), [payments]);

  const savePayments = (next) => {
    setPayments(next);
    writeMethods(next);
  };

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const addPayment = (event) => {
    event.preventDefault();
    const method = {
      id: `${form.brand}-${form.last4}-${Date.now()}`,
      label: form.brand.toUpperCase(),
      logoSrc: brandLogo[form.brand] || brandLogo.visa,
      number: `${form.brand.toUpperCase()} ending in ···· ${String(form.last4).slice(-4)}`,
      exp: `Expires ${String(form.expMonth).padStart(2, '0')} / ${String(form.expYear).slice(-2)}`,
      holder: form.holder,
      brand: form.brand,
      last4: String(form.last4).slice(-4),
      isDefault: payments.length === 0,
    };

    const next = method.isDefault ? [method, ...payments.map((item) => ({ ...item, isDefault: false }))] : [method, ...payments];
    savePayments(next);
    setMessage('Payment method saved in this browser.');
    setForm({ brand: 'visa', holder: '', last4: '', expMonth: '', expYear: '' });
  };

  const setDefault = (paymentId) => {
    const next = payments.map((payment) => ({
      ...payment,
      isDefault: payment.id === paymentId,
    }));
    savePayments(next);
    setMessage('Default payment method updated.');
  };

  const removePayment = (paymentId) => {
    const next = payments.filter((payment) => payment.id !== paymentId);
    if (!next.some((payment) => payment.isDefault) && next.length) {
      next[0].isDefault = true;
    }
    savePayments(next);
    setMessage('Payment method removed.');
  };

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <div className="mb-5">
        <UserPageHeader
          title={
            <span>
              Payment <span className="text-teal">Methods</span>
            </span>
          }
          subtitle="Your saved cards and payment options"
        />
      </div>

      {message ? <div className="mb-4 rounded border border-teal/30 bg-teal/10 px-4 py-2 text-sm text-teal">{message}</div> : null}

      <div className="bg-card mb-4 rounded-md border border-white/[0.07] p-5">
        <h3 className="mb-4 font-['Syne'] text-[1rem] font-bold text-white">Add Payment Method</h3>
        <form onSubmit={addPayment} className="grid grid-cols-1 gap-4 min-[700px]:grid-cols-2">
          <div>
            <label className="text-gray mb-1 block text-[0.7rem] font-medium tracking-widest uppercase">Brand</label>
            <select value={form.brand} onChange={handleChange('brand')} className="bg-navy3 w-full rounded border border-white/[0.07] px-3 py-2.5 text-[0.85rem] text-white outline-none">
              <option value="visa">Visa</option>
              <option value="mastercard">Mastercard</option>
              <option value="amex">American Express</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>
          <div>
            <label className="text-gray mb-1 block text-[0.7rem] font-medium tracking-widest uppercase">Cardholder Name</label>
            <input value={form.holder} onChange={handleChange('holder')} className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-3 py-2.5 text-[0.875rem] text-white outline-none" />
          </div>
          <div>
            <label className="text-gray mb-1 block text-[0.7rem] font-medium tracking-widest uppercase">Last 4 Digits</label>
            <input value={form.last4} onChange={handleChange('last4')} maxLength={4} className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-3 py-2.5 text-[0.875rem] text-white outline-none" />
          </div>
          <div>
            <label className="text-gray mb-1 block text-[0.7rem] font-medium tracking-widest uppercase">Expiry Month</label>
            <input value={form.expMonth} onChange={handleChange('expMonth')} maxLength={2} placeholder="08" className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-3 py-2.5 text-[0.875rem] text-white outline-none" />
          </div>
          <div>
            <label className="text-gray mb-1 block text-[0.7rem] font-medium tracking-widest uppercase">Expiry Year</label>
            <input value={form.expYear} onChange={handleChange('expYear')} maxLength={4} placeholder="2027" className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-3 py-2.5 text-[0.875rem] text-white outline-none" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="bg-teal text-navy hover:bg-teal2 rounded px-4 py-2 text-[0.8rem] font-medium">Save Method</button>
          </div>
        </form>
      </div>

      <div className="space-y-3">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className={`bg-card flex flex-wrap items-center gap-3 rounded-md border p-4 ${
              payment.isDefault ? 'border-teal/40' : 'border-white/[0.07]'
            }`}
          >
            <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded">
              <img
                src={payment.logoSrc}
                alt={payment.label}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="flex-1">
              <div className="text-[0.875rem] font-medium text-white">{payment.number}</div>
              <div className="text-gray mt-0.5 text-[0.875rem]">{payment.exp}</div>
            </div>

            {payment.isDefault ? (
              <span className="rounded-full border border-teal/35 bg-teal/10 px-2 py-0.5 text-[0.62rem] font-semibold text-teal">
                Default
              </span>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDefault(payment.id)}
                  className="text-gray2 hover:border-teal hover:text-teal rounded border border-white/[0.07] px-3 py-1 text-[0.74rem]"
                >
                  Set Default
                </button>
                <button
                  type="button"
                  onClick={() => removePayment(payment.id)}
                  className="rounded border border-red/25 bg-red/10 px-3 py-1 text-[0.74rem] text-red"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}

        {!payments.length ? (
          <div className="bg-card rounded-md border border-dashed border-white/[0.08] p-6 text-center text-gray">
            No saved payment methods yet. Add one above to manage your local wallet preferences.
          </div>
        ) : null}
        {defaultMethod ? <div className="text-gray text-sm">Default method: {defaultMethod.number}</div> : null}
      </div>
    </div>
  );
};

export default UserPayments;
