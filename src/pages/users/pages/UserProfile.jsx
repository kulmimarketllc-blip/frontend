import React, { useEffect, useMemo, useState } from 'react';
import UserPageHeader from '../components/UserPageHeader';
import LoadingFallback from '../../../router/components/LoadingFallback';
import { getMyProfile, updateMyProfile } from '../../../services/userService';
import { setUser } from '../../../utils/storage';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const user = await getMyProfile();
        setProfile(user);
        setForm({
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          phone: user?.phone || '',
        });
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load profile.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const initials = useMemo(() => {
    const first = profile?.firstName?.[0] || 'U';
    const last = profile?.lastName?.[0] || '';
    return `${first}${last}`.toUpperCase();
  }, [profile]);

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      setMessage('');
      const updated = await updateMyProfile(form);
      setProfile(updated);
      setUser(updated);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingFallback />;

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <div className="mb-5">
        <UserPageHeader
          title={
            <span>
              My <span className="text-teal">Profile</span>
            </span>
          }
          subtitle="Manage your personal information"
        />
      </div>

      {error ? <div className="mb-4 rounded border border-red/30 bg-red/10 px-4 py-2 text-sm text-red-300">{error}</div> : null}
      {message ? <div className="mb-4 rounded border border-teal/30 bg-teal/10 px-4 py-2 text-sm text-teal">{message}</div> : null}

      <form onSubmit={handleSave} className="bg-card rounded-md border border-white/[0.07] p-5">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} alt="Profile avatar" className="h-18 w-18 rounded-full object-cover" />
          ) : (
            <div className="from-teal to-blue-500 text-navy flex h-18 w-18 items-center justify-center rounded-full bg-linear-to-br font-['Syne'] text-[1.3rem] font-bold">
              {initials}
            </div>
          )}
          <div>
            <div className="font-['Syne'] text-[1.06rem] font-bold text-white">{profile?.firstName} {profile?.lastName}</div>
            <div className="text-gray mt-0.5 text-[0.875rem]">
              Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'recently'}
            </div>
            <div className="mt-1 inline-flex items-center rounded-full border border-teal/40 bg-teal/10 px-2 py-0.5 text-[0.65rem] font-medium text-teal">
              {profile?.isVerified ? 'Verified Member' : 'Account Pending Verification'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 min-[700px]:grid-cols-2">
          <div>
            <label className="text-gray mb-1 block text-[0.7rem] font-medium tracking-widest uppercase">
              First Name
            </label>
            <input
              value={form.firstName}
              onChange={handleChange('firstName')}
              className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-3 py-2.5 text-[0.875rem] text-white outline-none"
            />
          </div>
          <div>
            <label className="text-gray mb-1 block text-[0.7rem] font-medium tracking-widest uppercase">
              Last Name
            </label>
            <input
              value={form.lastName}
              onChange={handleChange('lastName')}
              className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-3 py-2.5 text-[0.85rem] text-white outline-none"
            />
          </div>

          <div className="min-[700px]:col-span-2">
            <label className="text-gray mb-1 block text-[0.7rem] font-medium tracking-widest uppercase">
              Email Address
            </label>
            <input
              value={profile?.email || ''}
              readOnly
              className="bg-navy3 w-full cursor-not-allowed rounded border border-white/[0.07] px-3 py-2.5 text-[0.85rem] text-gray outline-none"
            />
          </div>

          <div>
            <label className="text-gray mb-1 block text-[0.7rem] font-medium tracking-widest uppercase">
              Phone Number
            </label>
            <input
              value={form.phone}
              onChange={handleChange('phone')}
              className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-3 py-2.5 text-[0.85rem] text-white outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-teal text-navy hover:bg-teal2 mt-4 rounded px-4 py-2 text-[0.82rem] font-medium disabled:opacity-70"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default UserProfile;
