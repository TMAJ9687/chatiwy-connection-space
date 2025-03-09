// Import required dependencies and types
import { countries } from '@/utils/countryData';
import { botProfiles } from '@/utils/botProfiles';
import { User, STANDARD_AVATARS, MALE_AVATARS, FEMALE_AVATARS } from './types';

// Fetch country flag from REST Countries API
export async function fetchCountryFlag(countryCode: string): Promise<string> {
  try {
    const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
    if (!response.ok) {
      throw new Error('Country not found');
    }
    const data = await response.json();
    return data[0]?.flags?.png || '';
  } catch (error) {
    console.error('Error fetching country flag:', error);
    return '';
  }
}

// Get country flag emoji as fallback
export function getCountryFlag(countryName?: string): string {
  if (!countryName) return '';
  
  // Country code mapping for common countries
  const countryCodeMap: Record<string, string> = {
    'USA': 'US',
    'United States': 'US',
    'UK': 'GB',
    'United Kingdom': 'GB',
    'Canada': 'CA',
    'Australia': 'AU',
    'France': 'FR',
    'Germany': 'DE',
    'Italy': 'IT',
    'Japan': 'JP',
    'China': 'CN',
    'India': 'IN',
    'Brazil': 'BR',
    'Russia': 'RU',
    'Spain': 'ES',
    'Mexico': 'MX',
  };
  
  // Emoji flags as fallback
  const emojiFlags: Record<string, string> = {
    'US': '🇺🇸',
    'GB': '🇬🇧',
    'CA': '🇨🇦',
    'AU': '🇦🇺',
    'FR': '🇫🇷',
    'DE': '🇩🇪',
    'IT': '🇮🇹',
    'JP': '🇯🇵',
    'CN': '🇨🇳',
    'IN': '🇮🇳',
    'BR': '🇧🇷',
    'RU': '🇷🇺',
    'ES': '🇪🇸',
    'MX': '🇲🇽',
  };
  
  // Find the country in our data
  const country = countries.find(c => 
    c.name.toLowerCase() === countryName.toLowerCase() ||
    c.code.toLowerCase() === countryName.toLowerCase()
  );
  
  const countryCode = country?.code || countryCodeMap[countryName] || '';
  
  // Trigger async fetch of actual flag but return emoji for immediate display
  if (countryCode) {
    fetchCountryFlag(countryCode).then(flagUrl => {
      // Cache the flag URL for future use
      if (flagUrl) {
        localStorage.setItem(`flag_${countryCode}`, flagUrl);
      }
    });
    
    // Return emoji flag as fallback
    return emojiFlags[countryCode] || '';
  }
  
  return '';
}

// Function to get appropriate avatar URL based on user properties
export function getAvatarUrl(name: string, gender: string, isVIP = false): string {
  if (isVIP) {
    // Use VIP avatars based on gender
    if (gender.toLowerCase() === 'male') {
      return MALE_AVATARS[Math.floor(Math.random() * MALE_AVATARS.length)];
    } else {
      return FEMALE_AVATARS[Math.floor(Math.random() * FEMALE_AVATARS.length)];
    }
  } else {
    // Use standard avatars based on gender
    return gender.toLowerCase() === 'male' ? STANDARD_AVATARS.male : STANDARD_AVATARS.female;
  }
}

// Get connected users with filtering for VIP users
export function getConnectedUsers(userProfile: any, socketConnected: boolean, realTimeUsers: any[] = []): any[] {
  let connectedUsers: any[] = [];
  
  if (socketConnected && realTimeUsers.length > 0) {
    connectedUsers = realTimeUsers.filter(user => user.id !== userProfile.id);
  } else {
    // Use bot profiles as mock users when not connected
    connectedUsers = botProfiles.map(bot => ({
      id: bot.id,
      username: bot.username,
      age: bot.age,
      gender: bot.gender,
      country: bot.country,
      isOnline: true,
      isBot: true,
      interests: bot.interests,
      isVIP: bot.isVIP
    }));
  }
  
  // Ensure VIP users are visible to everyone, not just other VIP users
  return connectedUsers;
}
