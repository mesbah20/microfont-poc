import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

/**
 * Demo-faithful in-memory cache for repeated GET responses.
 *
 * Mirrors the demo's `CacheService` (a thin `Map<>` wrapper) so any service
 * can short-circuit a remote call when the data hasn't changed. Keys are
 * caller-defined strings (typically the URL + serialized params).
 *
 * Usage:
 *   this.cache.cacheRequest<MyDto[]>(
 *     'accounts.list',
 *     () => this.http.get<MyDto[]>(url),
 *   ).subscribe(rows => …);
 *
 *   // Simple form — just an HTTP GET, the cache wraps it for you:
 *   this.cache.cacheRequestSimple<MyDto[]>(
 *     'accounts.list',
 *     this.http.get<MyDto[]>(url),
 *   ).subscribe(rows => …);
 */
@Injectable({ providedIn: 'root' })
export class CacheService {
  private readonly cacheMap = new Map<string, any>();

  /**
   * Run `fetchData` only when no cached entry exists for `cacheKey`. The
   * returned Observable emits the cached value synchronously when present.
   */
  cacheRequest<T>(cacheKey: string, fetchDataFn: () => Observable<T>): Observable<T> {
    const cached = this.cacheMap.get(cacheKey) as T | undefined;
    if (cached !== undefined) {
      return of(cached);
    }
    const obs = fetchDataFn();
    obs.subscribe({
      next: (value) => this.cacheMap.set(cacheKey, value),
      error: () => undefined,
    });
    return obs;
  }

  /**
   * Sugar over {@link cacheRequest} when the caller already has a
   * pre-built Observable (the common case for `http.get`).
   */
  cacheRequestSimple<T>(cacheKey: string, apiCall: Observable<T>): Observable<T> {
    return this.cacheRequest<T>(cacheKey, () => apiCall);
  }

  /** Remove a single entry. */
  remove(cacheKey: string): void {
    this.cacheMap.delete(cacheKey);
  }

  /** Drop every cached entry (call on logout, theme change, etc.). */
  removeAll(): void {
    this.cacheMap.clear();
  }

  /** Check whether a key is cached (handy for placeholder UI). */
  has(cacheKey: string): boolean {
    return this.cacheMap.has(cacheKey);
  }

  /** Read a cached value without triggering a fetch. */
  get<T>(cacheKey: string): T | undefined {
    return this.cacheMap.get(cacheKey) as T | undefined;
  }
}