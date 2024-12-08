import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAuthPage = location.pathname.includes('/auth');

  if (isAuthPage) {
    return <div className="min-h-screen bg-gradient-to-br from-secondary to-primary/10">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-primary/10">
      <nav className="border-b border-white/10 bg-secondary/95 backdrop-blur supports-[backdrop-filter]:bg-secondary/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-display text-2xl text-white">Narrately.ai</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/pricing">
                <Button variant="ghost" className="text-white hover:text-primary">
                  Pricing
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button variant="ghost" className="text-white hover:text-primary">
                  Login
                </Button>
              </Link>
              <Link to="/auth/signup">
                <Button className="bg-primary text-white hover:bg-primary/90">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default Layout;