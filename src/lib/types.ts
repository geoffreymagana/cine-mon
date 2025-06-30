
export type Episode = {
  episodeNumber: number;
  name: string;
  overview: string;
  stillPath: string | null;
  watched: boolean;
};

export type Season = {
  seasonNumber: number;
  name: string;
  overview: string;
  posterPath: string | null;
  episodeCount: number;
  episodes: Episode[];
};

export type Movie = {
  id: string;
  tmdbId?: number;
  title: string;
  description: string;
  posterUrl: string;
  type: 'Movie' | 'TV Show' | 'Anime';
  status: 'Watching' | 'Completed' | 'On-Hold' | 'Dropped' | 'Plan to Watch';
  watchedEpisodes: number;
  totalEpisodes: number;
  rating: number;
  tags: string[];
  releaseDate: string;
  seasons?: Season[];
  // New fields for details page
  director?: string;
  cast?: { name: string; character: string; avatarUrl: string }[];
  alternatePosters?: string[];
  rewatchCount?: number;
  scriptUrl?: string;
  collection?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  // Fields for more details
  budget?: number;
  revenue?: number;
  runtime?: number;
  productionCountries?: string;
};

export type UserCollection = {
  id: string;
  name: string;
  type: 'Vault' | 'Spotlight';
  description?: string;
  coverImageUrl?: string;
  movieIds: string[];
};

export type ChangeSection = {
  type: 'Features' | 'Fixes' | 'Breaking Changes' | 'Other';
  content: string;
};

export type VersionInfo = {
  version: string;
  date: string;
  sections: ChangeSection[];
};
