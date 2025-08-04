import '@fortawesome/fontawesome-svg-core/styles.css'
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { DevBanner } from '@/components/props/infoBanner';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <DevBanner />
      <Component {...pageProps} />
    </>
  );
}