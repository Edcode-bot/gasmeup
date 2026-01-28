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
  
  // If it's a multi-segment path, it's not a username
  if (slug.length !== 1) {
    notFound();
  }
  
  const pathSegment = slug[0];
  
  // If it's a system route, let Next.js handle it normally
  if (SYSTEM_ROUTES.includes(pathSegment.toLowerCase())) {
    notFound();
  }
  
  // If it starts with @, remove it (for backward compatibility)
  const cleanUsername = pathSegment.startsWith('@') ? pathSegment.slice(1) : pathSegment;
  
  // Validate username format (alphanumeric + underscore, 3-30 chars)
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  if (!usernameRegex.test(cleanUsername)) {
    notFound();
  }
  
  // Look up username in profiles table (case-insensitive)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('wallet_address, username')
    .ilike('username', cleanUsername)
    .single();

  if (error) {
    // If it's a "not found" error, show custom 404
    if (error.code === 'PGRST116') {
      // Try exact match as fallback
      const { data: exactProfile, error: exactError } = await supabase
        .from('profiles')
        .select('wallet_address, username')
        .eq('username', cleanUsername)
        .single();
      
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
      
      redirect(`/builder/${exactProfile.wallet_address}`);
    }
    
    // For other database errors, still show 404
    notFound();
  }

  if (!profile) {
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

  // Redirect to the builder address page
  redirect(`/builder/${profile.wallet_address}`);
}

// Disable static generation for this route to make it fully dynamic
export const dynamic = 'force-dynamic';
