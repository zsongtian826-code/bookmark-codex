import type { Bookmark, Store } from './types';

export const EMPTY_STORE: Store = { schemaVersion: 1, folders: [], bookmarks: [] };
export const STORAGE_KEY = 'folio-bookmarks-v1';
export function normalizeUrl(input: string): string | null {
  const raw = input.trim(); if (!raw) return null;
  const candidate = /^[a-z][a-z\d+.-]*:/i.test(raw) ? raw : `https://${raw}`;
  try { const parsed = new URL(candidate); return ['http:', 'https:'].includes(parsed.protocol) && parsed.hostname ? parsed.toString() : null; } catch { return null; }
}
export function titleFromUrl(url: string): string { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; } }
export function uniqueTags(tags: string[]): string[] { return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))]; }
export function makeId(): string { return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `bm-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
function string(value: unknown, fallback = ''): string { return typeof value === 'string' ? value : fallback; }
export function validateBookmark(value: unknown): Bookmark | null {
  if (!value || typeof value !== 'object') return null; const item = value as Record<string, unknown>; const url = normalizeUrl(string(item.url)); if (!url) return null;
  const now = new Date().toISOString();
  return { id: string(item.id, makeId()), title: string(item.title).trim() || titleFromUrl(url), url, description: string(item.description).trim(), folder: typeof item.folder === 'string' && item.folder.trim() ? item.folder.trim() : null, tags: Array.isArray(item.tags) ? uniqueTags(item.tags.filter((tag): tag is string => typeof tag === 'string')) : [], favorite: item.favorite === true, createdAt: !Number.isNaN(Date.parse(string(item.createdAt))) ? string(item.createdAt) : now, updatedAt: !Number.isNaN(Date.parse(string(item.updatedAt))) ? string(item.updatedAt) : now };
}
export function validateStore(value: unknown): Store | null {
  if (!value || typeof value !== 'object') return null; const input = value as Record<string, unknown>;
  if (input.schemaVersion !== 1 || !Array.isArray(input.folders) || !Array.isArray(input.bookmarks)) return null;
  const folders = [...new Set(input.folders.filter((folder): folder is string => typeof folder === 'string').map((folder) => folder.trim()).filter(Boolean))]; const seen = new Set<string>();
  const bookmarks = input.bookmarks.map(validateBookmark).filter((bookmark): bookmark is Bookmark => !!bookmark).map((bookmark) => { const id = seen.has(bookmark.id) ? makeId() : bookmark.id; seen.add(id); return { ...bookmark, id, folder: bookmark.folder && folders.includes(bookmark.folder) ? bookmark.folder : null }; });
  return { schemaVersion: 1, folders, bookmarks };
}
export function readStore(): Store { try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? validateStore(JSON.parse(raw)) ?? EMPTY_STORE : EMPTY_STORE; } catch { return EMPTY_STORE; } }
export function writeStore(store: Store): boolean { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); return true; } catch { return false; } }
export function importStore(current: Store, incoming: unknown) {
  const valid = validateStore(incoming); if (!valid) return { error: 'ファイル形式が正しくないか、対応していないバージョンです。' };
  const folders = [...new Set([...current.folders, ...valid.folders])]; const urls = new Set(current.bookmarks.map((bookmark) => bookmark.url)); const ids = new Set(current.bookmarks.map((bookmark) => bookmark.id)); let added = 0; let skipped = 0; const bookmarks = [...current.bookmarks];
  valid.bookmarks.forEach((bookmark) => { if (urls.has(bookmark.url)) { skipped++; return; } let id = bookmark.id; while (ids.has(id)) id = makeId(); ids.add(id); urls.add(bookmark.url); bookmarks.push({ ...bookmark, id, folder: bookmark.folder && folders.includes(bookmark.folder) ? bookmark.folder : null }); added++; });
  return { store: { schemaVersion: 1 as const, folders, bookmarks }, added, skipped };
}
