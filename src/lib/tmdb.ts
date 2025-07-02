import type { Movie, Season } from './types';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

export const getPosterUrl = (path: string | null, size: 'w500' | 'original' = 'w500') => {
    return path ? `${IMAGE_BASE_URL}${size}${path}` : 'https://placehold.co/500x750.png';
};

const colorBuckets = {
    Red: [22, -22], Orange: [23, 45], Yellow: [46, 65],
    Green: [66, 160], Blue: [161, 260], Purple: [261, 320],
};

const getDominantColorName = (r: number, g: number, b: number): string => {
    if (r > 200 && g > 200 && b > 200) return 'White';
    if (r < 50 && g < 50 && b < 50) return 'Black';
    if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20) return 'Gray';

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0;
    if (max !== min) {
        const d = max - min;
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    const hue = h * 360;

    for (const [name, [start, end]] of Object.entries(colorBuckets)) {
        if (end < start) { // Handles Red's wraparound case
            if (hue >= start || hue <= end) return name;
        } else {
            if (hue >= start && hue <= end) return name;
        }
    }
    return 'Gray';
};

export const getDominantColor = (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imageUrl;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }
            canvas.width = 10;
            canvas.height = 10;
            ctx.drawImage(img, 0, 0, 10, 10);
            
            const imageData = ctx.getImageData(0, 0, 10, 10).data;
            const colorCounts: Record<string, number> = {};
            
            for (let i = 0; i < imageData.length; i += 4) {
                const colorName = getDominantColorName(imageData[i], imageData[i+1], imageData[i+2]);
                colorCounts[colorName] = (colorCounts[colorName] || 0) + 1;
            }

            const dominantColor = Object.keys(colorCounts).reduce((a, b) => colorCounts[a] > colorCounts[b] ? a : b, 'Gray');
            resolve(dominantColor);
        };
        img.onerror = (err) => {
            console.error("Image load error for color sampling:", err);
            resolve('Gray'); // Fallback color
        };
    });
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
    const posterUrl = getPosterUrl(tmdbResult.poster_path);
    const dominantColor = await getDominantColor(posterUrl);

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
        posterUrl: posterUrl,
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
        sortOrder: Date.now(),
        dominantColor: dominantColor
    };
};
