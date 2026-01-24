export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return diffInMonths === 1 ? '1 month ago' : `${diffInMonths} months ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return diffInYears === 1 ? '1 year ago' : `${diffInYears} years ago`;
  } catch (error) {
    return dateString; // Fallback to original date string
  }
}

export function formatRelativeTimeFromTimestamp(timestamp: number | string): string {
  try {
    const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) * 1000 : timestamp);
    return formatRelativeTime(date.toISOString());
  } catch (error) {
    return 'Unknown time';
  }
}

// For displaying dates in a user-friendly way
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

// For showing both relative and absolute time
export function formatSmartTime(dateString: string): string {
  const relative = formatRelativeTime(dateString);
  const absolute = formatDate(dateString);
  
  // If it's recent, show relative time, otherwise show absolute
  if (relative.includes('minute') || relative.includes('hour') || relative.includes('day')) {
    return relative;
  }
  
  return absolute;
}
