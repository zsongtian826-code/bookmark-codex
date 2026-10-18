export type Bookmark = { id: string; title: string; url: string; description: string; folder: string | null; tags: string[]; favorite: boolean; createdAt: string; updatedAt: string };
export type Store = { schemaVersion: 1; folders: string[]; bookmarks: Bookmark[] };
export type Sort = 'newest' | 'oldest' | 'title';
export type Draft = Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>;
