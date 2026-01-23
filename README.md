# GasMeUp

A Web3 platform where supporters fund builders. Help creators build the future, one contribution at a time.

## Features

- 🔐 **Privy Authentication** - Connect wallets, email, or SMS 
- 💰 **Builder Profiles** - View and fund builders by their wallet address 
- 📊 **Dashboard** - Track contributions and discover active builders


## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up your Privy App ID:

   - Sign up at [Privy](https://privy.io) and create a new app
   - Copy your App ID

3. Set up Supabase:

   - Sign up at [Supabase](https://supabase.com) and create a new project
   - Go to Settings → API to find your project URL and anon key
   - Run the database schema: Go to SQL Editor in Supabase dashboard and run the SQL from `supabase/schema.sql`

4. Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/app` - Next.js app router pages
  - `/` - Landing page
  - `/dashboard` - User dashboard
  - `/builder/[address]` - Builder profile pages
- `/components` - React components
  - `connect-wallet.tsx` - Wallet connection button
  - `privy-provider.tsx` - Privy authentication provider wrapper
- `/lib` - Utility functions
  - `utils.ts` - Helper functions (address formatting, etc.)
  - `supabase.ts` - Supabase client configuration
- `/supabase` - Database schema
  - `schema.sql` - Database tables and policies

## Tech Stack

- **Next.js 16** - React framework
- **Privy** - Web3 authentication
- **Viem** - Ethereum library for blockchain interactions
- **Supabase** - PostgreSQL database and backend
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
