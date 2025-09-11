/**
 * Image Performance Monitoring Utility
 * 
 * Tracks image loading performance metrics to help optimize the catalog experience
 */

class ImagePerformanceMonitor {
  constructor() {
    this.metrics = {
      totalImages: 0,
      loadedImages: 0,
      failedImages: 0,
      loadTimes: [],
      averageLoadTime: 0,
      totalDataTransferred: 0,
    };
    this.imageObserver = null;
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  /**
   * Start monitoring image performance
   */
  startMonitoring() {
    if (!this.isEnabled) return;

    // Track images being loaded
    this.trackImageLoading();
    
    // Track network usage if available
    this.trackNetworkUsage();
    
    console.log('🖼️ Image Performance Monitor: Started');
  }

  /**
   * Track individual image loading
   */
  trackImageLoading() {
    const originalImage = window.Image;
    const monitor = this;

    window.Image = function(...args) {
      const img = new originalImage(...args);
      const startTime = performance.now();
      
      monitor.metrics.totalImages++;

      img.addEventListener('load', function() {
        const loadTime = performance.now() - startTime;
        monitor.metrics.loadedImages++;
        monitor.metrics.loadTimes.push(loadTime);
        monitor.updateAverageLoadTime();
        
        console.log(`✅ Image loaded in ${loadTime.toFixed(2)}ms: ${this.src.substring(0, 50)}...`);
      });

      img.addEventListener('error', function() {
        monitor.metrics.failedImages++;
        console.warn(`❌ Image failed to load: ${this.src.substring(0, 50)}...`);
      });

      return img;
    };
  }

  /**
   * Track network usage for images
   */
  trackNetworkUsage() {
    if ('navigator' in window && 'connection' in navigator) {
      const connection = navigator.connection;
      console.log(`📊 Connection: ${connection.effectiveType}, Downlink: ${connection.downlink}Mbps`);
    }

    // Track data usage via Performance API
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.initiatorType === 'img') {
            this.metrics.totalDataTransferred += entry.transferSize || 0;
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
    }
  }

  /**
   * Update average load time
   */
  updateAverageLoadTime() {
    if (this.metrics.loadTimes.length > 0) {
      this.metrics.averageLoadTime = 
        this.metrics.loadTimes.reduce((sum, time) => sum + time, 0) / this.metrics.loadTimes.length;
    }
  }

  /**
   * Get performance report
   */
  getReport() {
    const report = {
      ...this.metrics,
      successRate: this.metrics.totalImages > 0 
        ? (this.metrics.loadedImages / this.metrics.totalImages * 100).toFixed(2) 
        : 0,
      dataTransferredMB: (this.metrics.totalDataTransferred / (1024 * 1024)).toFixed(2),
    };

    return report;
  }

  /**
   * Log performance report to console
   */
  logReport() {
    if (!this.isEnabled) return;

    const report = this.getReport();
    
    console.group('🖼️ Image Performance Report');
    console.log(`Total Images: ${report.totalImages}`);
    console.log(`Loaded Successfully: ${report.loadedImages}`);
    console.log(`Failed: ${report.failedImages}`);
    console.log(`Success Rate: ${report.successRate}%`);
    console.log(`Average Load Time: ${report.averageLoadTime.toFixed(2)}ms`);
    console.log(`Data Transferred: ${report.dataTransferredMB}MB`);
    console.groupEnd();
  }

  /**
   * Reset metrics
   */
  reset() {
    this.metrics = {
      totalImages: 0,
      loadedImages: 0,
      failedImages: 0,
      loadTimes: [],
      averageLoadTime: 0,
      totalDataTransferred: 0,
    };
  }

  /**
   * Get recommendations based on performance
   */
  getRecommendations() {
    const report = this.getReport();
    const recommendations = [];

    if (report.successRate < 95) {
      recommendations.push('🔧 Image success rate is low. Check image URLs and implement better error handling.');
    }

    if (report.averageLoadTime > 2000) {
      recommendations.push('⚡ Average load time is high. Consider implementing image compression or CDN.');
    }

    if (parseFloat(report.dataTransferredMB) > 10) {
      recommendations.push('📦 High data usage detected. Implement thumbnail loading and progressive enhancement.');
    }

    if (report.totalImages > 50) {
      recommendations.push('🔄 Many images loaded. Ensure lazy loading is working properly.');
    }

    return recommendations;
  }
}

// Create singleton instance
const imagePerformanceMonitor = new ImagePerformanceMonitor();

// Auto-start monitoring in development
if (process.env.NODE_ENV === 'development') {
  // Start monitoring after a short delay to ensure the page is loaded
  setTimeout(() => {
    imagePerformanceMonitor.startMonitoring();
    
    // Log report every 30 seconds
    setInterval(() => {
      imagePerformanceMonitor.logReport();
      const recommendations = imagePerformanceMonitor.getRecommendations();
      if (recommendations.length > 0) {
        console.group('💡 Image Performance Recommendations');
        recommendations.forEach(rec => console.log(rec));
        console.groupEnd();
      }
    }, 30000);
  }, 1000);
}

export default imagePerformanceMonitor;
