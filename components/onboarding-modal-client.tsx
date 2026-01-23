'use client';

import { useState } from 'react';
import { OnboardingModal } from './onboarding-modal';

export function OnboardingModalClient() {
  const [isOpen, setIsOpen] = useState(true);

  return <OnboardingModal isOpen={isOpen} onClose={() => setIsOpen(false)} />;
}
