
import type { Movie, Season } from './types';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

export const getPosterUrl = (path: string | null, size: 'w500' | 'original' = 'w500') => {
    return path ? `${IMAGE_BASE_URL}${size}${path}` : 'https://placehold.co/500x750.png';
};

export const searchMulti = async (query: string) => {
    if (!query) return [];

    let year: string | null = null;
    let searchQuery = query;

    const yearMatch = query.match(/\s+y:(\d{4})$/);
    if (yearMatch) {
        year = yearMatch[1];
        searchQuery = query.replace(/\s+y:\d{4}$/, '').trim();
    }
    
    if (!searchQuery) return [];

    try {
        if (year) {
            const moviePromise = fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}&primary_release_year=${year}&include_adult=false&language=en-US&page=1`).then(res => res.json());
            const tvPromise = fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}&first_air_date_year=${year}&include_adult=false&language=en-US&page=1`).then(res => res.json());
            
            const [movieResults, tvResults] = await Promise.all([moviePromise, tvPromise]);

            const movies = (movieResults.results || []).map((r: any) => ({ ...r, media_type: 'movie' }));
            const tvs = (tvResults.results || []).map((r: any) => ({ ...r, media_type: 'tv' }));
            
            const combinedResults = [...movies, ...tvs].sort((a, b) => b.popularity - a.popularity);

            return combinedResults.filter((r: any) => r.poster_path);

        } else {
            const response = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}&include_adult=false&language=en-US&page=1`);
            if (!response.ok) throw new Error('Failed to fetch search results');
            const data = await response.json();
            return data.results.filter((r: any) => (r.media_type === 'movie' || r.media_type === 'tv') && r.poster_path);
        }
    } catch (error) {
        console.error("TMDB search error:", error);
        return [];
    }
};

const fetchDetails = async (id: number, type: 'movie' | 'tv') => {
    try {
        const response = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=en-US&append_to_response=credits,images,videos`);
        if (!response.ok) throw new Error(`Failed to fetch ${type} details`);
        return await response.json();
    } catch (error) {
        console.error(`TMDB fetch ${type} details error:`, error);
        return null;
    }
}

export const getMovieDetails = (id: number) => fetchDetails(id, 'movie');
export const getTvDetails = (id: number) => fetchDetails(id, 'tv');

export const mapTmdbResultToMovie = async (tmdbResult: any): Promise<Omit<Movie, 'id'>> => {
    const isMovie = tmdbResult.media_type === 'movie' || !('name' in tmdbResult);
    const isAnime = tmdbResult.genres?.some((g: any) => g.id === 16) || tmdbResult.origin_country?.includes('JP');
    const officialTrailer = tmdbResult.videos?.results?.find(
        (vid: any) => vid.site === 'YouTube' && vid.type === 'Trailer'
    );

    let seasons: Season[] = [];
    let totalEpisodes = isMovie ? 1 : (tmdbResult.number_of_episodes || 0);

    if (!isMovie) {
        const seasonsData = tmdbResult.seasons || [];
        const seasonPromises = seasonsData
            .filter((s: any) => s.season_number > 0) // Exclude "Specials" season (season_number 0)
            .map((season: any) => 
                fetch(`${BASE_URL}/tv/${tmdbResult.id}/season/${season.season_number}?api_key=${API_KEY}&language=en-US`)
                .then(res => {
                    if (!res.ok) throw new Error(`Failed to fetch season ${season.season_number}`);
                    return res.json();
                })
                .catch(err => {
                    console.error(err);
                    return null;
                })
            );
        
        const detailedSeasonsResults = await Promise.all(seasonPromises);
        const detailedSeasons = detailedSeasonsResults.filter(s => s !== null && s.episodes);

        seasons = detailedSeasons.map((seasonDetail: any): Season => ({
            seasonNumber: seasonDetail.season_number,
            name: seasonDetail.name,
            overview: seasonDetail.overview,
            posterPath: getPosterUrl(seasonDetail.poster_path),
            episodeCount: (seasonDetail.episodes || []).length,
            episodes: (seasonDetail.episodes || []).map((ep: any) => ({
                episodeNumber: ep.episode_number,
                name: ep.name,
                overview: ep.overview,
                stillPath: getPosterUrl(ep.still_path, 'w500'),
                watched: false
            }))
        }));

        totalEpisodes = seasons.reduce((acc, s) => acc + s.episodeCount, 0);
    }

    return {
        tmdbId: tmdbResult.id,
        title: tmdbResult.title || tmdbResult.name,
        description: tmdbResult.overview,
        posterUrl: getPosterUrl(tmdbResult.poster_path),
        backdropUrl: getPosterUrl(tmdbResult.backdrop_path, 'original'),
        type: isMovie ? 'Movie' : (isAnime ? 'Anime' : 'TV Show'),
        status: 'Plan to Watch',
        watchedEpisodes: 0,
        totalEpisodes: totalEpisodes,
        rating: Math.round(tmdbResult.vote_average * 10),
        tags: tmdbResult.genres?.map((g: any) => g.name) || [],
        releaseDate: tmdbResult.release_date || tmdbResult.first_air_date,
        seasons: seasons,
        director: isMovie 
            ? tmdbResult.credits?.crew.find((c: any) => c.job === 'Director')?.name 
            : tmdbResult.created_by?.[0]?.name,
        cast: tmdbResult.credits?.cast.slice(0, 10).map((c: any) => ({
            name: c.name,
            character: c.character,
            avatarUrl: getPosterUrl(c.profile_path)
        })) || [],
        alternatePosters: tmdbResult.images?.posters.slice(1, 6).map((p: any) => getPosterUrl(p.file_path, 'w500')) || [],
        collection: tmdbResult.belongs_to_collection?.name,
        budget: tmdbResult.budget,
        revenue: tmdbResult.revenue,
        runtime: isMovie ? tmdbResult.runtime : tmdbResult.episode_run_time?.[0],
        productionCountries: tmdbResult.production_countries?.map((c: any) => c.name).join(', '),
        trailerUrl: officialTrailer?.key,
    };
};
