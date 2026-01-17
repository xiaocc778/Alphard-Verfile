import { useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY_V2 = 'bestauto.cars.override.v1';
const STORAGE_KEY_V1 = 'autohome.cars.override.v1';

function coerceCar(raw, fallbackId) {
  if (!raw || typeof raw !== 'object') return null;

  const id = Number.isFinite(Number(raw.id)) ? Number(raw.id) : fallbackId;
  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  if (!title) return null;

  const year = Number.isFinite(Number(raw.year)) ? Number(raw.year) : null;
  const price = Number.isFinite(Number(raw.price)) ? Number(raw.price) : 0;
  const mileage = Number.isFinite(Number(raw.mileage)) ? Number(raw.mileage) : 0;

  const features = Array.isArray(raw.features)
    ? raw.features.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim())
    : [];

  return {
    ...raw,
    id,
    title,
    year,
    price,
    mileage,
    features,
  };
}

function normalizeCars(rawCars) {
  if (!Array.isArray(rawCars)) return [];
  const out = [];
  for (let i = 0; i < rawCars.length; i += 1) {
    const c = coerceCar(rawCars[i], i + 1);
    if (c) out.push(c);
  }
  // De-dupe by id (last wins)
  const byId = new Map();
  for (const c of out) byId.set(c.id, c);
  return Array.from(byId.values()).sort((a, b) => (b.year || 0) - (a.year || 0));
}

export function useCarsData({ defaultCars = [] } = {}) {
  const normalizedDefault = useMemo(() => normalizeCars(defaultCars), [defaultCars]);
  const [cars, setCars] = useState(normalizedDefault);
  const [source, setSource] = useState('default'); // 'default' | 'imported'

  useEffect(() => {
    // Always prefer imported data if present.
    try {
      const raw = localStorage.getItem(STORAGE_KEY_V2) ?? localStorage.getItem(STORAGE_KEY_V1);
      if (!raw) {
        setCars(normalizedDefault);
        setSource('default');
        return;
      }
      const parsed = JSON.parse(raw);
      const normalized = normalizeCars(parsed);
      if (normalized.length > 0) {
        setCars(normalized);
        setSource('imported');
      } else {
        setCars(normalizedDefault);
        setSource('default');
      }
    } catch {
      setCars(normalizedDefault);
      setSource('default');
    }
  }, [normalizedDefault]);

  const setImportedCars = useCallback((nextCars) => {
    const normalized = normalizeCars(nextCars);
    if (normalized.length === 0) {
      throw new Error('No valid cars found in imported data.');
    }
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(normalized));
    setCars(normalized);
    setSource('imported');
  }, []);

  const clearImportedCars = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_V2);
    localStorage.removeItem(STORAGE_KEY_V1);
    setCars(normalizedDefault);
    setSource('default');
  }, [normalizedDefault]);

  return { cars, source, setImportedCars, clearImportedCars };
}

