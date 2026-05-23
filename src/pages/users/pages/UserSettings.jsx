import React, { useEffect, useState } from 'react';
import UserPageHeader from '../components/UserPageHeader';
import UserToggle from '../components/UserToggle';
import LoadingFallback from '../../../router/components/LoadingFallback';
import {
  changeMyPassword,
  deleteMyAccount,
  deactivateMyAccount,
  getMySettings,
  updateMySettings,
} from '../../../services/userService';
import { logout } from '../../../services/authService';
import { useNavigate } from 'react-router-dom';

const defaultSettings = {
  notifications: {
    'order-updates': true,
    offers: true,
    arrivals: false,
    'price-drops': true,
  },
  security: {
    'two-factor': false,
    'login-alerts': true,
  },
};

const notificationSettings = [
  {
    id: 'order-updates',
    label: 'Order Updates',
    sub: 'Email and push notifications for order status',
    on: true,
  },
  {
    id: 'offers',
    label: 'Promotional Offers',
    sub: 'Deals, discounts and flash sales',
    on: true,
  },
  {
    id: 'arrivals',
    label: 'New Arrivals',
    sub: 'Alerts for new products in your categories',
    on: false,
  },
  {
    id: 'price-drops',
    label: 'Wishlist Price Drops',
    sub: 'Notify when wishlist items go on sale',
    on: true,
  },
];

const securitySettings = [
  {
    id: 'two-factor',
    label: 'Two-Factor Authentication',
    sub: 'Add an extra layer of protection',
    on: false,
  },
  {
    id: 'login-alerts',
    label: 'Login Alerts',
    sub: 'Email me when someone signs into my account',
    on: true,
  },
];

