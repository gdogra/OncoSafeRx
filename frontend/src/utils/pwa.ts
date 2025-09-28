import { config } from './config';

// PWA installation and management utilities
export class PWAManager {
  private static deferredPrompt: any = null;
  private static isInstalled: boolean = false;

  // Initialize PWA features
  public static initialize(): void {
    if (typeof window === 'undefined') return;
    // If SW disabled, ensure any previous registrations are cleaned up and skip SW-related features
    if (!config.performance.enableServiceWorker) {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister())).catch(() => {});
      }
    } else {
      this.registerServiceWorker();
    }
    this.setupInstallPrompt();
    this.setupAppInstalledDetection();
    this.setupOfflineDetection();
    this.setupNotificationPermission();
  }

  // Register service worker
  private static async registerServiceWorker(): Promise<void> {
    if (!config.performance.enableServiceWorker || !('serviceWorker' in navigator)) {
      console.log('Service Worker not supported or disabled');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully:', registration);

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateAvailableNotification();
            }
          });
        }
      });

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event.data);
      });

      // Enable background sync if supported
      if ('sync' in window.ServiceWorkerRegistration.prototype) {
        this.setupBackgroundSync(registration);
      }

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  // Setup install prompt handling
  private static setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (event) => {
      console.log('PWA install prompt available');
      event.preventDefault();
      this.deferredPrompt = event;
      this.showInstallBanner();
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully');
      this.isInstalled = true;
      this.hideInstallBanner();
      this.trackInstallation();
    });
  }

  // Detect if app is already installed
  private static setupAppInstalledDetection(): void {
    // Check if running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      console.log('PWA is running in standalone mode');
    }

    // Check if launched from home screen on iOS
    if ((navigator as any).standalone === true) {
      this.isInstalled = true;
      console.log('PWA is running from iOS home screen');
    }
  }

  // Setup offline detection
  private static setupOfflineDetection(): void {
    const updateOnlineStatus = () => {
      const isOnline = navigator.onLine;
      const statusElement = document.getElementById('network-status');
      
      if (statusElement) {
        statusElement.className = isOnline ? 'online' : 'offline';
        statusElement.textContent = isOnline ? 'Online' : 'Offline';
      }

      // Show offline banner
      if (!isOnline) {
        this.showOfflineBanner();
      } else {
        this.hideOfflineBanner();
      }

      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('networkstatuschange', {
        detail: { isOnline }
      }));
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus(); // Initial check
  }

  // Setup notification permissions
  private static async setupNotificationPermission(): Promise<void> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    // Check if user has previously dismissed the notification banner
    const hasUserDismissedNotifications = localStorage.getItem('osrx_notification_banner_dismissed') === 'true';
    
    if (Notification.permission === 'default' && !hasUserDismissedNotifications) {
      // Don't request permission immediately - wait for user interaction
      this.showNotificationPermissionBanner();
    }
  }

  // Background sync setup
  private static setupBackgroundSync(registration: ServiceWorkerRegistration): void {
    // Register background sync events
    const syncTags = [
      'background-sync-interactions',
      'background-sync-favorites',
      'background-sync-analytics'
    ];

    // Setup periodic background sync (if available)
    if ('periodicSync' in registration) {
      this.setupPeriodicSync(registration);
    }
  }

  private static async setupPeriodicSync(registration: ServiceWorkerRegistration): Promise<void> {
    try {
      await (registration as any).periodicSync.register('periodic-sync', {
        minInterval: 24 * 60 * 60 * 1000, // 24 hours
      });
      console.log('Periodic background sync registered');
    } catch (error) {
      console.error('Periodic background sync registration failed:', error);
    }
  }

  // Public methods for app interaction
  public static async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log('Install prompt not available');
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      console.log('Install prompt result:', outcome);
      
      if (outcome === 'accepted') {
        this.trackInstallation();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Install prompt error:', error);
      return false;
    } finally {
      this.deferredPrompt = null;
    }
  }

  public static isInstallable(): boolean {
    return this.deferredPrompt !== null;
  }

  public static isAppInstalled(): boolean {
    return this.isInstalled;
  }

  public static async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // Clear dismissal preference since user granted permission
      localStorage.removeItem('osrx_notification_banner_dismissed');
      this.hideNotificationPermissionBanner();
      this.setupPushSubscription();
    }

    return permission;
  }

  // Setup push notifications
  private static async setupPushSubscription(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push messaging not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        console.log('No service worker registration found');
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.REACT_APP_VAPID_PUBLIC_KEY || ''
        )
      });

      console.log('Push subscription created:', subscription);
      
      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
    } catch (error) {
      console.error('Push subscription error:', error);
    }
  }

  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private static async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
    }
  }

  // Cache management
  public static async cacheImportantResources(urls: string[]): Promise<void> {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_URLS',
        urls
      });
    }
  }

  public static async clearCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All caches cleared');
    }
  }

  // Service worker message handling
  private static handleServiceWorkerMessage(data: any): void {
    switch (data.type) {
      case 'UPDATE_AVAILABLE':
        this.showUpdateAvailableNotification();
        break;
      case 'CACHE_UPDATED':
        console.log('Cache updated:', data.cacheName);
        break;
      default:
        console.log('Unknown service worker message:', data);
    }
  }

  // UI Banner methods
  private static showInstallBanner(): void {
    const banner = this.createBanner(
      'install-banner',
      'Install OncoSafeRx for quick access and offline use',
      [
        {
          text: 'Install',
          action: () => this.promptInstall(),
          primary: true
        },
        {
          text: 'Later',
          action: () => this.hideInstallBanner(),
          primary: false
        }
      ]
    );
    document.body.appendChild(banner);
  }

  private static hideInstallBanner(): void {
    const banner = document.getElementById('install-banner');
    if (banner) {
      banner.remove();
    }
  }

  private static showUpdateAvailableNotification(): void {
    const banner = this.createBanner(
      'update-banner',
      'A new version of OncoSafeRx is available',
      [
        {
          text: 'Update',
          action: () => this.applyUpdate(),
          primary: true
        },
        {
          text: 'Later',
          action: () => this.hideUpdateBanner(),
          primary: false
        }
      ]
    );
    document.body.appendChild(banner);
  }

  private static hideUpdateBanner(): void {
    const banner = document.getElementById('update-banner');
    if (banner) {
      banner.remove();
    }
  }

  private static showOfflineBanner(): void {
    const banner = this.createBanner(
      'offline-banner',
      'You are currently offline. Some features may be limited.',
      [],
      'offline'
    );
    document.body.appendChild(banner);
  }

  private static hideOfflineBanner(): void {
    const banner = document.getElementById('offline-banner');
    if (banner) {
      banner.remove();
    }
  }

  private static showNotificationPermissionBanner(): void {
    const banner = this.createBanner(
      'notification-banner',
      'Enable notifications to receive important drug safety alerts',
      [
        {
          text: 'Enable',
          action: () => this.requestNotificationPermission(),
          primary: true
        },
        {
          text: 'Not now',
          action: () => this.hideNotificationPermissionBanner(),
          primary: false
        }
      ]
    );
    document.body.appendChild(banner);
  }

  private static hideNotificationPermissionBanner(): void {
    // Store user's dismissal preference
    localStorage.setItem('osrx_notification_banner_dismissed', 'true');
    
    const banner = document.getElementById('notification-banner');
    if (banner) {
      banner.remove();
    }
  }

  // Banner creation utility
  private static createBanner(
    id: string,
    message: string,
    actions: Array<{ text: string; action: () => void; primary: boolean }>,
    type: 'default' | 'offline' = 'default'
  ): HTMLElement {
    const banner = document.createElement('div');
    banner.id = id;
    banner.className = `pwa-banner ${type}`;
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: ${type === 'offline' ? '#f59e0b' : '#2563eb'};
      color: white;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 1000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
    `;

    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    banner.appendChild(messageSpan);

    if (actions.length > 0) {
      const actionContainer = document.createElement('div');
      actionContainer.style.cssText = 'display: flex; gap: 8px;';

      actions.forEach(({ text, action, primary }) => {
        const button = document.createElement('button');
        button.textContent = text;
        button.onclick = action;
        button.style.cssText = `
          padding: 6px 12px;
          border: ${primary ? 'none' : '1px solid white'};
          background: ${primary ? 'white' : 'transparent'};
          color: ${primary ? '#2563eb' : 'white'};
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
        `;
        actionContainer.appendChild(button);
      });

      banner.appendChild(actionContainer);
    }

    return banner;
  }

  // Update application
  private static async applyUpdate(): Promise<void> {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SKIP_WAITING'
      });
      
      // Reload page to apply update
      window.location.reload();
    }
  }

  // Analytics
  private static trackInstallation(): void {
    // Track PWA installation
    if (typeof gtag !== 'undefined') {
      gtag('event', 'pwa_install', {
        event_category: 'PWA',
        event_label: 'Installation'
      });
    }

    // Custom analytics
    fetch('/api/analytics/pwa-install', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform
      })
    }).catch(console.error);
  }
}

export default PWAManager;
