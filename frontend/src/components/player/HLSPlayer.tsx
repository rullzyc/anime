'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { Server } from '@/types';

// video.js types
declare global {
  interface Window {
    videojs: any;
    Hls: any;
  }
}

interface HLSPlayerProps {
  server: Server;
  savedTime?: number;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onError?: () => void;
  onEnded?: () => void;
}

export default function HLSPlayer({
  server,
  savedTime,
  onTimeUpdate,
  onError,
  onEnded,
}: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const hlsRef = useRef<any>(null);

  const destroyPlayer = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const initPlayer = async () => {
      if (!videoRef.current) return;

      // Dynamically import video.js and hls.js to avoid SSR issues
      const [videojs, Hls] = await Promise.all([
        import('video.js').then((m) => m.default),
        import('hls.js').then((m) => m.default),
      ]);

      // Import video.js CSS
      await import('video.js/dist/video-js.css');

      const videoEl = videoRef.current;

      // Initialize video.js player
      const player = videojs(videoEl, {
        controls: true,
        autoplay: false,
        preload: 'auto',
        fluid: true,
        responsive: true,
        playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
        controlBar: {
          pictureInPictureToggle: false,
        },
        html5: {
          vhs: {
            enableLowInitialPlaylist: true,
            smoothQualityChange: true,
          },
        },
      });

      playerRef.current = player;

      const applyHLS = () => {
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
          });
          hlsRef.current = hls;

          hls.loadSource(server.url);
          hls.attachMedia(videoEl);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (savedTime && savedTime > 0) {
              videoEl.currentTime = savedTime;
            }
          });

          hls.on(Hls.Events.ERROR, (event: any, data: any) => {
            if (data.fatal) {
              console.error('[HLS] Fatal error:', data.type);
              onError?.();
            }
          });
        } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari native HLS
          videoEl.src = server.url;
          if (savedTime && savedTime > 0) {
            videoEl.addEventListener('loadedmetadata', () => {
              videoEl.currentTime = savedTime;
            }, { once: true });
          }
        } else {
          console.error('[HLS] HLS not supported in this browser');
          onError?.();
        }
      };

      applyHLS();

      // Time update handler
      player.on('timeupdate', () => {
        const currentTime = player.currentTime() ?? 0;
        const duration = player.duration() ?? 0;
        if (duration > 0) {
          onTimeUpdate?.(currentTime, duration);
        }
      });

      // Ended handler
      player.on('ended', () => {
        onEnded?.();
      });

      // Error handler
      player.on('error', () => {
        console.error('[VideoJS] Player error');
        onError?.();
      });
    };

    initPlayer();

    return () => {
      destroyPlayer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [server.url]);

  return (
    <div className="w-full bg-black">
      <div data-vjs-player className="w-full">
        <video
          ref={videoRef}
          className="video-js vjs-default-skin vjs-big-play-centered w-full"
          style={{ aspectRatio: '16/9' }}
          playsInline
        />
      </div>
    </div>
  );
}
