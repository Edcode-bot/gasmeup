'use client';

import { useState, useEffect } from 'react';
import { X, Info, Heart, Zap } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('gasmeup-onboarding');
    if (hasSeenOnboarding) {
      onClose();
    }
  }, [onClose]);

  const handleGetStarted = () => {
    localStorage.setItem('gasmeup-onboarding', 'true');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 relative">
        <button
          onClick={handleGetStarted}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#FFBF00] rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            Welcome to GasMeUp
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Fund builders directly on Base and Celo
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">
                Direct Support
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Send crypto directly to builders with transparent fee distribution
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">
                How it Works
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                1. Connect your wallet • 2. Choose a builder • 3. Send support
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleGetStarted}
          className="w-full bg-[#FFBF00] text-black font-semibold py-3 px-6 rounded-full hover:opacity-90 transition-opacity"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
