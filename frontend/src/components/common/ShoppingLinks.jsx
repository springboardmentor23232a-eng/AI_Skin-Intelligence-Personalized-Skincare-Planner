import React from 'react';
import { ExternalLink } from 'lucide-react';

const PLATFORMS = [
  {
    key: 'amazon',
    name: 'Amazon',
    className: 'bg-amber-50 hover:bg-amber-100/90 text-amber-950 border border-amber-200/80 hover:border-amber-300'
  },
  {
    key: 'nykaa',
    name: 'Nykaa',
    className: 'bg-pink-50 hover:bg-pink-100/90 text-pink-950 border border-pink-200/80 hover:border-pink-300'
  },
  {
    key: 'purplle',
    name: 'Purplle',
    className: 'bg-purple-50 hover:bg-purple-100/90 text-purple-950 border border-purple-200/80 hover:border-purple-300'
  }
];

/**
 * ShoppingLinks component to display redirect buttons for configured shopping platforms.
 * 
 * Rules:
 * - Shows only available platforms where a valid URL is provided.
 * - Displays only platform names (Amazon, Nykaa, Purplle), never the actual URL text.
 * - Opens the destination in a new browser tab with target="_blank" rel="noopener noreferrer".
 * - Gracefully handles missing links without breaking layout.
 */
export default function ShoppingLinks({ links, className = '' }) {
  if (!links || typeof links !== 'object') {
    return null;
  }

  // Filter platforms with valid non-empty URLs
  const availablePlatforms = PLATFORMS.filter(
    (platform) => links[platform.key] && typeof links[platform.key] === 'string' && links[platform.key].trim() !== ''
  );

  if (availablePlatforms.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-1.5 pt-2 ${className}`}>
      <span className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-500 block">
        Where to Buy
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {availablePlatforms.map((platform) => (
          <a
            key={platform.key}
            href={links[platform.key]}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-3 py-1 rounded-xl text-xs font-display font-semibold transition-all duration-150 inline-flex items-center justify-center gap-1 shadow-2xs hover:shadow-xs cursor-pointer ${platform.className}`}
          >
            <span>{platform.name}</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        ))}
      </div>
    </div>
  );
}
