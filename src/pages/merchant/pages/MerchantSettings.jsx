import React, { useEffect, useState } from 'react';
import { Save, Shield, User } from 'lucide-react';
import MerchantPageHeader from '../components/MerchantPageHeader';
import LoadingFallback from '../../../router/components/LoadingFallback';
import { getMyProfile, updateMyProfile } from '../../../services/userService';
import { setUser } from '../../../utils/storage';
import { Eye, EyeOff } from 'lucide-react';

const MerchantSettings = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const user = await getMyProfile();
        setProfile(user);
        setForm(prev => ({
          ...prev,
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
          phone: user?.phone || '',
        }));
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load profile.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const toggleShowPassword = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      if (form.newPassword || form.currentPassword) {
        if (form.newPassword !== form.confirmPassword) {
          throw new Error('New passwords do not match.');
        }
        if (!form.currentPassword) {
          throw new Error('Current password is required to set a new password.');
        }
      }

      setSaving(true);
      setError('');
      setMessage('');

      const formData = new FormData();
      formData.append('firstName', form.firstName);
      formData.append('lastName', form.lastName);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      
      if (form.newPassword) {
        formData.append('currentPassword', form.currentPassword);
        formData.append('newPassword', form.newPassword);
      }

      const updated = await updateMyProfile(formData);
      setProfile(updated);
      setUser(updated);
      setMessage('Account settings updated successfully.');
      
      // Clear password fields on success
      setForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to update account settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingFallback />;

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <MerchantPageHeader
          title={
            <>
              Account <span className="text-teal">Settings</span>
            </>
          }
          subtitle="Manage your personal information and security"
        />
        <div className="flex gap-2.5">
          <button onClick={handleSave} disabled={saving} className="bg-teal text-navy hover:bg-teal2 disabled:opacity-70 flex items-center gap-1.5 rounded border border-transparent px-4 py-1.5 text-[0.85rem] font-bold transition-colors">
            <Save size={14} strokeWidth={3} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {message ? <div className="mb-4 rounded border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-300">{message}</div> : null}
      {error ? <div className="mb-4 rounded border border-red/30 bg-red/10 px-4 py-2 text-sm text-red-300">{error}</div> : null}

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-6">
        {/* Personal Information */}
        <div className="space-y-6">
          <div className="bg-card hover:border-teal/20 transition-colors rounded-lg border border-white/[0.07] p-6 lg:p-8">
            <h3 className="mb-6 flex items-center gap-2 font-syne text-[1.1rem] font-bold text-white">
              <User size={18} className="text-teal" /> Personal Information
            </h3>

            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 min-[580px]:grid-cols-2">
                <div>
                  <label className="text-gray mb-2 block text-[0.7rem] font-bold tracking-widest uppercase">First Name</label>
                  <input value={form.firstName} onChange={handleChange('firstName')} className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-4 py-3 text-[0.88rem] text-white outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-gray mb-2 block text-[0.7rem] font-bold tracking-widest uppercase">Last Name</label>
                  <input value={form.lastName} onChange={handleChange('lastName')} className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-4 py-3 text-[0.88rem] text-white outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-gray mb-2 block text-[0.7rem] font-bold tracking-widest uppercase">Email Address</label>
                  <input value={form.email} onChange={handleChange('email')} type="email" className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-4 py-3 text-[0.88rem] text-white outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-gray mb-2 block text-[0.7rem] font-bold tracking-widest uppercase">Phone Number</label>
                  <input value={form.phone} onChange={handleChange('phone')} className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-4 py-3 text-[0.88rem] text-white outline-none transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Password */}
        <div className="space-y-6">
          <div className="bg-card hover:border-teal/20 transition-colors rounded-lg border border-white/[0.07] p-6 lg:p-8">
            <h3 className="mb-6 flex items-center gap-2 font-syne text-[1.1rem] font-bold text-white">
              <Shield size={18} className="text-teal" /> Security
            </h3>
            <p className="text-gray mb-5 text-[0.85rem]">Update your password to keep your account secure. Leave blank if you don't want to change it.</p>

            <div className="space-y-5 max-w-xl">
              <div className="relative">
                <label className="text-gray mb-2 block text-[0.7rem] font-bold tracking-widest uppercase">Current Password</label>
                <input value={form.currentPassword} onChange={handleChange('currentPassword')} type={showPasswords.current ? 'text' : 'password'} className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-4 py-3 pr-10 text-[0.88rem] text-white outline-none transition-colors" />
                <button type="button" onClick={() => toggleShowPassword('current')} className="text-gray hover:text-teal absolute bottom-3 right-3 cursor-pointer transition-colors" tabIndex={-1}>
                  {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="relative">
                <label className="text-gray mb-2 block text-[0.7rem] font-bold tracking-widest uppercase">New Password</label>
                <input value={form.newPassword} onChange={handleChange('newPassword')} type={showPasswords.new ? 'text' : 'password'} className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-4 py-3 pr-10 text-[0.88rem] text-white outline-none transition-colors" />
                <button type="button" onClick={() => toggleShowPassword('new')} className="text-gray hover:text-teal absolute bottom-3 right-3 cursor-pointer transition-colors" tabIndex={-1}>
                  {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="relative">
                <label className="text-gray mb-2 block text-[0.7rem] font-bold tracking-widest uppercase">Confirm New Password</label>
                <input value={form.confirmPassword} onChange={handleChange('confirmPassword')} type={showPasswords.confirm ? 'text' : 'password'} className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-4 py-3 pr-10 text-[0.88rem] text-white outline-none transition-colors" />
                <button type="button" onClick={() => toggleShowPassword('confirm')} className="text-gray hover:text-teal absolute bottom-3 right-3 cursor-pointer transition-colors" tabIndex={-1}>
                  {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MerchantSettings;
