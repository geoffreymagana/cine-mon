
import type { Movie, Season } from './types';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

export const getPosterUrl = (path: string | null, size: 'w500' | 'original' = 'w500') => {
    return path ? `${IMAGE_BASE_URL}${size}${path}` : 'https://placehold.co/500x750.png';
};

class PosterColorSampler {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
    this.canvas.style.display = 'none';
    if (typeof document !== 'undefined') {
        document.body.appendChild(this.canvas);
    }
  }

  async extractDominantColor(posterUrl: string): Promise<{ hex: string; rgb: { r: number; g: number; b: number }; colorName: string; confidence: number; timestamp: number }> {
    try {
      const imageData = await this.loadAndSampleImage(posterUrl);
      const dominantColor = this.findDominantColor(imageData);
      return {
        hex: dominantColor.hex,
        rgb: dominantColor.rgb,
        colorName: this.getColorName(dominantColor.rgb),
        confidence: dominantColor.confidence,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Color extraction failed:', error);
      return this.getDefaultColor();
    }
  }

  private loadAndSampleImage(posterUrl: string): Promise<{ r: number; g: number; b: number }[]> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      img.onload = () => {
        const sampleWidth = 32;
        const sampleHeight = 48;
        
        this.canvas.width = sampleWidth;
        this.canvas.height = sampleHeight;
        
        this.ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
        
        const samples = this.getStrategicSamples(sampleWidth, sampleHeight);
        resolve(samples);
      };
      
      img.onerror = (err) => reject(new Error(`Failed to load poster: ${err}`));
      img.src = posterUrl;
    });
  }

  private getStrategicSamples(width: number, height: number): { r: number; g: number; b: number }[] {
    const samples: { r: number; g: number; b: number }[] = [];
    const imageData = this.ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    
    const marginX = Math.floor(width * 0.15);
    const marginY = Math.floor(height * 0.1);
    
    for (let y = marginY; y < height - marginY; y += 2) {
      for (let x = marginX; x < width - marginX; x += 2) {
        const index = (y * width + x) * 4;
        const r = pixels[index];
        const g = pixels[index + 1];
        const b = pixels[index + 2];
        const a = pixels[index + 3];
        
        if (a > 128 && (r + g + b) > 30) {
          samples.push({ r, g, b });
        }
      }
    }
    
    return samples;
  }

  private findDominantColor(samples: { r: number; g: number; b: number }[]): { rgb: { r: number; g: number; b: number }; hex: string; confidence: number } {
    if (samples.length === 0) {
        const defaultColor = this.getDefaultColor();
        return { rgb: defaultColor.rgb, hex: defaultColor.hex, confidence: 0};
    }
    
    const k = Math.min(5, samples.length);
    let centroids = this.initializeCentroids(samples, k);
    
    for (let iter = 0; iter < 3; iter++) {
      const clusters = this.assignToClusters(samples, centroids);
      centroids = this.updateCentroids(clusters);
    }
    
    const clusters = this.assignToClusters(samples, centroids);
    const dominantCluster = clusters.reduce((max, cluster) => 
      cluster.length > max.length ? cluster : max, [] as {r:number, g:number, b:number}[]
    );
    
    const avgColor = this.averageColor(dominantCluster.length > 0 ? dominantCluster : samples);
    return {
      rgb: avgColor,
      hex: this.rgbToHex(avgColor),
      confidence: dominantCluster.length / samples.length
    };
  }

  private initializeCentroids(samples: { r: number; g: number; b: number }[], k: number): { r: number; g: number; b: number }[] {
    const centroids: { r: number; g: number; b: number }[] = [];
    const step = Math.floor(samples.length / k);
    
    for (let i = 0; i < k; i++) {
      const index = Math.min(i * step, samples.length - 1);
      centroids.push({ ...samples[index] });
    }
    
    return centroids;
  }

  private assignToClusters(samples: { r: number; g: number; b: number }[], centroids: { r: number; g: number; b: number }[]): { r: number; g: number; b: number }[][] {
    const clusters = centroids.map(() => [] as { r: number; g: number; b: number }[]);
    
    samples.forEach(sample => {
      let minDistance = Infinity;
      let closestCentroid = 0;
      
      centroids.forEach((centroid, index) => {
        const distance = this.colorDistance(sample, centroid);
        if (distance < minDistance) {
          minDistance = distance;
          closestCentroid = index;
        }
      });
      
      clusters[closestCentroid].push(sample);
    });
    
    return clusters;
  }

  private updateCentroids(clusters: { r: number; g: number; b: number }[][]): { r: number; g: number; b: number }[] {
    return clusters.map(cluster => 
      cluster.length > 0 ? this.averageColor(cluster) : { r: 0, g: 0, b: 0 }
    );
  }

  private colorDistance(color1: { r: number; g: number; b: number }, color2: { r: number; g: number; b: number }): number {
    const rMean = (color1.r + color2.r) / 2;
    const deltaR = color1.r - color2.r;
    const deltaG = color1.g - color2.g;
    const deltaB = color1.b - color2.b;
    
    const weightR = 2 + rMean / 256;
    const weightG = 4;
    const weightB = 2 + (255 - rMean) / 256;
    
    return Math.sqrt(
      weightR * deltaR * deltaR +
      weightG * deltaG * deltaG +
      weightB * deltaB * deltaB
    );
  }

  private averageColor(colors: { r: number; g: number; b: number }[]): { r: number; g: number; b: number } {
    if (colors.length === 0) return { r: 74, g: 85, b: 104 };
    const sum = colors.reduce(
      (acc, color) => ({
        r: acc.r + color.r,
        g: acc.g + color.g,
        b: acc.b + color.b
      }),
      { r: 0, g: 0, b: 0 }
    );
    
    return {
      r: Math.round(sum.r / colors.length),
      g: Math.round(sum.g / colors.length),
      b: Math.round(sum.b / colors.length)
    };
  }

  private rgbToHex({ r, g, b }: { r: number; g: number; b: number }): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).padStart(6, '0')}`;
  }

  private getColorName({ r, g, b }: { r: number; g: number; b: number }): string {
    const { h, s, l } = this.rgbToHsl(r, g, b);
    
    if (s < 0.1) {
      if (l < 0.2) return 'Black';
      if (l < 0.4) return 'Dark Gray';
      if (l < 0.6) return 'Gray';
      if (l < 0.8) return 'Light Gray';
      return 'White';
    }
    
    if (h < 15 || h >= 345) return 'Red';
    if (h < 45) return 'Orange';
    if (h < 75) return 'Yellow';
    if (h < 165) return 'Green';
    if (h < 195) return 'Cyan';
    if (h < 255) return 'Blue';
    if (h < 285) return 'Purple';
    if (h < 315) return 'Magenta';
    return 'Pink';
  }

  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s: number, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: break;
      }
      h /= 6;
    }

    return { h: h * 360, s, l };
  }

  private getDefaultColor() {
    return {
      hex: '#4A5568',
      rgb: { r: 74, g: 85, b: 104 },
      colorName: 'Gray',
      confidence: 0,
      timestamp: Date.now()
    };
  }

  destroy() {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

let colorSamplerInstance: PosterColorSampler | null = null;
const getColorSampler = () => {
    if (typeof window === 'undefined') {
        return null;
    }
    if (!colorSamplerInstance) {
        colorSamplerInstance = new PosterColorSampler();
    }
    return colorSamplerInstance;
}

export const getDominantColor = async (imageUrl: string): Promise<string> => {
    try {
        const sampler = getColorSampler();
        if (!sampler) return 'Gray';
        
        const result = await sampler.extractDominantColor(imageUrl);
        return result.colorName;
    } catch (error) {
        console.error("Dominant color calculation failed:", error);
        return 'Gray';
    }
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

    let seasons: Season[] = [];
    let totalEpisodes = isMovie ? 1 : (tmdbResult.number_of_episodes || 0);

    if (!isMovie) {
        const seasonsData = tmdbResult.seasons || [];
        const seasonPromises = seasonsData
            .filter((s: any) => s.season_number > 0)
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
    };
};
