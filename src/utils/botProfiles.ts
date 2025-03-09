
export interface BotProfile {
  id: string;
  username: string;
  age: number;
  gender: 'Male' | 'Female';
  country: string;
  interests: string[];
  isVIP?: boolean;
  // Add missing properties
  isOnline?: boolean;
  isAdmin?: boolean;
  flag?: string;
}

export const botProfiles: BotProfile[] = [
  {
    id: 'bot1',
    username: 'TravelGuru',
    age: 28,
    gender: 'Male',
    country: 'United States',
    interests: ['Travel', 'Photography', 'Languages'],
    isVIP: true,
    isOnline: true,
    flag: '🇺🇸'
  },
  {
    id: 'bot2',
    username: 'FitnessFanatic',
    age: 24,
    gender: 'Female',
    country: 'Canada',
    interests: ['Fitness', 'Nutrition', 'Yoga'],
    isVIP: false,
    isOnline: true,
    flag: '🇨🇦'
  },
  {
    id: 'bot3',
    username: 'TechWizard',
    age: 31,
    gender: 'Male',
    country: 'Germany',
    interests: ['Coding', 'Gaming', 'AI'],
    isVIP: true,
    isOnline: true,
    flag: '🇩🇪'
  },
  {
    id: 'bot4',
    username: 'BookLover',
    age: 26,
    gender: 'Female',
    country: 'United Kingdom',
    interests: ['Literature', 'Poetry', 'Writing'],
    isVIP: false,
    isOnline: true,
    flag: '🇬🇧'
  },
  {
    id: 'bot5',
    username: 'MusicProducer',
    age: 29,
    gender: 'Male',
    country: 'France',
    interests: ['Music', 'DJing', 'Concerts'],
    isVIP: true,
    isOnline: true,
    flag: '🇫🇷'
  },
  {
    id: 'bot6',
    username: 'ArtisticSoul',
    age: 27,
    gender: 'Female',
    country: 'Italy',
    interests: ['Art', 'Drawing', 'Museums'],
    isVIP: false,
    isOnline: true,
    flag: '🇮🇹'
  },
  {
    id: 'bot7',
    username: 'ChefMaster',
    age: 33,
    gender: 'Male',
    country: 'Spain',
    interests: ['Cooking', 'Baking', 'Food'],
    isVIP: true,
    isOnline: true,
    flag: '🇪🇸'
  },
  {
    id: 'bot8',
    username: 'AdventureSeeker',
    age: 25,
    gender: 'Female',
    country: 'Australia',
    interests: ['Hiking', 'Camping', 'Outdoors'],
    isVIP: false,
    isOnline: true,
    flag: '🇦🇺'
  },
  {
    id: 'bot9',
    username: 'SportsEnthusiast',
    age: 30,
    gender: 'Male',
    country: 'Brazil',
    interests: ['Soccer', 'Basketball', 'Tennis'],
    isVIP: true,
    isOnline: true,
    flag: '🇧🇷'
  },
  {
    id: 'bot10',
    username: 'FashionIcon',
    age: 28,
    gender: 'Female',
    country: 'Japan',
    interests: ['Fashion', 'Design', 'Trends'],
    isVIP: false,
    isOnline: true,
    flag: '🇯🇵'
  }
];

// Add function to generate random bot responses
export const getRandomBotResponse = (topic?: string): string => {
  const genericResponses = [
    "That's interesting! Tell me more.",
    "I see what you mean. What else is on your mind?",
    "That's a great point. I appreciate your perspective.",
    "I'm enjoying our conversation. What else would you like to talk about?",
    "That's fascinating. I'd love to hear more about that.",
    "Thanks for sharing that with me! How are you feeling about it?",
    "I'm glad you brought that up. Let's discuss it further.",
    "I hadn't thought about it that way before. Tell me more.",
    "That's really cool! What makes you interested in that?",
    "I'm curious to hear more about your experiences with that."
  ];

  const topicResponses: {[key: string]: string[]} = {
    travel: [
      "Have you traveled anywhere exciting recently?",
      "What's your favorite place you've ever visited?",
      "I love exploring new places! Any travel plans coming up?",
      "If you could go anywhere in the world, where would it be?",
      "Travel broadens the mind, don't you think?"
    ],
    music: [
      "What kind of music do you enjoy listening to?",
      "Have you been to any good concerts lately?",
      "Music is such a powerful form of expression. What artists inspire you?",
      "Do you play any instruments?",
      "What's your go-to song when you need a mood boost?"
    ],
    food: [
      "What's your favorite cuisine?",
      "Have you tried any new restaurants lately?",
      "Cooking or ordering in - which do you prefer?",
      "What's the best meal you've ever had?",
      "Do you enjoy trying foods from different cultures?"
    ]
  };

  if (topic && topicResponses[topic.toLowerCase()]) {
    const responses = topicResponses[topic.toLowerCase()];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  return genericResponses[Math.floor(Math.random() * genericResponses.length)];
};
