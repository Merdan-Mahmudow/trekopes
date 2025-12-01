/**
 * Утилиты для мониторинга производительности
 */

import { logTelemetry, debugLog } from './logger';

interface PerformanceMetrics {
  ttfb?: number; // Time to First Byte
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  tti?: number; // Time to Interactive
  fps?: number; // Frames Per Second
  memory?: {
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
    jsHeapSizeLimit?: number;
  };
}

let performanceObserver: PerformanceObserver | null = null;
let fpsMonitorInterval: ReturnType<typeof setInterval> | null = null;
let metricsCollectionInterval: ReturnType<typeof setInterval> | null = null;
let frameCount = 0;
let lastTime = performance.now();
let fps = 0;

/**
 * Инициализация мониторинга производительности
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  debugLog('[Performance] Initializing performance monitoring');

  // Отслеживание метрик загрузки через PerformanceObserver
  if ('PerformanceObserver' in window) {
    try {
      // FCP (First Contentful Paint)
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            const fcp = Math.round(entry.startTime);
            logPerformanceMetric('fcp', fcp);
          }
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        if (lastEntry) {
          const lcp = Math.round(lastEntry.renderTime || lastEntry.loadTime);
          logPerformanceMetric('lcp', lcp);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // TTI (Time to Interactive) - приблизительная оценка
      window.addEventListener('load', () => {
        setTimeout(() => {
          const tti = Math.round(performance.now());
          logPerformanceMetric('tti', tti);
        }, 0);
      });

      performanceObserver = fcpObserver;
    } catch (error) {
      debugLog('[Performance] Failed to initialize PerformanceObserver', error);
    }
  }

  // TTFB (Time to First Byte) - из navigation timing
  if ('performance' in window && 'getEntriesByType' in performance) {
    window.addEventListener('load', () => {
      try {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          const ttfb = Math.round(navigation.responseStart - navigation.requestStart);
          logPerformanceMetric('ttfb', ttfb);
        }
      } catch (error) {
        debugLog('[Performance] Failed to get TTFB', error);
      }
    });
  }

  // FPS мониторинг
  startFPSMonitoring();

  // Периодический сбор метрик
  startMetricsCollection();
}

/**
 * Запуск мониторинга FPS
 */
function startFPSMonitoring() {
  if (fpsMonitorInterval) return;

  const measureFPS = () => {
    frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - lastTime;

    if (elapsed >= 1000) {
      fps = Math.round((frameCount * 1000) / elapsed);
      frameCount = 0;
      lastTime = currentTime;
      
      logPerformanceMetric('fps', fps);
    }

    requestAnimationFrame(measureFPS);
  };

  requestAnimationFrame(measureFPS);
}

/**
 * Запуск периодического сбора метрик
 */
function startMetricsCollection() {
  if (metricsCollectionInterval) return;

  metricsCollectionInterval = setInterval(() => {
    collectMetrics();
  }, 30000); // Каждые 30 секунд
}

/**
 * Сбор текущих метрик производительности
 */
function collectMetrics(): PerformanceMetrics {
  const metrics: PerformanceMetrics = {};

  // Метрики памяти (если доступны)
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    metrics.memory = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };

    // Логируем только если использование памяти превышает 80% лимита
    if (memory.jsHeapSizeLimit && memory.usedJSHeapSize) {
      const memoryUsagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      if (memoryUsagePercent > 80) {
        logPerformanceMetric('memory_usage_high', memoryUsagePercent);
      }
    }
  }

  // FPS уже собирается отдельно
  if (fps > 0) {
    metrics.fps = fps;
  }

  // Отправка метрик в телеметрию
  logTelemetry('performance', {
    fps: metrics.fps,
    memory_used_mb: metrics.memory?.usedJSHeapSize 
      ? Math.round(metrics.memory.usedJSHeapSize / 1024 / 1024) 
      : undefined,
    memory_total_mb: metrics.memory?.totalJSHeapSize 
      ? Math.round(metrics.memory.totalJSHeapSize / 1024 / 1024) 
      : undefined,
    memory_limit_mb: metrics.memory?.jsHeapSizeLimit 
      ? Math.round(metrics.memory.jsHeapSizeLimit / 1024 / 1024) 
      : undefined,
  });

  return metrics;
}

/**
 * Логирование метрики производительности
 */
function logPerformanceMetric(name: string, value: number) {
  debugLog(`[Performance] ${name}: ${value}ms`);
  
  logTelemetry('performance', {
    metric_name: name,
    metric_value: value,
  });
}

/**
 * Получение текущих метрик производительности
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  return collectMetrics();
}

/**
 * Остановка мониторинга производительности
 */
export function stopPerformanceMonitoring() {
  if (performanceObserver) {
    performanceObserver.disconnect();
    performanceObserver = null;
  }

  if (fpsMonitorInterval) {
    clearInterval(fpsMonitorInterval);
    fpsMonitorInterval = null;
  }

  if (metricsCollectionInterval) {
    clearInterval(metricsCollectionInterval);
    metricsCollectionInterval = null;
  }

  debugLog('[Performance] Performance monitoring stopped');
}

/**
 * Измерение времени выполнения функции
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now();
  const result = fn();
  const duration = Math.round(performance.now() - start);
  
  debugLog(`[Performance] ${name} took ${duration}ms`);
  logTelemetry('performance', {
    metric_name: `${name}_duration`,
    metric_value: duration,
  });

  return result;
}

/**
 * Асинхронное измерение времени выполнения функции
 */
export async function measurePerformanceAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const duration = Math.round(performance.now() - start);
  
  debugLog(`[Performance] ${name} took ${duration}ms`);
  logTelemetry('performance', {
    metric_name: `${name}_duration`,
    metric_value: duration,
  });

  return result;
}


