// lib/analytics.ts

// 1. Facebook Event Helper
export const fbEvent = (name: string, options = {}) => {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", name, options);
  }
};

// 2. Google Event Helper
export const googleEvent = (action: string, params = {}) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", action, params);
  }
};

// 3. TikTok Event Helper
export const tiktokEvent = (name: string, options = {}) => {
  if (typeof window !== "undefined" && (window as any).ttq) {
    (window as any).ttq.track(name, options);
  }
};

// --- THE MASTER TRIGGER ---
export const trackConversion = (eventName: 'Lead' | 'Purchase' | 'AddToCart' | 'CompleteRegistration', value?: number) => {
  // Safe check for window
  if (typeof window === "undefined") return;

  console.log(`🔥 Firing Pixel Event: ${eventName} | Value: ${value || 0}`);

  // Map to platform-specific names
  if (eventName === 'Lead' || eventName === 'CompleteRegistration') {
    fbEvent('Lead');
    googleEvent('generate_lead');
    tiktokEvent('SubmitForm'); 
  } 
  else if (eventName === 'Purchase') {
    fbEvent('Purchase', { value: value, currency: 'USD' });
    googleEvent('purchase', { value: value, currency: 'USD', transaction_id: Date.now() });
    tiktokEvent('CompletePayment', { value: value, currency: 'USD' });
  }
  else if (eventName === 'AddToCart') {
    fbEvent('InitiateCheckout');
    googleEvent('begin_checkout');
    tiktokEvent('InitiateCheckout');
  }
};