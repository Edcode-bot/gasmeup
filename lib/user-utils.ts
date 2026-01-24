import { supabase } from './supabase';

export interface UserProfile {
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export async function getUserProfile(walletAddress: string): Promise<UserProfile | null> {
  if (!walletAddress) return null;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, avatar_url, bio')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();
    
    if (error) return null;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getDisplayName(profile: UserProfile | null, address: string): string {
  return profile?.username || formatAddress(address);
}

export async function getMultipleUserProfiles(walletAddresses: string[]): Promise<Map<string, UserProfile>> {
  const profiles = new Map<string, UserProfile>();
  
  if (!walletAddresses.length) return profiles;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, avatar_url, bio, wallet_address')
      .in('wallet_address', walletAddresses.map(addr => addr.toLowerCase()));
    
    if (error) throw error;
    
    data?.forEach(profile => {
      if (profile.wallet_address) {
        profiles.set(profile.wallet_address.toLowerCase(), {
          username: profile.username,
          avatar_url: profile.avatar_url,
          bio: profile.bio
        });
      }
    });
  } catch (error) {
    console.error('Error fetching multiple user profiles:', error);
  }
  
  return profiles;
}
