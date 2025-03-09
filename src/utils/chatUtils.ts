
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
  status?: 'sent' | 'delivered' | 'read';
  image?: {
    url: string;
    blurred: boolean;
  };
  audio?: {
    url: string;
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
  isTyping?: boolean;
}

export interface ServerConnectionStatus {
  isConnected: boolean;
  lastConnectedAt: Date | null;
  serverUrl: string | null;
  reconnectAttempts: number;
  error: string | null;
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

// Connection utilities
export const formatConnectionError = (error: any): string => {
  if (!error) return 'Unknown error';
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return JSON.stringify(error);
};

// WebSocket Connection Status
export const getConnectionStatusText = (status: ServerConnectionStatus): string => {
  if (status.isConnected) {
    return 'Connected to chat server';
  }
  
  if (status.reconnectAttempts > 0) {
    return `Connection attempt ${status.reconnectAttempts} failed. Retrying...`;
  }
  
  if (status.error) {
    return `Error connecting to chat server: ${formatConnectionError(status.error)}`;
  }
  
  return 'Disconnected from chat server';
};

// Get connection troubleshooting tips based on error
export const getTroubleshootingTips = (error: string | null): string[] => {
  const tips: string[] = [
    'Make sure the chat server is running',
    'Check your network connection',
    'Verify the server URL is correct'
  ];
  
  if (error?.includes('CORS')) {
    tips.push('CORS issue detected. Make sure the server allows connections from this origin');
  }
  
  if (error?.includes('WebSocket')) {
    tips.push('WebSocket connection failed. The server might not support WebSockets or is blocking them');
  }
  
  if (error?.includes('timeout')) {
    tips.push('Connection timeout. The server might be down or unreachable');
  }
  
  return tips;
};

// Constants
export const IMAGE_UPLOADS_KEY = 'chatiwy_daily_image_uploads';
export const IMAGE_UPLOADS_DATE_KEY = 'chatiwy_image_uploads_date';
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
export const GUIDANCE_ACCEPTED_KEY = 'chatiwy_guidance_accepted';
export const MAX_MESSAGE_LENGTH_REGULAR = 140;
export const MAX_MESSAGE_LENGTH_VIP = 200;
