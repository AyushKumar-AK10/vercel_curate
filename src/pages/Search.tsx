import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import { Button } from '@/components/ui/button';
import { 
  movieApi, 
  Movie, 
  SimilarMovie, 
  handleApiError 
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { username } = useUser();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // ✅ Fixed: Use SimilarMovie type instead of Movie
  const [similarMovies, setSimilarMovies] = useState<SimilarMovie[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);

  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (query) {
      searchMovie();
    }
  }, [query]);

  const searchMovie = async () => {
    if (!query) return;

    setIsLoading(true);
    setNotFound(false);
    setSimilarMovies([]); // Reset similar movies

    try {
      const response = await movieApi.search(query);

      if (response.data.error || !response.data.movies?.length) {
        setNotFound(true);
        setMovies([]);
        setSimilarMovies([]);
      } else {
        const foundMovies: Movie[] = response.data.movies.slice(0, 5);
        setMovies(foundMovies);

        // ✅ Fetch similar movies for the first matched movie
        if (foundMovies.length > 0) {
          await fetchSimilarMovies(foundMovies[0].ID);
        }
      }
    } catch (error) {
      setNotFound(true);
      setMovies([]);
      setSimilarMovies([]);
      toast({
        title: 'Search Error',
        description: handleApiError(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Fixed: Use correct API method and response structure
  const fetchSimilarMovies = async (movieId: number) => {
    setSimilarLoading(true);
    try {
      const response = await movieApi.getSimilarMovies(movieId, 8); // Get 8 similar movies
      
      // ✅ Access the correct response structure: similar_movies array
      if (response.data.similar_movies && response.data.similar_movies.length > 0) {
        setSimilarMovies(response.data.similar_movies);
      } else {
        setSimilarMovies([]);
      }
    } catch (error) {
      console.warn('Failed to fetch similar movies:', handleApiError(error));
      setSimilarMovies([]);
    } finally {
      setSimilarLoading(false);
    }
  };

  // ✅ Handle liking movies
  const handleLike = async (movieId: number) => {
    if (!username) {
      toast({
        title: 'Login Required',
        description: 'Please login to like movies',
        variant: 'destructive',
      });
      return;
    }

    try {
      await movieApi.likeMovie(username, movieId);
      toast({
        title: 'Success',
        description: 'Movie added to your favourites!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: handleApiError(error),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="hidden sm:flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center justify-center sm:justify-start space-x-3">
            <SearchIcon className="w-6 h-6 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold text-foreground text-center sm:text-left">
              Search Results for "{query}"
            </h1>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] w-full bg-secondary/50 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : notFound ? (
          <div className="text-center py-16 space-y-4">
            <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto" />
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">
              No Results Found
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              We couldn&apos;t find any movies matching &quot;{query}&quot;. Try
              searching for a different title.
            </p>
            <Button
              onClick={() => navigate('/')}
              className="bg-gradient-primary hover:opacity-90"
            >
              Back to Home
            </Button>
          </div>
        ) : movies.length > 0 ? (
          <div className="space-y-12">
            {/* Found Movies */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
                Matching Movies ({movies.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {movies.map((movie) => (
                  <MovieCard
                    key={movie.ID}
                    id={movie.ID}
                    poster={movie.Poster}
                    title={movie.Title}
                    showLikeButton={true}
                    onLike={() => handleLike(movie.ID)}
                  />
                ))}
              </div>
            </div>

            {/* Similar Movies */}
            {similarLoading ? (
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
                  Similar Movies
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[2/3] w-full bg-secondary/50 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ) : similarMovies.length > 0 ? (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                    Similar Movies
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    ({similarMovies.length} recommendations)
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                  {similarMovies.map((movie) => (
                    <div key={movie.ID} className="relative">
                      <MovieCard
                        id={movie.ID}
                        poster={movie.Poster}
                        title={movie.Title}
                        showLikeButton={true}
                        onLike={() => handleLike(movie.ID)}
                      />
                      {/* ✅ Show similarity score */}
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {(movie.similarity * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Search;
