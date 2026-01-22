'use client';

import { useState } from 'react';
import { LandingNavbar } from '@/components/landing-navbar';
import { supabaseClient } from '@/lib/supabase-client';
import { Mail, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all fields');
      setSubmitting(false);
      return;
    }

    if (message.length > 5000) {
      setError('Message must be 5000 characters or less');
      setSubmitting(false);
      return;
    }

    try {
      const client = supabaseClient;
      if (!client) {
        throw new Error('Database connection unavailable');
      }

      const { error: insertError } = await client.from('contact_messages').insert({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });

      if (insertError) throw insertError;

      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      console.error('Failed to submit message:', err);
      setError(err?.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <LandingNavbar />
      
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-6 text-4xl font-bold text-foreground sm:text-5xl">Contact Us</h1>
          
          {submitted ? (
            <div className="rounded-lg border border-green-300 bg-green-50 p-8 text-center dark:border-green-700 dark:bg-green-900/20">
              <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600 dark:text-green-400" />
              <h2 className="mb-2 text-2xl font-semibold text-green-900 dark:text-green-100">
                Message Sent!
              </h2>
              <p className="mb-6 text-green-800 dark:text-green-200">
                Thank you for reaching out. We'll get back to you as soon as possible.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="rounded-full bg-green-600 px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8 rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="h-5 w-5 text-[#FFBF00]" />
                  <h2 className="text-lg font-semibold text-foreground">Email Us</h2>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Prefer email? Reach us at{' '}
                  <a
                    href="mailto:gasmeuup@gmail.com"
                    className="text-[#FFBF00] hover:underline"
                  >
                    gasmeuup@gmail.com
                  </a>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-foreground placeholder-zinc-400 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder-zinc-500"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-foreground placeholder-zinc-400 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder-zinc-500"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-medium text-foreground">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={8}
                    maxLength={5000}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-foreground placeholder-zinc-400 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder-zinc-500"
                    placeholder="Tell us how we can help..."
                  />
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {message.length}/5000 characters
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FFBF00] px-6 py-3 font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
