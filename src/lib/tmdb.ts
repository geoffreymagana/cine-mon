import type { Movie } from './types';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

export const getPosterUrl = (path: string | null, size: 'w500' | 'original' = 'w500') => {
    return path ? `${IMAGE_BASE_URL}${size}${path}` : 'https://placehold.co/500x750.png';
};

export const searchMulti = async (query: string) => {
    if (!query) return [];
    try {
        const response = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`);
        if (!response.ok) throw new Error('Failed to fetch search results');
        const data = await response.json();
        return data.results.filter((r: any) => (r.media_type === 'movie' || r.media_type === 'tv') && r.poster_path);
    } catch (error) {
        console.error("TMDB search error:", error);
        return [];
    }
};

const fetchDetails = async (id: number, type: 'movie' | 'tv') => {
    try {
        const response = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=en-US&append_to_response=credits`);
        if (!response.ok) throw new Error(`Failed to fetch ${type} details`);
        return await response.json();
    } catch (error) {
        console.error(`TMDB fetch ${type} details error:`, error);
        return null;
    }
}

export const getMovieDetails = (id: number) => fetchDetails(id, 'movie');
export const getTvDetails = (id: number) => fetchDetails(id, 'tv');

export const mapTmdbResultToMovie = (tmdbResult: any): Omit<Movie, 'id'> => {
    const isMovie = tmdbResult.media_type === 'movie' || tmdbResult.title;
    const isAnime = tmdbResult.genres?.some((g: any) => g.id === 16) || tmdbResult.origin_country?.includes('JP');

    return {
        tmdbId: tmdbResult.id,
        title: tmdbResult.title || tmdbResult.name,
        description: tmdbResult.overview,
        posterUrl: getPosterUrl(tmdbResult.poster_path),
        backdropUrl: getPosterUrl(tmdbResult.backdrop_path, 'original'),
        type: isMovie ? 'Movie' : (isAnime ? 'Anime' : 'TV Show'),
        status: 'Plan to Watch',
        watchedEpisodes: 0,
        totalEpisodes: isMovie ? 1 : (tmdbResult.number_of_episodes || 1),
        rating: Math.round(tmdbResult.vote_average * 10),
        tags: tmdbResult.genres?.map((g: any) => g.name) || [],
        releaseDate: tmdbResult.release_date || tmdbResult.first_air_date,
        director: isMovie ? tmdbResult.credits?.crew.find((c: any) => c.job === 'Director')?.name : tmdbResult.created_by?.[0]?.name,
        cast: tmdbResult.credits?.cast.slice(0, 10).map((c: any) => ({
            name: c.name,
            character: c.character,
            avatarUrl: getPosterUrl(c.profile_path)
        })) || [],
    };
};
