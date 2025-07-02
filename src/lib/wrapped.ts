
'use client';

import type { Movie, WrappedSlide } from './types';

const genreThemeMap: Record<string, WrappedSlide['visualTheme']> = {
    'Science Fiction': 'sci-fi',
    'Sci-Fi': 'sci-fi',
    'Horror': 'horror',
    'Thriller': 'horror',
    'Romance': 'romance',
    'Action': 'action',
    'Adventure': 'action',
    'War': 'action',
    'Drama': 'drama',
    'Crime': 'drama',
    'History': 'drama',
    'Comedy': 'romance', // Re-using for a lighter feel
    'Animation': 'default',
    'Family': 'default',
    'Fantasy': 'sci-fi',
};

export const generateMusicLinks = (query: string) => ({
  spotify: `https://open.spotify.com/search/${encodeURIComponent(query)}`,
  youtube: `https://music.youtube.com/search?q=${encodeURIComponent(query)}`,
  apple: `https://music.apple.com/search?term=${encodeURIComponent(query)}`
});


export function generateWrappedSlides(movies: Movie[]): WrappedSlide[] {
  if (movies.length === 0) {
    return [{
      id: 'no-data',
      title: "It's been a quiet year...",
      subtitle: "You have no movies in your collection for 2025.",
      stats: "Add some movies to see your Wrapped!",
      visualTheme: 'default',
    }];
  }

  const slides: WrappedSlide[] = [];
  const currentYear = new Date().getFullYear();
  const yearMovies = movies.filter(m => m.releaseDate && new Date(m.releaseDate).getFullYear() === currentYear);

  // Slide 1: Year Overview
  slides.push({
    id: 'overview',
    title: `Your ${currentYear} in Review`,
    subtitle: "You've journeyed through",
    stats: `${movies.length} stories`,
    visualTheme: 'default',
  });

  // Slide 2: Top Genre
  const allTags = movies.flatMap(m => m.tags);
  const genreCounts = allTags.reduce((acc, genre) => {
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0];
  if (topGenre) {
    const topGenreName = topGenre[0];
    const theme = genreThemeMap[topGenreName] || 'default';
    slides.push({
      id: 'top-genre',
      title: 'Your Comfort Zone',
      subtitle: `Your top genre was`,
      stats: `${topGenreName}`,
      visualTheme: theme,
      musicSuggestion: {
        title: 'Sounds of ' + topGenreName,
        artist: 'Various Artists',
        searchQuery: `Music for ${topGenreName} movies`
      }
    });
  }
  
  // Slide 3: Most Watched Director
  const directorCounts = movies
    .filter(m => m.director)
    .reduce((acc, m) => {
      acc[m.director!] = (acc[m.director!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  const topDirector = Object.entries(directorCounts).sort((a, b) => b[1] - a[1])[0];
  if(topDirector) {
     slides.push({
      id: 'top-director',
      title: 'Behind the Camera',
      subtitle: "You trusted one director's vision more than any other.",
      stats: topDirector[0],
      visualTheme: 'drama',
    });
  }

  // Slide 4: Longest Movie
  const longestMovie = [...movies].sort((a,b) => (b.runtime || 0) - (a.runtime || 0))[0];
  if (longestMovie && longestMovie.runtime) {
    slides.push({
      id: 'longest-movie',
      title: 'The Marathon',
      subtitle: 'The longest journey you took was',
      stats: `${longestMovie.title} (${longestMovie.runtime} min)`,
      visualTheme: 'action',
    });
  }

  // Slide 5: Most Rewatched
  const mostRewatched = [...movies].sort((a,b) => (b.rewatchCount || 0) - (a.rewatchCount || 0))[0];
  if (mostRewatched && (mostRewatched.rewatchCount || 0) > 0) {
    slides.push({
      id: 'most-rewatched',
      title: 'An Old Favorite',
      subtitle: 'You revisited this story the most',
      stats: `${mostRewatched.title}`,
      visualTheme: 'romance',
    });
  }

  // Slide 6: Total Watch Time
  const totalMinutes = movies.reduce((acc, movie) => {
    const isMovie = movie.type === 'Movie';
    const duration = isMovie ? (movie.runtime || 90) : (movie.watchedEpisodes * (movie.runtime || 24));
    return acc + (duration * (1 + (movie.rewatchCount || 0)));
  }, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  slides.push({
    id: 'total-time',
    title: 'Time Well Spent',
    subtitle: 'You dedicated',
    stats: `${totalHours.toLocaleString()} hours`,
    visualTheme: 'sci-fi',
  });
  
  // Slide 7: Decade Distribution
  const decadeCounts: Record<string, number> = {};
  movies.forEach(m => {
    const year = m.releaseDate ? new Date(m.releaseDate).getFullYear() : 0;
    if (year) {
      const decade = `${Math.floor(year / 10) * 10}s`;
      decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
    }
  });
  const decadeData = Object.entries(decadeCounts).map(([name, value]) => ({ name, value })).sort((a,b) => a.name.localeCompare(b.name));
  
  if (decadeData.length > 0) {
    slides.push({
      id: 'decades',
      title: 'A Walk Through Time',
      subtitle: "Here's when your favorite stories were made.",
      stats: '',
      visualTheme: 'default',
      component: 'decadeChart',
      componentData: decadeData,
    });
  }

  // Final Slide
  slides.push({
    id: 'final',
    title: `That's a Wrap on ${currentYear}!`,
    subtitle: "Here's to another year of unforgettable stories.",
    stats: "Cine-Mon",
    visualTheme: 'default',
  });

  return slides;
}
