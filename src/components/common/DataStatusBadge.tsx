import React from 'react';
import { DataStatus } from '../../types';

interface DataStatusBadgeProps {
  status: DataStatus | 'LIVE_GPS' | 'DEMO_LOCATION';
  text?: string;
  className?: string;
  showIcon?: boolean;
}

export const DataStatusBadge: React.FC<DataStatusBadgeProps> = ({
  status,
  text,
  className = '',
  showIcon = true,
}) => {
  if (status === 'LIVE' || status === 'LIVE_GPS') {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 tracking-wide ${className}`}>
        {showIcon && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        )}
        <span>{text || (status === 'LIVE_GPS' ? 'LIVE GPS' : 'LIVE')}</span>
      </span>
    );
  }

  if (status === 'DEMO_DATA' || status === 'DEMO_LOCATION') {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 tracking-wide ${className}`}>
        {showIcon && <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>}
        <span>{text || (status === 'DEMO_LOCATION' ? 'DEMO LOCATION' : 'DEMO DATA')}</span>
      </span>
    );
  }

  if (status === 'UNAVAILABLE') {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 tracking-wide ${className}`}>
        {showIcon && <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>}
        <span>{text || 'Live data unavailable'}</span>
      </span>
    );
  }

  if (status === 'LAST_VERIFIED') {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 tracking-wide ${className}`}>
        {showIcon && <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>}
        <span>{text || 'LAST VERIFIED'}</span>
      </span>
    );
  }

  // UPDATED_RECENTLY
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 tracking-wide ${className}`}>
      {showIcon && <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>}
      <span>{text || 'UPDATED RECENTLY'}</span>
    </span>
  );
};
