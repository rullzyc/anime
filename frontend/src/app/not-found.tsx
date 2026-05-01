import Link from 'next/link';
import { HomeIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 gap-6">
      <div className="relative">
        <span className="text-9xl font-black text-gray-900 select-none">404</span>
        <span className="absolute inset-0 flex items-center justify-center text-7xl">🎌</span>
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white">Halaman Tidak Ditemukan</h1>
        <p className="text-gray-400 text-sm max-w-sm">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/" className="btn-primary">
          <HomeIcon className="h-4 w-4" />
          Kembali ke Home
        </Link>
        <Link href="/search" className="btn-secondary">
          Browse Anime
        </Link>
      </div>
    </div>
  );
}
