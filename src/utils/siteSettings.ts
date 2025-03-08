
// Define types for site settings
export interface SiteSettings {
  photoLimit: number;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  maintenanceMode: boolean;
  siteName: string;
  siteUrl: string;
  vipPhotoLimit: number;
  vipAccessCode: string; // Access code for VIP
  vipPricing: {
    monthly: number;
    yearly: number;
    lifetime: number;
  };
}

// Default settings
export const defaultSettings: SiteSettings = {
  photoLimit: 10,
  seoTitle: "Chatiwy - Private Anonymous Chat & Messaging Platform",
  seoDescription: "Chatiwy is a secure platform for private, one-on-one text and image-based conversations, designed to foster meaningful connections.",
  seoKeywords: "anonymous chat, private messaging, secure chat, instant messaging, online chat, text chat, image sharing",
  maintenanceMode: false,
  siteName: "Chatiwy",
  siteUrl: "https://chatiwy.app",
  vipPhotoLimit: 50, // VIP users get higher limits
  vipAccessCode: "CHATIWY-VIP-TEST", // Default VIP access code for testing
  vipPricing: {
    monthly: 9.99,
    yearly: 99.99,
    lifetime: 299.99
  }
};

// Get all site settings
export function getSiteSettings(): SiteSettings {
  try {
    const savedSettings = localStorage.getItem('site_settings');
    if (savedSettings) {
      return { ...defaultSettings, ...JSON.parse(savedSettings) };
    }
  } catch (error) {
    console.error('Error loading site settings:', error);
  }
  
  return defaultSettings;
}

// Get specific photo limit setting based on user type
export function getPhotoLimit(isVip: boolean = false): number {
  const settings = getSiteSettings();
  return isVip ? settings.vipPhotoLimit : settings.photoLimit;
}

// Get SEO settings
export function getSeoSettings() {
  const settings = getSiteSettings();
  return {
    title: settings.seoTitle,
    description: settings.seoDescription,
    keywords: settings.seoKeywords
  };
}

// Get VIP settings
export function getVipSettings() {
  const settings = getSiteSettings();
  return {
    photoLimit: settings.vipPhotoLimit,
    accessCode: settings.vipAccessCode,
    pricing: settings.vipPricing
  };
}

// Check if a VIP access code is valid
export function isValidVipCode(code: string): boolean {
  const settings = getSiteSettings();
  return code === settings.vipAccessCode;
}

// Save all site settings
export function saveSiteSettings(settings: Partial<SiteSettings>): void {
  const currentSettings = getSiteSettings();
  const newSettings = { ...currentSettings, ...settings };
  
  localStorage.setItem('site_settings', JSON.stringify(newSettings));
}

// Update just the photo limit
export function updatePhotoLimit(limit: number, isVip: boolean = false): void {
  if (isVip) {
    saveSiteSettings({ vipPhotoLimit: limit });
  } else {
    saveSiteSettings({ photoLimit: limit });
  }
}

// Update SEO settings
export function updateSeoSettings(title: string, description: string, keywords: string): void {
  saveSiteSettings({ 
    seoTitle: title, 
    seoDescription: description, 
    seoKeywords: keywords 
  });
}

// Update VIP settings
export function updateVipSettings(photoLimit: number, accessCode: string, pricing: { monthly: number, yearly: number, lifetime: number }): void {
  saveSiteSettings({
    vipPhotoLimit: photoLimit,
    vipAccessCode: accessCode,
    vipPricing: pricing
  });
}

// Get VIP test profile
export function getVipTestProfile(): any {
  try {
    // Create default VIP test profile if it doesn't exist
    const defaultVipProfile = {
      username: "VIP_tester",
      isVIP: true,
      joinDate: new Date().toISOString(),
      accessCode: defaultSettings.vipAccessCode
    };
    
    const profile = localStorage.getItem('vip_test_profile');
    if (profile) {
      return JSON.parse(profile);
    } else {
      // Save default profile if none exists
      localStorage.setItem('vip_test_profile', JSON.stringify(defaultVipProfile));
      return defaultVipProfile;
    }
  } catch (error) {
    console.error('Error loading VIP test profile:', error);
  }
  
  return null;
}

// Create or update VIP test profile
export function saveVipTestProfile(profile: any): void {
  try {
    localStorage.setItem('vip_test_profile', JSON.stringify({
      ...profile,
      isVIP: true, // Always ensure VIP status
    }));
  } catch (error) {
    console.error('Error saving VIP test profile:', error);
  }
}
