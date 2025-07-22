import React, { useState } from 'react';

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
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          {tab === 'profile' && <div><h2 className="text-xl font-bold mb-4">Profile</h2><p>Profile settings go here.</p></div>}
          {tab === 'subscription' && <div><h2 className="text-xl font-bold mb-4">Subscription</h2><p>Subscription and billing settings go here.</p></div>}
          {tab === 'notifications' && <div><h2 className="text-xl font-bold mb-4">Notifications</h2><p>Notification preferences go here.</p></div>}
          {tab === 'security' && <div><h2 className="text-xl font-bold mb-4">Security</h2><p>Security settings go here.</p></div>}
          {tab === 'integrations' && <div><h2 className="text-xl font-bold mb-4">Integrations</h2><p>Integrations go here.</p></div>}
          {tab === 'tax' && <div><h2 className="text-xl font-bold mb-4">Tax & Compliance</h2><p>Tax and compliance settings go here.</p></div>}
          {tab === 'privacy' && <div><h2 className="text-xl font-bold mb-4">Data & Privacy</h2><p>Data export and account deletion go here.</p></div>}
        </div>
      </div>
    </div>
  );
} 