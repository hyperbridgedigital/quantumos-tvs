import './globals.css';

export const metadata = {
  title: 'HyperBridge QuantumOS v11.1.0 — Charminar Mehfil & Mount Road Sangam',
  description: 'HyperBridge QuantumOS Enterprise Platform — Store Locator, 60-Min Delivery, WhatsApp Viral, Franchise/POS/Stock/WMS/OMS, CRM, Remarketing, CMS, SEO & Geo, Rewards, Promo Engine',
  metadataBase: new URL('https://charminarmehfil.com'),
  openGraph: {
    title: 'HyperBridge QuantumOS v11.1.0',
    description: 'Powered by HyperBridge QuantumOS — Enterprise Restaurant Platform',
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
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Figtree:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
