import type { Node, Edge } from 'reactflow';

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
  type: 'Movie' | 'TV Show' | 'Anime' | 'K-Drama' | 'Animation';
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
  sortOrder?: number;
  dominantColor?: string;
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

export type Feedback = {
  id: string;
  feedbackType: string;
  message: string;
  submittedAt: string; // ISO string
};

export type CanvasBoard = {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  lastModified: string;
};

export type Soundtrack = {
  id?: number;
  movieId: string;
  composer: string;
  albumTitle: string;
  tracks: {
    title: string;
    duration: string;
    trackNumber: number;
    previewUrl?: string;
  }[];
  previewBlobs?: { [trackId: string]: Blob };
  addedAt: Date;
};

export type Poster = {
  id?: number;
  movieId: string;
  imageBlob: Blob;
  url: string;
  cachedAt: Date;
};

export type Setting = {
  key: string;
  value: any;
};

export interface WrappedSlide {
  id: string;
  title: string;
  subtitle: string;
  stats: string;
  visualTheme: 'sci-fi' | 'horror' | 'romance' | 'action' | 'drama' | 'mystery' | 'nostalgic' | 'epic' | 'default';
  soundscape?: string;
  musicSuggestion?: {
    title: string;
    artist: string;
    searchQuery: string;
  };
  component?: 'decadeChart' | 'topActorsList' | 'colorPalette';
  componentData?: any;
}
