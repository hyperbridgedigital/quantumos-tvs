import './globals.css';

export const metadata = {
  title: 'TheValueStore — Best Value. Maximum Performance.',
  description: 'Gaming PCs, Laptops & Tech',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FFFFFF',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Figtree:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=typeof localStorage!=='undefined'?localStorage.getItem('tvs_theme'):null;var v=t==='dark'?'store-dark':'store';if(document.body)document.body.setAttribute('data-theme',v);})();`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
