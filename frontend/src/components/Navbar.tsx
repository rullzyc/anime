'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, Bars3Icon, XMarkIcon, PlayCircleIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery('');
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-gray-950/95 backdrop-blur-md border-b border-gray-800/60 shadow-xl shadow-black/40'
          : 'bg-gradient-to-b from-gray-950 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <PlayCircleIcon className="h-8 w-8 text-purple-500 group-hover:text-purple-400 transition-colors" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </div>
            <span className="text-xl font-black tracking-tight">
              <span className="text-white">Anime</span>
              <span className="text-purple-500">Stream</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
              Home
            </Link>
            <Link href="/search" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
              Browse
            </Link>
            <Link href="/search?status=Ongoing" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
              Ongoing
            </Link>
            <Link href="/search?status=Completed" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
              Completed
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Desktop search bar */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search anime..."
                  className="bg-gray-800/80 border border-gray-700/50 text-white placeholder-gray-500 text-sm rounded-full pl-4 pr-10 py-1.5 w-48 focus:w-64 focus:outline-none focus:border-purple-500/70 focus:bg-gray-800 transition-all duration-300"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors">
                  <MagnifyingGlassIcon className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Mobile search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              {menuOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <form onSubmit={handleSearch} className="md:hidden pb-4">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search anime..."
                autoFocus
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:border-purple-500"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400">
                <MagnifyingGlassIcon className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-800 pt-4 flex flex-col gap-3">
            {['/', '/search', '/search?status=Ongoing', '/search?status=Completed'].map((href, i) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="text-gray-300 hover:text-white text-sm font-medium px-2 py-1 hover:bg-gray-800 rounded-lg transition-colors"
              >
                {['Home', 'Browse', 'Ongoing', 'Completed'][i]}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
