import { Resend } from 'resend';

const FROM_EMAIL = 'GasMeUp <noreply@gasmeup.com>';

// Lazy initialization - only create Resend client when needed and on server side
let resendInstance: Resend | null = null;

function getResendClient(): Resend | null {
  // Only initialize on server side
  if (typeof window !== 'undefined') {
    return null;
  }

  // Check if API key is available
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }

  // Lazy initialization - only create when needed
  if (!resendInstance) {
    try {
      resendInstance = new Resend(apiKey);
    } catch (error) {
      console.error('Failed to initialize Resend client:', error);
      return null;
    }
  }

  return resendInstance;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email using Resend
 * Only works on server side - returns false on client side
 */
export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  // Only run on server side
  if (typeof window !== 'undefined') {
    return false;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set, skipping email send');
    return false;
  }

  const resend = getResendClient();
  if (!resend) {
    console.warn('Resend client not available, skipping email send');
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Email template for contribution received
 */
export function getContributionEmailTemplate(params: {
  builderName: string;
  amount: number;
  token: string;
  chain: string;
  supporterAddress: string;
  message?: string;
  txHash: string;
  explorerUrl: string;
  profileUrl: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>You received ${params.amount} ${params.token}!</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #FFBF00 0%, #FFD700 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #000; margin: 0; font-size: 28px;">💰 Contribution Received!</h1>
        </div>
        <div style="background: #fff; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 18px; margin-bottom: 20px;">Hi ${params.builderName},</p>
          <p style="font-size: 16px; margin-bottom: 20px;">
            Great news! You received <strong>${params.amount} ${params.token}</strong> on ${params.chain}.
          </p>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>From:</strong> ${params.supporterAddress}</p>
            <p style="margin: 5px 0;"><strong>Amount:</strong> ${params.amount} ${params.token}</p>
            <p style="margin: 5px 0;"><strong>Chain:</strong> ${params.chain}</p>
            ${params.message ? `<p style="margin: 10px 0 5px 0;"><strong>Message:</strong></p><p style="margin: 5px 0; font-style: italic;">"${params.message}"</p>` : ''}
          </div>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${params.explorerUrl}" style="display: inline-block; background: #FFBF00; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 5px;">View Transaction</a>
            <a href="${params.profileUrl}" style="display: inline-block; background: #333; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 5px;">View Profile</a>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Thank you for building on GasMeUp! 🚀
          </p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Email template for verification received
 */
export function getVerificationEmailTemplate(params: {
  builderName: string;
  profileUrl: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>You're now verified!</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #FFBF00 0%, #FFD700 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #000; margin: 0; font-size: 28px;">✅ You're Verified!</h1>
        </div>
        <div style="background: #fff; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 18px; margin-bottom: 20px;">Congratulations ${params.builderName}!</p>
          <p style="font-size: 16px; margin-bottom: 20px;">
            Your builder profile is now verified. Your supporters will see a verified badge next to your name.
          </p>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Benefits of Verification:</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Verified badge displayed on your profile</li>
              <li>Increased trust from supporters</li>
              <li>Priority in search results</li>
              <li>Access to exclusive features</li>
            </ul>
          </div>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${params.profileUrl}" style="display: inline-block; background: #FFBF00; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">View Your Profile</a>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Keep building amazing things! 🚀
          </p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Email template for new comment
 */
export function getCommentEmailTemplate(params: {
  builderName: string;
  commenterName: string;
  postTitle: string;
  comment: string;
  postUrl: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New comment on your post</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #FFBF00 0%, #FFD700 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #000; margin: 0; font-size: 28px;">💬 New Comment</h1>
        </div>
        <div style="background: #fff; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 18px; margin-bottom: 20px;">Hi ${params.builderName},</p>
          <p style="font-size: 16px; margin-bottom: 20px;">
            <strong>${params.commenterName}</strong> commented on your post:
          </p>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #FFBF00;">${params.postTitle}</h3>
            <p style="margin: 10px 0; font-style: italic;">"${params.comment}"</p>
          </div>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${params.postUrl}" style="display: inline-block; background: #FFBF00; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Reply to Comment</a>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Email template for project funding
 */
export function getProjectFundingEmailTemplate(params: {
  builderName: string;
  projectName: string;
  amount: number;
  token: string;
  chain: string;
  supporterAddress: string;
  totalRaised: number;
  goalAmount?: number;
  projectUrl: string;
}): string {
  const progressPercent = params.goalAmount
    ? Math.min(100, (params.totalRaised / params.goalAmount) * 100)
    : 0;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your project received funding!</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #FFBF00 0%, #FFD700 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #000; margin: 0; font-size: 28px;">🚀 Project Funded!</h1>
        </div>
        <div style="background: #fff; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 18px; margin-bottom: 20px;">Hi ${params.builderName},</p>
          <p style="font-size: 16px; margin-bottom: 20px;">
            Your project <strong>${params.projectName}</strong> received <strong>${params.amount} ${params.token}</strong> on ${params.chain}!
          </p>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>From:</strong> ${params.supporterAddress}</p>
            <p style="margin: 5px 0;"><strong>Amount:</strong> ${params.amount} ${params.token}</p>
            <p style="margin: 5px 0;"><strong>Total Raised:</strong> ${params.totalRaised.toFixed(4)} ${params.token}</p>
            ${params.goalAmount ? `<p style="margin: 10px 0 5px 0;"><strong>Progress:</strong> ${progressPercent.toFixed(1)}% of goal</p>` : ''}
          </div>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${params.projectUrl}" style="display: inline-block; background: #FFBF00; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">View Project</a>
          </div>
        </div>
      </body>
    </html>
  `;
}
