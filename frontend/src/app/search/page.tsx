'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchAnime, getAllAnime } from '@/lib/api';
import type { Anime } from '@/types';
import AnimeCard from '@/components/AnimeCard';
import { SkeletonCard } from '@/components/SkeletonCard';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') ?? '';
  const initialStatus = searchParams.get('status') ?? '';

  const [query, setQuery] = useState(initialQ);
  const [status, setStatus] = useState(initialStatus);
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const debouncedQuery = useDebounce(query, 400);

  const fetchAnimeList = useCallback(async (pageNum: number, isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);
    setHasSearched(true);
    
    try {
      if (debouncedQuery.trim()) {
        const data = await searchAnime(debouncedQuery);
        const filtered = status ? data.filter((a) => a.status === status) : data;
        setResults(filtered);
        setHasNextPage(false); // Search API belum mendukung pagination
      } else {
        const response = await getAllAnime(pageNum);
        const newResults = status ? response.data.filter((a) => a.status === status) : response.data;
        
        if (isLoadMore) {
          setResults(prev => [...prev, ...newResults]);
        } else {
          setResults(newResults);
        }
        setHasNextPage(response.pagination?.hasNextPage ?? false);
      }
    } catch {
      if (!isLoadMore) setResults([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [debouncedQuery, status]);

  // Initial fetch atau ketika query/status berubah
  useEffect(() => {
    setPage(1);
    fetchAnimeList(1, false);
  }, [debouncedQuery, status, fetchAnimeList]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAnimeList(nextPage, true);
  };

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (status) params.set('status', status);
    router.replace(`/search${params.toString() ? '?' + params.toString() : ''}`, { scroll: false });
  }, [query, status, router]);

  const statusOptions = [
    { label: 'Semua', value: '' },
    { label: 'Ongoing', value: 'Ongoing' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Upcoming', value: 'Upcoming' },
  ];

  return (
    <div className="page-container">
      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white flex items-center gap-2">
          <SparklesIcon className="h-8 w-8 text-purple-500" />
          Browse Anime
        </h1>
        <p className="text-gray-400 text-sm mt-1">Temukan anime favoritmu dari ribuan judul</p>
      </div>

      {/* Search bar + filters */}
      <div className="card-glass p-4 mb-8 space-y-4">
        {/* Search input */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari judul anime..."
            className="w-full bg-gray-800/80 border border-gray-700/50 focus:border-purple-500/70 text-white placeholder-gray-500 rounded-xl pl-11 pr-10 py-3 text-sm outline-none transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mr-1">
            <AdjustmentsHorizontalIcon className="h-4 w-4" />
            <span>Filter:</span>
          </div>
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatus(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                status === opt.value
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-gray-800/60 border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!loading && hasSearched && (
        <p className="text-gray-500 text-sm mb-4">
          {results.length > 0
            ? `${results.length} anime ditemukan${query ? ` untuk "${query}"` : ''}`
            : ''}
        </p>
      )}

      {/* Results Grid */}
      {loading && !loadingMore ? (
        <div className="anime-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="anime-grid">
            {results.map((anime) => (
              <AnimeCard key={anime._id} anime={anime} />
            ))}
          </div>
          
          {/* Load More Button */}
          {hasNextPage && !query && (
            <div className="mt-12 flex justify-center">
              <button 
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="btn-secondary px-8 py-3 text-sm flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                    Memuat...
                  </>
                ) : (
                  'Muat Lebih Banyak'
                )}
              </button>
            </div>
          )}
        </>
      ) : hasSearched ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <div className="text-5xl">🔍</div>
          <h3 className="text-xl font-bold text-white">Tidak ditemukan</h3>
          <p className="text-gray-400 text-sm">
            {query
              ? `Tidak ada anime dengan judul "${query}"`
              : 'Tidak ada anime yang tersedia'}
          </p>
          {query && (
            <button onClick={() => setQuery('')} className="btn-secondary">
              Hapus pencarian
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="page-container">
        <div className="h-10 bg-gray-800 rounded-full w-48 mb-8 animate-pulse" />
        <div className="anime-grid">
          {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
