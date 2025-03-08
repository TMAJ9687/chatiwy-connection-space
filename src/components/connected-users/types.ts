
export interface User {
  id: string;
  username: string;
  age: number;
  gender: string;
  country: string;
  flag?: string;
  isOnline: boolean;
  isBot: boolean;
  isVIP: boolean;
  avatar?: string;
  interests?: string[];
}

declare global {
  interface Window {
    unreadMessagesPerUser: Set<string>;
  }
}
