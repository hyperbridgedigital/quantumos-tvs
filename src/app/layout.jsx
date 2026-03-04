import './globals.css';
import { Providers } from './Providers';

export const metadata = {
  title: 'TheValueStore — Best Value. Maximum Performance. | Gaming PCs, Laptops & Tech',
  description: 'Premium computer and gaming ecommerce — Build your PC, shop RTX gaming rigs, AI-ready laptops, components, and tech that gives back.',
  metadataBase: new URL('https://thevaluestore.com'),
  openGraph: {
    title: 'TheValueStore — Best Value. Maximum Performance.',
    description: 'Gaming PCs · Laptops · PC Components · Build Your PC · Tech for Education',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0D0D0F',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700;9..144,800&family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
