
import { botProfiles } from '@/utils/botProfiles';
import { countries } from '@/utils/countryData';

export interface Message {
  id: string;
  sender: string;
  senderId?: string;
  content: string;
  timestamp: Date;
  isBot: boolean;
  isRead?: boolean;
  image?: {
    url: string;
    blurred: boolean;
  };
}

export interface ConnectedUser {
  id: string;
  username: string;
  isBot?: boolean;
  isAdmin?: boolean;
  interests?: string[];
  gender?: string;
  country?: string;
  age?: number;
  isOnline?: boolean;
}

export const BLOCKED_USERS_KEY = 'chatiwy_blocked_users';

export const getAvatarUrl = (username: string, gender: string = 'male') => {
  const nameHash = username.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const avatarId = nameHash % 70;
  return `https://uifaces.co/api/portraits/${gender}/${avatarId}`;
};

export const getGenderForAvatar = (username: string, isBot: boolean = false): string => {
  if (isBot) {
    return 'lego';
  }
  const nameHash = username.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return nameHash % 2 === 0 ? 'men' : 'women';
};

export const getCountryFlag = (countryCode: string | undefined) => {
  if (!countryCode) return null;
  const country = countries.find(c => c.code === countryCode);
  if (!country) return null;
  return country.flag || country.code;
};

// Constants
export const IMAGE_UPLOADS_KEY = 'chatiwy_daily_image_uploads';
export const IMAGE_UPLOADS_DATE_KEY = 'chatiwy_image_uploads_date';
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
export const GUIDANCE_ACCEPTED_KEY = 'chatiwy_guidance_accepted';
export const MAX_MESSAGE_LENGTH_REGULAR = 140;
export const MAX_MESSAGE_LENGTH_VIP = 200;
