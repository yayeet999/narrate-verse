import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from "@/integrations/supabase/client";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isAuthPage = location.pathname.includes('/auth');

  useEffect(() => {
    console.log('Layout mounted, checking auth state');
    let mounted = true;

    const checkAuth = async () => {
      try {
        console.log('Checking session in Layout');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (session) {
          console.log('Session found in Layout');
          setIsAuthenticated(true);
          if (isAuthPage) {
            console.log('On auth page with session, redirecting to dashboard');
            navigate('/dashboard', { replace: true });
          }
        } else {
          console.log('No session found in Layout');
          if (!isAuthPage && location.pathname !== '/') {
            console.log('Not on auth page without session, redirecting to login');
            navigate('/auth/login', { replace: true });
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed in Layout:', _event);
      if (!mounted) return;

      if (session) {
        setIsAuthenticated(true);
        if (isAuthPage) {
          navigate('/dashboard', { replace: true });
        }
      } else {
        setIsAuthenticated(false);
        if (!isAuthPage && location.pathname !== '/') {
          navigate('/auth/login', { replace: true });
        }
      }
    });

    return () => {
      console.log('Layout unmounting');
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, isAuthPage, location.pathname]);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Logo clicked');
    
    if (isAuthPage) {
      console.log('On auth page, preventing navigation');
      return;
    }

    if (isAuthenticated) {
      console.log('Authenticated, navigating to dashboard');
      navigate('/dashboard');
    } else {
      console.log('Not authenticated, navigating to home');
      navigate('/');
    }
  };

  if (isLoading) {
    console.log('Layout is loading');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <button 
              onClick={handleLogoClick}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <span className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
                Narrately.ai
              </span>
            </button>
            <div className="flex items-center space-x-4">
              <Link to="/pricing">
                <Button 
                  variant="ghost" 
                  className="text-slate-700 hover:text-primary dark:text-slate-200 dark:hover:text-primary"
                >
                  Pricing
                </Button>
              </Link>
              {!isAuthPage && !isAuthenticated && (
                <>
                  <Link to="/auth/login">
                    <Button 
                      variant="ghost" 
                      className="text-slate-700 hover:text-primary dark:text-slate-200 dark:hover:text-primary"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/auth/signup">
                    <Button 
                      className="bg-primary text-white hover:bg-primary/90 hover:animate-scale-up"
                    >
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
};

export default Layout;