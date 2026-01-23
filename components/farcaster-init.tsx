'use client';

import { useEffect } from 'react';
import { initFarcasterMiniApp } from '@/lib/farcaster';

export function FarcasterInit() {
  useEffect(() => {
    initFarcasterMiniApp();
  }, []);
  
  return null;
}
