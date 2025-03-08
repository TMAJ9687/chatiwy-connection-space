
// Define types for site settings
export interface SiteSettings {
  photoLimit: number;
}

// Default settings
export const defaultSettings: SiteSettings = {
  photoLimit: 10,
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

// Get specific photo limit setting
export function getPhotoLimit(): number {
  return getSiteSettings().photoLimit;
}

// Save all site settings
export function saveSiteSettings(settings: Partial<SiteSettings>): void {
  const currentSettings = getSiteSettings();
  const newSettings = { ...currentSettings, ...settings };
  
  localStorage.setItem('site_settings', JSON.stringify(newSettings));
}

// Update just the photo limit
export function updatePhotoLimit(limit: number): void {
  saveSiteSettings({ photoLimit: limit });
}
