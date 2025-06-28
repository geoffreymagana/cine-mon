export type Movie = {
  id: string;
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
};
