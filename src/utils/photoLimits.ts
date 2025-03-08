
import { getPhotoLimit } from './siteSettings';

// Key for storing user's daily photo count in localStorage
const getPhotoCountKey = (userId: string) => `photo_count_${userId}_${getCurrentDate()}`;

// Get current date in YYYY-MM-DD format for daily tracking
function getCurrentDate(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Get current photo count for a user
export function getUserPhotoCount(userId: string): number {
  try {
    const countStr = localStorage.getItem(getPhotoCountKey(userId));
    return countStr ? parseInt(countStr, 10) : 0;
  } catch (error) {
    console.error('Error getting photo count:', error);
    return 0;
  }
}

// Increment photo count for a user
export function incrementUserPhotoCount(userId: string): void {
  const currentCount = getUserPhotoCount(userId);
  localStorage.setItem(getPhotoCountKey(userId), String(currentCount + 1));
}

// Check if user can send more photos today
export function canUserSendPhoto(userId: string, isVIP: boolean = false): boolean {
  // VIP users have no limit
  if (isVIP) return true;
  
  const currentCount = getUserPhotoCount(userId);
  const limit = getPhotoLimit();
  
  return currentCount < limit;
}

// Get remaining photos for today
export function getRemainingPhotoCount(userId: string, isVIP: boolean = false): number {
  if (isVIP) return Infinity;
  
  const currentCount = getUserPhotoCount(userId);
  const limit = getPhotoLimit();
  
  return Math.max(0, limit - currentCount);
}
