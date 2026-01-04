import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Collaborative Garden',
  description: 'A slow-social collaborative garden built with Next.js and R3F'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="p-4 border-b">
            <div className="max-w-4xl mx-auto">Collaborative Garden</div>
          </header>
          <main className="flex-1 max-w-4xl mx-auto p-6">{children}</main>
          <footer className="p-4 border-t text-sm text-slate-500">Made with care 🌱</footer>
        </div>
      </body>
    </html>
  );
}
