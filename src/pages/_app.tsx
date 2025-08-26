import "@/styles/globals.css";
import '@fortawesome/fontawesome-svg-core/styles.css'
import type { AppProps } from "next/app";
import { DevBanner } from '@/components/ui/InfoBanner/infoBanner';
import { ToastProvider } from '@/components/ui/Toast/Toast';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ToastProvider>
      <DevBanner />
      <Component {...pageProps} />
    </ToastProvider>
  );
}