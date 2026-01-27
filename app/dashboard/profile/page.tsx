'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy, useLogout } from '@privy-io/react-auth';
import { DashboardNavbar } from '@/components/dashboard-navbar';
import { Avatar } from '@/components/avatar';
import { SocialLinks } from '@/components/social-links';
import { ProfileCompleteness } from '@/components/profile-completeness';
import Link from 'next/link';
import { formatAddress } from '@/lib/utils';
import { supabaseClient } from '@/lib/supabase-client';
import type { Profile } from '@/lib/supabase';

type FormState = 'loading' | 'idle' | 'saving' | 'success' | 'error';

export default function ProfilePage() {
  const router = useRouter();
  const { ready, authenticated, user } = usePrivy();
  const { logout } = useLogout();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formState, setFormState] = useState<FormState>('loading');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  // Form fields
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [karmaGapProfile, setKarmaGapProfile] = useState('');
  const [talentProtocolProfile, setTalentProtocolProfile] = useState('');
  const [email, setEmail] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [usernameError, setUsernameError] = useState('');
  
  // Delete account state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const walletAddress = user?.wallet?.address?.toLowerCase() || '';
  const isEditMode = !!profile;

  // Validate username: alphanumeric + underscore only
  const validateUsername = (value: string): boolean => {
    if (!value) return false;
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    return usernameRegex.test(value);
  };

  // Fetch existing profile
  useEffect(() => {
    if (!ready || !authenticated || !walletAddress || !supabaseClient) {
      if (ready && !authenticated) {
        setFormState('idle');
      }
      return;
    }

    const fetchProfile = async () => {
      const client = supabaseClient;
      if (!client) return;
      
      try {
        const { data, error: fetchError } = await client
          .from('profiles')
          .select('*')
          .eq('wallet_address', walletAddress)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          // PGRST116 is "not found" error
          console.error('Error fetching profile:', fetchError);
          setFormState('idle');
          return;
        }

        if (data) {
          setProfile(data);
          setUsername(data.username || '');
          setBio(data.bio || '');
          setAvatarUrl(data.avatar_url || '');
          setTwitterUrl(data.twitter_url || '');
          setGithubUrl(data.github_url || '');
          setLinkedinUrl(data.linkedin_url || '');
          setGithubUsername(data.github_username || '');
          setKarmaGapProfile(data.karma_gap_profile || '');
          setTalentProtocolProfile(data.talent_protocol_profile || '');
          setEmail(data.email || '');
          setEmailNotifications(data.email_notifications !== false);
        }
        setFormState('idle');
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setFormState('idle');
      }
    };

    fetchProfile();
  }, [ready, authenticated, walletAddress]);

  // Check username uniqueness
  const checkUsernameUnique = async (value: string): Promise<boolean> => {
    if (!value) return true;
    const client = supabaseClient;
    if (!client) return true;
    if (!validateUsername(value)) return false;

    try {
      const { data, error } = await client
        .from('profiles')
        .select('wallet_address')
        .eq('username', value)
        .single();

      // If username exists and belongs to different wallet, it's taken
      if (data && data.wallet_address.toLowerCase() !== walletAddress) {
        return false;
      }
      return true;
    } catch {
      // Username doesn't exist or error - assume it's available
      return true;
    }
  };

  const handleUsernameChange = async (value: string) => {
    setUsername(value);
    setUsernameError('');

    if (!value) {
      setUsernameError('');
      return;
    }

    if (!validateUsername(value)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      return;
    }

    if (value.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }

    if (value.length > 30) {
      setUsernameError('Username must be less than 30 characters');
      return;
    }

    const isUnique = await checkUsernameUnique(value);
    if (!isUnique) {
      setUsernameError('Username is already taken');
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setAvatarUrl(base64String);
      setError('');
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!authenticated || !walletAddress) {
      setError('Please connect your wallet first');
      return;
    }
    
    const client = supabaseClient;
    if (!client) {
      setError('Database connection failed. Please refresh the page.');
      return;
    }

    if (!username || username.trim() === '') {
      setError('Username is required');
      return;
    }

    if (usernameError) {
      setError('Please fix username errors before saving');
      return;
    }

    if (bio.length > 500) {
      setError('Bio must be 500 characters or less');
      return;
    }

    setFormState('saving');
    setError('');
    setSuccess(false);

    // Validate URLs
    const validateUrl = (url: string): string | null => {
      if (!url || !url.trim()) return null;
      const trimmed = url.trim();
      // Add https:// if no protocol
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        return `https://${trimmed}`;
      }
      try {
        new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
        return trimmed;
      } catch {
        return null;
      }
    };

    const validatedTwitterUrl = validateUrl(twitterUrl);
    const validatedGithubUrl = validateUrl(githubUrl);
    const validatedLinkedinUrl = validateUrl(linkedinUrl);

    if (twitterUrl && !validatedTwitterUrl) {
      setError('Please enter a valid Twitter URL');
      setFormState('error');
      return;
    }
    if (githubUrl && !validatedGithubUrl) {
      setError('Please enter a valid GitHub URL');
      setFormState('error');
      return;
    }
    if (linkedinUrl && !validatedLinkedinUrl) {
      setError('Please enter a valid LinkedIn URL');
      setFormState('error');
      return;
    }

    // Validate email if provided
    const validateEmail = (emailStr: string): boolean => {
      if (!emailStr || !emailStr.trim()) return true; // Email is optional
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(emailStr.trim());
    };

    if (email && !validateEmail(email)) {
      setError('Please enter a valid email address');
      setFormState('error');
      return;
    }

    try {
      const profileData = {
        wallet_address: walletAddress,
        username: username.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        twitter_url: validatedTwitterUrl,
        github_url: validatedGithubUrl,
        linkedin_url: validatedLinkedinUrl,
        github_username: githubUsername.trim() || null,
        karma_gap_profile: karmaGapProfile.trim() || null,
        talent_protocol_profile: talentProtocolProfile.trim() || null,
        email: email.trim() || null,
        email_notifications: emailNotifications,
      };

      const { data, error: saveError } = await client
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'wallet_address',
        })
        .select()
        .single();

      if (saveError) {
        if (saveError.code === '23505') {
          // Unique constraint violation
          setError('Username is already taken. Please choose another.');
        } else {
          setError(saveError.message || 'Failed to save profile');
        }
        setFormState('error');
        return;
      }

      setProfile(data);
      setFormState('success');
      setSuccess(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      setError(err?.message || 'Failed to save profile. Please try again.');
      setFormState('error');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.wallet?.address || !supabaseClient) return;
    
    setIsDeleting(true);
    
    try {
      const walletAddress = user.wallet.address.toLowerCase();
      
      console.log('🗑️ Starting account deletion with CASCADE for:', walletAddress);
      
      // With CASCADE DELETE, we only need to delete from the main profiles table
      // All related records will be automatically deleted by the database
      
      console.log('🗂️ Deleting user profile (CASCADE will handle all related data)...');
      
      // Delete from profiles table - CASCADE will automatically delete:
      // - projects (and their milestones/updates)
      // - posts (and their likes/comments)
      // - supports (both sent and received)
      // - notifications
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .delete()
        .eq('wallet_address', walletAddress);
      
      if (profileError) {
        console.error('❌ Failed to delete profile:', profileError);
        throw new Error(`Failed to delete account: ${profileError.message}`);
      }
      
      console.log('🔍 Verifying deletion...');
      
      // Verify deletion was successful
      const { data: remainingProfile } = await supabaseClient
        .from('profiles')
        .select('wallet_address')
        .eq('wallet_address', walletAddress)
        .maybeSingle(); // Use maybeSingle to avoid error if not found
      
      if (remainingProfile) {
        throw new Error('Account still exists in database after deletion attempt');
      }
      
      console.log('✅ Account successfully deleted via CASCADE - VERIFIED');
      
      // Log out user
      await logout();
      
      // Redirect to home
      router.push('/');
      
    } catch (error) {
      console.error('❌ Delete failed:', error);
      alert(`Failed to delete account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNavbar />

      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              {isEditMode ? 'Edit Profile' : 'Create Profile'}
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
              {isEditMode
                ? 'Update your builder profile information'
                : 'Create your builder profile to start receiving support'}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 rounded-lg border border-green-500 bg-green-50 p-4 dark:bg-green-900/20">
              <p className="text-green-700 dark:text-green-300">
                Profile saved successfully! Redirecting to dashboard...
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && formState === 'error' && (
            <div className="mb-6 rounded-lg border border-red-500 bg-red-50 p-4 dark:bg-red-900/20">
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            {/* Form */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={formatAddress(walletAddress)}
                  disabled
                  className="w-full rounded-lg border border-zinc-300 bg-zinc-100 px-4 py-3 text-foreground opacity-75 dark:border-zinc-700 dark:bg-zinc-800"
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {walletAddress}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="your_username"
                  className={`w-full rounded-lg border px-4 py-3 text-foreground placeholder:text-zinc-400 focus:outline-none focus:ring-2 ${
                    usernameError
                      ? 'border-red-500 focus:ring-red-500/20'
                      : 'border-zinc-300 focus:border-[#FFBF00] focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900'
                  }`}
                />
                {usernameError && (
                  <p className="mt-1 text-sm text-red-500">{usernameError}</p>
                )}
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Alphanumeric characters and underscores only. 3-30 characters.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself and your projects..."
                  rows={6}
                  maxLength={500}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-foreground placeholder:text-zinc-400 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-500"
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {bio.length}/500 characters
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Avatar Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-foreground file:mr-4 file:rounded-full file:border-0 file:bg-[#FFBF00] file:px-4 file:py-2 file:text-sm file:font-medium file:text-black hover:file:opacity-90 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900"
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Optional: Upload a profile picture (max 5MB)
                </p>
                {avatarUrl && avatarUrl.startsWith('data:image/') && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-foreground">Preview:</p>
                    <div className="relative inline-block">
                      <img
                        src={avatarUrl}
                        alt="Avatar preview"
                        className="h-24 w-24 rounded-full object-cover border-2 border-zinc-300 dark:border-zinc-700"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Social Links</h3>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Twitter/X URL
                  </label>
                  <input
                    type="url"
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    placeholder="https://twitter.com/yourhandle"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-foreground placeholder:text-zinc-400 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-500"
                  />
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Optional: Your Twitter/X profile URL
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/yourusername"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-foreground placeholder:text-zinc-400 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-500"
                  />
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Optional: Your GitHub profile URL
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    🐙 GitHub Username
                  </label>
                  <input
                    type="text"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder="yourusername"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-foreground placeholder:text-zinc-400 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-500"
                  />
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Optional: Your GitHub username (for credibility links)
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-foreground placeholder:text-zinc-400 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-500"
                  />
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Optional: Your LinkedIn profile URL
                  </p>
                </div>
              </div>

              {/* External Integrations */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">🔗 External Integrations</h3>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    🛡️ Karma GAP Profile
                  </label>
                  <input
                    type="url"
                    value={karmaGapProfile}
                    onChange={(e) => setKarmaGapProfile(e.target.value)}
                    placeholder="https://karmagap.xyz/profile/youraddress"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-foreground placeholder:text-zinc-400 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-500"
                  />
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Optional: Your Karma GAP profile URL for onchain reputation
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    🏆 Talent Protocol Profile
                  </label>
                  <input
                    type="url"
                    value={talentProtocolProfile}
                    onChange={(e) => setTalentProtocolProfile(e.target.value)}
                    placeholder="https://app.talentprotocol.com/talent/yourusername"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-foreground placeholder:text-zinc-400 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-500"
                  />
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Optional: Your Talent Protocol profile URL for builder credentials
                  </p>
                </div>
              </div>

              {/* Profile Completeness */}
              <ProfileCompleteness
                username={username}
                bio={bio}
                avatarUrl={avatarUrl}
                twitterUrl={twitterUrl}
                githubUrl={githubUrl}
                linkedinUrl={linkedinUrl}
                walletAddress={walletAddress}
              />

              <button
                onClick={handleSave}
                disabled={formState === 'saving' || !!usernameError || !username.trim()}
                className="min-h-[44px] w-full rounded-full bg-[#FFBF00] px-8 py-3 text-base font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formState === 'saving' ? 'Saving...' : isEditMode ? 'Update Profile' : 'Create Profile'}
              </button>
            </div>

            {/* Email Preferences */}
            <div className="mt-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground sm:text-xl">
                Email Notifications
              </h2>
              <div className="space-y-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:p-6">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                    Email Address (Optional)
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-foreground placeholder-zinc-400 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder-zinc-500"
                  />
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Receive email notifications for contributions, comments, and updates
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-zinc-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-zinc-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#FFBF00] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FFBF00]/20 dark:border-zinc-600 dark:bg-zinc-700"></div>
                  </label>
                  <span className="text-sm text-foreground">
                    Enable email notifications
                  </span>
                </div>
              </div>
            </div>

            {/* Preview Card */}
            <div className="mt-6 lg:mt-0">
              <h2 className="mb-4 text-lg font-semibold text-foreground sm:text-xl">
                Profile Preview
              </h2>
              <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
                This is how supporters see your profile
              </p>
              <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:p-6">
                <div className="mb-4 flex items-center gap-4">
                  <Avatar
                    src={avatarUrl}
                    alt="Avatar"
                    fallback={username ? username.charAt(0).toUpperCase() : '?'}
                    size="md"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {username || 'Your Username'}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {formatAddress(walletAddress)}
                    </p>
                  </div>
                </div>
                {bio ? (
                  <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                    {bio}
                  </p>
                ) : (
                  <p className="mb-4 text-sm italic text-zinc-500 dark:text-zinc-500">
                    No bio yet. Add one to tell supporters about yourself!
                  </p>
                )}
                {(twitterUrl || githubUrl || linkedinUrl) && (
                  <div className="mb-4">
                    <SocialLinks
                      twitterUrl={twitterUrl}
                      githubUrl={githubUrl}
                      linkedinUrl={linkedinUrl}
                      size="md"
                    />
                  </div>
                )}
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                  <Link
                    href={`/builder/${walletAddress}`}
                    className="text-sm font-medium text-[#FFBF00] hover:underline"
                  >
                    View Profile →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Delete Account Section - Only show for existing profiles */}
          {isEditMode && (
            <div className="border-t border-zinc-200 pt-6 mt-6 dark:border-zinc-700">
              <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
              
              <div className="rounded-lg border border-red-200 p-4 dark:border-red-800">
                <h4 className="text-red-600 font-medium mb-2">Delete Account</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Permanently delete your builder profile. This action cannot be undone.
                </p>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  This will delete:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 mb-4 space-y-1">
                  <li>• Your builder profile</li>
                  <li>• All your posts</li>
                  <li>• All your projects</li>
                  <li className="text-green-600">✓ Your received funds are safe (already in your wallet)</li>
                </ul>
                
                <button 
                  onClick={() => setShowDeleteDialog(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Are you absolutely sure?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers.
            </p>
            
            <div className="my-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Type <strong>DELETE</strong> to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md dark:border-zinc-700 dark:bg-zinc-800 dark:text-foreground"
                placeholder="Type DELETE"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteConfirmation('');
                }}
                className="flex-1 px-4 py-2 border border-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800 dark:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

