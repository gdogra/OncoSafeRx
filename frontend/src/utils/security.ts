import { config } from './config';
import CryptoJS from 'crypto-js';

// Security utilities for production
export class SecurityManager {
  private static readonly ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'oncosaferx-default-key';
  private static readonly SESSION_KEY = 'oncosaferx_session';
  private static readonly MAX_SESSION_DURATION = config.limits.sessionTimeout * 60 * 1000; // Convert to milliseconds

  // Content Security Policy
  public static setupCSP(): void {
    if (!config.security.enableCSP) return;

    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.oncosaferx.com https://api-staging.oncosaferx.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
    
    document.head.appendChild(meta);
  }

  // Secure local storage with encryption
  public static setSecureItem(key: string, value: any): void {
    try {
      const serialized = JSON.stringify(value);
      
      if (config.security.encryptLocalStorage) {
        const encrypted = CryptoJS.AES.encrypt(serialized, this.ENCRYPTION_KEY).toString();
        localStorage.setItem(key, encrypted);
      } else {
        localStorage.setItem(key, serialized);
      }
    } catch (error) {
      console.error('Failed to store secure item:', error);
    }
  }

  public static getSecureItem<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      let serialized: string;
      
      if (config.security.encryptLocalStorage) {
        const decrypted = CryptoJS.AES.decrypt(stored, this.ENCRYPTION_KEY);
        serialized = decrypted.toString(CryptoJS.enc.Utf8);
        
        if (!serialized) {
          console.warn('Failed to decrypt stored item');
          return null;
        }
      } else {
        serialized = stored;
      }

      return JSON.parse(serialized);
    } catch (error) {
      console.error('Failed to retrieve secure item:', error);
      return null;
    }
  }

  public static removeSecureItem(key: string): void {
    localStorage.removeItem(key);
  }

  // Session management
  public static createSession(userId: string, userData: any): void {
    const session = {
      userId,
      userData,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      fingerprint: this.generateFingerprint()
    };

    this.setSecureItem(this.SESSION_KEY, session);
  }

  public static getSession(): any | null {
    const session = this.getSecureItem(this.SESSION_KEY);
    
    if (!session) return null;

    // Check if session has expired
    if (Date.now() - session.lastActivity > this.MAX_SESSION_DURATION) {
      this.clearSession();
      return null;
    }

    // Verify session fingerprint
    if (session.fingerprint !== this.generateFingerprint()) {
      console.warn('Session fingerprint mismatch - possible session hijacking');
      this.clearSession();
      return null;
    }

    // Update last activity
    session.lastActivity = Date.now();
    this.setSecureItem(this.SESSION_KEY, session);

    return session;
  }

  public static clearSession(): void {
    this.removeSecureItem(this.SESSION_KEY);
  }

  public static isSessionValid(): boolean {
    return this.getSession() !== null;
  }

  // Browser fingerprinting for session security
  private static generateFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('OncoSafeRx Fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');

    return CryptoJS.SHA256(fingerprint).toString();
  }

  // Input sanitization
  public static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Validate email format
  public static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Generate secure random ID
  public static generateSecureId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Rate limiting for API calls
  private static apiCallCounts: Map<string, { count: number; resetTime: number }> = new Map();

  public static checkRateLimit(endpoint: string, maxCalls: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const key = endpoint;
    const current = this.apiCallCounts.get(key);

    if (!current || now > current.resetTime) {
      this.apiCallCounts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (current.count >= maxCalls) {
      return false;
    }

    current.count++;
    return true;
  }

  // CSRF protection
  public static generateCSRFToken(): string {
    const token = this.generateSecureId();
    this.setSecureItem('csrf_token', token);
    return token;
  }

  public static validateCSRFToken(token: string): boolean {
    const storedToken = this.getSecureItem<string>('csrf_token');
    return storedToken === token;
  }

  // Secure password validation
  public static validatePassword(password: string): {
    isValid: boolean;
    requirements: { [key: string]: boolean };
  } {
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      noCommonWords: !['password', '123456', 'qwerty', 'admin'].some(word => 
        password.toLowerCase().includes(word)
      )
    };

    const isValid = Object.values(requirements).every(req => req);

    return { isValid, requirements };
  }

  // Audit logging
  public static logSecurityEvent(event: string, details: any = {}): void {
    const logEntry = {
      event,
      details,
      timestamp: new Date().toISOString(),
      userId: this.getSession()?.userId,
      fingerprint: this.generateFingerprint(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // In production, send to security monitoring service
    if (config.environment === 'production') {
      // Optionally send to backend if endpoint exists
      // fetch('/api/security/audit', { ... }).catch(() => {});
    } else {
      console.log('Security Event:', logEntry);
    }
  }

  // Initialize security features
  public static initialize(): void {
    this.setupCSP();
    
    // Set up security headers via meta tags
    this.addSecurityHeaders();
    
    // Monitor for suspicious activity
    this.setupSecurityMonitoring();
    
    // Clean up expired sessions on initialization
    this.cleanupExpiredSessions();
  }

  private static addSecurityHeaders(): void {
    // Note: X-Frame-Options should be set by the server, not via meta tags
    const headers = [
      { name: 'X-Content-Type-Options', content: 'nosniff' },
      { name: 'X-XSS-Protection', content: '1; mode=block' },
      { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' }
    ];

    headers.forEach(({ name, content }) => {
      const meta = document.createElement('meta');
      meta.httpEquiv = name;
      meta.content = content;
      document.head.appendChild(meta);
    });
  }

  private static setupSecurityMonitoring(): void {
    // Monitor for suspicious activity
    let rapidClickCount = 0;
    let lastClickTime = 0;

    document.addEventListener('click', () => {
      const now = Date.now();
      if (now - lastClickTime < 100) {
        rapidClickCount++;
        if (rapidClickCount > 10) {
          this.logSecurityEvent('suspicious_rapid_clicking', { count: rapidClickCount });
        }
      } else {
        rapidClickCount = 0;
      }
      lastClickTime = now;
    });

    // Monitor for console access (possible debugging attempt)
    let consoleAccessCount = 0;
    const originalConsole = { ...console };
    
    Object.keys(console).forEach(key => {
      (console as any)[key] = (...args: any[]) => {
        consoleAccessCount++;
        if (consoleAccessCount === 1) {
          this.logSecurityEvent('console_access_detected');
        }
        return (originalConsole as any)[key](...args);
      };
    });
  }

  private static cleanupExpiredSessions(): void {
    const session = this.getSecureItem(this.SESSION_KEY);
    if (session && Date.now() - session.lastActivity > this.MAX_SESSION_DURATION) {
      this.clearSession();
    }
  }
}

export default SecurityManager;
