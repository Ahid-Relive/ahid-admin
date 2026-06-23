'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface Prediction {
  placeId: string;
  description: string;
}

interface PlacesAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  onPlaceSelect: (address: string, lat: number, lng: number) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  /** ISO 3166-1 alpha-2 code to restrict suggestions to a single country */
  countryCode?: string;
}

function waitForMaps(timeout = 8000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.google?.maps?.places?.AutocompleteService) {
      resolve();
      return;
    }
    const start = Date.now();
    const poll = () => {
      if (window.google?.maps?.places?.AutocompleteService) {
        resolve();
      } else if (Date.now() - start > timeout) {
        reject(new Error('Google Maps Places API did not load'));
      } else {
        setTimeout(poll, 100);
      }
    };
    poll();
  });
}

export function PlacesAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = '123 Main Street, Lagos',
  className,
  error,
  countryCode,
}: PlacesAutocompleteProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [suggesting, setSuggesting] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [selectError, setSelectError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const autocompleteRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesRef = useRef<google.maps.places.PlacesService | null>(null);
  const attributionRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    waitForMaps()
      .then(() => {
        autocompleteRef.current = new window.google.maps.places.AutocompleteService();
        if (attributionRef.current) {
          placesRef.current = new window.google.maps.places.PlacesService(attributionRef.current);
        }
      })
      .catch(() => {});
  }, []);

  const fetchPredictions = useCallback((input: string, code?: string) => {
    if (!autocompleteRef.current || input.length < 3) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }
    setSuggesting(true);
    const request: google.maps.places.AutocompletionRequest = { input };
    if (code) request.componentRestrictions = { country: code };
    autocompleteRef.current.getPlacePredictions(request, (results, status) => {
      setSuggesting(false);
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        setPredictions(results.map((r) => ({ placeId: r.place_id, description: r.description })));
        setIsOpen(true);
      } else {
        setPredictions([]);
        setIsOpen(false);
      }
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    setSelectError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPredictions(val, countryCode), 300);
  };

  const handleSelect = (prediction: Prediction) => {
    onChange(prediction.description);
    setIsOpen(false);
    setPredictions([]);

    if (!placesRef.current) {
      setSelectError('Places service not ready — please try again');
      return;
    }

    setResolving(true);
    setSelectError(null);

    placesRef.current.getDetails(
      { placeId: prediction.placeId, fields: ['geometry', 'formatted_address'] },
      (place, status) => {
        setResolving(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const address = place.formatted_address ?? prediction.description;
          onChange(address);
          onPlaceSelect(address, lat, lng);
        } else {
          setSelectError('Could not get coordinates for this location');
        }
      },
    );
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const inputClass =
    className ??
    'w-full rounded-lg border border-gray-300 px-3 py-2 pr-9 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          value={value}
          onChange={handleInputChange}
          onFocus={() => predictions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={inputClass}
        />
        {(suggesting || resolving) && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
        )}
      </div>

      {isOpen && predictions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {predictions.map((p) => (
            <li
              key={p.placeId}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(p);
              }}
              className="flex cursor-pointer items-start gap-2 px-3 py-2 text-sm hover:bg-blue-50"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <span>{p.description}</span>
            </li>
          ))}
        </ul>
      )}

      {(error || selectError) && (
        <p className="mt-1 text-xs text-red-600">{selectError ?? error}</p>
      )}

      {/* Required attribution container for Google Places API ToS */}
      <div ref={attributionRef} className="hidden" />
    </div>
  );
}
