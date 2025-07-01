import { db } from './database';

export async function migrateFromLocalStorage() {
  try {
    const migrated = await db.settings.get('migrated_from_localstorage');
    if (migrated) return;

    console.log('Starting migration from localStorage to IndexedDB...');

    const movies = JSON.parse(localStorage.getItem('movies') || '[]');
    const collections = JSON.parse(localStorage.getItem('collections') || '[]');
    
    if (movies.length > 0) {
      await db.movies.bulkAdd(movies);
      console.log(`Migrated ${movies.length} movies.`);
    }
    
    if (collections.length > 0) {
      await db.collections.bulkAdd(collections);
      console.log(`Migrated ${collections.length} collections.`);
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
      await db.settings.bulkPut(profileSettings);
      console.log(`Migrated ${profileSettings.length} profile settings.`);
    }
    
    await db.settings.put({ key: 'migrated_from_localstorage', value: true });
    
    localStorage.removeItem('movies');
    localStorage.removeItem('collections');
    profileSettings.forEach(setting => localStorage.removeItem(setting.key));

    console.log('Migration completed successfully. LocalStorage has been cleared.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}
