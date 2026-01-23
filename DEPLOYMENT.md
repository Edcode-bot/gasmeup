# GasMeUp Deployment Guide

## Pre-Deployment Checklist

1. ✅ Profile creation/editing system
2. ✅ Dashboard with real user data
3. ✅ Landing page polish
4. ✅ Support/donation flow
5. ✅ Database schema set up

## Environment Variables

Make sure you have these set in your Vercel project:

```bash
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Add environment variables (see above)
6. Click "Deploy"

### Option 2: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# For production deployment
vercel --prod
```

## Testing on Testnet

Before deploying to mainnet, test your transactions on testnets:

### Supported Testnets

- **Polygon Mumbai** (chainId: 80001)
- **Base Sepolia** (chainId: 84532)
- **Arbitrum Sepolia** (chainId: 421614)
- **Optimism Sepolia** (chainId: 11155420)

### Adding Testnet Support

To add testnet support, update `lib/blockchain.ts`:

```typescript
export const SUPPORTED_CHAINS = {
  // ... existing chains
  80001: {
    id: 80001,
    name: 'Polygon Mumbai',
    network: 'maticmum',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://rpc-mumbai.maticvigil.com'] },
    },
    blockExplorers: {
      default: { name: 'Polygonscan', url: 'https://mumbai.polygonscan.com' },
    },
    explorer: 'https://mumbai.polygonscan.com',
    currency: 'MATIC',
  },
  // ... more testnets
};
```

## Post-Deployment

1. Test the application on production
2. Verify environment variables are set correctly
3. Test wallet connection flow
4. Test profile creation
5. Test support transactions (start with small amounts!)
6. Monitor error logs in Vercel dashboard

## Troubleshooting

### Build Errors

- Check that all environment variables are set
- Ensure TypeScript compilation passes locally (`npm run build`)
- Check for missing dependencies

### Runtime Errors

- Check browser console for errors
- Check Vercel function logs
- Verify Supabase connection (check RLS policies)
- Verify Privy App ID is correct

### Database Issues

- Ensure RLS policies are set correctly in Supabase
- Verify Supabase URL and anon key are correct
- Check Supabase logs for query errors

## Production Checklist

- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] RLS policies configured
- [ ] Testnet testing completed
- [ ] Mainnet transactions tested (small amounts)
- [ ] Error monitoring set up
- [ ] Domain configured (optional)

## Support

For issues:
1. Check Vercel deployment logs
2. Check Supabase logs
3. Check browser console
4. Review this deployment guide

