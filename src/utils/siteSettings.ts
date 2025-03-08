
// Define types for site settings
export interface SiteSettings {
  photoLimit: number;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  maintenanceMode: boolean;
  siteName: string;
  siteUrl: string;
  vipPhotoLimit: number; // Adding VIP photo limit
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
  vipPhotoLimit: 50 // VIP users get higher limits
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
