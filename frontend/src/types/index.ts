// Types for the AnimeStream application

export interface Anime {
  _id: string;
  title: string;
  titleEnglish?: string;
  titleJapanese?: string;
  slug: string;
  coverImage: string;
  bannerImage?: string;
  description: string;
  genres: string[];
  status: 'Ongoing' | 'Completed' | 'Upcoming';
  rating: number;
  totalEpisodes: number;
  currentEpisode: number;
  isPopular: boolean;
  isLatest: boolean;
  season?: string;
  year?: number;
  studio?: string;
  type: 'TV' | 'Movie' | 'OVA' | 'ONA' | 'Special';
  createdAt: string;
  updatedAt: string;
}

export interface AnimeWithEpisodes extends Anime {
  episodes: EpisodeListItem[];
}

export interface EpisodeListItem {
  _id: string;
  episodeNumber: number;
  title?: string;
  thumbnail?: string;
  duration?: number;
  airDate?: string;
  isFiller?: boolean;
}

export interface Server {
  _id?: string;
  name: string;
  type: 'iframe' | 'hls' | 'mp4';
  url: string;
  quality: '360p' | '480p' | '720p' | '1080p' | 'Auto';
  isDefault: boolean;
}

export interface EpisodeNavItem {
  _id: string;
  episodeNumber: number;
  title?: string;
}

export interface Episode extends EpisodeListItem {
  animeId: string;
  servers: Server[];
  synopsis?: string;
  anime: {
    _id?: string;
    title: string;
    slug: string;
    coverImage: string;
    totalEpisodes: number;
  };
  navigation: {
    prev: EpisodeNavItem | null;
    next: EpisodeNavItem | null;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total?: number;
    page: number;
    limit?: number;
    totalPages?: number;
    hasNextPage?: boolean;
  };
}

export interface WatchProgress {
  episodeId: string;
  currentTime: number;
  duration: number;
  animeId: string;
  episodeNumber: number;
  updatedAt: string;
}
