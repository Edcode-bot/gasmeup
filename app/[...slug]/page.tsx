import { notFound, redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface CatchAllPageProps {
  params: Promise<{ slug: string[] }>;
}

// System routes that should not be treated as usernames
const SYSTEM_ROUTES = [
  'admin',
  'dashboard',
  'builder',
  'projects',
  'explore',
  'api',
  'auth',
  'login',
  'register',
  'settings',
  'profile',
  'notifications',
  'search',
  'about',
  'help',
  'privacy',
  'terms',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  '_next',
  'images',
  'css',
  'js'
];

export default async function CatchAllPage({ params }: CatchAllPageProps) {
  const { slug } = await params;
  
  console.log('🔍 Catch-all route accessed:', { slug });
  
  // If it's a multi-segment path, it's not a username
  if (slug.length !== 1) {
    console.log('❌ Multi-segment path, not a username');
    notFound();
  }
  
  const pathSegment = slug[0];
  console.log('🔍 Checking path segment:', pathSegment);
  
  // If it's a system route, let Next.js handle it normally
  if (SYSTEM_ROUTES.includes(pathSegment.toLowerCase())) {
    console.log('🔧 System route detected, letting Next.js handle:', pathSegment);
    notFound();
  }
  
  // If it starts with @, remove it (for backward compatibility)
  const cleanUsername = pathSegment.startsWith('@') ? pathSegment.slice(1) : pathSegment;
  console.log('🧹 Cleaned username:', cleanUsername);
  
  // Validate username format (alphanumeric + underscore, 3-30 chars)
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  if (!usernameRegex.test(cleanUsername)) {
    console.log('❌ Invalid username format:', cleanUsername);
    notFound();
  }
  
  console.log('👤 Looking up username in database...');
  
  // Look up username in profiles table (case-insensitive)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('wallet_address, username, avatar_url, bio')
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
        .select('wallet_address, username, avatar_url, bio')
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
