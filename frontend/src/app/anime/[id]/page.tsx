import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAnimeDetail } from '@/lib/api';
import type { EpisodeListItem } from '@/types';
import {
  StarIcon,
  PlayIcon,
  FilmIcon,
  CalendarIcon,
  BuildingOffice2Icon,
  CheckBadgeIcon,
} from '@heroicons/react/24/solid';
import { ClockIcon, ListBulletIcon } from '@heroicons/react/24/outline';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const anime = await getAnimeDetail(id);
    return {
      title: `${anime.titleEnglish || anime.title} — AnimeStream`,
      description: anime.description.slice(0, 160),
      openGraph: {
        images: [anime.coverImage],
      },
    };
  } catch {
    return { title: 'Anime Detail' };
  }
}

export const revalidate = 600;

function EpisodeCard({ episode, animeSlug, index }: { episode: EpisodeListItem; animeSlug: string; index: number }) {
  const minutes = Math.floor((episode.duration || 0) / 60);

  return (
    <Link
      href={`/episode/${episode._id}`}
      className="group flex items-center gap-3 p-3 bg-gray-900/60 hover:bg-gray-800/80 border border-gray-800/50 hover:border-purple-500/40 rounded-xl transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="relative flex-shrink-0 w-28 h-16 rounded-lg overflow-hidden bg-gray-800">
        {episode.thumbnail ? (
          <Image
            src={episode.thumbnail}
            alt={`Episode ${episode.episodeNumber}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-950 to-gray-900">
            <FilmIcon className="h-6 w-6 text-purple-600" />
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <PlayIcon className="h-6 w-6 text-white" />
        </div>
        {/* Ep number */}
        <div className="absolute bottom-1 left-1 bg-gray-950/90 text-white text-xs font-bold px-1.5 py-0.5 rounded">
          EP {episode.episodeNumber}
        </div>
        {episode.isFiller && (
          <div className="absolute top-1 right-1 bg-yellow-500/90 text-gray-900 text-xs font-bold px-1 py-0.5 rounded">
            Filler
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold group-hover:text-purple-300 transition-colors truncate">
          {episode.title || `Episode ${episode.episodeNumber}`}
        </p>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
          {minutes > 0 && (
            <span className="flex items-center gap-1">
              <ClockIcon className="h-3 w-3" />
              {minutes}m
            </span>
          )}
          {episode.airDate && (
            <span>{new Date(episode.airDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <PlayIcon className="h-4 w-4 text-gray-600 group-hover:text-purple-400 flex-shrink-0 transition-colors" />
    </Link>
  );
}

export default async function AnimeDetailPage({ params }: Props) {
  const { id } = await params;

  let anime;
  try {
    anime = await getAnimeDetail(id);
  } catch {
    notFound();
  }

  const statusColor: Record<string, string> = {
    Ongoing: 'bg-green-500/20 text-green-400 border-green-500/30',
    Completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Upcoming: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  };

  const firstEpisode = anime.episodes?.[0];

  return (
    <>
      {/* Banner */}
      <div className="relative w-full overflow-hidden" style={{ height: '340px' }}>
        {anime.bannerImage ? (
          <Image src={anime.bannerImage} alt={anime.title} fill className="object-cover object-center" unoptimized />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-gray-900 to-gray-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 to-transparent" />
      </div>

      <div className="page-container -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Cover + Meta */}
          <div className="flex-shrink-0 w-full md:w-52 space-y-4">
            {/* Cover image */}
            <div className="rounded-xl overflow-hidden shadow-2xl shadow-black/60 border border-gray-700/40 ring-1 ring-purple-500/20 mx-auto w-44 md:w-full">
              <Image
                src={anime.coverImage}
                alt={anime.title}
                width={208}
                height={312}
                className="object-cover w-full"
                unoptimized
              />
            </div>

            {/* Quick stats */}
            <div className="card-glass p-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Rating</span>
                <div className="flex items-center gap-1">
                  <StarIcon className="h-4 w-4 text-yellow-400" />
                  <span className="text-yellow-400 font-bold">{anime.rating.toFixed(1)}</span>
                  <span className="text-gray-500">/10</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status</span>
                <span className={`badge text-xs ${statusColor[anime.status]}`}>{anime.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Episode</span>
                <span className="text-white font-medium">
                  {anime.currentEpisode}
                  {anime.totalEpisodes > 0 && anime.totalEpisodes !== anime.currentEpisode && `/${anime.totalEpisodes}`}
                </span>
              </div>
              {anime.type && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Tipe</span>
                  <span className="text-white font-medium">{anime.type}</span>
                </div>
              )}
              {anime.year && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Tahun</span>
                  <span className="text-white font-medium">{anime.year}</span>
                </div>
              )}
              {anime.studio && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Studio</span>
                  <span className="text-white font-medium text-right">{anime.studio}</span>
                </div>
              )}
              {anime.season && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Season</span>
                  <span className="text-white font-medium">{anime.season}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Info + Episodes */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Title & genre */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`badge ${statusColor[anime.status]}`}>{anime.status}</span>
                <span className="badge bg-gray-800/80 border-gray-700/50 text-gray-400">{anime.type}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                {anime.titleEnglish || anime.title}
              </h1>
              {anime.titleJapanese && (
                <p className="text-gray-400 text-sm mt-1">{anime.titleJapanese}</p>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {anime.genres.map((g) => (
                <Link key={g} href={`/search?genre=${g}`} className="genre-tag">
                  {g}
                </Link>
              ))}
            </div>

            {/* Synopsis */}
            <div className="card-glass p-5">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Sinopsis</h2>
              <p className="text-gray-300 text-sm leading-relaxed">{anime.description}</p>
            </div>

            {/* CTA */}
            {firstEpisode && (
              <div className="flex gap-3 flex-wrap">
                <Link href={`/episode/${firstEpisode._id}`} className="btn-primary">
                  <PlayIcon className="h-4 w-4" />
                  Tonton Ep 1
                </Link>
              </div>
            )}

            {/* Episode List */}
            {anime.episodes && anime.episodes.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ListBulletIcon className="h-5 w-5 text-purple-400" />
                  <h2 className="section-title text-base">
                    Daftar Episode
                    <span className="text-gray-500 font-normal text-sm ml-1">({anime.episodes.length})</span>
                  </h2>
                </div>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                  {anime.episodes.map((ep, i) => (
                    <EpisodeCard key={ep._id} episode={ep} animeSlug={anime.slug} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
