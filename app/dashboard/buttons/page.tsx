'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { DashboardNavbar } from '@/components/dashboard-navbar';
import { ConnectWallet } from '@/components/connect-wallet';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase-client';
import { QRCodeSVG } from 'qrcode.react';
import { getBaseUrl } from '@/lib/utils';
import type { Profile, Project } from '@/lib/supabase';

export default function ButtonsPage() {
  const { ready, authenticated, user } = usePrivy();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const walletAddress = user?.wallet?.address?.toLowerCase() || '';
  const profileUrl = walletAddress ? 
    (profile?.username ? `${getBaseUrl()}/@${profile.username}` : `${getBaseUrl()}/builder/${walletAddress}`) : '';
  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const projectUrl = selectedProject ? `${getBaseUrl()}/projects/${selectedProjectId}` : '';

  useEffect(() => {
    if (!ready || !authenticated || !walletAddress || !supabaseClient) {
      if (ready && !authenticated) {
        setLoading(false);
      }
      return;
    }

    const fetchData = async () => {
      const client = supabaseClient;
      if (!client) return;

      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await client
          .from('profiles')
          .select('*')
          .eq('wallet_address', walletAddress)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
        } else if (profileData) {
          setProfile(profileData);
        }

        // Fetch projects
        const { data: projectsData, error: projectsError } = await client
          .from('projects')
          .select('*')
          .eq('builder_address', walletAddress)
          .order('created_at', { ascending: false });

        if (projectsError) {
          console.error('Error fetching projects:', projectsError);
        } else if (projectsData) {
          setProjects(projectsData);
          if (projectsData.length > 0) {
            setSelectedProjectId(projectsData[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ready, authenticated, walletAddress]);

  const handleCopyUrl = async () => {
    if (!profileUrl) return;
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopySnippet = async (snippet: string) => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const buttonSnippet = `<a href="${profileUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 12px 24px; background-color: #FFBF00; color: #000000; border-radius: 9999px; text-decoration: none; font-weight: 600; transition: opacity 0.2s;">Support Me on GasMeUp</a>`;

  const iframeSnippet = `<iframe src="${profileUrl}" width="100%" height="600" frameborder="0" style="border: 1px solid #e5e7eb; border-radius: 8px;"></iframe>`;

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen flex-col">
        <DashboardNavbar />
        <main className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-foreground">Connect Your Wallet</h1>
            <p className="mb-6 text-zinc-600 dark:text-zinc-400">
              Please connect your wallet to access buttons and share tools.
            </p>
            <ConnectWallet />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNavbar />

      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Share & Buttons</h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Share your profile and embed buttons on your website
            </p>
          </div>

          {/* Profile URL Section */}
          <div className="mb-6 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:mb-8 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground sm:text-xl">Your Profile URL</h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={profileUrl}
                readOnly
                className="flex-1 rounded-lg border border-zinc-300 bg-zinc-100 px-4 py-3 text-foreground dark:border-zinc-700 dark:bg-zinc-800"
              />
              <button
                onClick={handleCopyUrl}
                className="rounded-full bg-[#FFBF00] px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="mb-6 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:mb-8 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground sm:text-xl">QR Code</h2>
            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
              Share this QR code for easy access to your profile
            </p>
            <div className="flex justify-center rounded-lg bg-white p-6 dark:bg-zinc-900">
              {profileUrl && (
                <QRCodeSVG
                  value={profileUrl}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              )}
            </div>
          </div>

          {/* Embeddable Button Snippet */}
          <div className="mb-6 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:mb-8 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground sm:text-xl">Embeddable Button (Link)</h2>
            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
              Copy this HTML code to embed a button on your website
            </p>
            <div className="mb-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <pre className="overflow-x-auto text-xs">
                <code>{buttonSnippet}</code>
              </pre>
            </div>
            <button
              onClick={() => handleCopySnippet(buttonSnippet)}
              className="rounded-full bg-[#FFBF00] px-6 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
            >
              {copiedSnippet ? 'Copied!' : 'Copy Button Code'}
            </button>
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-foreground">Preview:</p>
              <div className="inline-block" dangerouslySetInnerHTML={{ __html: buttonSnippet }} />
            </div>
          </div>

          {/* Iframe Embed Snippet */}
          <div className="mb-6 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:mb-8 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground sm:text-xl">Embeddable Iframe</h2>
            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
              Embed your full profile page using an iframe
            </p>
            <div className="mb-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <pre className="overflow-x-auto text-xs">
                <code>{iframeSnippet}</code>
              </pre>
            </div>
            <button
              onClick={() => handleCopySnippet(iframeSnippet)}
              className="rounded-full bg-[#FFBF00] px-6 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
            >
              {copiedSnippet ? 'Copied!' : 'Copy Iframe Code'}
            </button>
          </div>

          {/* Share Your Projects Section */}
          {projects.length > 0 && (
            <div className="mb-6 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:mb-8 sm:p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground sm:text-xl">Share Your Projects</h2>
              <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                Select a project to generate shareable links and QR codes
              </p>

              {/* Project Selector */}
              <div className="mb-6">
                <label htmlFor="project-select" className="mb-2 block text-sm font-medium text-foreground">
                  Select Project
                </label>
                <select
                  id="project-select"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-foreground focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900"
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProject && projectUrl && (
                <>
                  {/* Project URL */}
                  <div className="mb-6">
                    <h3 className="mb-2 text-sm font-semibold text-foreground">Project URL</h3>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={projectUrl}
                        readOnly
                        className="flex-1 rounded-lg border border-zinc-300 bg-zinc-100 px-4 py-3 text-foreground dark:border-zinc-700 dark:bg-zinc-800"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(projectUrl);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="rounded-full bg-[#FFBF00] px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90"
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Project QR Code */}
                  <div className="mb-6">
                    <h3 className="mb-2 text-sm font-semibold text-foreground">Project QR Code</h3>
                    <div className="flex justify-center rounded-lg bg-white p-6 dark:bg-zinc-900">
                      <QRCodeSVG
                        value={projectUrl}
                        size={256}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                  </div>

                  {/* Project Button Snippet */}
                  <div className="mb-6">
                    <h3 className="mb-2 text-sm font-semibold text-foreground">Project Button Code</h3>
                    <p className="mb-4 text-xs text-zinc-600 dark:text-zinc-400">
                      Copy this HTML code to embed a button linking to your project
                    </p>
                    <div className="mb-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                      <pre className="overflow-x-auto text-xs">
                        <code>{`<a href="${projectUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 12px 24px; background-color: #FFBF00; color: #000000; border-radius: 9999px; text-decoration: none; font-weight: 600; transition: opacity 0.2s;">Support ${selectedProject.title} on GasMeUp</a>`}</code>
                      </pre>
                    </div>
                    <button
                      onClick={() => {
                        const snippet = `<a href="${projectUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 12px 24px; background-color: #FFBF00; color: #000000; border-radius: 9999px; text-decoration: none; font-weight: 600; transition: opacity 0.2s;">Support ${selectedProject.title} on GasMeUp</a>`;
                        handleCopySnippet(snippet);
                      }}
                      className="rounded-full bg-[#FFBF00] px-6 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
                    >
                      {copiedSnippet ? 'Copied!' : 'Copy Button Code'}
                    </button>
                  </div>

                  {/* Social Media Templates */}
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-foreground">Social Media Templates</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-foreground">Twitter/X</label>
                        <textarea
                          readOnly
                          value={`Check out ${selectedProject.title} on GasMeUp! 🚀\n\n${projectUrl}\n\n#Web3 #Builders #Crypto`}
                          rows={3}
                          className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-foreground dark:border-zinc-700 dark:bg-zinc-900"
                          onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-foreground">LinkedIn</label>
                        <textarea
                          readOnly
                          value={`I'm excited to share my project: ${selectedProject.title}\n\n${projectUrl}\n\nSupport the future of Web3 building!`}
                          rows={3}
                          className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-foreground dark:border-zinc-700 dark:bg-zinc-900"
                          onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

