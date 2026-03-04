'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { LANGUAGES, CURRENCIES } from '@/lib/i18n';

const LOCALE_STORAGE = 'tvs_locale';
const CURRENCY_STORAGE = 'tvs_currency';

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('INR');
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedLang = localStorage.getItem(LOCALE_STORAGE);
    const savedCurr = localStorage.getItem(CURRENCY_STORAGE);
    if (savedLang && LANGUAGES.some((l) => l.code === savedLang)) setLanguage(savedLang);
    if (savedCurr && CURRENCIES.some((c) => c.code === savedCurr)) setCurrency(savedCurr);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOCALE_STORAGE, language);
  }, [language]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CURRENCY_STORAGE, currency);
  }, [currency]);

  /** Auto-detect language from browser */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(LOCALE_STORAGE);
    if (saved) return;
    const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    const primary = browserLang.slice(0, 2);
    const match = LANGUAGES.find((l) => l.code === primary || browserLang.startsWith(l.code + '-'));
    if (match) setLanguage(match.code);
  }, []);

  /** Auto-detect currency from locale (optional) */
  const detectCurrencyFromLocale = useCallback(() => {
    const locale = typeof navigator !== 'undefined' ? (navigator.language || 'en-IN') : 'en-IN';
    if (locale.includes('IN')) setCurrency('INR');
    else if (locale.includes('US')) setCurrency('USD');
    else if (locale.includes('GB')) setCurrency('GBP');
    else if (locale.includes('DE') || locale.includes('FR') || locale.includes('ES') || locale.includes('IT')) setCurrency('EUR');
    else if (locale.includes('JP')) setCurrency('JPY');
    else if (locale.includes('CN')) setCurrency('CNY');
    else if (locale.includes('KR')) setCurrency('KRW');
    else if (locale.includes('AE') || locale.includes('SA')) setCurrency('AED');
  }, []);

  /** Auto-detect location (geolocation) */
  const detectLocation = useCallback(() => {
    setLocationLoading(true);
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLoading(false);
      },
      () => setLocationLoading(false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const value = {
    language,
    setLanguage,
    currency,
    setCurrency,
    userLocation,
    setUserLocation,
    locationLoading,
    detectLocation,
    detectCurrencyFromLocale,
    languages: LANGUAGES,
    currencies: CURRENCIES,
  };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used inside LocaleProvider');
  return ctx;
}