const UserSettings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(defaultSettings);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [deleteForm, setDeleteForm] = useState({ confirmText: '', currentPassword: '' });
  const [loading, setLoading] = useState(true);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const payload = await getMySettings();
        setSettings({
          notifications: {
            ...defaultSettings.notifications,
            ...(payload?.notifications || {}),
          },
          security: {
            ...defaultSettings.security,
            ...(payload?.security || {}),
          },
        });
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load settings.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const updateSetting = (group, key) => async (value) => {
    const previous = settings;
    const next = {
      ...settings,
      [group]: {
        ...settings[group],
        [key]: value,
      },
    };

    setSettings(next);

    try {
      setSavingSettings(true);
      setError('');
      setMessage('');
      const saved = await updateMySettings({
        [group]: {
          [key]: value,
        },
      });
      setSettings({
        notifications: {
          ...defaultSettings.notifications,
          ...(saved?.notifications || {}),
        },
        security: {
          ...defaultSettings.security,
          ...(saved?.security || {}),
        },
      });
      setMessage('Preferences updated successfully.');
    } catch (err) {
      setSettings(previous);
      setError(err?.response?.data?.message || 'Unable to update settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handlePasswordChange = (field) => (event) => {
    setPasswordForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error('New passwords do not match.');
      }
      setSavingPassword(true);
      setError('');
      setMessage('');
      await changeMyPassword(passwordForm.currentPassword, passwordForm.newPassword);
      setMessage('Password updated successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Unable to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeactivate = async () => {
    const confirmed = window.confirm('Deactivate your account? You can contact support to restore it later.');
    if (!confirmed) return;
    try {
      setError('');
      setMessage('');
      await deactivateMyAccount();
      setMessage('Account deactivated. Please sign in again if needed.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to deactivate account.');
    }
  };

  const handleDeleteField = (field) => (event) => {
    setDeleteForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleDeleteAccount = async (event) => {
    event.preventDefault();

    if (deleteForm.confirmText.trim().toUpperCase() !== 'DELETE') {
      setError('Type DELETE to confirm permanent account deletion.');
      return;
    }

    try {
      setDeletingAccount(true);
      setError('');
      setMessage('');
      await deleteMyAccount(deleteForm.confirmText, deleteForm.currentPassword.trim());
      await logout().catch(() => undefined);
      navigate('/auth/login', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to delete account.');
    } finally {
      setDeletingAccount(false);
    }
  };

  if (loading) return <LoadingFallback />;

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <div className="mb-5">
        <UserPageHeader
          title={
            <span>
              Account <span className="text-teal">Settings</span>
            </span>
          }
          subtitle="Manage your preferences and security"
        />
      </div>

      {error ? <div className="mb-4 rounded border border-red/30 bg-red/10 px-4 py-2 text-sm text-red-300">{error}</div> : null}
      {message ? <div className="mb-4 rounded border border-teal/30 bg-teal/10 px-4 py-2 text-sm text-teal">{message}</div> : null}
      {savingSettings ? <div className="mb-4 text-sm text-gray2">Saving preferences...</div> : null}

      <div className="space-y-4">
        <div className="bg-card rounded-md border border-white/[0.07] p-5">
          <h3 className="mb-4 font-['Syne'] text-[1rem] font-bold text-white">Notifications</h3>
          {notificationSettings.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b border-white/[0.07] py-3.5 last:border-b-0"
            >
              <div>
                <div className="text-[0.875rem] font-medium text-white">{item.label}</div>
                <div className="text-gray text-[0.875rem]">{item.sub}</div>
              </div>
              <UserToggle defaultOn={settings.notifications[item.id]} onChange={updateSetting('notifications', item.id)} />
            </div>
          ))}
        </div>

        <div className="bg-card rounded-md border border-white/[0.07] p-5">
          <h3 className="mb-4 font-['Syne'] text-[1rem] font-bold text-white">Security</h3>
          {securitySettings.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b border-white/[0.07] py-3.5 last:border-b-0"
            >
              <div>
                <div className="text-[0.875rem] font-medium text-white">{item.label}</div>
                <div className="text-gray text-[0.875rem]">{item.sub}</div>
              </div>
              <UserToggle defaultOn={settings.security[item.id]} onChange={updateSetting('security', item.id)} />
            </div>
          ))}

          <form onSubmit={submitPassword} className="mt-4 grid grid-cols-1 gap-3 min-[700px]:grid-cols-3">
            <input autoComplete="current-password" value={passwordForm.currentPassword} onChange={handlePasswordChange('currentPassword')} type="password" placeholder="Current password" className="bg-navy3 focus:border-teal rounded border border-white/[0.07] px-3 py-2.5 text-[0.85rem] text-white outline-none" />
            <input autoComplete="new-password" value={passwordForm.newPassword} onChange={handlePasswordChange('newPassword')} type="password" placeholder="New password" className="bg-navy3 focus:border-teal rounded border border-white/[0.07] px-3 py-2.5 text-[0.85rem] text-white outline-none" />
            <input autoComplete="new-password" value={passwordForm.confirmPassword} onChange={handlePasswordChange('confirmPassword')} type="password" placeholder="Confirm password" className="bg-navy3 focus:border-teal rounded border border-white/[0.07] px-3 py-2.5 text-[0.85rem] text-white outline-none" />
            <div className="min-[700px]:col-span-3">
              <button type="submit" disabled={savingPassword} className="bg-teal text-navy hover:bg-teal2 rounded px-4 py-2 text-[0.8rem] font-medium disabled:opacity-70">
                {savingPassword ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-card rounded-md border border-white/[0.07] p-5">
          <h3 className="mb-4 font-['Syne'] text-[1rem] font-bold text-red">Danger Zone</h3>
          <div className="flex items-center justify-between border-b border-white/[0.07] py-3.5">
            <div>
              <div className="text-[0.875rem] font-medium text-white">Deactivate Account</div>
              <div className="text-gray text-[0.875rem]">Temporarily disable your account</div>
            </div>
            <button
              type="button"
              onClick={handleDeactivate}
              className="rounded border border-red/25 bg-red/10 px-3 py-1.5 text-[0.74rem] text-red"
            >
              Deactivate
            </button>
          </div>

          <div className="flex items-center justify-between pt-3.5">
            <div>
              <div className="text-[0.875rem] font-medium text-white">Delete Account</div>
              <div className="text-gray text-[0.875rem]">Permanently delete all your data</div>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm((current) => !current)}
              className="rounded border border-red/25 bg-red/10 px-3 py-1.5 text-[0.74rem] text-red"
            >
              Delete
            </button>
          </div>

          {showDeleteConfirm ? (
            <form onSubmit={handleDeleteAccount} className="mt-4 rounded border border-red/20 bg-red/5 p-4">
              <div className="mb-3 text-[0.8rem] text-gray2">
                This will permanently remove your account, profile, saved addresses, and wishlist. Type DELETE to continue.
              </div>
              <div className="grid gap-3 min-[700px]:grid-cols-2">
                <input
                  autoComplete="off"
                  name="delete-confirmation"
                  value={deleteForm.confirmText}
                  onChange={handleDeleteField('confirmText')}
                  placeholder="Type DELETE"
                  className="bg-navy3 focus:border-red rounded border border-white/[0.07] px-3 py-2.5 text-[0.85rem] text-white outline-none"
                />
                <input
                  autoComplete="new-password"
                  name="delete-account-password"
                  value={deleteForm.currentPassword}
                  onChange={handleDeleteField('currentPassword')}
                  type="password"
                  placeholder="Current password"
                  className="bg-navy3 focus:border-red rounded border border-white/[0.07] px-3 py-2.5 text-[0.85rem] text-white outline-none"
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={deletingAccount}
                  className="rounded border border-red/40 bg-red px-4 py-2 text-[0.8rem] font-medium text-white disabled:opacity-70"
                >
                  {deletingAccount ? 'Deleting...' : 'Permanently Delete Account'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteForm({ confirmText: '', currentPassword: '' });
                  }}
                  className="rounded border border-white/[0.12] bg-transparent px-4 py-2 text-[0.8rem] font-medium text-gray2"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
