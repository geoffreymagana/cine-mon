
'use client';

import type { Movie, WrappedSlide } from './types';

const genreThemeMap: Record<string, WrappedSlide['visualTheme']> = {
    'Science Fiction': 'sci-fi',
    'Sci-Fi': 'sci-fi',
    'Horror': 'horror',
    'Thriller': 'mystery',
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
    'Fantasy': 'epic',
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
  'default': '/sounds/gentle-piano.mp3',
};

const timeWatchedCommentary = {
  low: [
    "A film a month. We love a casual commitment.",
    "You blinked and missed it. Literally.",
    "Your watch history is basically a trailer.",
    "Minimalist? Or just distracted?",
  ],
  moderate: [
    "One foot in the cinema, one foot in real life.",
    "Respectable. Balanced. Still enough time to touch grass.",
    "Not a binge, more of a polite nibble.",
    "The algorithm nods in quiet approval.",
  ],
  heavy: [
    "Okay binge mode, we see you.",
    "You've seen more screen time than some actors this year.",
    "You *could* have learned French… but this was probably more fun.",
    "The popcorn didn’t stand a chance.",
  ],
  extreme: [
    "Call Hollywood. You basically live there now.",
    "This wasn’t watching. This was *training*.",
    "Impressive. Concerning. Iconic.",
    "Hope your couch has a loyalty program.",
  ],
  offTheCharts: [
    "Cine-Mon says go outside. Please.",
    "That’s not a watchlist, that’s a full-time job.",
    "You could’ve walked to Uganda and back.",
    "At this point, you *are* the main character.",
  ],
};

const decadeCommentary = {
    '1940s': "Serving black & white realness with a side of jazz hands.",
    '1950s': "Your taste has vintage filter energy — *no app required*.",
    '1960s': "You vibe with movies where people wore hats to dinner.",
    '1970s': "You like your movies gritty, grainy, and groovy.",
    '1980s': "Your movies come with a synth soundtrack and a training montage.",
    '1990s': "You probably still rewind things for fun.",
    '2000s': "Everything you watched has a Linkin Park remix.",
    '2010s': "You’re the algorithm’s favorite child.",
    '2020s': "You're living in real time. No spoilers please.",
    'default': "You're not bound by time. Just taste."
};

const goalCommentary = {
    noGoal: "No goals, just vibes.",
    hitExactly: "Precision? We love an intentional viewer.",
    overshot: "You said ‘one more’ and meant it... weekly.",
    smashed: "Goal? Smashed. Standards? High.",
    under: "Life got in the way. Or maybe just sleep."
};

