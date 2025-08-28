import React, { useState } from 'react';
import { Search, User, LogOut, Heart } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username, setUsername } = useUser();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    setUsername(null);
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <img 
              src="/favicon.ico" 
              alt="Curate Logo" 
              className="w-8 h-8 rounded-lg"
            />
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Curate
            </span>
          </div>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:block flex-1 max-w-md mx-8"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/50 border-border focus:border-primary"
              />
            </div>
          </form>

          {/* Favourites Link - Desktop */}
          <Link
            to="/favourites"
            className={`hidden sm:flex items-center space-x-1 text-sm font-medium ${
              location.pathname === '/favourites'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Favourites</span>
          </Link>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              <User className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-foreground">{username}</span>
            </div>

            {/* Mobile Favourites Icon */}
            <Link
              to="/favourites"
              className={`sm:hidden p-2 rounded-md ${
                location.pathname === '/favourites'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Heart className="w-5 h-5" />
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearch} className="block md:hidden mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50 border-border focus:border-primary w-full"
            />
          </div>
        </form>
      </div>
    </nav>
  );
};

export default Navbar;
