// lib/analytics.ts

// FACEBOOK TRACKING
export const fbEvent = (name: string, options = {}) => {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", name, options);
  }
};

// GOOGLE TRACKING
export const googleEvent = (action: string, params = {}) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", action, params);
  }
};

// TIKTOK TRACKING
export const tiktokEvent = (name: string, options = {}) => {
  if (typeof window !== "undefined" && (window as any).ttq) {
    (window as any).ttq.track(name, options);
  }
};

// MASTER TRACKER (Fires all 3 at once)
export const trackConversion = (eventName: string, value?: number) => {
  console.log(`🔥 Firing Event: ${eventName} - Value: ${value}`);
  
  // 1. Facebook
  fbEvent(eventName, { value: value, currency: "USD" });
  
  // 2. Google (Standard names mapping)
  const gName = eventName === 'Purchase' ? 'purchase' : eventName === 'Lead' ? 'generate_lead' : 'custom_event';
  googleEvent(gName, { value: value, currency: "USD" });

  // 3. TikTok
  tiktokEvent(eventName, { value: value, currency: "USD" });
};