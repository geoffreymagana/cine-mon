import Dexie, { type Table } from 'dexie';
import type { Movie, UserCollection, Soundtrack, Poster, Setting, CanvasBoard } from './types';

export class MovieDatabase extends Dexie {
  movies!: Table<Movie, string>;
  collections!: Table<UserCollection, string>;
  soundtracks!: Table<Soundtrack, number>;
  posters!: Table<Poster, number>;
  settings!: Table<Setting, string>;
  canvases!: Table<CanvasBoard, string>;

  constructor() {
    super('MovieCollectionDB');
    this.version(1).stores({
      movies: 'id, tmdbId, title, *tags, type, status, collection',
      collections: 'id, name, type',
      soundtracks: '++id, movieId',
      posters: '++id, movieId',
      settings: 'key'
    });
    
    this.version(2).stores({
        canvases: 'id, name, lastModified'
    }).upgrade(tx => {
        // Migration logic for future versions can go here
    });
  }
}

export const db = new MovieDatabase();
