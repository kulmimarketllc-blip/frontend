import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerMerchant, getCurrentUser } from '../../../services/authService';
import { registerMerchantStore, getMyMerchantStore } from '../../../services/merchantService';
import { 
  Store, 
  Rocket, 
  Image as ImageIcon, 
  Palette, 
  User, 
  Building2, 
  Lock, 
  ClipboardCheck, 
  Send, 
  Banknote, 
  Globe, 
  Package, 
  CreditCard, 
  ShieldCheck, 
  BarChart3, 
  Zap, 
  PartyPopper, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

const CATEGORIES = [
  'Electronics', 'Fashion & Clothing', 'Home & Garden', 'Beauty & Health',
  'Food & Grocery', 'Sports & Outdoors', 'Books & Education', 'Toys & Kids',
  'Automotive', 'Pet Supplies', 'Other',
];

const RETURN_POLICIES = ['7 days return', '14 days return', '30 days return', 'No returns'];

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Somalia',
  'Kenya', 'Ethiopia', 'Uganda', 'Tanzania', 'Other',
];

const BENEFITS = [
  { icon: <Banknote size={16} />, title: 'Low Commission — Only 8%', desc: 'Lower than any other platform' },
  { icon: <Globe size={16} />, title: 'East African Audience', desc: 'Reach thousands of buyers in your community' },
  { icon: <Package size={16} />, title: 'Full Dashboard', desc: 'Manage orders, products & earnings in one place' },
  { icon: <CreditCard size={16} />, title: 'Fast Payouts', desc: 'Paid directly to your bank account' },
  { icon: <ShieldCheck size={16} />, title: 'Seller Protection', desc: 'Dispute resolution and seller support included' },
];

const STATS = [
  { label: 'Active Merchants', value: '500+' },
  { label: 'Products Listed', value: '10,000+' },
  { label: 'Monthly Customers', value: '25,000+' },
  { label: 'Avg Seller Rating', value: '4.8 ★' },
  { label: 'Commission Rate', value: 'Only 8%' },
];

const TIMELINE = [
  { step: 1, title: 'Submit Application', desc: 'Fill in your store details and submit' },
  { step: 2, title: 'Wait for Approval', desc: 'Our team reviews within 1–2 business days' },
  { step: 3, title: 'List Your Products', desc: 'Add products with photos, prices and stock' },
  { step: 4, title: 'Start Selling', desc: 'Receive orders and get paid to your bank' },
];

const STEPS = [
  { num: 1, label: 'Store Info' },
  { num: 2, label: 'Verification' },
  { num: 3, label: 'Review' },
  { num: 4, label: 'Go Live' },
];

/* ── Reusable components ── */
const InputField = ({ label, required, optional, hint, ...props }) => (
  <div className="mb-4">
    <label className="mb-1.5 block text-[0.82rem] font-semibold text-gray2 min-[640px]:text-[0.875rem]">
      {label}
      {required && <span className="ml-0.5 text-teal">*</span>}
      {optional && <span className="ml-1 text-[0.72rem] font-normal text-gray">(optional)</span>}
    </label>
    <input
      className="w-full rounded-lg border border-white/[0.07] bg-navy3 px-4 py-3 font-['DM_Sans'] text-base text-white outline-none placeholder:text-gray transition-all duration-150 focus:border-teal focus:shadow-[0_0_0_3px_rgba(0,201,167,0.1)]"
      {...props}
    />
    {hint && <div className="mt-1.5 text-[0.75rem] text-gray">{hint}</div>}
  </div>
);

const SelectField = ({ label, required, options, placeholder, ...props }) => (
  <div className="mb-4">
    <label className="mb-1.5 block text-[0.82rem] font-semibold text-gray2 min-[640px]:text-[0.875rem]">
      {label}
      {required && <span className="ml-0.5 text-teal">*</span>}
    </label>
    <select
      className="w-full cursor-pointer appearance-none rounded-lg border border-white/[0.07] bg-navy3 bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2712%27%20height=%2712%27%20fill=%27%2364748B%27%20viewBox=%270%200%2016%2016%27%3E%3Cpath%20d=%27M1.5%205.5l6.5%206%206.5-6%27/%3E%3C/svg%3E')] bg-size-[12px] bg-position-[right_13px_center] bg-no-repeat px-4 py-3 font-['DM_Sans'] text-base text-white outline-none transition-all duration-150 focus:border-teal focus:shadow-[0_0_0_3px_rgba(0,201,167,0.1)]"
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  </div>
);

