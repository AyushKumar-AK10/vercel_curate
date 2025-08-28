import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';
import { movieApi } from '@/lib/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUsername } = useUser();

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim() || !passwordInput.trim()) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const payload = { user: usernameInput.trim(), password: passwordInput.trim() };

      if (isSignUp) {
        const response = await movieApi.signup(payload.user, payload.password);

        if (response.data.message === 'User signed up successfully') {
          setUsername(payload.user);
          navigate('/');
          setUsernameInput('');
          setPasswordInput('');
        } else {
          setErrorMessage(response.data.error || 'Signup failed.');
          return;
        }
      } else {
        const response = await movieApi.login(payload.user, payload.password);

        if (response.data.message === 'Login successful') {
          setUsername(payload.user);
          navigate('/');
          setUsernameInput('');
          setPasswordInput('');
        } else {
          setErrorMessage(response.data.error || 'Login failed.');
          return;
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      let errorMsg = 'An unexpected error occurred.';
      if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      }
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-scale-in">
        <Card className="bg-card/90 backdrop-blur-md border-border shadow-intense">
          <CardHeader className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-3">
              {/* ✅ Replaced Film icon with favicon image */}
              <img
                src="/apple-icon-180x180.png"
                alt="Curate logo"
                className="w-12 h-12 rounded-md"
              />
              <span className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Curate
              </span>
            </div>
            <div>
              <CardTitle className="text-2xl text-foreground">
                {isSignUp ? 'Join Curate' : 'Welcome to Curate'}
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                {isSignUp ? 'Create an account to get started' : 'Sign in to your account'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-foreground">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="pl-10 bg-secondary/50 border-border focus:border-primary"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="pl-10 bg-secondary/50 border-border focus:border-primary"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90 text-white font-semibold"
                disabled={isLoading || !usernameInput.trim() || !passwordInput.trim()}
              >
                {isLoading ? (
                  <span>{isSignUp ? 'Creating account...' : 'Connecting...'}</span>
                ) : (
                  <>
                    {isSignUp ? 'Sign Up' : 'Login'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              {/* Error Message */}
              {errorMessage && (
                <div className="text-red-500 text-sm text-center mt-4">{errorMessage}</div>
              )}
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">
              {isSignUp ? (
                <>
                  Already have an account?{' '}
                  <button
                    className="text-primary hover:underline"
                    onClick={() => setIsSignUp(false)}
                    disabled={isLoading}
                  >
                    Login
                  </button>
                </>
              ) : (
                <>
                  New user?{' '}
                  <button
                    className="text-primary hover:underline"
                    onClick={() => setIsSignUp(true)}
                    disabled={isLoading}
                  >
                    Create an account
                  </button>
                </>
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
