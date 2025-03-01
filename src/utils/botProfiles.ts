// Create diverse bot profiles with different genders, countries, ages, and interests
export interface BotProfile {
  id: string;
  username: string;
  age: number;
  gender: 'Male' | 'Female';
  country: string;
  flag: string;
  interests: string[];
  isOnline?: boolean;
  lastActive?: string;
  isAdmin?: boolean;
}

export const botProfiles: BotProfile[] = [
  {
    id: 'bot-1',
    username: 'Emma',
    age: 25,
    gender: 'Female',
    country: 'United States',
    flag: '🇺🇸',
    interests: ['Photography', 'Hiking', 'Cooking'],
    isAdmin: false
  },
  {
    id: 'bot-2',
    username: 'Liam',
    age: 28,
    gender: 'Male',
    country: 'Canada',
    flag: '🇨🇦',
    interests: ['Gaming', 'Technology', 'Movies'],
    isAdmin: false
  },
  {
    id: 'bot-3',
    username: 'Sophia',
    age: 23,
    gender: 'Female',
    country: 'United Kingdom',
    flag: '🇬🇧',
    interests: ['Art', 'Music', 'Travel'],
    isAdmin: false
  },
  {
    id: 'bot-4',
    username: 'Noah',
    age: 30,
    gender: 'Male',
    country: 'Australia',
    flag: '🇦🇺',
    interests: ['Sports', 'Fitness', 'Reading'],
    isAdmin: false
  },
  {
    id: 'bot-5',
    username: 'Olivia',
    age: 26,
    gender: 'Female',
    country: 'France',
    flag: '🇫🇷',
    interests: ['Fashion', 'Baking', 'Dancing'],
    isAdmin: false
  },
  {
    id: 'bot-6',
    username: 'William',
    age: 31,
    gender: 'Male',
    country: 'Germany',
    flag: '🇩🇪',
    interests: ['Cycling', 'Photography', 'History'],
    isAdmin: false
  },
  {
    id: 'bot-7',
    username: 'Ava',
    age: 24,
    gender: 'Female',
    country: 'Italy',
    flag: '🇮🇹',
    interests: ['Cooking', 'Languages', 'Movies'],
    isAdmin: false
  },
  {
    id: 'bot-8',
    username: 'James',
    age: 29,
    gender: 'Male',
    country: 'Spain',
    flag: '🇪🇸',
    interests: ['Travel', 'Music', 'Food'],
    isAdmin: false
  },
  {
    id: 'bot-9',
    username: 'Isabella',
    age: 27,
    gender: 'Female',
    country: 'Japan',
    flag: '🇯🇵',
    interests: ['Anime', 'Gaming', 'Drawing'],
    isAdmin: false
  },
  {
    id: 'bot-10',
    username: 'Benjamin',
    age: 33,
    gender: 'Male',
    country: 'Brazil',
    flag: '🇧🇷',
    interests: ['Soccer', 'Beach', 'Dancing'],
    isAdmin: false
  },
  {
    id: 'admin-1',
    username: 'Admin',
    age: 35,
    gender: 'Male',
    country: 'Global',
    flag: '🌎',
    interests: ['Moderation', 'Support', 'Community'],
    isAdmin: true
  }
];

// Bot conversation starters and responses
export const botConversationStarters = [
  "Hi there! How are you doing today?",
  "Hello! What brings you to Chatiwy?",
  "Hey! I like your interests. Do you enjoy [interest] often?",
  "Hi! I noticed we both like [interest]. What's your favorite thing about it?",
  "Hello from [country]! How's the weather where you are?",
  "Hey there! Have you been using Chatiwy for long?",
  "Hi! What have you been up to today?",
  "Hello! What's your favorite thing to do in your free time?",
  "Hey! Any recommendations for good movies/books you've enjoyed recently?",
  "Hi there! If you could travel anywhere right now, where would you go?"
];

export const botResponses = {
  greeting: [
    "I'm doing great, thanks for asking! How about you?",
    "Pretty good! Just taking a break and chatting with people. How's your day going?",
    "I'm good! Excited to meet new people here. What about you?",
    "Doing well! Just relaxing and enjoying some conversations. How are you?"
  ],
  interests: [
    "I've been into [interest] for years now. What got you interested in it?",
    "Oh, I love [interest]! Do you have any favorite [interest] that you'd recommend?",
    "[Interest] is such a great hobby. What's your favorite thing about it?",
    "I'm actually just getting into [interest] more seriously. Any tips for beginners?"
  ],
  weather: [
    "The weather in [country] is [weather_type] today. How is it where you are?",
    "It's a beautiful day here in [country]! How's the weather there?",
    "It's been raining here in [country], but I don't mind. What's it like where you are?",
    "The weather is perfect for staying inside and chatting today. How is it on your end?"
  ],
  generic: [
    "That's interesting! Tell me more about that.",
    "Oh, I see what you mean. I've had similar experiences.",
    "That's cool! I've never thought about it that way before.",
    "Really? That's fascinating. What else do you enjoy?",
    "I can definitely relate to that. What do you think about...?",
    "That makes a lot of sense. Have you always felt that way?",
    "I appreciate you sharing that with me. What made you interested in that?",
    "That sounds fun! I've been wanting to try something like that."
  ]
};

// Function to get a random response from a category
export const getRandomBotResponse = (category: keyof typeof botResponses) => {
  const responses = botResponses[category];
  return responses[Math.floor(Math.random() * responses.length)];
};

// Function to get a random conversation starter
export const getRandomConversationStarter = () => {
  return botConversationStarters[Math.floor(Math.random() * botConversationStarters.length)];
};
