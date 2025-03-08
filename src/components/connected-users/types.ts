
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

// VIP male avatars
export const MALE_AVATARS = [
  '/lovable-uploads/7accc055-0e07-48ee-bb97-81ef9fd86baf.png', // male-1
  '/lovable-uploads/a03906b5-705e-4849-96e1-703cc2a7ac76.png', // male-2
  '/lovable-uploads/ceafdac2-c3e8-4013-874a-83b838d550d9.png', // male-3
  '/lovable-uploads/f0cc3d1f-ef75-4494-be6c-139b4a7556bf.png', // male-4
  '/lovable-uploads/ef1c978d-57a7-4ddb-ab41-5a6ade3c910f.png', // male-5
  '/lovable-uploads/98169ece-5312-4e3e-8178-7c1c7745ffa3.png', // male-6
  '/lovable-uploads/544bfb80-f8c7-4615-84d7-1a8b05ed1516.png', // male-7
  '/lovable-uploads/c7f14e64-9779-4494-8460-a6933c916e1e.png', // male-8
  '/lovable-uploads/5502cea4-027a-41fb-8a13-655c05afa600.png', // male-9
  '/lovable-uploads/b46fb4d7-0e3e-45f1-9a62-b0e147e35e09.png', // male-10
];

// VIP female avatars
export const FEMALE_AVATARS = [
  '/lovable-uploads/57331f9a-83b5-435e-8244-a750f249c0b6.png', // female-1
  '/lovable-uploads/d2d17a1e-c20e-48b7-a1ad-6509e49982c4.png', // female-2
  '/lovable-uploads/69e15008-2d7e-486b-9bc8-6dadc3b071cb.png', // female-3
  '/lovable-uploads/f4030c79-e5d3-47ab-92dc-78b611b4c3cb.png', // female-4
  '/lovable-uploads/0798049e-4f90-4102-91a4-f731bf02d914.png', // female-5
  '/lovable-uploads/f112b212-1604-40c8-8be1-43e3ccd1e561.png', // female-6
  '/lovable-uploads/25ff92ca-bd2a-41b9-a2eb-3f1e39b4b89b.png', // female-7
  '/lovable-uploads/5884436a-ebd6-4bb6-a81e-70d8cd860aba.png', // female-8
  '/lovable-uploads/7accc055-0e07-48ee-bb97-81ef9fd86baf.png', // female-9
  '/lovable-uploads/a03906b5-705e-4849-96e1-703cc2a7ac76.png', // female-10
];

declare global {
  interface Window {
    unreadMessagesPerUser: Set<string>;
  }
}
