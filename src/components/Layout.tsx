import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname.includes('/auth');

  const handleLogoClick = (e: React.MouseEvent) => {
    console.log('Logo clicked, current location:', location.pathname);
    e.preventDefault();
    console.log('Navigating to home page...');
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <button 
              onClick={handleLogoClick}
              className="flex items-center space-x-2"
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
              {!isAuthPage && (
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