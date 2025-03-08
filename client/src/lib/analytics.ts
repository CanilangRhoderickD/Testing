
import { IS_DEVELOPMENT } from './constants';

// Google Analytics Measurement ID
const MEASUREMENT_ID = 'G-03XW3FWG7L';

/**
 * Sends an analytics event to Google Analytics
 * Includes error handling for blocked requests
 */
export function sendAnalyticsEvent(eventName: string, eventParams: Record<string, any> = {}) {
  if (IS_DEVELOPMENT) {
    console.log('Analytics event (dev mode):', eventName, eventParams);
    return;
  }
  
  try {
    // @ts-ignore - gtag might not be defined in the global scope
    window.gtag?.('event', eventName, eventParams);
  } catch (error) {
    // Silently handle errors from analytics being blocked
    console.debug('Analytics event could not be sent:', error);
  }
}

/**
 * Initialize analytics - can be called from your main application file
 */
export function initializeAnalytics() {
  if (IS_DEVELOPMENT) {
    console.log('Analytics initialization skipped in development');
    return;
  }
  
  try {
    // Add the Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    
    script.onerror = () => {
      console.debug('Analytics script failed to load - likely blocked by browser');
    };
    
    document.head.appendChild(script);
    
    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    // @ts-ignore
    function gtag() {
      // @ts-ignore
      dataLayer.push(arguments);
    }
    // @ts-ignore
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', MEASUREMENT_ID);
  } catch (error) {
    console.debug('Analytics initialization failed:', error);
  }
}
