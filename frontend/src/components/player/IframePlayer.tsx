'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { Server } from '@/types';

interface IframePlayerProps {
  server: Server;
  onError?: () => void;
}

export default function IframePlayer({ server, onError }: IframePlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleError = useCallback(() => {
    onError?.();
  }, [onError]);

  useEffect(() => {
    // Reset iframe on server change
    if (iframeRef.current) {
      iframeRef.current.src = server.url;
    }
  }, [server.url]);

  return (
    <div className="relative w-full bg-black" style={{ paddingTop: '56.25%' }}>
      <iframe
        ref={iframeRef}
        src={server.url}
        className="absolute inset-0 w-full h-full border-0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        onError={handleError}
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-forms allow-modals allow-pointer-lock"
        title={`Video Player - ${server.name}`}
      />
    </div>
  );
}
