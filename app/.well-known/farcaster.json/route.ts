export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL || 'https://gasmeup-sable.vercel.app';
  
  const manifest = {
    accountAssociation: {
      header: "eyJmaWQiOjIwNDc3OTMsInR5cGUiOiJjdXN0b21lSIsImtleSI6IjB4YWJGOGI4MTc5ZEU0QTYyYzhCOUExNmQ2RTExMzJmNjAwMUU1QUIxQyJ9",
      payload: "eyJkb21haW4iOiJnYXNtZXVwLXNhYmxlLnZlcmNlbC5hcHAifQ",
      signature: "Jl6lyiQtbzTlb2kxkQmcKxBdUbnXdYY7LEVzbVOoIC9+xraAj9zxa/iFdR74BB71B3c7TOnTfRt+8D17W7X2qhs="
    },
    miniapp: {
      version: "1",
      name: "GasMeUp",
      homeUrl: URL,
      iconUrl: `${URL}/icon-192.png`,
      splashImageUrl: `${URL}/splash.png`,
      splashBackgroundColor: "#FFBF00",
      webhookUrl: `${URL}/api/farcaster/webhook`,
      subtitle: "Fund Builders on Web3",
      description: "Direct, transparent support for creators on Base and Celo. Send crypto to builders with automatic fee distribution and help build the future of Web3.",
      screenshotUrls: [
        `${URL}/screenshot-1.png`,
        `${URL}/screenshot-2.png` 
      ],
      primaryCategory: "finance",
      tags: ["web3", "funding", "builders", "base", "celo", "crypto", "creator", "support"],
      heroImageUrl: `${URL}/og-image.png`,
      tagline: "Fund the Builders. Support the Future.",
      ogTitle: "GasMeUp - Fund Builders on Web3",
      ogDescription: "Direct support for creators on Base and Celo. Send crypto to builders with transparent fee distribution.",
      ogImageUrl: `${URL}/og-image.png`,
      castShareUrl: "https://warpcast.com/~/compose?text=Check+out+GasMeUp+-+Fund+builders+on+Base+and+Celo+🚀",
      noindex: false
    }
  };
  
  return Response.json(manifest);
}
