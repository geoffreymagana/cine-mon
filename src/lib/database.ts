import Dexie, { type Table } from 'dexie';
import type { Movie, UserCollection, Soundtrack, Poster, Setting } from './types';

export class MovieDatabase extends Dexie {
  movies!: Table<Movie, string>;
  collections!: Table<UserCollection, string>;
  soundtracks!: Table<Soundtrack, number>;
  posters!: Table<Poster, number>;
  settings!: Table<Setting, string>;

  constructor() {
    super('MovieCollectionDB');
    this.version(1).stores({
      movies: 'id, tmdbId, title, *tags, type, status, collection',
      collections: 'id, name, type',
      soundtracks: '++id, movieId',
      posters: '++id, movieId',
      settings: 'key'
    });
  }
}

export const db = new MovieDatabase();
