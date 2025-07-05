
import { db } from './database';

export async function migrateFromLocalStorage() {
  try {
    const migrated = await db.settings.get('migrated_from_localstorage_v2');
    if (migrated) return;

    console.log('Starting migration from localStorage to IndexedDB...');

    const movies = JSON.parse(localStorage.getItem('movies') || '[]');
    const collections = JSON.parse(localStorage.getItem('collections') || '[]');
    const canvases = JSON.parse(localStorage.getItem('canvases') || '[]');
    
    if (movies.length > 0) {
      await db.movies.bulkPut(movies);
      console.log(`Migrated ${movies.length} movies.`);
    }
    
    if (collections.length > 0) {
      await db.collections.bulkPut(collections);
      console.log(`Migrated ${collections.length} collections.`);
    }

    if (canvases.length > 0) {
        await db.canvases.bulkPut(canvases);
        console.log(`Migrated ${canvases.length} canvases.`);
    }
    
    const profileSettings = [
        { key: 'profileName', value: localStorage.getItem('profileName') },
        { key: 'profileUsername', value: localStorage.getItem('profileUsername') },
        { key: 'profileBio', value: localStorage.getItem('profileBio') },
        { key: 'profileAvatar', value: localStorage.getItem('profileAvatar') },
        { key: 'profileBanner', value: localStorage.getItem('profileBanner') },
        { key: 'cinemon-theme', value: localStorage.getItem('cinemon-theme') },
        { key: 'cinemon-dark-mode', value: localStorage.getItem('cinemon-dark-mode') },
    ].filter(item => item.value !== null);

    if (profileSettings.length > 0) {
      await db.settings.bulkPut(profileSettings as any);
      console.log(`Migrated ${profileSettings.length} profile settings.`);
    }
    
    await db.settings.put({ key: 'migrated_from_localstorage_v2', value: true });
    
    // Clean up old keys
    localStorage.removeItem('movies');
    localStorage.removeItem('collections');
    localStorage.removeItem('canvases');
    profileSettings.forEach(setting => {
        if (setting.key) localStorage.removeItem(setting.key);
    });

    console.log('Migration completed successfully. LocalStorage has been cleared.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}
