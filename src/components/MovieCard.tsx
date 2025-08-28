import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { movieApi } from '@/lib/api';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

interface MovieCardProps {
  id: number;
  poster: string;
  title?: string;
  showLikeButton?: boolean;
  isLiked: boolean; // fully controlled
  onLike: () => void; // callback to update parent
}

const MovieCard: React.FC<MovieCardProps> = ({
  id,
  poster,
  title,
  showLikeButton = true,
  isLiked,
  onLike,
}) => {
  const navigate = useNavigate();
  const { username } = useUser();
  const { toast } = useToast();
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!username || isLiking || isLiked) return;

    setIsLiking(true);
    try {
      await movieApi.likeMovie(username, id);
      onLike(); // update parent favourites
      toast({
        title: 'Movie liked!',
        description: 'Added to your preferences',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to like movie',
        variant: 'destructive',
      });
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div
      className="group relative cursor-pointer transition-all duration-300 hover:scale-105 animate-fade-in w-full h-full"
      onClick={() => navigate(`/movie/${id}`)}
    >
      <div className="relative w-full h-full overflow-hidden rounded-lg shadow-movie-card">
        {/* 🔥 Force image to fill square container */}
        <img
          src={poster}
          alt={title || 'Movie poster'}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-darker-surface/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Like button */}
        {showLikeButton && (
          <button
            onClick={handleLike}
            disabled={isLiking || isLiked}
            className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              isLiked
                ? 'bg-primary/90 text-white shadow-glow'
                : 'bg-glass hover:bg-primary/80 text-white/80 hover:text-white'
            } ${isLiking ? 'animate-pulse' : ''}`}
          >
            <Heart
              className={`w-5 h-5 transition-all duration-300 ${
                isLiked ? 'fill-current animate-heart-beat' : ''
              }`}
            />
          </button>
        )}

        {/* Title (appears on hover) */}
        {title && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-darker-surface to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h3 className="text-white font-semibold text-sm truncate">{title}</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
