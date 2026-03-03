import './globals.css';
import { Providers } from './Providers';

export const metadata = {
  title: 'QuantumOS Charminar Mehfil v1.2.0 — Powered by Kynetra AI',
  description: 'HyperBridge QuantumOS Enterprise Restaurant Platform — AI-Powered Admin, Multi-Mode Operations, Kynetra Intelligence',
  metadataBase: new URL('https://charminarmehfil.com'),
  openGraph: {
    title: 'QuantumOS Charminar Mehfil v1.2.0',
    description: 'Powered by Kynetra AI | HyperBridge Digital',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0C0B09',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Figtree:wght@300;400;500;600;700;800&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700;9..144,800&family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
