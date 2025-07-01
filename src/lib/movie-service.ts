import { db } from './database';
import type { Movie, UserCollection, Soundtrack, Setting, CanvasBoard } from './types';

export class MovieService {
  // Movie Methods
  static async addMovie(movie: Omit<Movie, 'id'> & { id?: string }): Promise<string> {
    const movieWithId = { ...movie, id: movie.id || crypto.randomUUID() };
    return await db.movies.add(movieWithId);
  }

  static async getMovies(): Promise<Movie[]> {
    return await db.movies.orderBy('sortOrder').reverse().toArray();
  }
  
  static async getMovie(id: string): Promise<Movie | undefined> {
    return await db.movies.get(id);
  }
  
  static async updateMovie(id: string, changes: Partial<Movie>): Promise<number> {
    return await db.movies.update(id, changes);
  }

  static async deleteMovie(id: string): Promise<void> {
    await this.deleteMovies([id]);
  }

  static async deleteMovies(ids: string[]): Promise<void> {
    await db.transaction('rw', db.movies, db.collections, async () => {
        await db.movies.bulkDelete(ids);

        const collectionsToUpdate = await db.collections.where('movieIds').anyOf(...ids).toArray();
        
        const updates = collectionsToUpdate.map(c => {
            const newMoviedIds = c.movieIds.filter(mid => !ids.includes(mid));
            return db.collections.update(c.id, { movieIds: newMoviedIds });
        });

        await Promise.all(updates);
    });
  }

  static async saveAllMovies(movies: Movie[]): Promise<string[]> {
      return await db.movies.bulkPut(movies);
  }

  // Collection Methods
  static async addCollection(collection: UserCollection): Promise<string> {
    return await db.collections.add(collection);
  }
  
  static async getCollections(): Promise<UserCollection[]> {
    return await db.collections.toArray();
  }

  static async getCollection(id: string): Promise<UserCollection | undefined> {
      return await db.collections.get(id);
  }
  
  static async updateCollection(id: string, changes: Partial<UserCollection>): Promise<number> {
    return await db.collections.update(id, changes);
  }
  
  static async deleteCollection(id: string): Promise<void> {
    return await db.collections.delete(id);
  }
  
  // Canvas Methods
  static async getCanvases(): Promise<CanvasBoard[]> {
    return await db.canvases.orderBy('lastModified').reverse().toArray();
  }
  
  static async getCanvas(id: string): Promise<CanvasBoard | undefined> {
    return await db.canvases.get(id);
  }
  
  static async addCanvas(canvas: CanvasBoard): Promise<string> {
    return await db.canvases.add(canvas);
  }
  
  static async updateCanvas(id: string, changes: Partial<CanvasBoard>): Promise<number> {
    return await db.canvases.update(id, changes);
  }
  
  static async deleteCanvas(id: string): Promise<void> {
    return await db.canvases.delete(id);
  }

  // Soundtrack Methods
  static async addSoundtrack(movieId: string, soundtrackData: Omit<Soundtrack, 'id' | 'movieId' | 'addedAt'>): Promise<number> {
    return await db.soundtracks.add({
      movieId,
      ...soundtrackData,
      addedAt: new Date()
    });
  }

  static async getSoundtrack(movieId: string): Promise<Soundtrack | undefined> {
    return await db.soundtracks.where({ movieId }).first();
  }

  // Poster Caching
  static async cachePoster(movieId: string, imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      await db.posters.put({
        movieId,
        imageBlob: blob,
        url: imageUrl,
        cachedAt: new Date()
      });
      
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Failed to cache poster:', error);
      return imageUrl; // Fallback to original URL
    }
  }

  static async getCachedPosterUrl(movieId: string): Promise<string | null> {
    const cached = await db.posters.where({ movieId }).first();
    return cached ? URL.createObjectURL(cached.imageBlob) : null;
  }
  
  // Settings Methods
  static async getSetting(key: string): Promise<any> {
    const setting = await db.settings.get(key);
    return setting?.value;
  }
  
  static async setSetting(key: string, value: any): Promise<string> {
    return await db.settings.put({ key, value });
  }

  static async getAllSettings(): Promise<Setting[]> {
      return await db.settings.toArray();
  }
}
