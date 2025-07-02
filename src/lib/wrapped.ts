
'use client';

import type { Movie, WrappedSlide } from './types';

const genreThemeMap: Record<string, WrappedSlide['visualTheme']> = {
    'Science Fiction': 'sci-fi',
    'Sci-Fi': 'sci-fi',
    'Horror': 'horror',
    'Thriller': 'horror',
    'Mystery': 'mystery',
    'Romance': 'romance',
    'Action': 'action',
    'Adventure': 'action',
    'War': 'action',
    'Drama': 'drama',
    'Crime': 'drama',
    'History': 'nostalgic',
    'Comedy': 'romance', // Re-using for a lighter feel
    'Animation': 'default',
    'Family': 'default',
    'Fantasy': 'sci-fi',
};

const soundscapes: Record<WrappedSlide['visualTheme'], string> = {
  'sci-fi': '/sounds/ambient-space.mp3',
  'horror': '/sounds/dark-ambience.mp3', 
  'romance': '/sounds/gentle-piano.mp3',
  'action': '/sounds/cinematic-stomp.wav',
  'drama': '/sounds/cinematic-strings-and-piano.mp3',
  'mystery': '/sounds/myst-dark-drone-synth-female-vocal-choir-atmo-ambience-cinematic.wav',
  'nostalgic': '/sounds/nostalgic-piano-loop.wav',
  'epic': '/sounds/epic-movie-ending.wav',
  'default': '/sounds/gentle-piano.mp3', // fallback
};

export const generateMusicLinks = (query: string) => ({
  spotify: `https://open.spotify.com/search/${encodeURIComponent(query)}`,
  youtube: `https://music.youtube.com/search?q=${encodeURIComponent(query)}`,
  apple: `https://music.apple.com/search?term=${encodeURIComponent(query)}`
});

const PALETTE_COLORS: Record<string, string> = {
    'Red': '#ef4444',
    'Orange': '#f97316',
    'Yellow': '#facc15',
    'Green': '#22c55e',
    'Cyan': '#06b6d4',
    'Blue': '#3b82f6',
    'Purple': '#8b5cf6',
    'Magenta': '#d946ef',
    'Pink': '#ec4899',
    'Black': '#1f2937',
    'White': '#f8fafc',
    'Gray': '#6b7280',
    'Dark Gray': '#4b5563',
    'Light Gray': '#d1d5db',
};


