import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import '../styles/index.css';
import '../styles/App.css';
import '../styles/design-system.css';
import '../styles/unified-design.css';
import '../styles/push-theme.css';

// Component styles
import '../src/components/AchievementModal.css';
import '../src/components/LandingPage.css';
import '../src/components/MissedTokenNotification.css';
import '../src/components/ModeSelection.css';
import '../src/components/MultiplayerLobby.css';
import '../src/components/PointPopup.css';
import '../src/components/ResultsScreen.css';
import '../styles/results-screen.css';
import '../src/components/TierDisplay.css';

import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

// Dynamically import PushUniversalWalletProvider to avoid SSR issues
const PushWalletProviderWrapper = dynamic(
  () => import('../src/components/PushWalletProviderWrapper'),
  { ssr: false }
);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PushWalletProviderWrapper>
      <Component {...pageProps} />
      <SpeedInsights />
      <Analytics />
    </PushWalletProviderWrapper>
  );
}
