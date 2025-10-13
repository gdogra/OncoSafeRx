import { config } from './config';
import { errorReporter } from './errorReporting';

// Performance monitoring and optimization utilities
export class PerformanceMonitor {
  private static metrics: Map<string, number> = new Map();
  private static observer: PerformanceObserver | null = null;

  // Initialize performance monitoring
  public static initialize(): void {
    if (typeof window === 'undefined') return;

    this.setupPerformanceObserver();
    this.monitorPageLoad();
    this.monitorMemoryUsage();
    this.setupResourceMonitoring();
  }

  private static setupPerformanceObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          switch (entry.entryType) {
            case 'navigation':
              this.handleNavigationEntry(entry as PerformanceNavigationTiming);
              break;
            case 'paint':
              this.handlePaintEntry(entry);
              break;
            case 'largest-contentful-paint':
              this.handleLCPEntry(entry);
              break;
            case 'first-input':
              this.handleFIDEntry(entry);
              break;
            case 'layout-shift':
              this.handleCLSEntry(entry);
              break;
            case 'resource':
              this.handleResourceEntry(entry as PerformanceResourceTiming);
              break;
          }
        });
      });

      // Observe different entry types
      const entryTypes = ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift', 'resource'];
      
      entryTypes.forEach((entryType) => {
        try {
          this.observer!.observe({ entryTypes: [entryType] });
        } catch (error) {
          console.warn(`Cannot observe ${entryType}:`, error);
        }
      });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }

  private static handleNavigationEntry(entry: PerformanceNavigationTiming): void {
    const metrics = {
      pageLoadTime: entry.loadEventEnd - entry.fetchStart,
      domContentLoaded: entry.domContentLoadedEventEnd - entry.fetchStart,
      firstByte: entry.responseStart - entry.fetchStart,
      domInteractive: entry.domInteractive - entry.fetchStart,
      resourceLoadTime: entry.loadEventEnd - entry.domContentLoadedEventEnd
    };

    this.recordMetrics(metrics);
    this.reportPerformanceMetrics('page-load', metrics);
  }

  private static handlePaintEntry(entry: PerformanceEntry): void {
    if (entry.name === 'first-contentful-paint') {
      this.recordMetric('firstContentfulPaint', entry.startTime);
    } else if (entry.name === 'first-paint') {
      this.recordMetric('firstPaint', entry.startTime);
    }
  }

  private static handleLCPEntry(entry: any): void {
    this.recordMetric('largestContentfulPaint', entry.startTime);
  }

  private static handleFIDEntry(entry: any): void {
    this.recordMetric('firstInputDelay', entry.processingStart - entry.startTime);
  }

  private static handleCLSEntry(entry: any): void {
    if (!entry.hadRecentInput) {
      const currentCLS = this.metrics.get('cumulativeLayoutShift') || 0;
      this.recordMetric('cumulativeLayoutShift', currentCLS + entry.value);
    }
  }

  private static handleResourceEntry(entry: PerformanceResourceTiming): void {
    const resourceType = this.getResourceType(entry.name);
    const loadTime = entry.responseEnd - entry.startTime;
    
    // Track slow resources
    if (loadTime > 1000) { // More than 1 second
      this.reportSlowResource(entry.name, loadTime, resourceType);
    }
  }

  private static getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  private static recordMetric(name: string, value: number): void {
    this.metrics.set(name, value);
  }

  private static recordMetrics(metrics: Record<string, number>): void {
    Object.entries(metrics).forEach(([name, value]) => {
      this.recordMetric(name, value);
    });
  }

  // Monitor page load performance
  private static monitorPageLoad(): void {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.handleNavigationEntry(navigation);
        }
      }, 0);
    });
  }

  // Monitor memory usage
  private static monitorMemoryUsage(): void {
    if (!('memory' in performance)) return;

    const checkMemory = () => {
      const memory = (performance as any).memory;
      const memoryMetrics = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        memoryUsagePercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };

      // Alert if memory usage is high
      if (memoryMetrics.memoryUsagePercent > 80) {
        this.reportMemoryWarning(memoryMetrics);
      }

      this.recordMetrics(memoryMetrics);
    };

    // Check memory usage every 30 seconds
    setInterval(checkMemory, 30000);
    checkMemory(); // Initial check
  }

  // Monitor resource loading
  private static setupResourceMonitoring(): void {
    const resourceObserver = new PerformanceObserver((list) => {
      const resources = list.getEntries() as PerformanceResourceTiming[];
      
      resources.forEach((resource) => {
        const loadTime = resource.responseEnd - resource.startTime;
        const size = resource.transferSize || 0;
        
        // Track large resources
        if (size > 1024 * 1024) { // More than 1MB
          this.reportLargeResource(resource.name, size, loadTime);
        }
      });
    });

    try {
      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Resource monitoring not supported:', error);
    }
  }

  // API call performance monitoring
  public static monitorApiCall<T>(
    apiCall: () => Promise<T>,
    endpoint: string
  ): Promise<T> {
    const startTime = performance.now();
    
    return apiCall()
      .then((result) => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.recordApiMetrics(endpoint, duration, 'success');
        
        if (duration > 5000) { // More than 5 seconds
          this.reportSlowApi(endpoint, duration);
        }
        
        return result;
      })
      .catch((error) => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.recordApiMetrics(endpoint, duration, 'error');
        
        throw error;
      });
  }

  private static recordApiMetrics(endpoint: string, duration: number, status: 'success' | 'error'): void {
    const metrics = {
      apiResponseTime: duration,
      endpoint,
      status,
      timestamp: Date.now()
    };

    this.reportPerformanceMetrics('api-call', metrics);
  }

  // Component render performance monitoring
  public static monitorComponentRender(componentName: string): {
    start: () => void;
    end: () => void;
  } {
    let startTime: number;

    return {
      start: () => {
        startTime = performance.now();
      },
      end: () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        this.recordMetric(`${componentName}RenderTime`, renderTime);
        
        if (renderTime > 100) { // More than 100ms
          this.reportSlowRender(componentName, renderTime);
        }
      }
    };
  }

  // Lazy loading performance
  public static monitorLazyLoading(componentName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      this.recordMetric(`${componentName}LazyLoadTime`, loadTime);
      
      if (loadTime > 2000) { // More than 2 seconds
        this.reportSlowLazyLoad(componentName, loadTime);
      }
    };
  }

  // Bundle size monitoring
  public static monitorBundleSize(): void {
    if (!('getEntriesByType' in performance)) return;

    const scripts = performance.getEntriesByType('resource')
      .filter((resource: any) => resource.name.includes('.js'))
      .map((resource: any) => ({
        name: resource.name,
        size: resource.transferSize || 0,
        loadTime: resource.responseEnd - resource.startTime
      }));

    const totalBundleSize = scripts.reduce((total, script) => total + script.size, 0);
    
    this.recordMetric('totalBundleSize', totalBundleSize);
    
    if (totalBundleSize > 5 * 1024 * 1024) { // More than 5MB
      this.reportLargeBundle(totalBundleSize, scripts);
    }
  }

  // Reporting methods
  private static reportPerformanceMetrics(type: string, metrics: any): void {
    errorReporter.reportPerformanceMetrics({
      ...metrics,
      type,
      route: window.location.pathname
    });
  }

  private static reportSlowResource(url: string, loadTime: number, resourceType: string): void {
    if (config.environment === 'development') {
      console.warn(`Slow ${resourceType} resource:`, { url, loadTime });
    }
    
    this.reportPerformanceMetrics('slow-resource', {
      url,
      loadTime,
      resourceType
    });
  }

  private static reportMemoryWarning(memoryMetrics: any): void {
    if (config.environment === 'development') {
      console.warn('High memory usage detected:', memoryMetrics);
    }
    
    this.reportPerformanceMetrics('memory-warning', memoryMetrics);
  }

  private static reportLargeResource(url: string, size: number, loadTime: number): void {
    if (config.environment === 'development') {
      console.warn('Large resource detected:', { url, size, loadTime });
    }
    
    this.reportPerformanceMetrics('large-resource', {
      url,
      size,
      loadTime
    });
  }

  private static reportSlowApi(endpoint: string, duration: number): void {
    if (config.environment === 'development') {
      console.warn('Slow API call:', { endpoint, duration });
    }
    
    this.reportPerformanceMetrics('slow-api', {
      endpoint,
      duration
    });
  }

  private static reportSlowRender(componentName: string, renderTime: number): void {
    if (config.environment === 'development') {
      console.warn('Slow component render:', { componentName, renderTime });
    }
    
    this.reportPerformanceMetrics('slow-render', {
      componentName,
      renderTime
    });
  }

  private static reportSlowLazyLoad(componentName: string, loadTime: number): void {
    if (config.environment === 'development') {
      console.warn('Slow lazy load:', { componentName, loadTime });
    }
    
    this.reportPerformanceMetrics('slow-lazy-load', {
      componentName,
      loadTime
    });
  }

  private static reportLargeBundle(totalSize: number, scripts: any[]): void {
    if (config.environment === 'development') {
      console.warn('Large bundle detected:', { totalSize, scripts });
    }
    
    this.reportPerformanceMetrics('large-bundle', {
      totalSize,
      scriptCount: scripts.length,
      largestScripts: scripts.sort((a, b) => b.size - a.size).slice(0, 5)
    });
  }

  // Get current metrics
  public static getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  // Performance optimization suggestions
  public static getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    const metrics = this.getMetrics();

    if (metrics.firstContentfulPaint > 2500) {
      suggestions.push('Consider optimizing critical rendering path - FCP is slow');
    }

    if (metrics.largestContentfulPaint > 4000) {
      suggestions.push('Optimize largest contentful paint - consider image optimization or code splitting');
    }

    if (metrics.firstInputDelay > 300) {
      suggestions.push('Reduce main thread blocking - FID is high');
    }

    if (metrics.cumulativeLayoutShift > 0.25) {
      suggestions.push('Reduce layout shifts - specify dimensions for images and ads');
    }

    if (metrics.memoryUsagePercent > 70) {
      suggestions.push('Consider reducing memory usage - implement better cleanup');
    }

    if (metrics.totalBundleSize > 3 * 1024 * 1024) {
      suggestions.push('Consider code splitting to reduce bundle size');
    }

    return suggestions;
  }
}

import React from 'react';

// React hook for performance monitoring
export const usePerformanceMonitoring = (componentName: string) => {
  const [renderTime, setRenderTime] = React.useState<number | null>(null);
  
  React.useEffect(() => {
    const monitor = PerformanceMonitor.monitorComponentRender(componentName);
    monitor.start();
    
    return () => {
      monitor.end();
      const metrics = PerformanceMonitor.getMetrics();
      setRenderTime(metrics[`${componentName}RenderTime`] || null);
    };
  }, [componentName]);
  
  return { renderTime };
};

export default PerformanceMonitor;