export function generateWrappedSlides(movies: Movie[], watchGoal: number = 200): WrappedSlide[] {
  if (movies.length === 0) {
    return [{
      id: 'no-data',
      title: "It's been a quiet year...",
      subtitle: "You have no movies in your collection for 2025.",
      stats: "Add some movies to see your Wrapped!",
      visualTheme: 'default',
      soundscape: soundscapes.default
    }];
  }

  const slides: WrappedSlide[] = [];
  const currentYear = new Date().getFullYear();
  
  // Slide 1: Year Overview
  let overviewSubtitle = "You journeyed through";
  if (movies.length < 10) {
      overviewSubtitle = "A curated year. You explored";
  } else if (movies.length > 200) {
      overviewSubtitle = "The cinema is your second home. You conquered";
  } else if (movies.length > 100) {
      overviewSubtitle = "A true cinephile. You devoured";
  }
  slides.push({
    id: 'overview',
    title: `Your ${currentYear} in Review`,
    subtitle: overviewSubtitle,
    stats: `${movies.length} stories`,
    visualTheme: 'epic',
    soundscape: soundscapes.epic,
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
    let genreSubtitle = `Your top genre was`;
    if (topGenreName === 'Horror') {
        genreSubtitle = 'You faced your fears. Your top genre was';
    } else if (topGenreName === 'Comedy') {
        genreSubtitle = 'You kept things light. Your top genre was'
    } else if (topGenreName === 'Action') {
        genreSubtitle = 'You lived for the thrill. Your top genre was';
    }
    slides.push({
      id: 'top-genre',
      title: 'Your Comfort Zone',
      subtitle: genreSubtitle,
      stats: `${topGenreName}`,
      visualTheme: theme,
      soundscape: soundscapes[theme],
      musicSuggestion: {
        title: `Sounds of ${topGenreName}`,
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
  if(topDirector && topDirector[1] > 1) {
     slides.push({
      id: 'top-director',
      title: 'Behind the Camera',
      subtitle: "You put your full trust in one director's vision.",
      stats: topDirector[0],
      visualTheme: 'drama',
      soundscape: soundscapes.drama,
      musicSuggestion: {
        title: `The Films of ${topDirector[0]}`,
        artist: 'Soundtrack',
        searchQuery: `${topDirector[0]} film score`
      }
    });
  }

  // Slide 4: Most Watched Actors
  const topActors = movies.flatMap(m => m.cast?.map(c => c.name) || [])
    .reduce((acc, name) => {
        acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
  const sortedTopActors = Object.entries(topActors).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name]) => name);

  if (sortedTopActors.length > 0) {
    slides.push({
        id: 'top-actors',
        title: 'Your Leading Stars',
        subtitle: 'These faces graced your screen the most.',
        stats: '',
        visualTheme: 'default',
        soundscape: soundscapes.default,
        component: 'topActorsList',
        componentData: sortedTopActors
    })
  }

  // Slide 5: Longest Movie
  const longestMovie = [...movies].filter(m => m.runtime && m.type === 'Movie').sort((a,b) => (b.runtime || 0) - (a.runtime || 0))[0];
  if (longestMovie && longestMovie.runtime) {
    slides.push({
      id: 'longest-movie',
      title: `${longestMovie.title}`,
      subtitle: 'Your longest marathon viewing was',
      stats: `${longestMovie.runtime} minutes`,
      visualTheme: 'action',
      soundscape: soundscapes.action,
      musicSuggestion: {
        title: longestMovie.title,
        artist: 'Original Soundtrack',
        searchQuery: `${longestMovie.title} official soundtrack`,
      }
    });
  }

  // Slide 6: Rewatches
  const totalRewatches = movies.reduce((acc, m) => acc + (m.rewatchCount || 0), 0);
  const mostRewatched = [...movies].sort((a,b) => (b.rewatchCount || 0) - (a.rewatchCount || 0))[0];

  if (totalRewatches > 0) {
    let rewatchSubtitle = `You hit rewind on ${totalRewatches} stories.`;
    if (totalRewatches > 20) {
        rewatchSubtitle = `Familiar faces are the best. You rewatched ${totalRewatches} titles.`
    }
    slides.push({
        id: 'total-rewatches',
        title: 'Round Two (and Three, and Four...)',
        subtitle: rewatchSubtitle,
        stats: `${mostRewatched.title}`,
        visualTheme: 'romance',
        soundscape: soundscapes.romance,
        musicSuggestion: {
            title: `Theme from ${mostRewatched.title}`,
            artist: 'Various Artists',
            searchQuery: `${mostRewatched.title} theme song`
        }
    })
  }

  // Slide 7: Series Completion
  const completedSeries = movies.filter(m => (m.type === 'TV Show' || m.type === 'Anime') && m.totalEpisodes > 0 && m.watchedEpisodes === m.totalEpisodes);
  if (completedSeries.length > 0) {
    let seriesSubtitle = "A job well done. You completed";
    if (completedSeries.length > 10) {
        seriesSubtitle = "A true completionist. You finished every episode of";
    }
    slides.push({
        id: 'series-completion',
        title: 'Series Slayer',
        subtitle: seriesSubtitle,
        stats: `${completedSeries.length} series`,
        visualTheme: 'nostalgic',
        soundscape: soundscapes.nostalgic
    });
  }
  
  // Slide 8: Total Watch Time
  const totalMinutes = movies.reduce((acc, movie) => {
    const isMovie = movie.type === 'Movie';
    const duration = isMovie ? (movie.runtime || 90) : (movie.watchedEpisodes * (movie.runtime || 24));
    return acc + (duration * (1 + (movie.rewatchCount || 0)));
  }, 0);
  const totalHours = Math.floor(totalMinutes / 60);

  let timeSubtitle = "You dedicated";
  if (totalHours > 1000) {
      timeSubtitle = "That's a lot of popcorn. You dedicated";
  } else if (totalHours < 50) {
      timeSubtitle = "A respectable start. You dedicated";
  }

  slides.push({
    id: 'total-time',
    title: 'Time Well Spent',
    subtitle: timeSubtitle,
    stats: `${totalHours.toLocaleString()} hours`,
    visualTheme: 'sci-fi',
    soundscape: soundscapes['sci-fi'],
  });
  
  // Slide 9: Decade Distribution
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
    const topDecade = [...decadeData].sort((a, b) => b.value - a.value)[0];
    slides.push({
      id: 'decades',
      title: 'A Walk Through Time',
      subtitle: `Your favorite stories were mostly from the`,
      stats: topDecade.name,
      visualTheme: 'nostalgic',
      soundscape: soundscapes.nostalgic,
      component: 'decadeChart',
      componentData: decadeData,
      musicSuggestion: {
          title: `Best of the ${topDecade.name}`,
          artist: 'Various Artists',
          searchQuery: `Best movie soundtracks of the ${topDecade.name}`
      }
    });
  }

  // Slide 10: Watch Goal
  const goalProgress = watchGoal > 0 ? Math.round((movies.length / watchGoal) * 100) : 0;
  if (goalProgress >= 100) {
    slides.push({
        id: 'goal-reached',
        title: 'Goal Smashed!',
        subtitle: `You aimed for ${watchGoal} titles and hit`,
        stats: `${movies.length}!`,
        visualTheme: 'epic',
        soundscape: soundscapes.epic
    });
  }

  // Slide 11: Color Palette
  const posterPalette = movies
    .map(m => m.dominantColor)
    .filter((c): c is string => !!c && c !== 'Gray' && c !== 'Light Gray')
    .reduce((acc, color) => {
        acc[color] = (acc[color] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
  const topColor = Object.entries(posterPalette).sort((a,b) => b[1] - a[1])[0];

  if (topColor) {
    slides.push({
        id: 'color-palette',
        title: 'Your Visual Vibe',
        subtitle: "The dominant color in your movie posters was",
        stats: '',
        visualTheme: 'default',
        soundscape: soundscapes.default,
        component: 'colorPalette',
        componentData: {
            name: topColor[0],
            color: PALETTE_COLORS[topColor[0]] || '#6b7280'
        }
    });
  }

  // Final Slide
  slides.push({
    id: 'final',
    title: `That's a Wrap on ${currentYear}!`,
    subtitle: "Here's to another year of unforgettable stories.",
    stats: "Cine-Mon",
    visualTheme: 'epic',
    soundscape: soundscapes.epic,
  });

  return slides;
}
