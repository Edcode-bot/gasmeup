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
  
  // Look up username in profiles table (case-insensitive)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('wallet_address, username')
    .ilike('username', cleanUsername)
    .single();

  console.log('👤 Profile lookup result:', { profile, error });

  if (error) {
    console.log('❌ Database error:', error);
    
    // If it's a "not found" error, show custom 404
    if (error.code === 'PGRST116') {
      console.log('❌ Profile not found for username:', cleanUsername);
      
      // Try exact match as fallback
      const { data: exactProfile, error: exactError } = await supabase
        .from('profiles')
        .select('wallet_address, username')
        .eq('username', cleanUsername)
        .single();
      
      console.log('🔄 Exact match fallback result:', { exactProfile, exactError });
      
      if (exactError || !exactProfile) {
        // Create a custom 404 page for username not found
        return (
          <div className="flex min-h-screen flex-col items-center justify-center px-4">
            <div className="text-center">
              <h1 className="mb-4 text-4xl font-bold text-foreground">Builder Not Found</h1>
              <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
                The builder @{cleanUsername} does not exist on GasMeUp.
              </p>
              <div className="space-y-4">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Make sure you have the correct username or check the spelling.
                </p>
                <a 
                  href="/explore" 
                  className="inline-flex items-center gap-2 rounded-lg bg-[#FFBF00] px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#FFD700]"
                >
                  Explore Builders
                </a>
              </div>
            </div>
          </div>
        );
      }
      
      console.log('✅ Redirecting to builder address (exact match):', exactProfile.wallet_address);
      redirect(`/builder/${exactProfile.wallet_address}`);
    }
    
    // For other database errors, still show 404
    notFound();
  }

  if (!profile) {
    console.log('❌ Profile not found for username:', cleanUsername);
    
    // Create a custom 404 page for username not found
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">Builder Not Found</h1>
          <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
            The builder @{cleanUsername} does not exist on GasMeUp.
          </p>
          <div className="space-y-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Make sure you have the correct username or check the spelling.
            </p>
            <a 
              href="/explore" 
              className="inline-flex items-center gap-2 rounded-lg bg-[#FFBF00] px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#FFD700]"
            >
              Explore Builders
            </a>
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ Redirecting to builder address:', profile.wallet_address);
  
  // Redirect to the builder address page
  redirect(`/builder/${profile.wallet_address}`);
}

// Disable static generation for this route to make it fully dynamic
export const dynamic = 'force-dynamic';
