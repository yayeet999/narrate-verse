import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import Navbar from './navigation/Navbar';

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
          setIsAuthenticated(false);
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

  if (isLoading) {
    console.log('Layout is loading');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Navbar isAuthenticated={isAuthenticated} isAuthPage={isAuthPage} />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
};

export default Layout;