import Link from 'next/link';
import Image from 'next/image';
import type { Anime } from '@/types';
import { StarIcon, PlayIcon } from '@heroicons/react/24/solid';

interface AnimeCardProps {
  anime: Anime;
}

export default function AnimeCard({ anime }: AnimeCardProps) {
  const statusColor = {
    Ongoing: 'bg-green-500/20 text-green-400 border-green-500/30',
    Completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Upcoming: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  }[anime.status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';

  return (
    <Link href={`/anime/${anime.slug}`} className="group block">
      <div className="relative rounded-xl overflow-hidden bg-gray-900 border border-gray-800/50 hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-900/20">
        {/* Cover image */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <Image
            src={anime.coverImage}
            alt={anime.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="bg-purple-600/90 backdrop-blur-sm rounded-full p-3 shadow-xl shadow-purple-900/50 scale-75 group-hover:scale-100 transition-transform duration-300">
              <PlayIcon className="h-6 w-6 text-white" />
            </div>
          </div>

          {/* Status badge */}
          {anime.status && (
            <div className="absolute top-2 left-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColor} backdrop-blur-sm`}>
                {anime.status}
              </span>
            </div>
          )}

          {/* Episode count */}
          {anime.currentEpisode ? (
            <div className="absolute top-2 right-2">
              <span className="bg-gray-950/80 backdrop-blur-sm text-gray-300 text-xs font-medium px-2 py-0.5 rounded-full border border-gray-700/50">
                EP {anime.currentEpisode}
              </span>
            </div>
          ) : null}

          {/* Rating */}
          {anime.rating ? (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-gray-950/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-gray-700/50">
              <StarIcon className="h-3 w-3 text-yellow-400" />
              <span className="text-yellow-400 text-xs font-bold">{anime.rating.toFixed(1)}</span>
            </div>
          ) : null}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="text-white text-sm font-semibold leading-tight line-clamp-2 group-hover:text-purple-300 transition-colors">
            {anime.titleEnglish || anime.title}
          </h3>
          {anime.genres && anime.genres.length > 0 && (
            <p className="text-gray-500 text-xs mt-1 truncate">
              {anime.genres.slice(0, 2).join(' · ')}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