const getRandomComment = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

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
  
  // --- CALCULATIONS ---
  const totalMinutes = movies.reduce((acc, movie) => {
    const isMovie = movie.type === 'Movie';
    const duration = isMovie ? (movie.runtime || 90) : (movie.watchedEpisodes * (movie.runtime || 24));
    return acc + (duration * (1 + (movie.rewatchCount || 0)));
  }, 0);
  const totalHours = Math.floor(totalMinutes / 60);

  const allTags = movies.flatMap(m => m.tags);
  const genreCounts = allTags.reduce((acc, genre) => {
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0];
  
  const directorCounts = movies
    .filter(m => m.director)
    .reduce((acc, m) => {
      acc[m.director!] = (acc[m.director!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  const topDirector = Object.entries(directorCounts).sort((a, b) => b[1] - a[1])[0];
  
  const allActorsWithAvatars = movies.flatMap(m => m.cast?.map(c => ({ name: c.name, avatarUrl: c.avatarUrl })) || []);
  const actorCounts = allActorsWithAvatars.reduce((acc, actor) => {
      if (!acc[actor.name]) {
          acc[actor.name] = { count: 0, avatarUrl: actor.avatarUrl };
      }
      acc[actor.name].count++;
      return acc;
  }, {} as Record<string, { count: number, avatarUrl: string }>);
  const topActors = Object.entries(actorCounts).sort((a, b) => b[1].count - a[1].count).slice(0, 3).map(([name, data]) => ({ name, avatarUrl: data.avatarUrl, count: data.count }));
  
  const longestMovie = [...movies].filter(m => m.runtime && m.type === 'Movie').sort((a,b) => (b.runtime || 0) - (a.runtime || 0))[0];
  
  const totalRewatches = movies.reduce((acc, m) => acc + (m.rewatchCount || 0), 0);
  const mostRewatched = totalRewatches > 0 ? [...movies].sort((a,b) => (b.rewatchCount || 0) - (a.rewatchCount || 0))[0] : null;

  const completedSeries = movies.filter(m => (m.type === 'TV Show' || m.type === 'Anime') && m.totalEpisodes > 0 && m.watchedEpisodes === m.totalEpisodes);
  
  const decadeCounts: Record<string, number> = {};
  movies.forEach(m => {
    const year = m.releaseDate ? parseInt(m.releaseDate.substring(0, 4), 10) : 0;
    if (year) {
      const decade = `${Math.floor(year / 10) * 10}s`;
      decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
    }
  });
  const decadeData = Object.entries(decadeCounts).map(([name, value]) => ({ name, value })).sort((a,b) => a.name.localeCompare(b.name));
  const topDecade = decadeData.length > 0 ? [...decadeData].sort((a, b) => b.value - a.value)[0] : null;
  
  const posterPalette = movies
    .map(m => m.dominantColor)
    .filter((c): c is string => !!c && c !== 'Gray' && c !== 'Light Gray')
    .reduce((acc, color) => {
        acc[color] = (acc[color] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
  const topColor = Object.entries(posterPalette).sort((a,b) => b[1] - a[1])[0];
  
  // --- SLIDE GENERATION ---
  
  slides.push({
    id: 'overview',
    title: `Your ${currentYear} in Review`,
    subtitle: "A cinematic journey through",
    stats: `${movies.length} stories`,
    visualTheme: 'epic',
    soundscape: soundscapes.epic,
  });

  if (topGenre) {
    const topGenreName = topGenre[0];
    const theme = genreThemeMap[topGenreName] || 'default';
    slides.push({
      id: 'top-genre',
      title: 'Your Comfort Zone',
      subtitle: `Your top genre was`,
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

  let timeComment = getRandomComment(timeWatchedCommentary.moderate);
  if (totalHours < 10) timeComment = getRandomComment(timeWatchedCommentary.low);
  else if (totalHours >= 50 && totalHours < 150) timeComment = getRandomComment(timeWatchedCommentary.heavy);
  else if (totalHours >= 150 && totalHours < 300) timeComment = getRandomComment(timeWatchedCommentary.extreme);
  else if (totalHours >= 300) timeComment = getRandomComment(timeWatchedCommentary.offTheCharts);

  slides.push({
    id: 'total-time',
    title: 'Time Well Spent',
    subtitle: timeComment,
    stats: `${totalHours.toLocaleString()} hours`,
    visualTheme: 'nostalgic',
    soundscape: soundscapes['nostalgic'],
  });

  if (longestMovie && longestMovie.runtime) {
    slides.push({
      id: 'longest-movie',
      title: `Your longest journey was ${longestMovie.runtime} minutes with`,
      subtitle: 'A true test of endurance',
      stats: `${longestMovie.title}`,
      visualTheme: 'action',
      soundscape: soundscapes.action,
      musicSuggestion: {
        title: longestMovie.title,
        artist: 'Original Soundtrack',
        searchQuery: `${longestMovie.title} official soundtrack`,
      }
    });
  }

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
  
  if (topActors.length > 0) {
    slides.push({
        id: 'top-actors',
        title: 'Your Leading Stars',
        subtitle: 'These faces graced your screen the most.',
        stats: '',
        visualTheme: 'default',
        soundscape: soundscapes.default,
        component: 'topActorsList',
        componentData: topActors,
    })
  }

  if (mostRewatched) {
    slides.push({
        id: 'total-rewatches',
        title: 'Round Two (and Three, and Four...)',
        subtitle: `You hit rewind on ${totalRewatches} stories. Your most rewatched was`,
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
  
  if (completedSeries.length > 0) {
    slides.push({
        id: 'series-completion',
        title: 'Series Slayer',
        subtitle: `A true completionist. You finished every episode of`,
        stats: `${completedSeries.length} series`,
        visualTheme: 'nostalgic',
        soundscape: soundscapes.nostalgic
    });
  }
  
  if (topDecade) {
    const decadeKey = topDecade.name.substring(0, 4) as keyof typeof decadeCommentary;
    const decadeSass = decadeCommentary[decadeKey] || decadeCommentary.default;
    slides.push({
      id: 'decades',
      title: 'A Walk Through Time',
      subtitle: decadeSass,
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
