import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Globe, Heart, Play, ExternalLink } from 'lucide-react';
import YouTube from 'react-youtube';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  movieApi, 
  Movie, 
  WatchProvidersData,
  handleApiError 
} from '@/lib/api';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Provider links mapping
const providerLinksByName: Record<string, string> = {
  "Amazon Prime Video": "https://www.primevideo.com",
  "Amazon Prime Video with Ads": "https://www.primevideo.com",
  "JioHotstar": "https://www.hotstar.com/in",
  "Disney Plus Hotstar": "https://www.hotstar.com/in",
  "Apple TV": "https://tv.apple.com",
  "Google Play Movies": "https://play.google.com/store/movies",
  "YouTube": "https://www.youtube.com/movies",
  "Amazon Video": "https://www.primevideo.com",
  "Netflix": "https://www.netflix.com",
  "ZEE5": "https://www.zee5.com",
  "JioCinema": "https://www.jiocinema.com",
  "Sony Liv": "https://www.sonyliv.com",
  "Voot": "https://www.voot.com",
  "SonyLIV": "https://www.sonyliv.com",
  "Eros Now": "https://erosnow.com",
  "Alt Balaji": "https://www.altbalaji.com",
  "MX Player": "https://www.mxplayer.in",
};

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { username } = useUser();
  const { toast } = useToast();
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [watchProviders, setWatchProviders] = useState<WatchProvidersData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMovieDetails(id);
      fetchWatchProviders(id);
    }
  }, [id]);

  const fetchMovieDetails = async (movieId: string) => {
    try {
      const response = await movieApi.getMovieById(movieId);
      if (response.data && response.data.movie) {
        setMovie(response.data.movie);
      } else {
        throw new Error('Movie not found');
      }
    } catch (error) {
      console.error('Failed to fetch movie details:', error);
      toast({
        title: "Error",
        description: handleApiError(error),
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWatchProviders = async (movieId: string) => {
    setIsLoadingProviders(true);
    try {
      const response = await movieApi.getWatchProviders(parseInt(movieId), 'IN');
      if (response.data && response.data.providers) {
        setWatchProviders(response.data.providers);
      }
    } catch (error) {
      console.warn('Failed to fetch watch providers:', handleApiError(error));
      setWatchProviders(null);
    } finally {
      setIsLoadingProviders(false);
    }
  };

  const handleLike = async () => {
    if (!username || !movie || isLiking) return;
    
    setIsLiking(true);
    try {
      await movieApi.likeMovie(username, movie.ID);
      toast({
        title: "Movie liked!",
        description: "Added to your preferences",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: handleApiError(error),
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  };

  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const renderStreamingOptions = () => {
    if (isLoadingProviders) {
      return (
        <div className="text-center py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-secondary/50 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-secondary/50 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="text-muted-foreground mt-4">Loading streaming options...</p>
        </div>
      );
    }

    if (!watchProviders) {
      return (
        <div className="text-center py-8 space-y-4">
          <p className="text-muted-foreground">
            No streaming options available for your region (India).
          </p>
          {movie?.Homepage && (
            <div className="pt-4 border-t">
              <a 
                href={movie.Homepage} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Visit movie homepage
              </a>
            </div>
          )}
        </div>
      );
    }

    const { flatrate = [], rent = [], buy = [], link } = watchProviders;

    const renderSection = (label: string, list: any[]) => {
      if (!list.length) return null;
      
      return (
        <div className="mb-6">
          <h4 className="font-semibold mb-3 text-foreground flex items-center gap-2">
            {label}
            <span className="text-sm text-muted-foreground font-normal">
              ({list.length} option{list.length > 1 ? 's' : ''})
            </span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {list.map((provider, idx) => {
              const providerUrl = providerLinksByName[provider.provider_name] || 
                                 link || 
                                 movie?.Homepage || 
                                 "#";

              return (
                <a
                  key={idx}
                  href={providerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <img 
                    src={`https://image.tmdb.org/t/p/original${provider.logo_path}`} 
                    alt={provider.provider_name} 
                    className="w-12 h-12 rounded-lg object-cover shadow-sm" 
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-provider.png';
                    }}
                  />
                  <span className="text-sm text-center font-medium max-w-[100px] leading-tight">
                    {provider.provider_name}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      );
    };

    const hasAnyProviders = flatrate.length > 0 || rent.length > 0 || buy.length > 0;

    if (!hasAnyProviders) {
      return (
        <div className="text-center py-8 space-y-4">
          <p className="text-muted-foreground">
            No streaming options available for your region.
          </p>
          {link && (
            <div className="pt-4 border-t">
              <a 
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View on JustWatch
              </a>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {renderSection("Stream", flatrate)}
        {renderSection("Rent", rent)}
        {renderSection("Buy", buy)}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-secondary/50 rounded w-32" />
            <div className="aspect-video bg-secondary/50 rounded-lg" />
            <div className="space-y-4">
              <div className="h-10 bg-secondary/50 rounded w-3/4" />
              <div className="h-6 bg-secondary/50 rounded w-1/2" />
              <div className="h-20 bg-secondary/50 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Movie not found</h1>
          <Button onClick={() => navigate('/')} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const videoId = movie.Trailer ? getYouTubeVideoId(movie.Trailer) : null;
  const genres = movie.Genres.split(', ').filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="hidden sm:flex text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Top section: Trailer + Actions (side by side on laptop) */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Trailer section - reduced size */}
          <div className="lg:col-span-2">
            {videoId && showTrailer ? (
              <div className="aspect-video rounded-lg overflow-hidden shadow-intense">
                <YouTube
                  videoId={videoId}
                  opts={{
                    width: '100%',
                    height: '100%',
                    playerVars: {
                      autoplay: 1,
                      controls: 1,
                      rel: 0,
                    },
                  }}
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div className="aspect-video relative rounded-lg overflow-hidden shadow-intense">
                <img
                  src={movie.Poster}
                  alt={movie.Title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-darker-surface/50 flex items-center justify-center">
                  {videoId && (
                    <Button
                      onClick={() => setShowTrailer(true)}
                      className="bg-glass hover:bg-primary/80 border border-white/20 backdrop-blur-md text-white w-11/12 sm:w-auto"
                      size="lg"
                    >
                      <Play className="w-6 h-6 mr-2" />
                      Watch Trailer
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions sidebar - positioned beside trailer */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-card/50 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Actions</h3>
              
              {username ? (
                <Button
                  onClick={handleLike}
                  disabled={isLiking}
                  className="w-full bg-gradient-primary hover:opacity-90 text-white"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {isLiking ? 'Adding...' : 'Add to Favorites'}
                </Button>
              ) : (
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full bg-gradient-primary hover:opacity-90 text-white"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Login to Like
                </Button>
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                    Watch Now
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Where to Watch "{movie.Title}"</DialogTitle>
                  </DialogHeader>
                  {renderStreamingOptions()}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Movie details section */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left side: Movie info, overview, cast */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground text-center sm:text-left">
                {movie.Title}
              </h1>
              
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-muted-foreground text-sm sm:text-base">
                {movie.Runtime && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{movie.Runtime} min</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>{movie.Language.toUpperCase()}</span>
                </div>
                {movie['Vote Average'] && (
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-500">★</span>
                    <span>{movie['Vote Average'].toFixed(1)}/10</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                {genres.map((genre) => (
                  <Badge key={genre} variant="secondary" className="bg-secondary/80 text-sm">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">Overview</h2>
              <p className="text-muted-foreground leading-relaxed text-base sm:text-lg text-center sm:text-left">
                {movie.Overview || "No overview available for this movie."}
              </p>
            </div>

            {/* Cast section */}
            {movie.Cast && movie.Cast.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">Cast</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {movie.Cast.slice(0, 10).map((actor, index) => (
                    <div key={index} className="text-center space-y-2">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full overflow-hidden bg-secondary/50">
                        {actor.photo ? (
                          <img
                            src={actor.photo}
                            alt={actor.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling!.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="w-full h-full flex items-center justify-center"
                          style={{ display: actor.photo ? 'none' : 'flex' }}
                        >
                          <span className="text-xl sm:text-2xl text-muted-foreground">
                            {actor.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-foreground font-medium leading-tight">
                        {actor.name}
                      </p>
                      {actor.character && (
                        <p className="text-xs text-muted-foreground leading-tight">
                          {actor.character}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right side: Movie poster (positioned beside cast) */}
          <div className="lg:col-span-1">
            <div className="bg-card/50 rounded-lg p-6">
              <img
                src={movie.Poster}
                alt={movie.Title}
                className="w-full rounded-lg shadow-movie-card"
              />
            </div>
          </div>
        </div>

        {/* Mobile actions - only shown on mobile */}
        <div className="lg:hidden space-y-4">
          {username ? (
            <Button
              onClick={handleLike}
              disabled={isLiking}
              className="w-full bg-gradient-primary hover:opacity-90 text-white"
            >
              <Heart className="w-4 h-4 mr-2" />
              {isLiking ? 'Adding...' : 'Add to Favorites'}
            </Button>
          ) : (
            <Button
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-primary hover:opacity-90 text-white"
            >
              <Heart className="w-4 h-4 mr-2" />
              Login to Like
            </Button>
          )}

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                Watch Now
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Where to Watch "{movie.Title}"</DialogTitle>
              </DialogHeader>
              {renderStreamingOptions()}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
