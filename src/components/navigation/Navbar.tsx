import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Menu } from 'lucide-react';
import NavLink from './NavLink';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from 'react';

interface NavbarProps {
  isAuthenticated: boolean;
  isAuthPage: boolean;
}

const Navbar = ({ isAuthenticated, isAuthPage }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname.includes('/dashboard');
  const [isOpen, setIsOpen] = useState(false);
  
  console.log('Navbar rendered with:', { isAuthenticated, isAuthPage, isDashboard });
  
  const handleLogoClick = (e: React.MouseEvent) => {
    if (isAuthenticated) {
      e.preventDefault();
      navigate('/dashboard');
    }
  };
  
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <Link 
            to={isAuthenticated ? '/dashboard' : '/'}
            onClick={handleLogoClick}
            className="flex items-center space-x-2"
          >
            <span className="font-display text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
              Narrately.ai
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated && !isAuthPage && !isDashboard && (
              <>
                {/* Desktop dashboard link */}
                <Button
                  variant="ghost"
                  className="hidden md:flex items-center gap-2"
                  onClick={() => navigate('/dashboard')}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  User Dashboard
                </Button>
                
                {/* Mobile menu */}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                    <nav className="flex flex-col gap-4 pt-4">
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2"
                        onClick={() => {
                          setIsOpen(false);
                          navigate('/dashboard');
                        }}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        User Dashboard
                      </Button>
                    </nav>
                  </SheetContent>
                </Sheet>
              </>
            )}
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