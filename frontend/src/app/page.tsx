import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getPopularAnime, getLatestAnime } from '@/lib/api';
import AnimeCard from '@/components/AnimeCard';
import type { Anime } from '@/types';
import { FireIcon, SparklesIcon, PlayIcon, StarIcon } from '@heroicons/react/24/solid';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'AnimeStream — Watch Anime Online Free',
  description: 'Watch the latest and most popular anime online in HD. Free streaming with multiple servers.',
};

export const revalidate = 300; // ISR: revalidate every 5 minutes

async function getHomeData() {
  try {
    const [popular, latest] = await Promise.all([
      getPopularAnime(),
      getLatestAnime(),
    ]);
    return { popular, latest };
  } catch {
    return { popular: [], latest: [] };
  }
}

function HeroSection({ anime }: { anime: Anime }) {
  return (
    <section className="relative w-full overflow-hidden" style={{ height: '85vh', maxHeight: '680px' }}>
      {/* Banner */}
      {anime.bannerImage ? (
        <Image
          src={anime.bannerImage}
          alt={anime.title}
          fill
          priority
          className="object-cover object-center"
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-gray-900 to-gray-950" />
      )}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950/30" />

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-16">
        <div className="flex gap-6 items-end max-w-2xl">
          {/* Cover */}
          <div className="hidden sm:block flex-shrink-0 w-36 rounded-xl overflow-hidden shadow-2xl shadow-black/60 border border-gray-700/40 ring-1 ring-purple-500/20">
            <Image
              src={anime.coverImage}
              alt={anime.title}
              width={144}
              height={216}
              className="object-cover w-full"
              unoptimized
            />
          </div>

          {/* Info */}
          <div className="space-y-3">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="badge bg-purple-600/30 border-purple-500/40 text-purple-300 font-semibold">
                🔥 Featured
              </span>
              <span className="badge bg-gray-800/80 border-gray-700/50 text-gray-300">
                {anime.type}
              </span>
              <span className={`badge ${anime.status === 'Ongoing' ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-blue-500/20 border-blue-500/30 text-blue-400'}`}>
                {anime.status}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight drop-shadow-lg">
              {anime.titleEnglish || anime.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
              {anime.rating ? (
                <div className="flex items-center gap-1">
                  <StarIcon className="h-4 w-4 text-yellow-400" />
                  <span className="text-yellow-400 font-bold">{anime.rating.toFixed(1)}</span>
                </div>
              ) : null}
              {anime.rating && (anime.year || anime.studio || anime.currentEpisode) ? <span>·</span> : null}
              
              {anime.year ? (
                <>
                  <span>{anime.year}</span>
                  {(anime.studio || anime.currentEpisode) ? <span>·</span> : null}
                </>
              ) : null}

              {anime.studio ? (
                <>
                  <span>{anime.studio}</span>
                  {anime.currentEpisode ? <span>·</span> : null}
                </>
              ) : null}

              {anime.currentEpisode ? (
                <span>{anime.currentEpisode} EP</span>
              ) : null}
            </div>

            {anime.description ? (
              <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 max-w-lg">
                {anime.description}
              </p>
            ) : null}

            {/* Genre tags */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {anime.genres.map((g) => (
                  <Link key={g} href={`/search?genre=${g}`} className="genre-tag">
                    {g}
                  </Link>
                ))}
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex gap-3 pt-1">
              <Link href={`/anime/${anime.slug}`} className="btn-primary">
                <PlayIcon className="h-4 w-4" />
                Tonton Sekarang
              </Link>
              <Link href={`/anime/${anime.slug}`} className="btn-secondary">
                Detail
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ title, icon, href }: { title: string; icon: React.ReactNode; href: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="section-title">
        {icon}
        {title}
      </h2>
      <Link
        href={href}
        className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium"
      >
        Lihat Semua
        <ChevronRightIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default async function HomePage() {
  const { popular, latest } = await getHomeData();
  const hero = popular[0] ?? latest[0];

  return (
    <>
      {/* Hero Section */}
      {hero && <HeroSection anime={hero} />}

      <div className="page-container space-y-14">
        {/* Popular Anime */}
        {popular.length > 0 && (
          <section>
            <SectionHeader
              title="Populer Saat Ini"
              icon={<FireIcon className="h-6 w-6 text-orange-500" />}
              href="/search?sort=-rating"
            />
            <div className="anime-grid">
              {popular.map((anime) => (
                <AnimeCard key={anime._id} anime={anime} />
              ))}
            </div>
          </section>
        )}

        {/* Latest Anime */}
        {latest.length > 0 && (
          <section>
            <SectionHeader
              title="Terbaru"
              icon={<SparklesIcon className="h-6 w-6 text-purple-500" />}
              href="/search?sort=-createdAt"
            />
            <div className="anime-grid">
              {latest.map((anime) => (
                <AnimeCard key={anime._id} anime={anime} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {popular.length === 0 && latest.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
            <div className="text-6xl">🎌</div>
            <h2 className="text-2xl font-bold text-white">Tidak ada anime ditemukan</h2>
            <p className="text-gray-400 text-sm max-w-sm">
              Pastikan backend berjalan dan database sudah di-seed dengan{' '}
              <code className="bg-gray-800 px-1.5 py-0.5 rounded text-purple-400">npm run seed</code>
            </p>
          </div>
        )}
      </div>
    </>
  );
}
