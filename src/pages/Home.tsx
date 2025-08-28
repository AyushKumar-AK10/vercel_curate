import React, { useEffect, useState, useRef } from 'react';
import {
  TrendingUp,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Film,
  Sword,
  Laugh,
  Heart,
  Gavel,
  Skull,
  Search,
  Compass
} from 'lucide-react';

import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import { movieApi, TrendingMovie, Suggestion } from '@/lib/api';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

/* ─────────────────── constants ─────────────────── */
const GENRES = [
  'Action', 'Comedy', 'Romance', 'Crime',
  'Horror', 'Mystery', 'Adventure'
];

// Genre → Icon mapping
const GENRE_ICONS: Record<string, React.ReactNode> = {
  Action: <Sword />,
  Comedy: <Laugh />,
  Romance: <Heart />,
  Crime: <Gavel />,
  Horror: <Skull />,
  Mystery: <Search />,
  Adventure: <Compass />,
  Default: <Film />
};

const SUGGESTION_BATCH = 18;

/* ─────────────────── reusable sub-components ─────────────────── */

interface MovieCarouselProps {
  movies: TrendingMovie[];
  favourites: number[];
  onLike: (id: number, event?: React.MouseEvent) => void;
}

const MovieCarousel: React.FC<MovieCarouselProps> = ({
  movies,
  favourites,
  onLike
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return;
    const { scrollLeft, clientWidth } = ref.current;
    ref.current.scrollTo({
      left:
        dir === 'left'
          ? scrollLeft - clientWidth * 0.8
          : scrollLeft + clientWidth * 0.8,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {/* desktop */}
      <div className="relative w-full hidden lg:block">
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-background/70 rounded-full shadow hover:bg-background"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-background/70 rounded-full shadow hover:bg-background"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div ref={ref} className="flex space-x-6 overflow-hidden py-4 px-10">
          {movies.map(m => (
            <div
              key={m.ID}
              className="flex-shrink-0 w-56 lg:w-64 aspect-[2/3]"
            >
              <MovieCard
                id={m.ID}
                poster={m.Poster}
                showLikeButton
                isLiked={favourites.includes(m.ID)}
                onLike={() => onLike(m.ID)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* mobile */}
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide py-4 px-2 lg:hidden">
        {movies.map(m => (
          <div
            key={m.ID}
            className="flex-shrink-0 w-40 sm:w-48 md:w-56 aspect-[2/3]"
          >
            <MovieCard
              id={m.ID}
              poster={m.Poster}
              showLikeButton
              isLiked={favourites.includes(m.ID)}
              onLike={() => onLike(m.ID)}
            />
          </div>
        ))}
      </div>
    </>
  );
};

const Header: React.FC<{
  icon: React.ReactNode;
  title: string;
  extra?: string;
}> = ({ icon, title, extra }) => (
  <div className="flex items-center space-x-3">
    {icon}
    <h2 className="text-2xl font-bold text-foreground">{title}</h2>
    {extra && <span className="text-sm text-muted-foreground">{extra}</span>}
  </div>
);

const Placeholder: React.FC<{ text: string }> = ({ text }) => (
  <div className="text-center py-12 text-muted-foreground">
    <p className="text-lg">{text}</p>
  </div>
);

const SectionSkeleton: React.FC<{ heading: string; message?: string }> = ({
  heading,
  message = 'Loading personalized recommendations...'
}) => (
  <section className="space-y-6">
    <Header icon={<Sparkles />} title={heading} />
    <Placeholder text={message} />
  </section>
);

interface MovieSectionProps {
  icon: React.ReactNode;
  title: string;
  movies: TrendingMovie[];
  favourites: number[];
  onLike: (id: number, event?: React.MouseEvent) => void;
}

const MovieSection: React.FC<MovieSectionProps> = ({
  icon,
  title,
  movies,
  favourites,
  onLike
}) => (
  <section className="space-y-6">
    <Header icon={icon} title={title} />
    <MovieCarousel movies={movies} favourites={favourites} onLike={onLike} />
  </section>
);

/* ─────────────────── main component ─────────────────── */

const Home: React.FC = () => {
  const { username } = useUser();
  const { toast } = useToast();

  const [englishMovies, setEnglishMovies] = useState<TrendingMovie[]>([]);
  const [hindiMovies, setHindiMovies] = useState<TrendingMovie[]>([]);
  const [genreMovies, setGenreMovies] = useState<Record<string, TrendingMovie[]>>({});
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [favourites, setFavourites] = useState<number[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [favouritesLoaded, setFavouritesLoaded] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  /* ───────── load data ───────── */
  useEffect(() => {
    fetchTrendingMovies();
    fetchGenreMovies();

    if (username) {
      fetchFavourites();
      fetchSuggestions();
    } else {
      setSuggestionsLoading(false);
      setFavouritesLoaded(true);
    }
  }, [username]);

  // Debug logging
  useEffect(() => {
    console.log('Component state:', {
      isLoading,
      favouritesLoaded,
      suggestionsLoading,
      isLiking,
      favourites: favourites.length,
      suggestions: suggestions.length,
      englishMovies: englishMovies.length,
      hindiMovies: hindiMovies.length
    });
  }, [isLoading, favouritesLoaded, suggestionsLoading, isLiking, favourites, suggestions, englishMovies, hindiMovies]);

  /* ───────── fetchers ───────── */
  const fetchTrendingMovies = async () => {
    try {
      const [enRes, hiRes] = await Promise.all([
        movieApi.getTrending('en'),
        movieApi.getTrending('hi')
      ]);
      setEnglishMovies(enRes.data.movies || []);
      setHindiMovies(hiRes.data.movies || []);
    } catch (error) {
      console.error('Failed to load trending movies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load trending movies',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGenreMovies = async () => {
    const results: Record<string, TrendingMovie[]> = {};
    await Promise.all(
      GENRES.map(async genre => {
        try {
          const res = await movieApi.getTrendingByGenre(genre, 'en');
          results[genre] = res.data.movies || [];
        } catch (error) {
          console.warn(`Failed to load ${genre} movies:`, error);
        }
      })
    );
    setGenreMovies(results);
  };

  const fetchSuggestions = async () => {
    if (!username) {
      setSuggestionsLoading(false);
      return;
    }
    
    try {
      console.log('Fetching suggestions for user:', username);
      const res = await movieApi.getSuggestions(username, { 
        top_n: SUGGESTION_BATCH 
      });
      console.log('Suggestions response:', res.data);
      setSuggestions(res.data?.suggestions ?? res.data ?? []);
    } catch (error) {
      console.error('Suggestions fetch error:', error);
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const fetchFavourites = async () => {
    if (!username) return;
    
    try {
      const res = await movieApi.getFavourites(username);
      const ids = res.data.favourites?.map((f: any) => f.ID) || [];
      setFavourites(ids);
    } catch (error) {
      console.error('Failed to load favourites:', error);
      toast({
        title: 'Error',
        description: 'Failed to load favourites.',
        variant: 'destructive'
      });
    } finally {
      setFavouritesLoaded(true);
    }
  };

  /* ───────── like handler ───────── */
  const handleMovieUpdate = async (movieId: number) => {
    console.log('Movie liked:', movieId);
    
    // Just update favourites optimistically - NO API call here
    setFavourites(prev => [...prev, movieId]);
    
    // Refresh suggestions in background
    console.log('Refreshing suggestions...');
    setSuggestionsLoading(true);
    await fetchSuggestions();
  };

  const isDataLoaded = !isLoading && favouritesLoaded;

  /* ───────── suggestions grid ───────── */
  const SuggestionsCarousel: React.FC<{ suggestions: Suggestion[] }> = ({
    suggestions
  }) => (
    <>
      {/* desktop */}
      <div className="hidden lg:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {suggestions.map(s => (
          <div key={s.ID} className="relative aspect-[2/3]">
            <MovieCard
              id={s.ID}
              poster={s.Poster}
              title={s.Title}
              showLikeButton
              isLiked={favourites.includes(s.ID)}
              onLike={() => handleMovieUpdate(s.ID)} // 🔥 Use new function
            />
          </div>
        ))}
      </div>

      {/* mobile */}
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide py-4 px-2 lg:hidden">
        {suggestions.map(s => (
          <div key={s.ID} className="flex-shrink-0 w-40 sm:w-48 md:w-56 aspect-[2/3]">
            <MovieCard
              id={s.ID}
              poster={s.Poster}
              title={s.Title}
              showLikeButton
              isLiked={favourites.includes(s.ID)}
              onLike={() => handleMovieUpdate(s.ID)} // 🔥 Use new function
            />
          </div>
        ))}
      </div>
    </>
  );



  /* ───────── loading placeholder ───────── */
  if (!isDataLoaded) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] w-40 sm:w-48 md:w-56 lg:w-64 bg-secondary/50 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ───────── main render ───────── */
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* greeting */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold">
            Welcome back,&nbsp;
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              {username || 'Movie Lover'}
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Handpicked recommendations on Curate
          </p>
        </div>

        {/* suggestions */}
        {suggestionsLoading ? (
          <SectionSkeleton heading="Just For You" />
        ) : suggestions.length === 0 && favourites.length === 0 ? (
          <SectionSkeleton
            heading="Just For You"
            message="Like some movies below to get personalized recommendations!"
          />
        ) : suggestions.length > 0 ? (
          <section className="space-y-6">
            <Header
              icon={<Sparkles />}
              title="Just For You"
            />
            <SuggestionsCarousel suggestions={suggestions} />
          </section>
        ) : null}

        {/* trending lists */}
        {englishMovies.length > 0 && (
          <MovieSection
            icon={<TrendingUp />}
            title="Trending in English"
            movies={englishMovies}
            favourites={favourites}
            onLike={(movieId) => handleMovieUpdate(movieId)}
          />
        )}

        {hindiMovies.length > 0 && (
          <MovieSection
            icon={<TrendingUp />}
            title="Trending in Hindi"
            movies={hindiMovies}
            favourites={favourites}
            onLike={(movieId) => handleMovieUpdate(movieId)}
          />
        )}

        {GENRES.map(
          g =>
            genreMovies[g]?.length > 0 && (
              <MovieSection
                key={g}
                icon={GENRE_ICONS[g] || GENRE_ICONS.Default}
                title={`Trending in ${g}`}
                movies={genreMovies[g]}
                favourites={favourites}
                onLike={(movieId) => handleMovieUpdate(movieId)}
              />
            )
        )}

      </main>
    </div>
  );
};

export default Home;
