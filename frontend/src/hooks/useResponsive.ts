import { useState, useEffect } from 'react';

export interface ResponsiveBreakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLarge: boolean;
  width: number;
  height: number;
}

export const useResponsive = (): ResponsiveBreakpoints => {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Set initial dimensions
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { width, height } = dimensions;

  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    isLarge: width >= 1280,
    width,
    height,
  };
};

// Hook to detect if device is touch-enabled
export const useTouchDevice = (): boolean => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      );
    };

    setIsTouchDevice(checkTouchDevice());
  }, []);

  return isTouchDevice;
};

// Hook to detect mobile user agent
export const useMobileUserAgent = (): boolean => {
  const [isMobileUA, setIsMobileUA] = useState(false);

  useEffect(() => {
    const checkMobileUA = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = [
        'android',
        'iphone',
        'ipad',
        'ipod',
        'blackberry',
        'windows phone',
        'mobile',
        'webos',
        'opera mini'
      ];
      
      return mobileKeywords.some(keyword => userAgent.includes(keyword));
    };

    setIsMobileUA(checkMobileUA());
  }, []);

  return isMobileUA;
};

// Comprehensive mobile detection
export const useIsMobile = (): boolean => {
  const { isMobile } = useResponsive();
  const isTouchDevice = useTouchDevice();
  const isMobileUA = useMobileUserAgent();

  // Consider it mobile if screen is small OR it's a touch device with mobile UA
  return isMobile || (isTouchDevice && isMobileUA);
};

// Hook for PWA detection and installation
export const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      // PWA installed detection
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
      
      // iOS Safari standalone detection
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
      }
    };

    checkInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return false;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('PWA installation failed:', error);
      return false;
    }
  };

  return {
    isInstallable,
    isInstalled,
    installPWA,
  };
};

// Hook for device orientation
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    
    // Also listen to orientation change event if available
    if ('onorientationchange' in window) {
      window.addEventListener('orientationchange', updateOrientation);
    }

    return () => {
      window.removeEventListener('resize', updateOrientation);
      if ('onorientationchange' in window) {
        window.removeEventListener('orientationchange', updateOrientation);
      }
    };
  }, []);

  return orientation;
};

// Hook for safe area insets (iOS notch, etc.)
export const useSafeArea = () => {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const updateSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      
      setSafeArea({
        top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0'),
      });
    };

    updateSafeArea();
    
    // Update on orientation change
    window.addEventListener('orientationchange', updateSafeArea);
    window.addEventListener('resize', updateSafeArea);

    return () => {
      window.removeEventListener('orientationchange', updateSafeArea);
      window.removeEventListener('resize', updateSafeArea);
    };
  }, []);

  return safeArea;
};