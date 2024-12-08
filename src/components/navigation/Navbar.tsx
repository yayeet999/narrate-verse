import { Link } from 'react-router-dom';
import NavLink from './NavLink';

interface NavbarProps {
  isAuthenticated: boolean;
  isAuthPage: boolean;
}

const Navbar = ({ isAuthenticated, isAuthPage }: NavbarProps) => {
  console.log('Navbar rendered with:', { isAuthenticated, isAuthPage });
  
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <Link 
            to={isAuthenticated ? "/dashboard" : "/"} 
            className="flex items-center space-x-2"
            onClick={(e) => {
              if (isAuthPage) {
                console.log('Preventing navigation on auth page');
                e.preventDefault();
              } else {
                console.log('Allowing navigation from non-auth page');
              }
            }}
          >
            <span className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
              Narrately.ai
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <NavLink 
              to="/pricing"
              variant="ghost" 
              className="text-slate-700 hover:text-primary dark:text-slate-200 dark:hover:text-primary"
            >
              Pricing
            </NavLink>

            {!isAuthPage && !isAuthenticated && (
              <>
                <NavLink 
                  to="/auth/login"
                  variant="ghost" 
                  className="text-slate-700 hover:text-primary dark:text-slate-200 dark:hover:text-primary"
                >
                  Login
                </NavLink>
                <NavLink 
                  to="/auth/signup"
                  className="bg-primary text-white hover:bg-primary/90 hover:animate-scale-up"
                >
                  Get Started
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;