import axios from 'axios';

// Updated to point to your HF Space
const API_BASE_URL = 'https://tyson1106-movie-recommender.hf.space';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Movie {
  ID: number;
  Title: string;
  Genres: string | string[];
  Language: string;
  Overview: string;
  Runtime: number;
  'Vote Average': number;
  'Release Date'?: string;
  Poster: string;
  Backdrop?: string;
  Cast?: Array<{
    name: string;
    character?: string;
    photo: string | null;
  }>;
  Trailer?: string;
  Homepage?: string;
  'Similar Movies'?: Array<{
    ID: number;
    Title: string;
    Poster: string;
    'Vote Average': number;
  }>;
  'Production Companies'?: string[];
}

export interface TrendingMovie {
  ID: number;
  Title: string;
  'Vote Average': number;
  Poster: string;
  Overview: string;
  'Release Date'?: string;
}

export interface Suggestion {
  ID: number;
  Title: string;
  'Vote Average': number;
  similarity?: number;
  Poster?: string;
  Overview?: string;
  'Suggested Because'?: string;
}

export interface FavoriteMovie {
  ID: number;
  Title: string;
  Poster: string;
  'Vote Average': number;
  'Release Date'?: string;
}

// Similar Movie interface
export interface SimilarMovie {
  ID: number;
  Title: string;
  'Vote Average': number;
  similarity: number;
  Poster?: string;
}

// Watch Providers interfaces
export interface WatchProvider {
  display_priority: number;
  logo_path: string;
  provider_id: number;
  provider_name: string;
}

export interface WatchProvidersData {
  link?: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

export interface WatchProvidersResponse {
  region: string;
  providers: WatchProvidersData;
}

export const movieApi = {
  // Authentication endpoints
  signup: (username: string, password: string) =>
    api.post('/signup', { user: username, password }),

  login: (username: string, password: string) =>
    api.post('/login', { user: username, password }),

  // Movie search endpoint
  search: (query: string) =>
    api.post('/search', { movie: query }),

  // Trending movies endpoints
  getTrending: (language: string = 'en') =>
    api.get('/trending', { params: { language } }),

  getTrendingByGenre: (genre: string, language: string = 'en') =>
    api.get(`/trending/${genre}`, { params: { language } }),

  // User-specific endpoints
  getSuggestions: (username: string, params: { top_n: number }) =>
    api.get(`/suggestions/${username}`, { params }),

  likeMovie: (username: string, movieId: number) =>
    api.post(`/like/${username}`, { tmdb_id: movieId }),

  dislikeMovie: (username: string, movieId: number) =>
    api.post(`/dislike/${username}`, { tmdb_id: movieId }),

  getFavourites: (username: string) =>
    api.get(`/favourites/${username}`),

  // Movie details endpoint
  getMovieById: (id: string | number) =>
    api.get(`/movie/${id}`),

  // Similar movies endpoint
  getSimilarMovies: (movieId: number, topN: number = 5) =>
    api.get(`/similar/${movieId}`, { params: { top_n: topN } }),

  // Watch providers endpoint
  getWatchProviders: (movieId: number, region: string = 'IN') =>
    api.get(`/movie/${movieId}/watch-providers`, { params: { region } }),

  // Utility endpoint for health check
  healthCheck: () =>
    api.get('/health'),

  // Get API status
  getStatus: () =>
    api.get('/'),
};

// Response type definitions for better TypeScript support
export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

export interface SearchResponse {
  movies: Movie[];
}

export interface TrendingResponse {
  movies: TrendingMovie[];
}

export interface TrendingByGenreResponse {
  genre: string;
  movies: TrendingMovie[];
}

export interface SuggestionsResponse {
  suggestions: Suggestion[];
}

export interface FavouritesResponse {
  favourites: FavoriteMovie[];
  total: number;
}

export interface MovieDetailsResponse {
  movie: Movie;
}

// Similar movies response interface
export interface SimilarMoviesResponse {
  similar_movies: SimilarMovie[];
}

export interface AuthResponse {
  message: string;
  user?: string;
}

export interface ErrorResponse {
  error: string;
}

// Helper function to handle API errors
export const handleApiError = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.status === 404) {
    return 'Resource not found';
  }
  if (error.response?.status === 500) {
    return 'Server error - please try again later';
  }
  if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
    return 'Network error - please check your connection';
  }
  return error.message || 'An unexpected error occurred';
};

// Helper function to check if response contains error
export const hasError = (response: any): boolean => {
  return response.data && 'error' in response.data;
};

// Helper function to extract data from response
export const extractData = <T>(response: ApiResponse<T>): T => {
  return response.data;
};

// Additional utility functions for common operations
export const movieUtils = {
  // Format runtime from minutes to hours and minutes
  formatRuntime: (runtime: number): string => {
    if (!runtime) return 'Unknown';
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  },

  // Format vote average to 1 decimal place
  formatRating: (rating: number): string => {
    return rating ? rating.toFixed(1) : 'N/A';
  },

  // Format release date
  formatReleaseDate: (dateString: string): string => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Get year from release date
  getYear: (dateString: string): string => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).getFullYear().toString();
  },

  // Format genres array or string
  formatGenres: (genres: string | string[]): string => {
    if (Array.isArray(genres)) {
      return genres.join(', ');
    }
    return genres || 'Unknown';
  },

  // Format similarity score as percentage
  formatSimilarity: (similarity: number): string => {
    return `${(similarity * 100).toFixed(1)}% match`;
  }
};

export default movieApi;
