import { notFound, redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface UsernamePageProps {
  params: Promise<{ username: string }>;
}

export default async function UsernamePage({ params }: UsernamePageProps) {
  const { username } = await params;
  
  // Check if username exists
  if (!username || typeof username !== 'string') {
    notFound();
  }
  
  // Remove @ if present and clean up
  const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
  
  // Look up username in profiles table
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('wallet_address')
    .eq('username', cleanUsername)
    .single();

  if (error || !profile) {
    notFound();
  }

  // Redirect to the builder address page
  redirect(`/builder/${profile.wallet_address}`);
}

// Generate static params for known usernames (optional optimization)
export async function generateStaticParams() {
  try {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('username')
      .not('username', 'is', null);

    return (profiles || [])
      .filter((profile) => profile.username && typeof profile.username === 'string')
      .map((profile) => ({
        username: profile.username,
      }));
  } catch (error) {
    console.error('Error generating static params for usernames:', error);
    return [];
  }
}
