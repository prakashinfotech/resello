import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchCities,
  fetchAreasByCity,
  detectCity,
  setLocation,
  clearAreas,
} from '../store/slices/locationSlice';
import type { City, Area } from '../store/slices/locationSlice';
import Modal from './Modal';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal for selecting city and area.
 * Supports manual selection via dropdowns and auto-detection via browser geolocation.
 * Persists selection to localStorage via Redux slice.
 */
const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { cities, areas, loading, selectedCity, selectedArea } = useAppSelector(
    (state) => state.location
  );

  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [detectError, setDetectError] = useState<string>('');
  const [isDetecting, setIsDetecting] = useState(false);

  // Load cities when modal opens
  useEffect(() => {
    if (isOpen && cities.length === 0) {
      dispatch(fetchCities());
    }
  }, [isOpen, cities.length, dispatch]);

  // Pre-fill with current selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCityId(selectedCity?.id ?? '');
      setSelectedAreaId(selectedArea?.id ?? '');
      setDetectError('');
      if (selectedCity) {
        dispatch(fetchAreasByCity(selectedCity.id));
      }
    }
  }, [isOpen, selectedCity, selectedArea, dispatch]);

  // Load areas when city changes
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = e.target.value;
    setSelectedCityId(cityId);
    setSelectedAreaId('');
    dispatch(clearAreas());
    if (cityId) {
      dispatch(fetchAreasByCity(cityId));
    }
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAreaId(e.target.value);
  };

  const handleSave = () => {
    const city = cities.find((c: City) => c.id === selectedCityId);
    if (!city) return;
    const area = areas.find((a: Area) => a.id === selectedAreaId) ?? null;
    dispatch(setLocation({ city, area }));
    onClose();
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setDetectError('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetecting(true);
    setDetectError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const result = await dispatch(
            detectCity({ lat: position.coords.latitude, lon: position.coords.longitude })
          ).unwrap();
          setSelectedCityId(result.id);
          setSelectedAreaId('');
          dispatch(fetchAreasByCity(result.id));
        } catch {
          setDetectError('Could not detect your city. Please select manually.');
        } finally {
          setIsDetecting(false);
        }
      },
      () => {
        setDetectError('Location access denied. Please select your city manually.');
        setIsDetecting(false);
      }
    );
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} labelId="location-modal-title">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 id="location-modal-title" className="text-xl font-semibold text-gray-900">
            Select Location
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Use Current Location button */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isDetecting || loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
          >
            {isDetecting ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600" />
                Detecting location...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Use Current Location
              </>
            )}
          </button>

          {detectError && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md" role="alert">
              {detectError}
            </p>
          )}

          <div className="relative flex items-center">
            <div className="flex-1 border-t border-gray-200" />
            <span className="mx-3 text-sm text-gray-400">or select manually</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          {/* City dropdown */}
          <div>
            <label htmlFor="location-city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <select
              id="location-city"
              value={selectedCityId}
              onChange={handleCityChange}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white disabled:opacity-60 min-h-[44px]"
            >
              <option value="">Select a city</option>
              {cities.map((city: City) => (
                <option key={city.id} value={city.id}>
                  {city.name}, {city.state}
                </option>
              ))}
            </select>
          </div>

          {/* Area dropdown — shown only when a city is selected */}
          {selectedCityId && (
            <div>
              <label htmlFor="location-area" className="block text-sm font-medium text-gray-700 mb-1">
                Area <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <select
                id="location-area"
                value={selectedAreaId}
                onChange={handleAreaChange}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white disabled:opacity-60 min-h-[44px]"
              >
                <option value="">All areas</option>
                {areas.map((area: Area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={!selectedCityId || loading}
            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
          >
            Apply Location
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LocationModal;
