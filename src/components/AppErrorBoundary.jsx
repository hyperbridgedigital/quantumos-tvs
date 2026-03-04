'use client';

import { Component } from 'react';
import { brand } from '@/lib/brand';

/** Catches runtime errors so the app shows a fallback instead of crashing. */
export class AppErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('AppErrorBoundary:', error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      const isDev = typeof window !== 'undefined' && window.location?.hostname === 'localhost';
      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: brand?.storeBg2 || '#F8FAF8',
          fontFamily: brand?.fontBody || 'system-ui',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontFamily: brand?.fontDisplay, fontSize: 22, color: brand?.storeHeading || '#1A2E1C', marginBottom: 8 }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 14, color: brand?.storeDim || '#8A9588', marginBottom: 20, textAlign: 'center', maxWidth: 400 }}>
            The page hit a runtime error. Try refreshing or going back to the store.
          </p>
          {isDev && this.state.error?.message && (
            <pre style={{
              background: '#fff',
              border: '1px solid #DCE6DC',
              borderRadius: 12,
              padding: 16,
              fontSize: 12,
              color: '#EF4444',
              maxWidth: '100%',
              overflow: 'auto',
              marginBottom: 20,
            }}>
              {this.state.error.message}
            </pre>
          )}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                background: brand?.green || '#1B5E20',
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Refresh page
            </button>
            <button
              type="button"
              onClick={() => { this.setState({ error: null }); window.location.href = '/'; }}
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                background: '#fff',
                color: brand?.green || '#1B5E20',
                fontWeight: 700,
                fontSize: 14,
                border: '1px solid ' + (brand?.green || '#1B5E20'),
                cursor: 'pointer',
              }}
            >
              Go to store
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
