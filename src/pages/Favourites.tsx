import { movieApi } from "@/lib/api";
import React, { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Favourites: React.FC = () => {
  const { username } = useUser();
  const [favs, setFavs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!username) {
      setLoading(false);
      toast({
        title: "Error",
        description: "Please log in to view favourites.",
        variant: "destructive",
      });
      return;
    }
    movieApi
      .getFavourites(username)
      .then((res) => {
        setFavs(res.data.favourites || []);
      })
      .catch((err) => {
        console.error("Error fetching favourites:", err);
        toast({
          title: "Error",
          description: "Failed to load favourites. Please try again.",
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }, [username, toast]);

  const handleDislike = (movieId: number) => {
    if (!username) return;
    movieApi
      .dislikeMovie(username, movieId)
      .then(() => {
        setFavs((prev) => prev.filter((m) => m.ID !== movieId));
        toast({
          title: "Success",
          description: "Movie removed from favourites.",
        });
      })
      .catch((err) => {
        console.error("Error disliking movie:", err);
        toast({
          title: "Error",
          description: "Failed to remove movie from favourites.",
          variant: "destructive",
        });
      });
  };

  if (loading)
    return <p className="text-center text-lg mt-10">Loading favourites...</p>;
  if (!favs.length)
    return <p className="text-center text-lg mt-10">No favourites yet 👀</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        🎬 Your Favourite Movies
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {favs.map((movie) => (
          <div
            key={movie.ID}
            className="bg-card rounded-lg overflow-hidden shadow-md transform transition duration-300 hover:scale-105 hover:shadow-xl"
          >
            <img
              src={movie.Poster}
              alt={movie.Title}
              className="w-full h-64 object-cover cursor-pointer"
              onClick={() => navigate(`/movie/${movie.ID}`)}
            />
            <div className="p-3 flex justify-between items-center">
              <div
                className="cursor-pointer flex-1"
                onClick={() => navigate(`/movie/${movie.ID}`)}
              >
                <h2 className="text-md font-semibold truncate">
                  {movie.Title}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  ID: {movie.ID}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDislike(movie.ID);
                }}
                className="ml-3 text-red-500 hover:text-red-700"
                title="Remove from favourites"
              >
                ❌
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favourites;