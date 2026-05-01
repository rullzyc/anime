import axios from 'axios';
import type {
  Anime,
  AnimeWithEpisodes,
  Episode,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// ── Anime ────────────────────────────────────────────────────────────────────

export const getPopularAnime = async (): Promise<Anime[]> => {
  const res = await api.get<ApiResponse<Anime[]>>('/anime/popular');
  return res.data.data;
};

export const getLatestAnime = async (): Promise<Anime[]> => {
  const res = await api.get<ApiResponse<Anime[]>>('/anime/latest');
  return res.data.data;
};

export const searchAnime = async (q: string): Promise<Anime[]> => {
  if (!q.trim()) return [];
  const res = await api.get<ApiResponse<Anime[]>>(`/anime/search?q=${encodeURIComponent(q)}`);
  return res.data.data;
};

export const getAllAnime = async (page = 1, limit = 20): Promise<PaginatedResponse<Anime>> => {
  const res = await api.get<PaginatedResponse<Anime>>(`/anime?page=${page}&limit=${limit}`);
  return res.data;
};

export const getAnimeDetail = async (id: string): Promise<AnimeWithEpisodes> => {
  const res = await api.get<ApiResponse<AnimeWithEpisodes>>(`/anime/${id}`);
  return res.data.data;
};

// ── Episode ──────────────────────────────────────────────────────────────────

export const getEpisode = async (id: string): Promise<Episode> => {
  const res = await api.get<ApiResponse<Episode>>(`/episode/${id}`);
  return res.data.data;
};
