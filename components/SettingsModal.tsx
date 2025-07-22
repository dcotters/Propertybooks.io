import React, { useState, useEffect } from 'react';
import SubscriptionPlans from './subscription/SubscriptionPlans';

const TABS = [
  { key: 'profile', label: 'Profile' },
  { key: 'subscription', label: 'Subscription' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'security', label: 'Security' },
  { key: 'integrations', label: 'Integrations' },
  { key: 'tax', label: 'Tax & Compliance' },
  { key: 'privacy', label: 'Data & Privacy' },
];

export default function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<any>(null);
  const [countries, setCountries] = useState<any[]>([]);
  // Profile fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [currency, setCurrency] = useState('');
  const [timezone, setTimezone] = useState('');
  // Notifications
  const [notificationPreferences, setNotificationPreferences] = useState<any>({});
  // Tax/Compliance
  const [taxInsights, setTaxInsights] = useState('');
  const [subscription, setSubscription] = useState<any>(null);
  const [subLoading, setSubLoading] = useState(false);
  const [subError, setSubError] = useState('');
  const [subSuccess, setSubSuccess] = useState('');

  // Fetch subscription info on open
  useEffect(() => {
    if (open) {
      setSubLoading(true);
      setSubError('');
      fetch('/api/settings')
        .then(res => res.json())
        .then(data => {
          setSubscription(data.user?.subscription || null);
        })
        .catch(() => setSubError('Failed to load subscription.'))
        .finally(() => setSubLoading(false));
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError('');
      setSuccess('');
      fetch('/api/settings')
        .then(res => res.json())
        .then(data => {
          setUser(data.user);
          setCountries(data.countries || []);
          setName(data.user?.name || '');
          setEmail(data.user?.email || '');
          setCountry(data.user?.country || '');
          setCurrency(data.user?.currency || '');
          setTimezone(data.user?.timezone || '');
          setNotificationPreferences(data.user?.notificationPreferences || {});
        })
        .catch(() => setError('Failed to load settings.'))
        .finally(() => setLoading(false));
    }
  }, [open]);

  // Handle country change (cascade currency/timezone)
  useEffect(() => {
    if (country && countries.length) {
      const c = countries.find((c: any) => c.code === country);
      if (c) {
        setCurrency(c.currencyCode);
        setTimezone(c.timezone || '');
      }
    }
  }, [country, countries]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, country, currency, timezone }),
    });
    if (res.ok) {
      setSuccess('Profile updated!');
    } else {
      setError('Failed to update profile.');
    }
    setSaving(false);
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationPreferences }),
    });
    if (res.ok) {
      setSuccess('Notification preferences updated!');
    } else {
      setError('Failed to update notifications.');
    }
    setSaving(false);
  };

  const handleGenerateTaxInsights = async () => {
    setTaxInsights('');
    setError('');
    setSuccess('');
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate-tax-insights', country }),
    });
    if (res.ok) {
      const data = await res.json();
      setTaxInsights(data.taxInsights || 'No insights available.');
    } else {
      setError('Failed to generate tax insights.');
    }
  };

  const handleUpgrade = async (planId: string) => {
    setSubLoading(true);
    setSubError('');
    setSubSuccess('');
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.sessionId) {
        window.location.href = data.sessionId.startsWith('http') ? data.sessionId : `https://checkout.stripe.com/pay/${data.sessionId}`;
      } else {
        setSubError('Failed to start checkout.');
      }
    } catch {
      setSubError('Failed to start checkout.');
    }
    setSubLoading(false);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl flex relative">
        {/* Sidebar */}
        <div className="w-48 border-r p-4 flex flex-col">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`text-left py-2 px-3 rounded-lg mb-1 font-medium ${tab === t.key ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => { setTab(t.key); setError(''); setSuccess(''); }}
            >
              {t.label}
            </button>
          ))}
        </div>
        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          {loading ? <div>Loading...</div> : null}
          {error && <div className="text-red-600 mb-2">{error}</div>}
          {success && <div className="text-green-600 mb-2">{success}</div>}
          {tab === 'profile' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input className="input-field" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input className="input-field" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <select className="input-field" value={country} onChange={e => setCountry(e.target.value)}>
                    <option value="">Select country</option>
                    {countries.map((c: any) => (
                      <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Currency</label>
                  <input className="input-field" value={currency} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Timezone</label>
                  <input className="input-field" value={timezone} disabled />
                </div>
                <button className="btn-primary mt-2" onClick={handleSaveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
              </div>
            </div>
          )}
          {tab === 'subscription' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Subscription</h2>
              {subLoading ? <div>Loading subscription...</div> : null}
              {subError && <div className="text-red-600 mb-2">{subError}</div>}
              {subscription ? (
                <div className="mb-4">
                  <div><b>Current Plan:</b> {subscription.plan || 'Free'}</div>
                  <div><b>Status:</b> {subscription.status || 'Active'}</div>
                  <div><b>Renewal:</b> {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}</div>
                  <button className="btn-primary mt-2 mr-2" onClick={() => handleUpgrade('premium')} disabled={subLoading}>Upgrade to Premium</button>
                  <button className="btn-secondary mt-2" onClick={() => handleUpgrade('basic')} disabled={subLoading}>Downgrade to Basic</button>
                  <button className="btn-secondary mt-2 ml-2" onClick={() => handleUpgrade('cancel')} disabled={subLoading}>Cancel Subscription</button>
                </div>
              ) : (
                <div>No subscription found. You are on the Free plan.</div>
              )}
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Billing History</h3>
                {/* TODO: Implement billing history fetch from Stripe. Placeholder for now. */}
                <div className="text-gray-500">Billing history will appear here.</div>
              </div>
            </div>
          )}
          {tab === 'notifications' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Notifications</h2>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" checked={!!notificationPreferences.email} onChange={e => setNotificationPreferences((p: any) => ({ ...p, email: e.target.checked }))} />
                  Email notifications
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" checked={!!notificationPreferences.inApp} onChange={e => setNotificationPreferences((p: any) => ({ ...p, inApp: e.target.checked }))} />
                  In-app notifications
                </label>
                <button className="btn-primary mt-2" onClick={handleSaveNotifications} disabled={saving}>{saving ? 'Saving...' : 'Save Preferences'}</button>
              </div>
            </div>
          )}
          {tab === 'security' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Security</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Change Password</label>
                  {/* TODO: Implement change password API endpoint and logic */}
                  <input className="input-field" type="password" placeholder="New password" disabled />
                  <button className="btn-primary mt-2" disabled>Change Password (Coming Soon)</button>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Two-Factor Authentication (2FA)</label>
                  {/* TODO: Implement 2FA setup */}
                  <button className="btn-secondary mt-2" disabled>Enable 2FA (Coming Soon)</button>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Login Activity</label>
                  {/* TODO: Implement login activity fetch */}
                  <div className="text-gray-500">Login activity will appear here.</div>
                </div>
              </div>
            </div>
          )}
          {tab === 'integrations' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Integrations</h2>
              <div className="space-y-2">
                {/* TODO: Implement integrations logic */}
                <button className="btn-secondary" disabled>Connect Google (Coming Soon)</button>
                <button className="btn-secondary ml-2" disabled>Connect QuickBooks (Coming Soon)</button>
                <button className="btn-secondary ml-2" disabled>Connect Stripe (Coming Soon)</button>
              </div>
            </div>
          )}
          {tab === 'tax' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Tax & Compliance</h2>
              <div className="space-y-2">
                <button className="btn-primary" onClick={handleGenerateTaxInsights} type="button">Generate Tax Insights</button>
                {taxInsights && <div className="mt-2 p-2 bg-gray-50 border rounded text-sm whitespace-pre-line">{taxInsights}</div>}
              </div>
            </div>
          )}
          {tab === 'privacy' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Data & Privacy</h2>
              <div className="space-y-2">
                {/* TODO: Implement export and delete account logic */}
                <button className="btn-secondary" disabled>Export My Data (Coming Soon)</button>
                <button className="btn-danger ml-2" disabled>Delete My Account (Coming Soon)</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 