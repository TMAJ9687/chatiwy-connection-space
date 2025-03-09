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

export function getCountryFlag(countryName?: string): string {
  if (!countryName) return '';
  
  // This is a fallback for common countries - for immediate display
  const commonFlags: Record<string, string> = {
    'USA': '🇺🇸',
    'US': '🇺🇸',
    'United States': '🇺🇸',
    'UK': '🇬🇧',
    'United Kingdom': '🇬🇧',
    'Canada': '🇨🇦',
    'Australia': '🇦🇺',
    'France': '🇫🇷',
    'Germany': '🇩🇪',
    'Italy': '🇮🇹',
    'Japan': '🇯🇵',
    'China': '🇨🇳',
    'India': '🇮🇳',
    'Brazil': '🇧🇷',
    'Russia': '🇷🇺',
    'Spain': '🇪🇸',
    'Mexico': '🇲🇽',
  };
  
  return commonFlags[countryName] || '';
}

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

  // Add specific diagnostics for common issues
  if (error?.includes('failed')) {
    tips.push('Try using a different browser or network connection');
    tips.push('Check if your firewall or proxy is blocking WebSocket connections');
  }
  
  return tips;
};

export const diagnoseWebSocketConnectivity = async (serverUrl: string): Promise<{
  canConnect: boolean;
  protocol: string;
  error?: string;
  latency?: number;
}> => {
  try {
    // First check if we can reach the server via HTTP(S)
    const start = performance.now();
    
    // Try to connect with fetch first to test basic connectivity
    const response = await fetch(serverUrl.replace('ws://', 'http://').replace('wss://', 'https://'), {
      method: 'HEAD',
      mode: 'no-cors', // This allows us to at least attempt the connection
      cache: 'no-cache',
      headers: {
        'Accept': 'text/html'
      },
      redirect: 'follow',
    }).catch(e => {
      throw new Error(`HTTP connection failed: ${e.message}`);
    });
    
    const latency = performance.now() - start;
    
    // Now try a WebSocket connection
    return new Promise((resolve) => {
      try {
        const ws = new WebSocket(serverUrl);
        const timeout = setTimeout(() => {
          ws.close();
          resolve({
            canConnect: false,
            protocol: serverUrl.startsWith('wss') ? 'WSS' : 'WS',
            error: 'WebSocket connection timeout after 5 seconds',
            latency
          });
        }, 5000);
        
        ws.onopen = () => {
          clearTimeout(timeout);
          ws.close();
          resolve({
            canConnect: true,
            protocol: ws.protocol || (serverUrl.startsWith('wss') ? 'WSS' : 'WS'),
            latency
          });
        };
        
        ws.onerror = (error) => {
          clearTimeout(timeout);
          ws.close();
          resolve({
            canConnect: false,
            protocol: serverUrl.startsWith('wss') ? 'WSS' : 'WS',
            error: 'WebSocket connection error',
            latency
          });
        };
      } catch (error) {
        resolve({
          canConnect: false,
          protocol: serverUrl.startsWith('wss') ? 'WSS' : 'WS',
          error: `WebSocket initialization error: ${error instanceof Error ? error.message : String(error)}`,
          latency
        });
      }
    });
  } catch (error) {
    return {
      canConnect: false,
      protocol: serverUrl.startsWith('wss') ? 'WSS' : 'WS',
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

export const IMAGE_UPLOADS_KEY = 'chatiwy_daily_image_uploads';
export const IMAGE_UPLOADS_DATE_KEY = 'chatiwy_image_uploads_date';
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
export const GUIDANCE_ACCEPTED_KEY = 'chatiwy_guidance_accepted';
export const MAX_MESSAGE_LENGTH_REGULAR = 140;
export const MAX_MESSAGE_LENGTH_VIP = 200;
