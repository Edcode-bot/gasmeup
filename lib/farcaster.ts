import { sdk } from '@farcaster/miniapp-sdk';

export function initFarcasterMiniApp() {
  if (typeof window !== 'undefined') {
    // Call ready() to hide loading splash and show app
    sdk.actions.ready();
  }
}
