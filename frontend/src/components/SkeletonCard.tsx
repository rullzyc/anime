export function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden bg-gray-900 border border-gray-800/50 animate-pulse">
      <div className="aspect-[2/3] bg-gray-800" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 bg-gray-800 rounded-full w-4/5" />
        <div className="h-3 bg-gray-800/70 rounded-full w-2/5" />
      </div>
    </div>
  );
}

export function SkeletonBanner() {
  return (
    <div className="relative w-full h-[420px] md:h-[520px] bg-gray-900 animate-pulse rounded-2xl overflow-hidden">
      <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
        <div className="h-6 bg-gray-800 rounded-full w-1/2" />
        <div className="h-4 bg-gray-800/70 rounded-full w-3/4" />
        <div className="h-4 bg-gray-800/70 rounded-full w-2/3" />
        <div className="flex gap-3 mt-4">
          <div className="h-10 w-28 bg-gray-800 rounded-full" />
          <div className="h-10 w-28 bg-gray-800/70 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonEpisodeCard() {
  return (
    <div className="flex gap-3 p-3 bg-gray-900 rounded-xl border border-gray-800/50 animate-pulse">
      <div className="flex-shrink-0 w-28 h-16 bg-gray-800 rounded-lg" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3.5 bg-gray-800 rounded-full w-3/4" />
        <div className="h-3 bg-gray-800/70 rounded-full w-1/2" />
      </div>
    </div>
  );
}
