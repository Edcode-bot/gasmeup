import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Profile = {
  id: string;
  wallet_address: string;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  twitter_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  verified: boolean;
  verified_at: string | null;
  email: string | null;
  email_notifications: boolean;
  email_verified: boolean;
  created_at: string;
};

export type Support = {
  id: string;
  from_address: string;
  to_address: string;
  amount: number;
  message: string | null;
  tx_hash: string;
  chain_id: number;
  status?: 'pending' | 'confirmed' | 'failed' | null;
  project_id: string | null;
  via_contract?: boolean | null;
  created_at: string;
};

export type Post = {
  id: string;
  builder_address: string;
  title: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
};

export type PostLike = {
  id: string;
  post_id: string;
  user_address: string;
  created_at: string;
};

export type PostComment = {
  id: string;
  post_id: string;
  user_address: string;
  content: string;
  created_at: string;
};

export type Project = {
  id: string;
  builder_address: string;
  title: string;
  description: string;
  image_url: string;
  live_url: string | null;
  github_url: string | null;
  goal_amount: number | null;
  raised_amount: number;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
};

export type Notification = {
  id: string;
  user_address: string;
  type: 'contribution' | 'comment' | 'like' | 'follow' | 'admin';
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
};
