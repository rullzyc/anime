'use client';

import type { Server } from '@/types';
import { SignalIcon, GlobeAltIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ServerSwitcherProps {
  servers: Server[];
  selectedServer: Server | null;
  onSelect: (server: Server) => void;
  failedServers?: Set<string>;
}

export default function ServerSwitcher({
  servers,
  selectedServer,
  onSelect,
  failedServers = new Set(),
}: ServerSwitcherProps) {
  if (!servers.length) return null;

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800/60 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <SignalIcon className="h-4 w-4 text-purple-400" />
        <span className="text-sm font-semibold text-gray-300">Pilih Server</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {servers.map((server) => {
          const isActive = selectedServer?.name === server.name;
          const isFailed = failedServers.has(server.name);
          const isHLS = server.type === 'hls';

          return (
            <button
              key={server.name}
              onClick={() => !isFailed && onSelect(server)}
              disabled={isFailed}
              className={`
                relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                border transition-all duration-200
                ${
                  isActive
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/40'
                    : isFailed
                    ? 'bg-red-950/40 border-red-800/40 text-red-500 cursor-not-allowed'
                    : 'bg-gray-800/60 border-gray-700/50 text-gray-300 hover:bg-gray-700/60 hover:border-gray-600 hover:text-white'
                }
              `}
            >
              {/* Type icon */}
              {isHLS ? (
                <SignalIcon className="h-3.5 w-3.5" />
              ) : (
                <GlobeAltIcon className="h-3.5 w-3.5" />
              )}

              {server.name}

              {/* Active indicator */}
              {isActive && <CheckCircleIcon className="h-3.5 w-3.5 text-purple-300" />}

              {/* Failed indicator */}
              {isFailed && <ExclamationTriangleIcon className="h-3.5 w-3.5" />}

              {/* Quality badge */}
              {server.quality && server.quality !== 'Auto' && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded font-bold ${
                    isActive
                      ? 'bg-purple-500/50 text-purple-200'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {server.quality}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Type legend */}
      <div className="flex gap-4 mt-3 pt-3 border-t border-gray-800/50">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <GlobeAltIcon className="h-3.5 w-3.5 text-blue-400" />
          <span>Embed Player</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <SignalIcon className="h-3.5 w-3.5 text-green-400" />
          <span>HLS Stream</span>
        </div>
      </div>
    </div>
  );
}
