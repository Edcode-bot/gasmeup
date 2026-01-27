import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Create Supabase admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, adminWallet } = await request.json();
    
    // Validate inputs
    if (!walletAddress || !adminWallet) {
      return NextResponse.json(
        { error: 'Missing walletAddress or adminWallet' },
        { status: 400 }
      );
    }
    
    // Normalize addresses
    const normalizedWalletAddress = walletAddress.toLowerCase();
    const normalizedAdminWallet = adminWallet.toLowerCase();
    
    console.log('🗑️ Admin delete request:', { 
      targetUser: normalizedWalletAddress, 
      admin: normalizedAdminWallet 
    });
    
    // Verify the requester is an admin
    // In production, you should use a proper admin system
    // For now, we'll check against environment variables or a hardcoded list
    const adminWallets = [
      process.env.NEXT_PUBLIC_ADMIN_WALLET_1?.toLowerCase(),
      process.env.NEXT_PUBLIC_ADMIN_WALLET_2?.toLowerCase(),
      // Add your admin wallet addresses here
      '0x19ae00cf65fd68d96bacacc33f59d16030eb576c', // Example admin wallet
    ].filter(Boolean);
    
    if (!adminWallets.includes(normalizedAdminWallet)) {
      console.log('❌ Unauthorized delete attempt from:', normalizedAdminWallet);
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    
    console.log('✅ Admin authorized, proceeding with deletion...');
    
    // Delete from profiles table - CASCADE will automatically delete:
    // - projects (and their milestones/updates)
    // - posts (and their likes/comments)
    // - supports (both sent and received)
    // - notifications
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('wallet_address', normalizedWalletAddress);
    
    if (profileError) {
      console.error('❌ Profile delete failed:', profileError);
      throw new Error(`Failed to delete user profile: ${profileError.message}`);
    }
    
    console.log('🗂️ Profile deleted, verifying deletion...');
    
    // Verify deletion was successful
    const { data: remainingProfile } = await supabaseAdmin
      .from('profiles')
      .select('wallet_address')
      .eq('wallet_address', normalizedWalletAddress)
      .maybeSingle();
    
    if (remainingProfile) {
      throw new Error('User profile still exists in database after deletion attempt');
    }
    
    console.log('✅ User successfully deleted via API - VERIFIED');
    
    return NextResponse.json({ 
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error: any) {
    console.error('❌ Admin delete API error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to delete user',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
