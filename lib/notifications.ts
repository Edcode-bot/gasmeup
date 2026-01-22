import { supabaseClient } from './supabase-client';
import { sendEmail, getContributionEmailTemplate, getVerificationEmailTemplate, getCommentEmailTemplate, getProjectFundingEmailTemplate } from './email';
import { getChainConfig, getExplorerUrl, type SupportedChainId } from './blockchain';

export type NotificationType = 'contribution' | 'comment' | 'like' | 'follow' | 'admin' | 'project_contribution';

interface CreateNotificationParams {
  userAddress: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

/**
 * Create a notification for a user
 */
export async function createNotification({
  userAddress,
  type,
  title,
  message,
  link,
}: CreateNotificationParams): Promise<void> {
  const client = supabaseClient;
  if (!client) {
    console.error('Supabase client not initialized');
    return;
  }

  try {
    const { error } = await client.from('notifications').insert({
      user_address: userAddress.toLowerCase(),
      type,
      title,
      message,
      link: link || null,
    });

    if (error) {
      console.error('Failed to create notification:', error);
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

/**
 * Create notification when builder receives contribution
 */
export async function notifyContribution(
  builderAddress: string,
  supporterAddress: string,
  amount: number,
  projectId?: string,
  chainId?: SupportedChainId,
  txHash?: string
): Promise<void> {
  const client = supabaseClient;
  if (!client) return;

  // Get builder's profile
  const { data: profile } = await client
    .from('profiles')
    .select('username, email, email_notifications')
    .eq('wallet_address', builderAddress.toLowerCase())
    .single();

  const supporterName = profile?.username || supporterAddress.slice(0, 6) + '...' + supporterAddress.slice(-4);
  const link = projectId ? `/projects/${projectId}` : `/builder/${builderAddress}`;

  // Create in-app notification
  await createNotification({
    userAddress: builderAddress,
    type: 'contribution',
    title: 'New Contribution Received',
    message: `${supporterName} contributed ${amount.toFixed(4)} to ${projectId ? 'your project' : 'you'}`,
    link,
  });

  // Send email if enabled
  if (profile?.email && profile?.email_notifications && chainId && txHash) {
    const chainConfig = getChainConfig(chainId);
    const explorerUrl = getExplorerUrl(chainId, txHash);
    const profileUrl = `https://gasmeup-sable.vercel.app${link}`;

    const html = getContributionEmailTemplate({
      builderName: profile.username || 'Builder',
      amount,
      token: chainConfig.currency,
      chain: chainConfig.name,
      supporterAddress,
      txHash,
      explorerUrl,
      profileUrl,
    });

    await sendEmail({
      to: profile.email,
      subject: `💰 You received ${amount} ${chainConfig.currency} on GasMeUp!`,
      html,
    });
  }
}

/**
 * Create notification when someone comments on a post
 */
export async function notifyComment(
  builderAddress: string,
  commenterAddress: string,
  postId: string,
  commentContent?: string
): Promise<void> {
  const client = supabaseClient;
  if (!client) return;

  // Get builder's profile
  const { data: builderProfile } = await client
    .from('profiles')
    .select('username, email, email_notifications')
    .eq('wallet_address', builderAddress.toLowerCase())
    .single();

  // Get commenter's profile
  const { data: commenterProfile } = await client
    .from('profiles')
    .select('username')
    .eq('wallet_address', commenterAddress.toLowerCase())
    .single();

  // Get post details
  const { data: post } = await client
    .from('posts')
    .select('title')
    .eq('id', postId)
    .single();

  const commenterName = commenterProfile?.username || commenterAddress.slice(0, 6) + '...' + commenterAddress.slice(-4);
  const postUrl = `https://gasmeup-sable.vercel.app/builder/${builderAddress}/posts/${postId}`;

  // Create in-app notification
  await createNotification({
    userAddress: builderAddress,
    type: 'comment',
    title: 'New Comment',
    message: `${commenterName} commented on your post`,
    link: `/builder/${builderAddress}/posts/${postId}`,
  });

  // Send email if enabled
  if (builderProfile?.email && builderProfile?.email_notifications && post && commentContent) {
    const html = getCommentEmailTemplate({
      builderName: builderProfile.username || 'Builder',
      commenterName,
      postTitle: post.title,
      comment: commentContent,
      postUrl,
    });

    await sendEmail({
      to: builderProfile.email,
      subject: `💬 New comment on your post: ${post.title}`,
      html,
    });
  }
}

/**
 * Create notification when someone likes a post
 */
export async function notifyLike(
  builderAddress: string,
  likerAddress: string,
  postId: string
): Promise<void> {
  const client = supabaseClient;
  if (!client) return;

  // Get liker's profile
  const { data: profile } = await client
    .from('profiles')
    .select('username')
    .eq('wallet_address', likerAddress.toLowerCase())
    .single();

  const likerName = profile?.username || likerAddress.slice(0, 6) + '...' + likerAddress.slice(-4);

  await createNotification({
    userAddress: builderAddress,
    type: 'like',
    title: 'New Like',
    message: `${likerName} liked your post`,
    link: `/builder/${builderAddress}/posts/${postId}`,
  });
}

/**
 * Create notification when builder is verified
 */
export async function notifyVerification(builderAddress: string): Promise<void> {
  const client = supabaseClient;
  if (!client) return;

  // Get builder's profile
  const { data: profile } = await client
    .from('profiles')
    .select('username, email, email_notifications')
    .eq('wallet_address', builderAddress.toLowerCase())
    .single();

  const profileUrl = `https://gasmeup-sable.vercel.app/builder/${builderAddress}`;

  // Create in-app notification
  await createNotification({
    userAddress: builderAddress,
    type: 'admin',
    title: '🎉 You\'ve been verified!',
    message: 'Your builder profile is now verified. Your supporters will see a verified badge.',
    link: `/builder/${builderAddress}`,
  });

  // Send email if enabled
  if (profile?.email && profile?.email_notifications) {
    const html = getVerificationEmailTemplate({
      builderName: profile.username || 'Builder',
      profileUrl,
    });

    await sendEmail({
      to: profile.email,
      subject: '✅ You\'re now a verified builder on GasMeUp!',
      html,
    });
  }
}

/**
 * Create notification when project receives funding
 */
export async function notifyProjectFunding(
  builderAddress: string,
  supporterAddress: string,
  projectId: string,
  amount: number,
  chainId: SupportedChainId,
  txHash: string
): Promise<void> {
  const client = supabaseClient;
  if (!client) return;

  // Get builder's profile
  const { data: builderProfile } = await client
    .from('profiles')
    .select('username, email, email_notifications')
    .eq('wallet_address', builderAddress.toLowerCase())
    .single();

  // Get project details
  const { data: project } = await client
    .from('projects')
    .select('title, raised_amount, goal_amount')
    .eq('id', projectId)
    .single();

  if (!project) return;

  // Get supporter's profile
  const { data: supporterProfile } = await client
    .from('profiles')
    .select('username')
    .eq('wallet_address', supporterAddress.toLowerCase())
    .single();

  const supporterName = supporterProfile?.username || supporterAddress.slice(0, 6) + '...' + supporterAddress.slice(-4);
  const projectUrl = `https://gasmeup-sable.vercel.app/projects/${projectId}`;

  // Create in-app notification
  await createNotification({
    userAddress: builderAddress,
    type: 'project_contribution',
    title: 'Project Funding Received',
    message: `${supporterName} contributed ${amount.toFixed(4)} to your project "${project.title}"`,
    link: `/projects/${projectId}`,
  });

  // Send email if enabled
  if (builderProfile?.email && builderProfile?.email_notifications) {
    const chainConfig = getChainConfig(chainId);

    const html = getProjectFundingEmailTemplate({
      builderName: builderProfile.username || 'Builder',
      projectName: project.title,
      amount,
      token: chainConfig.currency,
      chain: chainConfig.name,
      supporterAddress,
      totalRaised: Number(project.raised_amount),
      goalAmount: project.goal_amount ? Number(project.goal_amount) : undefined,
      projectUrl,
    });

    await sendEmail({
      to: builderProfile.email,
      subject: `🚀 Your project received ${amount} ${chainConfig.currency}!`,
      html,
    });
  }
}
