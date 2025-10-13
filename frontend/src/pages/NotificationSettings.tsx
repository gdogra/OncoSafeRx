import React, { useEffect, useState } from 'react';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import Card from '../components/UI/Card';
import { Bell, CheckCircle, XCircle } from 'lucide-react';
import { PWAManager } from '../utils/pwa';

const NotificationSettings: React.FC = () => {
  const [supported, setSupported] = useState<boolean>(true);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');

  const refreshState = async () => {
    try {
      setSupported('Notification' in window && 'serviceWorker' in navigator);
      setPermission('Notification' in window ? Notification.permission : 'denied');
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        setSubscribed(!!sub);
      } else {
        setSubscribed(false);
      }
    } catch {}
  };

  useEffect(() => { refreshState(); }, []);

  const handleEnable = async () => {
    if (!supported) return;
    setBusy(true);
    setStatus('');
    try {
      const p = await PWAManager.requestNotificationPermission();
      setPermission(p);
      if (p !== 'granted') {
        setStatus('Please allow notifications in your browser.');
        return;
      }
      // subscription happens inside requestNotificationPermission via setupPushSubscription
      await refreshState();
      setStatus('Notifications enabled.');
    } catch (e: any) {
      setStatus(e?.message || 'Failed to enable notifications');
    } finally {
      setBusy(false);
    }
  };

  const handleDisable = async () => {
    if (!supported) return;
    setBusy(true);
    setStatus('');
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        try {
          await fetch('/api/push/unsubscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }) } as any);
        } catch {}
        await sub.unsubscribe();
        // Optionally tell server to remove (not implemented; server auto-upsert on subscribe)
      }
      await refreshState();
      setStatus('Notifications disabled.');
    } catch (e: any) {
      setStatus(e?.message || 'Failed to disable notifications');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Notification Settings' }]} />
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
              <p className="text-sm text-gray-600">Enable background notifications and in-app reminders.</p>
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <div className="text-sm text-gray-700">Support: {supported ? 'Supported' : 'Not Supported'}</div>
          <div className="text-sm text-gray-700">Permission: {permission}</div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span>Status:</span>
            {subscribed ? (
              <span className="inline-flex items-center text-green-700"><CheckCircle className="w-4 h-4 mr-1" /> Subscribed</span>
            ) : (
              <span className="inline-flex items-center text-red-700"><XCircle className="w-4 h-4 mr-1" /> Not Subscribed</span>
            )}
          </div>
          {status && <div className="text-sm text-gray-600">{status}</div>}
          <div className="mt-2 flex items-center gap-3">
            {!subscribed ? (
              <button disabled={busy || !supported} onClick={handleEnable} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60">Enable Notifications</button>
            ) : (
              <button disabled={busy || !supported} onClick={handleDisable} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60">Disable Notifications</button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotificationSettings;
