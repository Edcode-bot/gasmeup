import { notFound, redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface UsernamePageProps {
  params: Promise<{ username: string }>;
}

export default async function UsernamePage({ params }: UsernamePageProps) {
  const { username } = await params;
  
  console.log('🔍 Username route accessed:', { username });
  
  // Check if username exists
  if (!username || typeof username !== 'string') {
    console.log('❌ Invalid username parameter');
    notFound();
  }
  
  // Remove @ if present and clean up
  const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
  console.log('🧹 Cleaned username:', cleanUsername);
  
  // Look up username in profiles table
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('wallet_address')
    .eq('username', cleanUsername)
    .single();

  console.log('👤 Profile lookup result:', { profile, error });

  if (error || !profile) {
    console.log('❌ Profile not found for username:', cleanUsername);
    notFound();
  }

  console.log('✅ Redirecting to builder address:', profile.wallet_address);
  
  // Redirect to the builder address page
  redirect(`/builder/${profile.wallet_address}`);
}

// Disable static generation for this route to make it fully dynamic
export const dynamic = 'force-dynamic';
