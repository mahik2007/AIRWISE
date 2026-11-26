import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Loader2, Navigation, AlertCircle } from 'lucide-react';
import { searchLocations } from '../../services/api';
import { GeocodingResult } from '../../types';

interface LocationSearchProps {
  onSelectLocation: (loc: GeocodingResult) => void;
  currentLocationName?: string;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onSelectLocation,
  currentLocationName,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [geoLocating, setGeoLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setErrorMessage(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        const res = await searchLocations(query.trim());
        setResults(res);
        setIsOpen(true);
      } catch (err: unknown) {
        console.error(err);
        setErrorMessage('Unable to reach location service. Please verify network.');
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleUseBrowserLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLocating(true);
    setErrorMessage(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLocating(false);
        onSelectLocation({
          id: 0,
          name: 'My GPS Location',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          country: 'Local',
        });
        setIsOpen(false);
      },
      (err) => {
        setGeoLocating(false);
        console.warn('Geolocation denied or failed:', err);
        setErrorMessage('Location permission denied or unavailable. Please search by city name.');
      },
      { timeout: 8000 }
    );
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          placeholder={currentLocationName ? `${t('nav.location')}: ${currentLocationName}` : t('common.searchPlaceholder')}
          className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-[#111e17] border border-[#233a2c] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all shadow-inner"
        />
        <div className="absolute right-2 flex items-center space-x-1">
          {loading && <Loader2 className="w-4 h-4 text-emerald-400 animate-spin mr-1" />}
          <button
            onClick={handleUseBrowserLocation}
            disabled={geoLocating}
            title="Use current GPS position"
            className="p-1.5 rounded-lg bg-[#182c21] hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 transition-colors border border-[#233f2e]"
          >
            {geoLocating ? (
              <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Inline Geolocation or Search Error Banner */}
      {errorMessage && (
        <div className="mt-2 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300 flex items-center space-x-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-[#0e1a14] border border-[#21372a] rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-[#17271e]">
          {results.map((loc) => (
            <div
              key={`${loc.id}-${loc.latitude}-${loc.longitude}`}
              onClick={() => {
                onSelectLocation(loc);
                setQuery('');
                setIsOpen(false);
              }}
              className="px-4 py-2.5 hover:bg-[#14261c] cursor-pointer transition-colors flex items-center justify-between"
            >
              <div className="flex items-center space-x-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-slate-200">{loc.name}</div>
                  <div className="text-[11px] text-slate-500">
                    {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-emerald-500/70 font-mono">
                {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
              </span>
            </div>
          ))}
        </div>
      )}

      {isOpen && !loading && query.trim().length >= 2 && results.length === 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-[#0e1a14] border border-[#21372a] rounded-xl p-4 text-center text-xs text-slate-400 z-50">
          {t('common.noLocations')}
        </div>
      )}
    </div>
  );
};
