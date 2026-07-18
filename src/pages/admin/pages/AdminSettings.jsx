import React, { useEffect, useState } from 'react';
import { Save, Settings, DollarSign } from 'lucide-react';
import DashboardPageHeader from '../components/DashboardPageHeader';
import { getAdminSettings, updateAdminSettings } from '../../../services/adminService';

const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'CHF'];

const TIMEZONE_OPTIONS = {
  America: [
    'America/Chicago',
    'America/New_York',
    'America/Los_Angeles',
    'America/Toronto',
    'America/Mexico_City',
  ],
  Europe: [
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Rome',
    'Europe/Madrid',
  ],
};

const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const payload = await getAdminSettings();
      setSettings(payload || null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load settings.');
      setSettings(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateSection = (section, patch) => {
    setSettings((prev) => ({
      ...(prev || {}),
      [section]: {
        ...(prev?.[section] || {}),
        ...patch,
      },
    }));
  };

  const save = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      setError('');
      setMessage('');
      const payload = await updateAdminSettings({
        general: settings.general,
        commission: settings.commission,
      });
      setSettings(payload || settings);
      setMessage('Settings saved successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <DashboardPageHeader
          title={<span>Platform <span className="text-teal">Settings</span></span>}
          subtitle="Configure your marketplace preferences"
        />
        <button onClick={save} disabled={saving || loading || !settings} className="bg-teal text-navy hover:bg-teal2 disabled:opacity-50 flex items-center gap-1.5 rounded px-4 py-1.5 text-[0.8rem] font-medium">
          <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error ? <div className="mb-4 rounded border border-red/30 bg-red/10 px-4 py-2 text-sm text-red-300">{error}</div> : null}
      {message ? <div className="mb-4 rounded border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-300">{message}</div> : null}
      {loading && <div className="mb-4 text-sm text-gray2">Loading settings...</div>}

      <div className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-2">
        <div className="bg-card rounded-md border border-white/[0.07] p-5">
          <h3 className="mb-4 flex items-center gap-2 font-['Syne'] text-[1rem] font-bold text-white">
            <Settings size={16} className="text-teal" /> General Settings
          </h3>
          <div className="mb-3">
            <label className="text-gray mb-1 block text-[0.7rem] font-medium tracking-widest uppercase">Platform Name</label>
            <input value={settings?.general?.platformName || ''} onChange={(e) => updateSection('general', { platformName: e.target.value })} className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-3 py-2.5 text-[0.85rem] text-white transition-colors outline-none" />
          </div>
          <div className="mb-3">
            <label className="text-gray mb-1 block text-[0.7rem] font-medium tracking-widest uppercase">Support Email</label>
            <input value={settings?.general?.supportEmail || ''} onChange={(e) => updateSection('general', { supportEmail: e.target.value })} className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-3 py-2.5 text-[0.85rem] text-white transition-colors outline-none" />
          </div>
          <div className="mb-3">
            <label className="text-gray mb-1 block text-[0.7rem] font-medium tracking-widest uppercase">Default Currency</label>
            <select
              value={settings?.general?.defaultCurrency || 'USD'}
              onChange={(e) => updateSection('general', { defaultCurrency: e.target.value })}
              className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-3 py-2.5 text-[0.85rem] text-white transition-colors outline-none"
            >
              {CURRENCY_OPTIONS.map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="text-gray mb-1 block text-[0.7rem] font-medium tracking-widest uppercase">Timezone</label>
            <select
              value={settings?.general?.timezone || 'America/Chicago'}
              onChange={(e) => updateSection('general', { timezone: e.target.value })}
              className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-3 py-2.5 text-[0.85rem] text-white transition-colors outline-none"
            >
              {Object.entries(TIMEZONE_OPTIONS).map(([region, zones]) => (
                <optgroup key={region} label={region}>
                  {zones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-card rounded-md border border-white/[0.07] p-5">
          <h3 className="mb-4 flex items-center gap-2 font-['Syne'] text-[1rem] font-bold text-white">
            <DollarSign size={16} className="text-teal" /> Commission Settings
          </h3>
          {[['defaultRate', 'Default Commission Rate'], ['electronicsRate', 'Electronics Commission'], ['fashionRate', 'Fashion Commission'], ['foodGroceryRate', 'Food & Grocery Commission']].map(([key, label]) => (
            <div key={key} className="mb-3">
              <label className="text-gray mb-1 block text-[0.7rem] font-medium tracking-widest uppercase">{label}</label>
              <input
                type="number"
                value={settings?.commission?.[key] ?? ''}
                onChange={(e) => updateSection('commission', { [key]: Number(e.target.value) })}
                className="bg-navy3 focus:border-teal w-full rounded border border-white/[0.07] px-3 py-2.5 text-[0.85rem] text-white transition-colors outline-none"
              />
            </div>
          ))}
          <div className="mb-3">
            <label className="text-gray mb-1 block text-[0.7rem] font-medium tracking-widest uppercase">Payout Cycle</label>
            <select value={settings?.commission?.payoutCycle || 'weekly'} onChange={(e) => updateSection('commission', { payoutCycle: e.target.value })} className="bg-navy3 w-full rounded border border-white/[0.07] px-3 py-2.5 text-[0.85rem] text-white outline-none">
              <option value="weekly">Weekly</option>
              <option value="bi-weekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminSettings;
