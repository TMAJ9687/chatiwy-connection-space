
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
  vipAccessCode: "CHATIWY-VIP-2023", // Default VIP access code (password for VIP_Tester)
  vipPricing: {
    monthly: 5.00,
    yearly: 49.99,
    lifetime: 199.99
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
    const testProfile = {
      id: "vip_test_id_123",
      username: "VIP_Tester",
      isVIP: true,
      email: "vip_tester@chatiwy.app",
      gender: "male",
      country: "US",
      interests: ["chatting", "music", "travel", "technology"],
      registrationDate: new Date().toISOString(),
      photoUploaded: 0,
      accessCode: defaultSettings.vipAccessCode
    };
    
    localStorage.setItem('vip_test_profile', JSON.stringify(testProfile));
    return testProfile;
  } catch (error) {
    console.error('Error creating VIP test profile:', error);
  }
  
  return null;
}
