
export interface BotProfile {
  id: string;
  username: string;
  age: number;
  gender: 'Male' | 'Female';
  country: string;
  interests: string[];
  isVIP?: boolean;
}

export const botProfiles: BotProfile[] = [
  {
    id: 'bot1',
    username: 'TravelGuru',
    age: 28,
    gender: 'Male',
    country: 'United States',
    interests: ['Travel', 'Photography', 'Languages'],
    isVIP: true
  },
  {
    id: 'bot2',
    username: 'FitnessFanatic',
    age: 24,
    gender: 'Female',
    country: 'Canada',
    interests: ['Fitness', 'Nutrition', 'Yoga'],
    isVIP: false
  },
  {
    id: 'bot3',
    username: 'TechWizard',
    age: 31,
    gender: 'Male',
    country: 'Germany',
    interests: ['Coding', 'Gaming', 'AI'],
    isVIP: true
  },
  {
    id: 'bot4',
    username: 'BookLover',
    age: 26,
    gender: 'Female',
    country: 'United Kingdom',
    interests: ['Literature', 'Poetry', 'Writing'],
    isVIP: false
  },
  {
    id: 'bot5',
    username: 'MusicProducer',
    age: 29,
    gender: 'Male',
    country: 'France',
    interests: ['Music', 'DJing', 'Concerts'],
    isVIP: true
  },
  {
    id: 'bot6',
    username: 'ArtisticSoul',
    age: 27,
    gender: 'Female',
    country: 'Italy',
    interests: ['Art', 'Drawing', 'Museums'],
    isVIP: false
  },
  {
    id: 'bot7',
    username: 'ChefMaster',
    age: 33,
    gender: 'Male',
    country: 'Spain',
    interests: ['Cooking', 'Baking', 'Food'],
    isVIP: true
  },
  {
    id: 'bot8',
    username: 'AdventureSeeker',
    age: 25,
    gender: 'Female',
    country: 'Australia',
    interests: ['Hiking', 'Camping', 'Outdoors'],
    isVIP: false
  },
  {
    id: 'bot9',
    username: 'SportsEnthusiast',
    age: 30,
    gender: 'Male',
    country: 'Brazil',
    interests: ['Soccer', 'Basketball', 'Tennis'],
    isVIP: true
  },
  {
    id: 'bot10',
    username: 'FashionIcon',
    age: 28,
    gender: 'Female',
    country: 'Japan',
    interests: ['Fashion', 'Design', 'Trends'],
    isVIP: false
  }
];
