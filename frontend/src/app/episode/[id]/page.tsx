'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getEpisode } from '@/lib/api';
import type { Episode } from '@/types';
import VideoPlayer from '@/components/player/VideoPlayer';
import { SkeletonEpisodeCard } from '@/components/SkeletonCard';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import { PlayIcon, FilmIcon } from '@heroicons/react/24/solid';

export default function EpisodePage() {
  const params = useParams();
  const router = useRouter();
  const episodeId = params.id as string;

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchEpisode = useCallback(async (id: string) => {
    setLoading(true);
    setError(false);
    setEpisode(null);
    try {
      const data = await getEpisode(id);
      setEpisode(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (episodeId) fetchEpisode(episodeId);
  }, [episodeId, fetchEpisode]);

  const handleAutoNext = useCallback(() => {
    if (episode?.navigation.next) {
      router.push(`/episode/${episode.navigation.next._id}`);
    }
  }, [episode, router]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="page-container max-w-5xl space-y-4">
        {/* Player skeleton */}
        <div className="w-full bg-gray-900 rounded-xl animate-pulse" style={{ paddingTop: '56.25%', position: 'relative' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
        <div className="h-6 bg-gray-800 rounded-full w-1/3 animate-pulse" />
        <div className="h-4 bg-gray-800/70 rounded-full w-1/4 animate-pulse" />
        <div className="space-y-2 mt-6">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonEpisodeCard key={i} />)}
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !episode) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <div className="text-6xl">😢</div>
        <h2 className="text-2xl font-bold text-white">Episode tidak ditemukan</h2>
        <p className="text-gray-400 text-sm">Episode mungkin telah dihapus atau ID tidak valid.</p>
        <Link href="/" className="btn-primary">
          <HomeIcon className="h-4 w-4" />
          Kembali ke Home
        </Link>
      </div>
    );
  }

  const { anime, navigation } = episode;

  return (
    <div className="page-container max-w-5xl space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
        <Link href="/" className="hover:text-gray-300 transition-colors flex items-center gap-1">
          <HomeIcon className="h-3.5 w-3.5" />
          Home
        </Link>
        <span>/</span>
        <Link href={`/anime/${anime.slug}`} className="hover:text-purple-400 transition-colors truncate max-w-xs">
          {anime.title}
        </Link>
        <span>/</span>
        <span className="text-gray-300 font-medium">Episode {episode.episodeNumber}</span>
      </nav>

      {/* ── VIDEO PLAYER ───────────────────────────────────────────────────── */}
      <VideoPlayer
        servers={episode.servers}
        episodeId={episode._id}
        animeId={episode.animeId}
        episodeNumber={episode.episodeNumber}
        onEnded={handleAutoNext}
      />

      {/* ── Episode Info ───────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <h1 className="text-xl md:text-2xl font-bold text-white">
          {episode.title || `Episode ${episode.episodeNumber}`}
        </h1>
        <div className="flex items-center gap-3 text-sm text-gray-400 flex-wrap">
          <Link href={`/anime/${anime.slug}`} className="hover:text-purple-400 transition-colors font-medium text-purple-400">
            {anime.title}
          </Link>
          <span>·</span>
          <span>Episode {episode.episodeNumber}</span>
          {(episode.duration || 0) > 0 && (
            <>
              <span>·</span>
              <span>{Math.floor((episode.duration || 0) / 60)} menit</span>
            </>
          )}
          {episode.airDate && (
            <>
              <span>·</span>
              <span>{new Date(episode.airDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </>
          )}
        </div>
        {episode.synopsis && (
          <p className="text-gray-400 text-sm leading-relaxed pt-2">{episode.synopsis}</p>
        )}
      </div>

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {navigation.prev ? (
          <Link
            href={`/episode/${navigation.prev._id}`}
            className="btn-secondary flex-1 justify-center"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            <span className="hidden sm:inline">EP {navigation.prev.episodeNumber}</span>
            <span className="sm:hidden">Sebelumnya</span>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        <Link href={`/anime/${anime.slug}`} className="btn-secondary px-4">
          <ListBulletIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Semua EP</span>
        </Link>

        {navigation.next ? (
          <Link
            href={`/episode/${navigation.next._id}`}
            className="btn-primary flex-1 justify-center"
          >
            <span className="hidden sm:inline">EP {navigation.next.episodeNumber}</span>
            <span className="sm:hidden">Berikutnya</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>

      {/* ── Anime Info Card ─────────────────────────────────────────────────── */}
      <Link
        href={`/anime/${anime.slug}`}
        className="card-glass p-4 flex items-center gap-4 hover:border-purple-500/40 transition-all group"
      >
        <div className="relative w-14 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-800">
          {anime.coverImage ? (
            <Image
              src={anime.coverImage}
              alt={anime.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FilmIcon className="h-6 w-6 text-gray-600" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Dari anime</p>
          <h3 className="text-white font-bold text-sm group-hover:text-purple-300 transition-colors line-clamp-2">
            {anime.title}
          </h3>
          {anime.totalEpisodes ? (
            <p className="text-gray-500 text-xs mt-1">{anime.totalEpisodes} Episode</p>
          ) : null}
        </div>
        <PlayIcon className="h-5 w-5 text-purple-500 flex-shrink-0" />
      </Link>
    </div>
  );
}
