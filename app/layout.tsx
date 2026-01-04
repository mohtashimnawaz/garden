import './globals.css';
import React from 'react';
import { AuthProvider } from '../components/Auth/AuthProvider';
import SignIn from '../components/Auth/SignIn';
import UserMenu from '../components/Auth/UserMenu';
import AuthDebug from '../components/Auth/AuthDebug';

export const metadata = {
  title: 'Collaborative Garden',
  description: 'A slow-social collaborative garden built with Next.js and R3F'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <header className="p-4 border-b">
              <div className="max-w-4xl mx-auto flex items-center justify-between">
                <div className="text-lg font-semibold">Collaborative Garden</div>
                <div className="flex items-center gap-4">
                  <SignIn />
                  <UserMenu />
                  <div className="hidden md:block ml-2">
                    <AuthDebug />
                  </div>
                </div>
              </div>
            </header>
            <main className="flex-1 max-w-4xl mx-auto p-6">{children}</main>
            <footer className="p-4 border-t text-sm text-slate-500">Made with care 🌱</footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
