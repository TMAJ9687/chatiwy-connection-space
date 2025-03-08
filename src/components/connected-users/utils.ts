
import { countries } from '@/utils/countryData';
import { botProfiles } from '@/utils/botProfiles';

// Utility function to get country flag
export const getCountryFlag = (countryName?: string): string => {
  if (!countryName || countryName === 'Unknown') return '🌍';
  
  // Find the country in the countries array
  const country = countries.find(c => c.name === countryName);
  return country?.flag || '🌍';
};

// Utility function to get avatar URL
export const getAvatarUrl = (name: string, gender: string): string => {
  // Generate a consistent hash for the name to get the same avatar each time
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Select avatar style based on gender and hash
  const style = gender === 'Male' ? 'male' : 'female';
  const number = Math.abs(hash % 10) + 1; // Numbers 1-10
  
  return `https://api.dicebear.com/7.x/personas/svg?seed=${style}${number}`;
};

// Function to get connected users
export const getConnectedUsers = (userProfile: any, socketConnected: boolean, realTimeUsers: any[]) => {
  try {
    if (socketConnected && realTimeUsers.length > 0) {
      // Only return users that are not the current user and are online
      const socketUsers = realTimeUsers
        .filter(user => user.id !== userProfile.id && user.isOnline)
        .map(user => ({
          id: user.id,
          username: user.username,
          age: user.age,
          gender: user.gender,
          country: user.country || 'Unknown',
          flag: user.flag || getCountryFlag(user.country),
          isOnline: true,
          isBot: false,
          isVIP: !!user.isVIP,
          avatar: user.avatar || getAvatarUrl(user.username, user.gender)
        }));
      
      const bots = botProfiles.map(bot => ({
        ...bot,
        isBot: false,
        isVIP: false
      }));
      
      return [...socketUsers, ...bots];
    } else {
      const mockUsers = [
        {
          id: "mock-user-1",
          username: "TravelBug",
          age: 28,
          gender: "Female",
          country: "Canada",
          flag: "🇨🇦",
          isOnline: true,
          isBot: false,
          isVIP: true,
          avatar: getAvatarUrl("TravelBug", "Female")
        },
        {
          id: "mock-user-2",
          username: "CoffeeGuy",
          age: 34,
          gender: "Male",
          country: "Italy",
          flag: "🇮🇹",
          isOnline: true,
          isBot: false,
          isVIP: false,
          avatar: getAvatarUrl("CoffeeGuy", "Male")
        }
      ];
      
      const bots = botProfiles.map(bot => ({
        ...bot,
        flag: getCountryFlag(bot.country),
        isBot: false,
        isVIP: false,
        avatar: getAvatarUrl(bot.username, bot.gender)
      }));
      
      return [...mockUsers, ...bots];
    }
  } catch (error) {
    console.error("Error fetching connected users:", error);
    return botProfiles.map(bot => ({
      ...bot,
      flag: getCountryFlag(bot.country),
      isBot: false,
      isVIP: false,
      avatar: getAvatarUrl(bot.username, bot.gender)
    }));
  }
};