const UploadZone = ({ icon: Icon, text, sub }) => (
  <div className="mb-4">
    <div className="cursor-pointer rounded-xl border-2 border-dashed border-white/[0.07] p-8 text-center transition-all duration-150 hover:border-[rgba(0,201,167,0.25)] hover:bg-[rgba(0,201,167,0.08)] group">
      <div className="mb-3 flex justify-center text-gray transition-colors group-hover:text-teal">
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <div className="mb-1 text-[0.875rem] font-medium text-gray2">{text}</div>
      <div className="text-[0.75rem] text-gray">{sub}</div>
    </div>
  </div>
);

const MerchantRegister = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    storeName: '', storeDescription: '', category: '', returnPolicy: '30 days return',
    firstName: '', lastName: '', email: '', phone: '',
    country: 'United States', city: '',
    businessName: '', taxId: '', businessAddress: '',
    password: '', confirmPassword: '',
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [existingMerchant, setExistingMerchant] = useState(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setIsLoggedIn(true);
      setCurrentUser(user);
      setForm(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
      
      // Check if they already have a merchant application
      getMyMerchantStore().then(m => {
        if (m) {
          setExistingMerchant(m);
          setForm(prev => ({
            ...prev,
            storeName: m.storeName || '',
            storeDescription: m.description || '',
            category: m.businessInfo?.category || '',
            returnPolicy: m.businessInfo?.returnPolicy || '30 days return',
            country: m.businessInfo?.country || 'United States',
            city: m.businessInfo?.city || '',
            businessName: m.businessInfo?.businessName || '',
            taxId: m.businessInfo?.taxId || '',
            businessAddress: m.businessInfo?.businessAddress || '',
          }));
        }
      }).catch(() => {});
    }
  }, []);

  const [agreements, setAgreements] = useState({ terms: true, products: false });
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const toggleAgreement = useCallback((key) => {
    setAgreements((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreements.terms || !agreements.products) {
      setError('Please agree to all terms and conditions.');
      return;
    }
    
    if (!isLoggedIn && form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (isLoggedIn) {
        // Just register/update the store
        await registerMerchantStore({
          storeName: form.storeName,
          description: form.storeDescription,
          businessInfo: {
            category: form.category,
            returnPolicy: form.returnPolicy,
            country: form.country,
            city: form.city,
            businessName: form.businessName,
            taxId: form.taxId,
            businessAddress: form.businessAddress,
          },
        });
        
        setSubmitting(false);
        setShowModal(true);
      } else {
        // Full registration (User + Store)
        const response = await registerMerchant({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          storeName: form.storeName,
          storeDescription: form.storeDescription,
          category: form.category,
          returnPolicy: form.returnPolicy,
          businessInfo: {
            country: form.country,
            city: form.city,
            businessName: form.businessName,
            taxId: form.taxId,
            businessAddress: form.businessAddress,
          },
        });

        setSubmitting(false);
        setShowModal(true);
        
        // Store pending info for OTP view
        localStorage.setItem('pendingUserId', response.userId);
        localStorage.setItem('pendingEmail', form.email);
      }
    } catch (err) {
      setSubmitting(false);
      setError(err?.response?.data?.message || err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-navy font-['DM_Sans'] text-gray2">

      {/* ───── NAV ───── */}
      <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/[0.07] bg-navy2 px-4 min-[640px]:px-10">
        <Link to="/" className="font-['Syne'] text-[1.5rem] font-extrabold text-white no-underline min-[640px]:text-[1.7rem]">
          <span className="text-teal">ES</span>UUQ
        </Link>
        <div className="flex gap-3">
          <Link to="/" className="inline-flex items-center gap-2 rounded-lg border border-white/[0.07] bg-transparent px-5 py-2 text-[0.85rem] font-semibold text-gray2 transition-all duration-150 hover:border-[rgba(0,201,167,0.25)] hover:text-white">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <Link to="/auth/login" className="hidden items-center gap-1.5 rounded-lg bg-teal px-5 py-2 text-[0.85rem] font-semibold text-navy transition-all duration-150 hover:bg-teal2 min-[500px]:inline-flex">
            Sign In
          </Link>
        </div>
      </nav>

      {/* ───── HERO ───── */}
      <div className="border-b border-white/[0.07] bg-[linear-gradient(135deg,var(--color-navy2)_0%,var(--color-navy)_100%)] px-4 py-12 text-center min-[640px]:px-10 min-[900px]:py-20">
        <div className="mb-5 inline-flex items-center gap-2 rounded-[20px] border border-[rgba(0,201,167,0.25)] bg-[rgba(0,201,167,0.08)] px-4 py-1.5 text-[0.75rem] font-semibold tracking-widest text-teal">
          <Rocket size={14} />
          JOIN 500+ MERCHANTS ON Kulmi Market
        </div>
        <h1 className="mb-4 font-['Syne'] text-[1.8rem] font-extrabold leading-[1.1] text-white min-[640px]:text-[3rem] min-[900px]:text-[3.6rem]">
          Start Selling on <span className="text-teal">Kulmi Market</span>
        </h1>
        <p className="mx-auto mb-8 max-w-150 text-base leading-[1.8] text-gray min-[640px]:text-lg">
          Reach thousands of East African customers. Set up your store in minutes and start earning today.
        </p>

        {/* Steps */}
        <div className="flex flex-wrap items-center justify-center gap-y-4">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-2.5">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.9rem] font-bold ${s.num === 1 ? 'bg-teal text-navy' : 'border border-white/[0.07] bg-navy3 text-gray'}`}>
                  {s.num}
                </div>
                <div className={`text-[0.85rem] font-semibold min-[640px]:text-[0.9rem] ${s.num === 1 ? 'text-teal' : 'text-gray'}`}>
                  {s.label}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className="mx-2 h-0.5 w-6 bg-white/[0.07] min-[640px]:mx-4 min-[640px]:w-12" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ───── BODY ───── */}
      <div className="mx-auto grid max-w-360 items-start gap-8 px-4 py-10 min-[640px]:px-10 min-[900px]:grid-cols-[1fr_380px] min-[900px]:py-16">

        {/* ─── FORM ─── */}
        <form className="overflow-hidden rounded-2xl border border-white/[0.07] bg-navy2 shadow-2xl" onSubmit={handleSubmit}>

          {/* Store Information */}
          <div className="border-b border-white/[0.07] px-6 py-8 min-[640px]:px-10">
            <div className="mb-1.5 flex items-center gap-2.5 font-['Syne'] text-[1.1rem] font-bold text-white min-[640px]:text-[1.3rem]">
              <Store className="text-teal" size={20} />
              Store Information
            </div>
            <div className="mb-6 text-[0.875rem] leading-relaxed text-gray min-[640px]:text-base">This is what customers will see when they visit your store.</div>

            <InputField label="Store Name" required name="storeName" value={form.storeName} onChange={handleChange} placeholder="e.g. Barwaaqo Electronics" hint="This will be your public store name on Kulmi Market" />

            <div className="mb-4">
              <label className="mb-1.5 block text-[0.82rem] font-semibold text-gray2 min-[640px]:text-[0.875rem]">
                Store Description <span className="ml-0.5 text-teal">*</span>
              </label>
              <textarea
                className="min-h-27.5 w-full resize-y rounded-lg border border-white/[0.07] bg-navy3 px-4 py-3 font-['DM_Sans'] text-base text-white outline-none placeholder:text-gray transition-all duration-150 focus:border-teal focus:shadow-[0_0_0_3px_rgba(0,201,167,0.1)]"
                name="storeDescription" value={form.storeDescription} onChange={handleChange}
                placeholder="Describe what you sell and what makes your store special..."
                required
              />
            </div>

            <div className="grid gap-4 min-[640px]:grid-cols-2">
              <SelectField label="Main Category" required name="category" value={form.category} onChange={handleChange} placeholder="Select category" options={CATEGORIES} />
              <SelectField label="Return Policy" required name="returnPolicy" value={form.returnPolicy} onChange={handleChange} options={RETURN_POLICIES} />
            </div>

            {/* Store logo and banner removed per request */}
          </div>


          {/* Your Information */}
          {!isLoggedIn ? (
            <div className="border-b border-white/[0.07] px-6 py-8 min-[640px]:px-10">
              <div className="mb-1.5 flex items-center gap-2.5 font-['Syne'] text-[1.1rem] font-bold text-white min-[640px]:text-[1.3rem]">
                <User className="text-teal" size={20} />
                Your Information
              </div>
              <div className="mb-6 text-[0.875rem] leading-relaxed text-gray min-[640px]:text-base">Kept private. Used for account verification only.</div>

              <div className="grid gap-4 min-[640px]:grid-cols-2">
                <InputField label="First Name" required name="firstName" value={form.firstName} onChange={handleChange} placeholder="Ahmed" />
                <InputField label="Last Name" required name="lastName" value={form.lastName} onChange={handleChange} placeholder="Hassan" />
              </div>
              <div className="grid gap-4 min-[640px]:grid-cols-2">
                <InputField label="Email Address" required type="email" name="email" value={form.email} onChange={handleChange} placeholder="ahmed@store.com" />
                <InputField label="Phone Number" required type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 612 555 0198" />
              </div>
              <div className="grid gap-4 min-[640px]:grid-cols-2">
                <SelectField label="Country" required name="country" value={form.country} onChange={handleChange} options={COUNTRIES} />
                <InputField label="City" required name="city" value={form.city} onChange={handleChange} placeholder="Minneapolis" />
              </div>
            </div>
          ) : (
            <div className="border-b border-white/[0.07] px-6 py-8 min-[640px]:px-10 bg-[rgba(0,201,167,0.03)]">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(0,201,167,0.2)] bg-[rgba(0,201,167,0.1)] font-['Syne'] text-xl font-bold text-teal shadow-[0_0_15px_rgba(0,201,167,0.1)]">
                  {currentUser?.firstName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="text-[1rem] font-bold text-white">Logged in as {currentUser?.firstName} {currentUser?.lastName}</div>
                  <div className="text-[0.85rem] text-gray">{currentUser?.email}</div>
                </div>
              </div>
              {existingMerchant?.status === 'rejected' && (
                <div className="rounded-xl bg-red/10 border border-red/20 p-4 text-[0.85rem] text-red leading-relaxed">
                  <div className="font-bold mb-1 flex items-center gap-2">
                    <ShieldCheck size={16} />
                    Previous Application Rejected
                  </div>
                  <p>{existingMerchant.businessInfo?.rejectionReason || 'No specific reason provided.'}</p>
                  <p className="mt-2 font-medium opacity-80">Please update your details below and re-submit for another review.</p>
                </div>
              )}
            </div>
          )}

          {/* Business Details */}
          <div className="border-b border-white/[0.07] px-6 py-8 min-[640px]:px-10">
            <div className="mb-1.5 flex items-center gap-2.5 font-['Syne'] text-[1.1rem] font-bold text-white min-[640px]:text-[1.3rem]">
              <Building2 className="text-teal" size={20} />
              Business Details <span className="ml-2 text-[0.75rem] font-normal text-gray">(Optional)</span>
            </div>
            <div className="mb-6 text-[0.875rem] leading-relaxed text-gray min-[640px]:text-base">If you have a registered business, enter the details here.</div>

            <div className="grid gap-4 min-[640px]:grid-cols-2">
              <InputField label="Business Name" optional name="businessName" value={form.businessName} onChange={handleChange} placeholder="Barwaaqo LLC" />
              <InputField label="Tax ID / Business Number" optional name="taxId" value={form.taxId} onChange={handleChange} placeholder="EIN or Business Number" />
            </div>
            <InputField label="Business Address" optional name="businessAddress" value={form.businessAddress} onChange={handleChange} placeholder="123 Main Street, Minneapolis, MN 55401" />
          </div>

          {/* Password */}
          {!isLoggedIn && (
            <div className="border-b border-white/[0.07] px-6 py-8 min-[640px]:px-10">
              <div className="mb-1.5 flex items-center gap-2.5 font-['Syne'] text-[1.1rem] font-bold text-white min-[640px]:text-[1.3rem]">
                <Lock className="text-teal" size={20} />
                Create Your Password
              </div>
              <div className="mb-6 text-[0.875rem] leading-relaxed text-gray min-[640px]:text-base">Set a strong password to protect your merchant account.</div>

              <div className="grid gap-4 min-[640px]:grid-cols-2">
                <InputField label="Password" required type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 8 characters" />
                <InputField label="Confirm Password" required type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" />
              </div>
            </div>
          )}

          {/* Agreement */}
          <div className="px-6 py-8 min-[640px]:px-10">
            <div className="mb-5 flex items-center gap-2.5 font-['Syne'] text-[1.1rem] font-bold text-white min-[640px]:text-[1.3rem]">
              <ClipboardCheck className="text-teal" size={20} />
              Agreement
            </div>

            <div
              onClick={() => toggleAgreement('terms')}
              className="group mb-4 flex cursor-pointer items-start gap-4 rounded-xl border border-white/[0.07] bg-navy3 p-5 transition-all duration-150 hover:border-[rgba(0,201,167,0.25)] hover:bg-navy3/80"
            >
              <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[0.8rem] transition-all duration-150 ${agreements.terms ? 'border-teal bg-teal font-black text-navy shadow-[0_0_10px_rgba(0,201,167,0.3)]' : 'border border-gray'}`}>
                {agreements.terms && '✓'}
              </div>
              <div className="text-[0.875rem] leading-[1.6] text-gray2">
                I agree to the <a href="#" className="text-teal no-underline hover:underline">Kulmi Market Merchant Terms &amp; Conditions</a> and understand that Kulmi Market charges a commission on each sale. My store will be reviewed before going live.
              </div>
            </div>

            <div
              onClick={() => toggleAgreement('products')}
              className="group mb-4 flex cursor-pointer items-start gap-4 rounded-xl border border-white/[0.07] bg-navy3 p-5 transition-all duration-150 hover:border-[rgba(0,201,167,0.25)] hover:bg-navy3/80"
            >
              <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[0.8rem] transition-all duration-150 ${agreements.products ? 'border-teal bg-teal font-black text-navy shadow-[0_0_10px_rgba(0,201,167,0.3)]' : 'border border-gray'}`}>
                {agreements.products && '✓'}
              </div>
              <div className="text-[0.875rem] leading-[1.6] text-gray2">
                I confirm that all products I list comply with <a href="#" className="text-teal no-underline hover:underline">Kulmi Market's product guidelines</a> and that I will not sell prohibited or counterfeit items.
              </div>
            </div>

            {/* Submit */}
            <div className="mt-8">
              {error && <div className="mb-6 rounded-xl bg-red/10 border border-red/20 p-4 text-center text-[0.875rem] font-medium text-red animate-shake">{error}</div>}
              
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border-none bg-teal px-6 py-4.5 font-['Syne'] text-[1.1rem] font-bold text-navy transition-all duration-150 hover:bg-teal2 hover:shadow-[0_0_30px_rgba(0,201,167,0.3)] disabled:cursor-wait disabled:opacity-70"
              >
                {submitting ? (
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-3 border-navy/20 border-t-navy" />
                    Submitting...
                  </div>
                ) : (
                  <>
                    <Send size={20} />
                    Submit Application
                  </>
                )}
              </button>
              <div className="mt-4 text-center text-[0.85rem] text-gray">
                Applications are reviewed within 1–2 business days
              </div>
            </div>
          </div>
        </form>

        {/* ─── SIDEBAR ─── */}
        <aside className="flex flex-col gap-5 max-[899px]:order-first">

          {/* Benefits */}
          <div className="rounded-2xl border border-white/[0.07] bg-navy2 p-6 min-[640px]:p-8">
            <div className="mb-5 font-['Syne'] text-[1rem] font-bold text-white min-[640px]:text-[1.1rem]">🎯 Why Sell on Kulmi Market?</div>
            <div className="flex flex-col gap-5">
              {BENEFITS.map((b) => (
                <div className="flex items-start gap-4" key={b.title}>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[rgba(0,201,167,0.25)] bg-[rgba(0,201,167,0.08)] text-teal">
                    {b.icon}
                  </div>
                  <div className="text-[0.875rem] leading-normal text-gray2">
                    <strong className="mb-0.5 block text-[0.9rem] text-white">{b.title}</strong>
                    {b.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-2xl border border-white/[0.07] bg-navy2 p-6 min-[640px]:p-8">
            <div className="mb-5 flex items-center gap-2 font-['Syne'] text-[1rem] font-bold text-white min-[640px]:text-[1.1rem]">
              <BarChart3 className="text-teal" size={18} />
              Platform Stats
            </div>
            <div className="flex flex-col gap-3">
              {STATS.map((s) => (
                <div className="flex justify-between border-b border-white/[0.07] pb-3 last:border-b-0 last:pb-0" key={s.label}>
                  <span className="text-[0.85rem] text-gray">{s.label}</span>
                  <span className="text-[0.95rem] font-bold text-teal">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="rounded-2xl border border-white/[0.07] bg-navy2 p-6 min-[640px]:p-8">
            <div className="mb-5 flex items-center gap-2 font-['Syne'] text-[1rem] font-bold text-white min-[640px]:text-[1.1rem]">
              <Zap className="text-teal" size={18} />
              How It Works
            </div>
            <div className="flex flex-col gap-5">
              {TIMELINE.map((t) => (
                <div className="flex gap-4" key={t.step}>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[rgba(0,201,167,0.25)] bg-[rgba(0,201,167,0.08)] text-[0.85rem] font-bold text-teal">
                    {t.step}
                  </div>
                  <div className="pt-0.5 text-[0.875rem] leading-[1.6] text-gray2">
                    <strong className="mb-0.5 block text-white">{t.title}</strong>
                    {t.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ───── SUCCESS MODAL ───── */}
      {showModal && (
        <div
          className="fixed inset-0 z-200 flex animate-[fadeIn_0.25s_ease] items-center justify-center bg-black/80 px-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-110 animate-[slideUp_0.35s_ease] rounded-3xl border border-[rgba(0,201,167,0.25)] bg-navy2 px-8 py-12 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Success Content */}
            <div className="mb-6 flex justify-center text-teal">
              <div className="relative">
                <PartyPopper size={80} strokeWidth={1} className="relative z-10" />
                <div className="absolute inset-0 animate-ping rounded-full bg-teal/20" />
              </div>
            </div>
            
            <div className="mb-3 font-['Syne'] text-[1.8rem] font-bold text-white">Application Submitted!</div>
            
            <div className="mb-8 text-base leading-[1.7] text-gray">
              {isLoggedIn 
                ? 'Your store information has been updated and sent for review. We will contact you within 1–2 business days.'
                : 'Welcome to the Kulmi Market merchant community! Our team will review your application and contact you within 1–2 business days.'
              }
            </div>

            <div className="flex flex-col gap-4">
              {isLoggedIn ? (
                <button
                  onClick={() => navigate('/merchant')}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-none bg-teal px-6 py-4 font-['DM_Sans'] text-[1rem] font-bold text-navy transition-all duration-150 hover:bg-teal2 hover:shadow-[0_0_20px_rgba(0,201,167,0.2)]"
                >
                  <Rocket size={20} />
                  Go to Merchant Panel
                </button>
              ) : (
                <button
                  onClick={() => navigate('/auth/otp', { state: { userId: localStorage.getItem('pendingUserId'), email: localStorage.getItem('pendingEmail') } })}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-none bg-teal px-6 py-4 font-['DM_Sans'] text-[1rem] font-bold text-navy transition-all duration-150 hover:bg-teal2 hover:shadow-[0_0_20px_rgba(0,201,167,0.2)]"
                >
                  <ShieldCheck size={20} />
                  Verify Your Account
                </button>
              )}
              
              <button
                onClick={() => navigate('/')}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-4 font-['DM_Sans'] text-[1rem] font-semibold text-white transition-all duration-150 hover:bg-white/10"
              >
                <ArrowLeft size={18} />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantRegister;
