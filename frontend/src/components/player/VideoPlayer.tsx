'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { Server } from '@/types';
import { usePlayerStore } from '@/store/usePlayerStore';
import ServerSwitcher from './ServerSwitcher';
import IframePlayer from './IframePlayer';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// Dynamically import HLS player to avoid SSR issues with video.js
const HLSPlayer = dynamic(() => import('./HLSPlayer'), { ssr: false });

interface VideoPlayerProps {
  servers: Server[];
  episodeId: string;
  animeId: string;
  episodeNumber: number;
  onEnded?: () => void;
}

export default function VideoPlayer({
  servers,
  episodeId,
  animeId,
  episodeNumber,
  onEnded,
}: VideoPlayerProps) {
  const { selectedServer, lastServerName, setSelectedServer, saveProgress, getProgress } =
    usePlayerStore();

  const [failedServers, setFailedServers] = useState<Set<string>>(new Set());
  const [hasError, setHasError] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get saved watch progress for this episode
  const savedProgress = getProgress(episodeId);
  const savedTime = savedProgress?.currentTime ?? 0;

  // Initialize server selection
  useEffect(() => {
    if (!servers.length) return;

    // Try to restore last used server
    const lastServer = servers.find((s) => s.name === lastServerName);
    const defaultServer = servers.find((s) => s.isDefault) ?? servers[0];
    const initialServer = lastServer ?? defaultServer;

    setSelectedServer(initialServer);
    setFailedServers(new Set());
    setHasError(false);
    setIsInitialized(true);
  }, [episodeId, servers]); // eslint-disable-line

  const handleServerSelect = useCallback(
    (server: Server) => {
      setSelectedServer(server);
      setHasError(false);
    },
    [setSelectedServer]
  );

  const handleError = useCallback(() => {
    if (!selectedServer) return;

    // Mark this server as failed
    setFailedServers((prev) => new Set([...prev, selectedServer.name]));

    // Auto-switch to next available server
    const nextServer = servers.find(
      (s) => s.name !== selectedServer.name && !failedServers.has(s.name)
    );

    if (nextServer) {
      console.log(`[Player] Auto-switching to ${nextServer.name}`);
      setSelectedServer(nextServer);
      setHasError(false);
    } else {
      setHasError(true);
    }
  }, [selectedServer, servers, failedServers, setSelectedServer]);

  const handleTimeUpdate = useCallback(
    (currentTime: number, duration: number) => {
      // Save every 5 seconds
      if (Math.round(currentTime) % 5 === 0) {
        saveProgress({
          episodeId,
          currentTime,
          duration,
          animeId,
          episodeNumber,
          updatedAt: new Date().toISOString(),
        });
      }
    },
    [episodeId, animeId, episodeNumber, saveProgress]
  );

  const handleRetry = () => {
    setFailedServers(new Set());
    setHasError(false);
    // Reset to first server
    if (servers.length) setSelectedServer(servers[0]);
  };

  // All servers failed
  if (hasError) {
    return (
      <div className="w-full rounded-xl overflow-hidden bg-gray-900 border border-gray-800">
        <div
          className="flex flex-col items-center justify-center gap-4 py-16 px-4 text-center"
          style={{ minHeight: '360px' }}
        >
          <div className="bg-red-950/50 border border-red-800/40 rounded-full p-4">
            <ExclamationTriangleIcon className="h-10 w-10 text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">Video Tidak Tersedia</h3>
            <p className="text-gray-400 text-sm mt-1">
              Semua server gagal memuat video. Coba lagi nanti.
            </p>
          </div>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Coba Ulang
          </button>
          <ServerSwitcher
            servers={servers}
            selectedServer={selectedServer}
            onSelect={handleServerSelect}
            failedServers={failedServers}
          />
        </div>
      </div>
    );
  }

  if (!isInitialized || !selectedServer) {
    return (
      <div
        className="w-full bg-gray-900 rounded-xl animate-pulse"
        style={{ paddingTop: '56.25%', position: 'relative' }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Player */}
      <div className="rounded-xl overflow-hidden bg-black shadow-2xl shadow-black/60 border border-gray-800/40">
        {selectedServer.type === 'iframe' ? (
          <IframePlayer server={selectedServer} onError={handleError} />
        ) : (
          <HLSPlayer
            server={selectedServer}
            savedTime={savedTime}
            onTimeUpdate={handleTimeUpdate}
            onError={handleError}
            onEnded={onEnded}
          />
        )}
      </div>

      {/* Server switcher */}
      <ServerSwitcher
        servers={servers}
        selectedServer={selectedServer}
        onSelect={handleServerSelect}
        failedServers={failedServers}
      />

      {/* Resume indicator */}
      {savedTime > 30 && (
        <div className="flex items-center gap-2 text-xs text-purple-400 bg-purple-950/30 border border-purple-800/30 rounded-lg px-3 py-2">
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
          Melanjutkan dari {Math.floor(savedTime / 60)}:{String(Math.floor(savedTime % 60)).padStart(2, '0')}
        </div>
      )}
    </div>
  );
}
