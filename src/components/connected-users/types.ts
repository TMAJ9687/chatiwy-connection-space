
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

// Standard user avatars
export const STANDARD_AVATARS = {
  male: '/lovable-uploads/5884436a-ebd6-4bb6-a81e-70d8cd860aba.png', // male-standard
  female: '/lovable-uploads/25ff92ca-bd2a-41b9-a2eb-3f1e39b4b89b.png' // female-standard
};

declare global {
  interface Window {
    unreadMessagesPerUser: Set<string>;
  }
}
