import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'AnimeStream — Watch Anime Online Free',
    template: '%s | AnimeStream',
  },
  description:
    'Watch the latest and most popular anime online for free in HD quality. Jujutsu Kaisen, Demon Slayer, Attack on Titan, and more.',
  keywords: ['anime', 'streaming', 'watch anime', 'free anime', 'HD anime'],
  openGraph: {
    type: 'website',
    siteName: 'AnimeStream',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen antialiased`}>
        <Navbar />
        <main className="pt-16">{children}</main>
        <footer className="mt-20 border-t border-gray-800/50 py-8 text-center text-gray-600 text-sm">
          <p>
            © {new Date().getFullYear()}{' '}
            <span className="text-purple-500 font-semibold">AnimeStream</span> — For educational
            purposes only.
          </p>
        </footer>
      </body>
    </html>
  );
}
